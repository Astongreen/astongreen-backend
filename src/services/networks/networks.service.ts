import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NetworksService {
  constructor(private configService: ConfigService) {}

  public async getConfig() {
    return {
      Networks: [
        {
          // Network Configuration
          chainType: this.configService.get<string>('NETWORK_NAME'),
          chainId: Number(this.configService.get<string>('NETWORK_CHAIN_ID')),
          currency: this.configService.get<string>('NETWORK_CURRENCY'),
          rpcUrl: this.configService.get<string>('NETWORK_RPC_URL'),
          explorer: this.configService.get<string>('NETWORK_EXPLORER'),

          // Factory Contract Configuration
          factoryContractAddress:
            this.configService.get<string>('FACTORY_CONTRACT'),
          startBlockFactory: this.configService.get<string>(
            'FACTORY_BLOCK_NUMBER',
          ),
        },
      ],

      eventBatchSize:
        this.configService.get<string>('EVENT_BATCH_SIZE') || '5000',
      encryptionKey: this.configService.get<string>('ENCRYPTION_KEY'),
    };
  }
}
