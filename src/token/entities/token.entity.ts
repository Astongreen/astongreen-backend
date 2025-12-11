import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TokenStatus, TokenType } from '../enums/token.enum';
import { Project } from 'src/projects/entities/project.entity';
import { Company } from 'src/companies/entities/company.entity';
import { ProjectType } from 'src/common/enums/role.enum';

export type TokenDistributionItem = {

    projectId: Project['projectId'];
    totalTokenDistribution: string;
    value: string;
    projectName?: string;
};

export type TokenDistribution = {
    projectType: ProjectType;
    distrubutionItems: TokenDistributionItem[];
};

@Entity({ name: 'tokens' })
export class Token {
    @PrimaryGeneratedColumn('uuid')
    tokenId: string;

    @Column({ type: 'enum', enum: TokenType })
    tokenType: TokenType;

    @Column({ type: 'json', name: 'token_distribution', nullable: true })
    tokenDistribution?: TokenDistribution[];

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'enum', enum: TokenStatus, default: TokenStatus.PENDING })
    tokenStatus: TokenStatus;

    @Column({ type: 'varchar', length: 255, nullable: true })
    tokenContractAddress?: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    transactionHash: string;

    @Column({ type: 'int', nullable: true })
    tokenDecimals?: number | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    tokenSymbol?: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    tokenName?: string | null;

    @ManyToOne(() => Company, { eager: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'companyId', referencedColumnName: 'companyId' })
    company: Company;

    @Column({ type: 'uuid', name: 'companyId', nullable: false })
    companyId?: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}


