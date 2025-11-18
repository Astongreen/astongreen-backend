import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserRole } from '../common/enums/role.enum';
import { Errors } from 'src/common/constants/messages';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async createInvestor(email: string, password: string): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException(Errors.USER.EMAIL_ALREADY_IN_USE);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      passwordHash,
      role: UserRole.INVESTOR,
    });
    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByEmailAndRole(email: string, role: UserRole): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email, role } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update({ id: userId }, { passwordHash });
  }

  async updateLastLoginAt(userId: string): Promise<User> {
    await this.userRepository.update({ id: userId }, { lastLoginAt: new Date() });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(Errors.USER.USER_NOT_FOUND);
    }
    return user as User;
  }
}


