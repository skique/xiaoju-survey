import { Entity, Column, BeforeInsert, AfterLoad } from 'typeorm';
import pluginManager from '../securityPlugin/pluginManager';
import { BaseEntity } from './base.entity';

@Entity({ name: 'surveySubmit' })
export class SurveyResponse extends BaseEntity {
  @Column()
  pageId: string;

  @Column()
  surveyPath: string;

  @Column('jsonb')
  data: Record<string, any>;

  @Column()
  diffTime: number;

  @Column()
  clientTime: number;

  @Column('jsonb')
  secretKeys: Array<string>;

  @Column('jsonb')
  optionTextAndId: Record<string, any>;



  // @BeforeInsert()
  // async onDataInsert(dataList) {
  //   return await pluginManager.triggerHook('encryptResponseData', {responseData: this, dataList});
  // }

  @AfterLoad()
  async onDataLoaded() {
    return await pluginManager.triggerHook('decryptResponseData', this);
  }
}
