import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { NetworksModule } from '../networks/networks.module';
import { EthersModule } from '../ethers/ethers.module';
import { EventsModule } from '../events/events.module';
import { BlockModule } from '../block/block.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    NetworksModule,
    EthersModule,
    EventsModule,
    BlockModule,
    RedisModule,
  ],
  providers: [CronService],
})
export class CronModule {}
