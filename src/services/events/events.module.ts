import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockModule } from '../block/block.module';
import { EthersModule } from '../ethers/ethers.module';
import { EventsService } from './events.service';
import { EventInfo } from './entities/event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventInfo]),
    BlockModule,
    forwardRef(() => EthersModule),
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
