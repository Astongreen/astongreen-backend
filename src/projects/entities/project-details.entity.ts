import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './project.entity';

@Entity({ name: 'project_details' })
export class ProjectDetails {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToOne(() => Project, project => project.details)
	@JoinColumn({ name: 'projectId', referencedColumnName: 'projectId' })
	project: Project;

	@Column({ type: 'timestamp', nullable: true })
	dateOfCommissioningExpected?: Date | null;

	@Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
	tariff?: string | null;

	@Column({ type: 'varchar', length: 120, nullable: true })
	creditRatingOfCharter?: string | null;

	@Column({ type: 'varchar', length: 120, nullable: true })
	internalCreditRating?: string | null;

	@Column({ type: 'varchar', length: 120, nullable: true })
	concessionAgreementTenure?: string | null;

	@Column({ type: 'varchar', length: 255, nullable: true })
	locationCoordinates?: string | null;

	@Column({ type: 'varchar', length: 255, nullable: true })
	nameOfCharter?: string | null;

	@Column({ type: 'varchar', length: 120, nullable: true })
	projectCapacity?: string | null;

	@Column({ type: 'varchar', length: 120, nullable: true })
	externalCreditRating?: string | null;
}


