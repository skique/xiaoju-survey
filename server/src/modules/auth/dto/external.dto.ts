import Joi from 'joi';
import { EXTERNAL_LOGIN_KIND_ENUM } from 'src/enums/externalAuth';
import { ApiProperty } from '@nestjs/swagger';

export const validateKind = (kind) => {
  return Joi.string()
    .valid(EXTERNAL_LOGIN_KIND_ENUM.GOOGLE, EXTERNAL_LOGIN_KIND_ENUM.WECHAT)
    .validate(kind);
};

export class BindAccountDto {
  @ApiProperty({ description: '用户名', required: true })
  username: string;

  @ApiProperty({ description: '密码', required: true })
  password: string;

  @ApiProperty({ description: '账号id', required: true })
  eid: string;

  static validate(data) {
    return Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      eid: Joi.string().required(),
    }).validate(data);
  }
}
