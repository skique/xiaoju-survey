import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { CaptchaService } from './services/captcha.service';

import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { ExternalAuthController } from './controllers/externalAuth.controller';

import { User } from 'src/models/user.entity';
import { Captcha } from 'src/models/captcha.entity';
import { ExternalUser } from 'src/models/externalUser.entity';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ExternalAuthService } from './services/externalAuth.service';
import { Logger } from 'src/logger';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Captcha, ExternalUser]),
    ConfigModule,
  ],
  controllers: [AuthController, UserController, ExternalAuthController],
  providers: [
    UserService,
    AuthService,
    CaptchaService,
    ExternalAuthService,
    Logger,
  ],
  exports: [UserService, AuthService],
})
export class AuthModule {}
