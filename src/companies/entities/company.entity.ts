import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'companies' })
export class Company {
    @PrimaryGeneratedColumn('uuid')
    id: string;

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

    // Documents stored as JSON array of strings
    @Column({ type: 'json', nullable: true })
    documents?: string[] | null;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}


