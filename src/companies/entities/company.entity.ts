import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CompanyStatus } from '../types/company.enum';
import { User } from 'src/users/entities/user.entity';
import { Project } from 'src/projects/entities/project.entity';
import { Token } from 'src/token/entities/token.entity';

@Entity({ name: 'companies' })
export class Company {
    @PrimaryGeneratedColumn('uuid')
    companyId: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 120, unique: true })
    registrationNumber?: string | null;

    @Column({ type: 'varchar', length: 120, unique: true })
    vatNumber?: string | null;

    @Column({ type: 'varchar', length: 100 })
    country: string;

    @Column({ type: 'varchar', length: 500 })
    address: string;

    @Column({ type: 'varchar', length: 255 })
    spocName: string;

    @Column({ type: 'varchar', length: 255 })
    spocEmail: string;

    @Column({ type: 'varchar', length: 30 })
    spocNumber: string;

    @Column({ type: 'enum', enum: CompanyStatus, default: CompanyStatus.PENDING })
    status: CompanyStatus;

    @Column({ type: 'varchar', length: 500, nullable: true })
    rejectReason?: string | null;


    @ManyToOne(() => User, (user) => user.companies, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'createdBy' })
    user: User;

    @OneToMany(() => Project, project => project.company)
    projects?: Project[];

    @OneToMany(() => Token, token => token.company)
    tokens?: Token[];

    @Column({ type: 'uuid' })
    createdBy: string;

    // Documents stored as JSON array of strings
    @Column({ type: 'json', nullable: true })
    documents?: string[] | null;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}


