import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'password_reset_otps' })
export class PasswordResetOtp {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    user: User;

    @Index()
    @Column({ type: 'varchar', length: 6 })
    code: string;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;

    @Column({ name: 'used_at', type: 'timestamp', nullable: true })
    usedAt?: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}


