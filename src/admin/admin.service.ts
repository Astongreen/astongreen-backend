import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/common/enums/role.enum';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
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
}


