import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/common/enums/role.enum';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Errors } from 'src/common/constants/messages';
import { AddNewUserDto, BlockUnblockUserDto, UpdateUserDto } from './dto/user.dto';
import { EmailService } from 'src/common/email/email.service';
import { QueryTransformOptions } from 'src/common/middlewares/query-transform/query-transform.interface';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
        private readonly paginationService: PaginationService,
    ) { }

    getHealth(): { status: string } {
        return { status: 'ok' };
    }


    onModuleInit() {
        this.createDefaultSuperAdmin();
    }

    async createDefaultSuperAdmin() {
        const existingAdmin = await this.userRepository.findOne({ where: { role: UserRole.SUPER_ADMIN } });
        if (!existingAdmin) {
            const superAdminEmail = this.configService.get<string>('SUPER_ADMIN_EMAIL');
            const superAdminPassword = this.configService.get<string>('SUPER_ADMIN_PASSWORD');

            if (!superAdminEmail || !superAdminPassword) {
                throw new Error('Default admin email or password is not set in configuration.');
            }
            const passwordHash = await bcrypt.hash(superAdminPassword, 10);

            const newAdmin = this.userRepository.create({
                email: superAdminEmail,
                passwordHash: passwordHash,
                role: UserRole.SUPER_ADMIN
            });

            await this.userRepository.save(newAdmin);
        }
    }

    async checkUserIsSuperAdmin(userId: string): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { id: userId, role: UserRole.SUPER_ADMIN } });
        return !!user;
    }

    async addNewUser(dto: AddNewUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
        if (existingUser) {
            throw new ConflictException(Errors.USER.EMAIL_ALREADY_IN_USE);
        }
        const randomPassword = Math.random().toString(36).substring(2, 15);
        const passwordHash = await bcrypt.hash(randomPassword, 10);
        const newUser = this.userRepository.create({ ...dto, passwordHash: passwordHash });
        const saved = await this.userRepository.save(newUser);
        // Fire-and-forget; let errors bubble to logs but do not block user creation
        try {
            await this.emailService.sendNewUserCredentialsEmail(dto.email, dto.email, randomPassword, dto.role as any);
        } catch (e) {
            // Intentionally swallow to avoid failing user creation due to email issues
        }
        return saved;
    }

    async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new ConflictException(Errors.USER.USER_NOT_FOUND);
        }
        const merged = this.userRepository.merge(user, {
            firstName: dto.firstName ?? user.firstName,
            lastName: dto.lastName ?? user.lastName,
            role: dto.role ?? user.role,
            companyName: dto.companyName ?? user.companyName,
            address: dto.address ?? user.address,
            pinCode: dto.pinCode ?? user.pinCode,
            phoneNumber: dto.phoneNumber ?? user.phoneNumber,
        });
        return await this.userRepository.save(merged);
    }

    async setUserBlocked(id: string, dto: BlockUnblockUserDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new ConflictException(Errors.USER.USER_NOT_FOUND);
        }
        if (user.role === UserRole.SUPER_ADMIN) {
            throw new ConflictException(Errors.USER.USER_NOT_ALLOWED_TO_BLOCK_SUPER_ADMIN);
        }
        user.isBlocked = !!dto.isBlocked;
        return await this.userRepository.save(user);
    }

    async getUserById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new ConflictException(Errors.USER.USER_NOT_FOUND);
        }
        return user;
    }


    async getAllUsers(
        whereCondition: Record<string, any>,
        options: QueryTransformOptions,
    ) {
        return this.paginationService.applyPaginationAndFilters(
            this.userRepository,
            [
                "id", "email",
                "role",
                "firstName",
                "lastName",
                "profilePicture",
                "lastLoginAt",
                "isBlocked",
                "companyName",
                "address",
                "pinCode",
                "phoneNumber",
                "createdAt",
                "updatedAt"
            ],
            whereCondition,
            [],
            options,
            ['firstName', 'lastName', 'email', 'role', 'companyName', 'address', 'pinCode', 'phoneNumber'],
        );
    }

}

