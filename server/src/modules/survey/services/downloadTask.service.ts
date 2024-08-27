import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ResponseSchema } from 'src/models/responseSchema.entity';
import { DownloadTask } from 'src/models/downloadTask.entity';
import { RECORD_STATUS } from 'src/enums';
import { ObjectId } from 'mongodb';
import { ResponseSchemaService } from 'src/modules/surveyResponse/services/responseScheme.service';
import { SurveyResponse } from 'src/models/surveyResponse.entity';
import { DataStatisticService } from './dataStatistic.service';
import xlsx from 'node-xlsx';
import { load } from 'cheerio';
import { get } from 'lodash';
import { FileService } from 'src/modules/file/services/file.service';
import { XiaojuSurveyLogger } from 'src/logger';

@Injectable()
export class DownloadTaskService {
  private static taskList: Array<any> = [];
  private static isExecuting: boolean = false;

  constructor(
    @InjectRepository(DownloadTask)
    private readonly downloadTaskRepository: MongoRepository<DownloadTask>,
    private readonly responseSchemaService: ResponseSchemaService,
    @InjectRepository(SurveyResponse)
    private readonly surveyResponseRepository: MongoRepository<SurveyResponse>,
    private readonly dataStatisticService: DataStatisticService,
    private readonly fileService: FileService,
    private readonly logger: XiaojuSurveyLogger,
  ) {}

  async createDownloadTask({
    surveyId,
    responseSchema,
    operatorId,
    params,
  }: {
    surveyId: string;
    responseSchema: ResponseSchema;
    operatorId: string;
    params: any;
  }) {
    const downloadTask = this.downloadTaskRepository.create({
      surveyId,
      surveyPath: responseSchema.surveyPath,
      fileSize: '计算中',
      ownerId: operatorId,
      params: {
        ...params,
        title: responseSchema.title,
      },
    });
    await this.downloadTaskRepository.save(downloadTask);
    return downloadTask._id.toString();
  }

  async getDownloadTaskList({
    ownerId,
    pageIndex,
    pageSize,
  }: {
    ownerId: string;
    pageIndex: number;
    pageSize: number;
  }) {
    const where = {
      onwer: ownerId,
      'curStatus.status': {
        $ne: RECORD_STATUS.REMOVED,
      },
    };
    const [surveyDownloadList, total] =
      await this.downloadTaskRepository.findAndCount({
        where,
        take: pageSize,
        skip: (pageIndex - 1) * pageSize,
        order: {
          createDate: -1,
        },
      });
    return {
      total,
      list: surveyDownloadList,
    };
  }

  async getDownloadTaskById({ taskId }) {
    const res = await this.downloadTaskRepository.find({
      where: {
        _id: new ObjectId(taskId),
      },
    });
    if (Array.isArray(res) && res.length > 0) {
      return res[0];
    }
    return null;
  }

  async deleteDownloadTask({ taskId }: { taskId: string }) {
    const curStatus = {
      status: RECORD_STATUS.REMOVED,
      date: Date.now(),
    };
    return this.downloadTaskRepository.updateOne(
      {
        _id: new ObjectId(taskId),
        'curStatus.status': {
          $ne: RECORD_STATUS.REMOVED,
        },
      },
      {
        $set: {
          curStatus,
        },
        $push: {
          statusList: curStatus as never,
        },
      },
    );
  }

  processDownloadTask({ taskId }) {
    DownloadTaskService.taskList.push(taskId);
    if (!DownloadTaskService.isExecuting) {
      this.executeTask();
      DownloadTaskService.isExecuting = true;
    }
  }

  private async executeTask() {
    try {
      for (const taskId of DownloadTaskService.taskList) {
        const taskInfo = await this.getDownloadTaskById({ taskId });
        if (!taskInfo || taskInfo.curStatus.status === RECORD_STATUS.REMOVED) {
          // 不存在或者已删除的，不处理
          continue;
        }
        await this.handleDownloadTask({ taskInfo });
      }
    } finally {
      DownloadTaskService.isExecuting = false;
    }
  }

  private async handleDownloadTask({ taskInfo }) {
    try {
      // 更新任务状态为计算中
      const updateRes = await this.downloadTaskRepository.updateOne(
        {
          _id: taskInfo._id,
        },
        {
          $set: {
            curStatus: {
              status: RECORD_STATUS.COMOPUTETING,
              date: Date.now(),
            },
          },
        },
      );

      this.logger.info(JSON.stringify(updateRes));

      // 开始计算任务
      const surveyId = taskInfo.surveyId;
      const responseSchema =
        await this.responseSchemaService.getResponseSchemaByPageId(surveyId);
      const where = {
        pageId: surveyId,
        'curStatus.status': {
          $ne: 'removed',
        },
      };
      const total = await this.surveyResponseRepository.count(where);
      const pageSize = 200;
      const pageTotal = Math.ceil(total / pageSize);
      const xlsxHead = [];
      const xlsxBody = [];
      for (let pageIndex = 1; pageIndex <= pageTotal; pageIndex++) {
        const { listHead, listBody } =
          await this.dataStatisticService.getDataTable({
            surveyId,
            pageNum: pageIndex,
            pageSize,
            responseSchema,
          });
        if (xlsxHead.length === 0) {
          for (const item of listHead) {
            const $ = load(item.title);
            const text = $.text();
            xlsxHead.push(text);
          }
        }
        for (const bodyItem of listBody) {
          const bodyData = [];
          for (const headItem of listHead) {
            const field = headItem.field;
            const val = get(bodyItem, field, '');
            const $ = load(val);
            const text = $.text();
            bodyData.push(text);
          }
          xlsxBody.push(bodyData);
        }
      }
      const xlsxData = [xlsxHead, ...xlsxBody];
      const buffer = await xlsx.build([
        { name: 'sheet1', data: xlsxData, options: {} },
      ]);

      const isDesensitive = taskInfo.params?.isDesensitive;

      const originalname = `${taskInfo.params.title}-${isDesensitive ? '脱敏' : '原'}回收数据.xlsx`;

      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: originalname,
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        filename: originalname,
        size: buffer.length,
        buffer: buffer,
        stream: null,
        destination: null,
        path: '',
      };
      const { url, key } = await this.fileService.upload({
        configKey: 'SERVER_LOCAL_CONFIG',
        file,
        pathPrefix: 'exportfile',
        keepOriginFilename: true,
      });

      const curStatus = {
        status: RECORD_STATUS.FINISHED,
        date: Date.now(),
      };

      // 更新计算结果
      const updateFinishRes = await this.downloadTaskRepository.updateOne(
        {
          _id: taskInfo._id,
        },
        {
          $set: {
            curStatus,
            url,
            filename: originalname,
            fileKey: key,
            fileSize: buffer.length,
          },
          $push: {
            statusList: curStatus as never,
          },
        },
      );
      this.logger.info(JSON.stringify(updateFinishRes));
    } catch (error) {
      const curStatus = {
        status: RECORD_STATUS.ERROR,
        date: Date.now(),
      };
      await this.downloadTaskRepository.updateOne(
        {
          _id: taskInfo._id,
        },
        {
          $set: {
            curStatus,
          },
          $push: {
            statusList: curStatus as never,
          },
        },
      );
      this.logger.error(
        `导出文件失败 taskId: ${taskInfo._id.toString()}, surveyId: ${taskInfo.surveyId}, message: ${error.message}`,
      );
    }
  }
}
