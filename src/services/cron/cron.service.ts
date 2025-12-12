import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NetworksService } from '../networks/networks.service';
import { BlocksService } from '../block/block.service';
import EthersService from '../ethers/ethers.service';
import { EventsService } from '../events/events.service';
import { DEFAULT_CONTRACTS } from 'src/common/enums/events.enum';

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly networkService: NetworksService,
    private readonly blockService: BlocksService,
    private readonly ethersService: EthersService,
    private readonly eventsService: EventsService,
  ) {}

  async onModuleInit() {
    try {
      const config = await this.networkService.getConfig();

      const tasks = config.Networks.map(async (network: any) => {
        try {
          await this.blockService.updateCronStatus(
            DEFAULT_CONTRACTS.FACTORY,
            network.chainType,
            false,
          );
        } catch (error: any) {
          this.logger.warn(
            `Failed to update cron status for ${network.chainType}: ${error?.message || error}`,
          );
        }
      });

      await Promise.allSettled(tasks);
    } catch (error: any) {
      this.logger.error(
        `Failed to initialize cron service: ${error?.message || error}`,
        error,
      );
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async fetchEventsFromBlockchain() {
    const config = await this.networkService.getConfig();

    const tasks = config.Networks.map(async (network: any) => {
      try {
        const currentBlock = await this.ethersService.getCurrentBlockNumber(
          network.chainType,
        );
        await this.eventsService.getEvents(
          DEFAULT_CONTRACTS.FACTORY,
          BigInt(network.startBlockFactory),
          network,
          currentBlock,
        );
      } catch (error: any) {
        console.warn(
          `Cron fetch failed for ${network.chainType}: ${error?.message || error}`,
        );
      }
    });

    await Promise.allSettled(tasks);
  }
}
