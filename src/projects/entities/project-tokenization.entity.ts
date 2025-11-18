import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './project.entity';

@Entity({ name: 'project_tokenization' })
export class ProjectTokenization {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToOne(() => Project, project => project.tokenization)
	@JoinColumn({ name: 'projectId', referencedColumnName: 'projectId' })
	project: Project;

	@Column({ type: 'varchar', length: 120, nullable: true })
	investmentTokenChosen?: string | null;

	@Column({ type: 'varchar', length: 120, nullable: true })
	interestInListing?: string | null;

	@Column({ type: 'boolean', default: false })
	dcoRegistrationServiceProvided?: boolean;

	@Column({ type: 'boolean', default: false })
	co2ServicesPerformed?: boolean;

	@Column({ type: 'json', nullable: true })
	keyProjectDocuments?: string[] | null;

	@Column({ type: 'varchar', length: 255, nullable: true })
	tokenConversionRule?: string | null;

	@Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
	tokenPrice?: string | null;

	@Column({ type: 'varchar', length: 10, nullable: true })
	tokenPriceCurrency?: string | null;
}


