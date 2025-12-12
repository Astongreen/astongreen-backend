import { Module, forwardRef } from '@nestjs/common';
import EthersService from './ethers.service';
import { NetworksService } from '../networks/networks.service';
import { NetworksModule } from '../networks/networks.module';
import { EventsModule } from '../events/events.module';
import { BlockModule } from '../block/block.module';
import { ethers } from 'ethers';

@Module({
  imports: [NetworksModule, BlockModule, forwardRef(() => EventsModule)],
  providers: [
    EthersService,
    {
      provide: 'ETHERS_PROVIDER',
      useFactory: async (networkService: NetworksService) => {
        const CONFIG = await networkService.getConfig();
        const providers: Record<string, ethers.JsonRpcProvider> = {};

        CONFIG.Networks.forEach((config) => {
          try {
            if (config.chainType && config.rpcUrl) {
              providers[config.chainType] = new ethers.JsonRpcProvider(
                config.rpcUrl,
                Number(config.chainId ?? 0),
              );
            } else {
              console.warn(
                `Missing chainType or rpc for network config:`,
                config,
              );
            }
          } catch (error) {
            console.error(
              `Failed to create provider for ${config.chainType}:`,
              error.message,
            );
          }
        });

        return providers;
      },
      inject: [NetworksService],
    },
    {
      provide: 'CONTRACT_ADDRESSES',
      useFactory: async (networkService: NetworksService) => {
        const CONFIG = await networkService.getConfig();
        return CONFIG.Networks;
      },
      inject: [NetworksService],
    },
  ],
  exports: [EthersService],
})
export class EthersModule {}
