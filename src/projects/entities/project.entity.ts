import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Company } from 'src/companies/entities/company.entity';
import { User } from 'src/users/entities/user.entity';
import { ProjectStatus } from '../types/project.enum';
import { ProjectDetails } from './project-details.entity';
import { ProjectCapital } from './project-capital.entity';
import { ProjectCo2Registry } from './project-co2-registry.entity';
import { ProjectTokenization } from './project-tokenization.entity';
import { ProjectType } from 'src/common/enums/role.enum';

@Entity({ name: 'projects' })
export class Project {
    @PrimaryGeneratedColumn('uuid')
    projectId: string;

    // Keep basic information in main table
    @Column({ type: 'varchar', length: 255 })
    projectName: string;

    @Column({ type: 'varchar', length: 120, unique: true })
    projectCode: string;

    @Column({ type: 'enum', enum: ProjectType })
    typeOfProject: ProjectType;

    @Column({ type: 'varchar', length: 255 })
    legalSpvName: string;

    // Section relations (One-to-one sub-entities)
    @OneToOne(() => ProjectDetails, details => details.project, { cascade: true, eager: true })
    details: ProjectDetails;

    @OneToOne(() => ProjectCapital, capital => capital.project, { cascade: true, eager: true })
    capital: ProjectCapital;

    @OneToOne(() => ProjectCo2Registry, registry => registry.project, { cascade: true, eager: true })
    co2Registry: ProjectCo2Registry;

    @OneToOne(() => ProjectTokenization, tokenization => tokenization.project, { cascade: true, eager: true })
    tokenization: ProjectTokenization;

    @ManyToOne(() => Company, { eager: true, onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'companyId', referencedColumnName: 'companyId' })
    company: Company;

    @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.PENDING })
    status: ProjectStatus;

    @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'created_by' })
    createdBy?: User | null;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}


