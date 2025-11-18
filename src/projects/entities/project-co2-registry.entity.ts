import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './project.entity';

@Entity({ name: 'project_co2_registry' })
export class ProjectCo2Registry {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToOne(() => Project, project => project.co2Registry)
	@JoinColumn({ name: 'projectId', referencedColumnName: 'projectId' })
	project: Project;

	@Column({ type: 'varchar', length: 255, nullable: true })
	registryName?: string | null;

	@Column({ type: 'varchar', length: 120, nullable: true })
	registryProjectId?: string | null;

	@Column({ type: 'timestamp', nullable: true })
	dateOfPddRegistration?: Date | null;

	@Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
	co2IssuedSoFar?: string | null;

	@Column({ type: 'boolean', default: false })
	registeredMitigationOutcome?: boolean;
}


