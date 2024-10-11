import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { EXTERNAL_LOGIN_KIND_ENUM } from 'src/enums/externalAuth';

@Entity({ name: 'messagePushingLog' })
export class ExternalUser extends BaseEntity {
  @Column('string')
  kind: EXTERNAL_LOGIN_KIND_ENUM;

  @Column('string')
  userId: string;

  @Column('string')
  openid: string;

  @Column('string')
  email?: string;

  @Column('string')
  avatar?: string;

  @Column('string')
  name?: string;

  @Column('string')
  clientId: string;
}
