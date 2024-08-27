import {
  Controller,
  Get,
  Query,
  HttpCode,
  UseGuards,
  SetMetadata,
  Request,
  Post,
  Body,
  // Response,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { ResponseSchemaService } from '../../surveyResponse/services/responseScheme.service';

import { Authentication } from 'src/guards/authentication.guard';
import { SurveyGuard } from 'src/guards/survey.guard';
import { SURVEY_PERMISSION } from 'src/enums/surveyPermission';
import { XiaojuSurveyLogger } from 'src/logger';
import { HttpException } from 'src/exceptions/httpException';
import { EXCEPTION_CODE } from 'src/enums/exceptionCode';
//后添加
import { DownloadTaskService } from '../services/downloadTask.service';
import {
  GetDownloadTaskDto,
  CreateDownloadDto,
  GetDownloadTaskListDto,
  DeleteDownloadTaskDto,
} from '../dto/downloadTask.dto';
import moment from 'moment';
import { NoPermissionException } from 'src/exceptions/noPermissionException';

@ApiTags('downloadTask')
@ApiBearerAuth()
@Controller('/api/downloadTask')
export class DownloadTaskController {
  constructor(
    private readonly responseSchemaService: ResponseSchemaService,
    private readonly downloadTaskService: DownloadTaskService,
    private readonly logger: XiaojuSurveyLogger,
  ) {}

  @Post('/createTask')
  @HttpCode(200)
  @UseGuards(SurveyGuard)
  @SetMetadata('surveyId', 'body.surveyId')
  @SetMetadata('surveyPermission', [SURVEY_PERMISSION.SURVEY_RESPONSE_MANAGE])
  @UseGuards(Authentication)
  async createTask(
    @Body()
    reqBody: CreateDownloadDto,
    @Request() req,
  ) {
    const { value, error } = CreateDownloadDto.validate(reqBody);
    if (error) {
      this.logger.error(error.message);
      throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }
    const { surveyId, isDesensitive } = value;
    const responseSchema =
      await this.responseSchemaService.getResponseSchemaByPageId(surveyId);
    const id = await this.downloadTaskService.createDownloadTask({
      surveyId,
      responseSchema,
      operatorId: req.user._id.toString(),
      params: { isDesensitive },
    });
    this.downloadTaskService.processDownloadTask({ taskId: id });
    return {
      code: 200,
      data: { taskId: id },
    };
  }

  @Get('/getDownloadTaskList')
  @HttpCode(200)
  @UseGuards(Authentication)
  async downloadList(
    @Query()
    queryInfo: GetDownloadTaskListDto,
  ) {
    const { value, error } = GetDownloadTaskListDto.validate(queryInfo);
    if (error) {
      this.logger.error(error.message);
      throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }
    const { ownerId, pageIndex, pageSize } = value;
    const { total, list } = await this.downloadTaskService.getDownloadTaskList({
      ownerId,
      pageIndex,
      pageSize,
    });
    return {
      code: 200,
      data: {
        total: total,
        list: list.map((data) => {
          const item: Record<string, any> = {};
          item.taskId = data._id.toString();
          item.curStatus = data.curStatus;
          item.filename = data.filename;
          item.url = data.url;
          const fmt = 'YYYY-MM-DD HH:mm:ss';
          const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
          let unitIndex = 0;
          let size = Number(data.fileSize);
          if (isNaN(size)) {
            item.fileSize = data.fileSize;
          } else {
            while (size >= 1024 && unitIndex < units.length - 1) {
              size /= 1024;
              unitIndex++;
            }
            item.fileSize = `${size.toFixed()} ${units[unitIndex]}`;
          }
          item.createDate = moment(Number(data.createDate)).format(fmt);
          return item;
        }),
      },
    };
  }

  @Get('/getDownloadTask')
  @HttpCode(200)
  @UseGuards(Authentication)
  async getDownloadTask(@Query() query: GetDownloadTaskDto, @Request() req) {
    const { value, error } = GetDownloadTaskDto.validate(query);
    if (error) {
      throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }

    const taskInfo = await this.downloadTaskService.getDownloadTaskById({
      taskId: value.taskId,
    });

    if (!taskInfo) {
      throw new HttpException('任务不存在', EXCEPTION_CODE.PARAMETER_ERROR);
    }

    if (taskInfo.ownerId !== req.user._id.toString()) {
      throw new NoPermissionException('没有权限');
    }
    const res: Record<string, any> = {
      ...taskInfo,
    };
    res.taskId = taskInfo._id.toString();
    delete res._id;

    return {
      code: 200,
      data: res,
    };
  }

  @Post('/deleteDownloadTask')
  @HttpCode(200)
  @UseGuards(Authentication)
  async deleteFileByName(@Body() body: DeleteDownloadTaskDto, @Request() req) {
    const { value, error } = DeleteDownloadTaskDto.validate(body);
    if (error) {
      throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }
    const { taskId } = value;

    const taskInfo = await this.downloadTaskService.getDownloadTaskById({
      taskId,
    });

    if (!taskInfo) {
      throw new HttpException('任务不存在', EXCEPTION_CODE.PARAMETER_ERROR);
    }

    if (taskInfo.ownerId !== req.user._id.toString()) {
      throw new NoPermissionException('没有权限');
    }

    const delRes = await this.downloadTaskService.deleteDownloadTask({
      taskId,
    });

    return {
      code: 200,
      data: delRes.modifiedCount === 1,
    };
  }
}
