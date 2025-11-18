import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './project.entity';

@Entity({ name: 'project_capital' })
export class ProjectCapital {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToOne(() => Project, project => project.capital)
	@JoinColumn({ name: 'projectId', referencedColumnName: 'projectId' })
	project: Project;

	@Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
	paidUpEquityCapital?: string | null;

	@Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
	debtFromBanks?: string | null;

	@Column({ type: 'int', nullable: true })
	tenureOfDebtYears?: number | null;

	@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
	interestRatePercent?: string | null;

	@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
	dscr?: string | null;

	@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
	prbPreTaxPercent?: string | null;

	@Column({ type: 'bigint', nullable: true })
	totalSharesSubscribed?: string | null;

	@Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
	currentBookValuePerShare?: string | null;

	@Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
	capitalRaisedByPromoters?: string | null;
}


