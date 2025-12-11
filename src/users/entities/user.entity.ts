import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../../common/enums/role.enum';
import { Company } from 'src/companies/entities/company.entity';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ name: 'password_hash', type: 'varchar', length: 255 })
    passwordHash: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.INVESTOR })
    role: UserRole;

    @Column({ type: 'varchar', length: 255, nullable: true })
    firstName?: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    lastName?: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    profilePicture?: string | null;

    @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
    lastLoginAt?: Date | null;

    @Column({ type: 'boolean', default: false })
    isBlocked: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    companyName?: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    address?: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    pinCode?: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    phoneNumber?: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Company, (company) => company.createdBy)
    companies?: Company[] | null;
}


