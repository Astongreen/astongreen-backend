import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserRole } from '../common/enums/role.enum';
import { Errors } from 'src/common/constants/messages';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(Errors.USER.USER_NOT_FOUND);
    }
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException(Errors.AUTH.INVALID_CURRENT_PASSWORD);
    }
    await this.updatePassword(userId, newPassword);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(Errors.USER.USER_NOT_FOUND);
    }
    await this.userRepository.update(
      { id: userId },
      {
        firstName: dto.firstName ?? user.firstName ?? null,
        lastName: dto.lastName ?? user.lastName ?? null,
      },
    );
    const updated = await this.userRepository.findOne({ select: ['id', 'email', 'role', 'firstName', 'lastName', 'profilePicture', 'lastLoginAt'], where: { id: userId } });
    if (!updated) {
      throw new NotFoundException(Errors.USER.USER_NOT_FOUND);
    }
    return updated;
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


