import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'approval' })
export class Approval extends BaseEntity {
  @Column()
  surveyId: string;

  @Column()
  userId: string;

  @Column()
  requiredCallback: boolean;

  @Column()
  auditInfo: Array<string>

  @Column()
  consec: Object

  @Column()
  curStatus: Object
  
  @Column()
  statusList: Object    
}
