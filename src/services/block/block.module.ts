import { Module } from '@nestjs/common';
import { NetworksModule } from '../networks/networks.module';
import { BlocksService } from './block.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule, NetworksModule],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlockModule {}
