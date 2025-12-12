import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'eventInfo' })
export class EventInfo {
  @PrimaryGeneratedColumn()
  uId: string;

  @Column({ nullable: false })
  contract: string;

  @Column({ nullable: false })
  chainType: string;

  @Column({ nullable: false })
  transactionHash: string;

  @Column({ nullable: false })
  logIndex: number;

  @Column({ nullable: false })
  blockNumber: number;

  @CreateDateColumn({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
