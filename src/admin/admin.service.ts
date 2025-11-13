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
        this.createDefaultAdmin();
    }

    async createDefaultAdmin() {
        const existingAdmin = await this.userRepository.findOne({ where: { role: UserRole.ADMIN } });
        if (!existingAdmin) {
            const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
            const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

            if (!adminEmail || !adminPassword) {
                throw new Error('Default admin email or password is not set in configuration.');
            }
            const passwordHash = await bcrypt.hash(adminPassword, 10);

            const newAdmin = this.userRepository.create({
                email: adminEmail,
                passwordHash: passwordHash,
                role: UserRole.ADMIN
            });

            await this.userRepository.save(newAdmin);
        }

    }
}


