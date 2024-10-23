import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from 'src/models/user.entity';
import { ExternalUser } from 'src/models/externalUser.entity';
import { HttpException } from 'src/exceptions/httpException';
import { EXCEPTION_CODE } from 'src/enums/exceptionCode';
import { hash256 } from 'src/utils/hash256';
import { ObjectId } from 'mongodb';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
    @InjectRepository(ExternalUser)
    private readonly externalUserRepository: MongoRepository<ExternalUser>,
  ) {}

  async createUser(userInfo: {
    username: string;
    password: string;
  }): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { username: userInfo.username },
    });

    if (existingUser) {
      throw new HttpException('该用户已存在', EXCEPTION_CODE.USER_EXISTS);
    }

    const newUser = this.userRepository.create({
      username: userInfo.username,
      password: userInfo.password ? hash256(userInfo.password) : '',
    });

    return this.userRepository.save(newUser);
  }

  async createUserByOpenid({
    username,
    openid,
    avatar,
    email,
    name,
  }: {
    username: string;
    openid: string;
    avatar?: string;
    email?: string;
    name?: string;
  }): Promise<User> {
    const newUser = this.userRepository.create({
      username,
      openid,
      avatar,
      email,
      name,
    });

    return this.userRepository.save(newUser);
  }
  async createUserByUid({
    username,
    uid,
    phone,
    avatar,
    email,
    name,
  }: {
    uid: string;
    phone: string;
    username: string;
    avatar?: string;
    email?: string;
    name?: string;
  }): Promise<User> {
    const newUser = this.userRepository.create({
      uid,
      phone,
      username,
      avatar,
      email,
      name,
    });

    return this.userRepository.save(newUser);
  }

  saveUser(user: User) {
    return this.userRepository.save(user);
  }

  async getUser(userInfo: {
    username: string;
    password: string;
  }): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: {
        username: userInfo.username,
        password: hash256(userInfo.password), // Please handle password hashing here
      },
    });

    return user;
  }

  async getUserByUsername(username) {
    const user = await this.userRepository.findOne({
      where: {
        username: username,
        downgradeFlag: false
      },
    });

    return user;
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        _id: new ObjectId(id),
      },
    });

    return user;
  }

  async getUserByOpenid(openid: string) {
    const user = await this.userRepository.findOne({
      where: {
        openid,
      },
    });

    return user;
  }
  async getUserByUid(uid: string) {
    const user = await this.userRepository.findOne({
      where: {
        uid,
        downgradeFlag: false
      },
    });

    return user;
  }

  async getUserListByUsername({ username, skip, take }) {
    const list = await this.userRepository.find({
      where: {
        username: new RegExp(username),
        downgradeFlag: false
      },
      skip,
      take,
      select: ['_id', 'username', 'createdAt'],
    });
    return list;
  }

  async getUserListByIds({ idList }) {
    const list = await this.userRepository.find({
      where: {
        _id: {
          $in: idList.map((item) => new ObjectId(item)),
        },
        downgradeFlag: false
      },
      select: ['_id', 'username', 'createdAt'],
    });
    return list;
  }

  async createExternalUser({ kind, clientId, ...remoteUser }) {
    const externalUser = this.externalUserRepository.create({
      kind,
      clientId,
      ...remoteUser,
    });
    return this.externalUserRepository.save(externalUser);
  }

  async getExternalUserByOpenId({ kind, clientId, openid }) {
    const externalUser = await this.externalUserRepository.findOne({
      where: {
        kind,
        clientId,
        openid,
      },
    });
    return externalUser;
  }

  async getExternalUserById(id) {
    const externalUser = await this.externalUserRepository.findOne({
      where: {
        _id: new ObjectId(id),
      },
    });
    return externalUser;
  }

  async bindUser({ externalUserId, userId }) {
    return this.externalUserRepository.updateOne(
      {
        _id: new ObjectId(externalUserId),
      },
      {
        $set: {
          userId,
        },
      },
    );
  }
}
