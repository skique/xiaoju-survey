import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
@Entity({ name: 'user' })
export class User extends BaseEntity {
  @Column('string')
  username: string;

  @Column('string')
  password?: string;

  @Column('string')
  openid?: string;
  
  @Column('string')
  uid?: string;
  
  @Column('string')
  phone?: string;

  @Column('string')
  email?: string;

  @Column('string')
  avatar?: string;

  @Column('string')
  name?: string;
  
  @Column()
  downgradeFlag?: Boolean;
}
