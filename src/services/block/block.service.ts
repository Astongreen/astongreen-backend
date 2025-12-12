import { Injectable } from '@nestjs/common';
import { NetworksService } from '../networks/networks.service';
import { RedisService } from 'src/redis/redis.service';

interface StoredBlockInfo {
  lastBlock?: string;
  cronInProcess?: boolean;
}

interface ComputedBlockInfo {
  startBlock: bigint;
  endBlock: bigint;
  cronInProcess: boolean;
}

@Injectable()
export class BlocksService {
  constructor(
    private readonly redisService: RedisService,
    private readonly networkService: NetworksService,
  ) {}

  private getRedisKey(contract: string, chainType: string): string {
    return `block_info:${contract}:${chainType}`;
  }

  private parseStored(raw: string | null): StoredBlockInfo | null {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredBlockInfo;
    } catch {
      return null;
    }
  }

  async getBlockInfo(
    contract: string,
    contractStartBlock: bigint,
    chainType: string,
    currentBlock: number,
  ): Promise<ComputedBlockInfo> {
    try {
      // Resolve batch size with sane defaults
      const cfg = await this.networkService.getConfig();
      const eventBatchSizeNum = Math.max(1, Number(cfg.eventBatchSize ?? 1000));

      const stored = await this.getBlocks(contract, chainType);
      // Determine start block
      let startBlock = contractStartBlock;
      if (stored?.lastBlock) {
        const last = BigInt(Number(stored.lastBlock));
        startBlock = last + BigInt(1);
      }

      // Clamp to current head if somehow beyond
      const head = BigInt(currentBlock);
      if (startBlock > head) {
        startBlock = head;
      }

      // Compute end block (inclusive window)
      let endBlock = BigInt(startBlock) + BigInt(eventBatchSizeNum);
      if (endBlock > head) endBlock = head;
      if (endBlock < startBlock) endBlock = startBlock;

      return {
        startBlock,
        endBlock,
        cronInProcess: !!stored?.cronInProcess,
      };
    } catch (error) {
      console.log('error-->>>', error);
      throw new Error(String(error));
    }
  }

  async getBlocks(
    contract: string,
    chainType: string,
  ): Promise<StoredBlockInfo | null> {
    const key = this.getRedisKey(contract, chainType);
    const raw = await this.redisService.get(key);
    return this.parseStored(raw as string);
  }

  async updateCronStatus(
    contract: string,
    chainType: string,
    cronInProcess: boolean,
  ): Promise<boolean> {
    const key = this.getRedisKey(contract, chainType);
    const existing =
      this.parseStored((await this.redisService.get(key)) as string) ?? {};
    const next: StoredBlockInfo = {
      ...existing,
      cronInProcess,
    };

    await this.redisService.set(key, JSON.stringify(next));
    return true;
  }

  async saveBlockInfo(
    contract: string,
    lastBlock: number,
    chainType: string,
  ): Promise<boolean> {
    const key = this.getRedisKey(contract, chainType);
    const existing =
      this.parseStored((await this.redisService.get(key)) as string) ?? {};

    const next: StoredBlockInfo = {
      ...existing,
      lastBlock: lastBlock.toString(),
      cronInProcess: existing.cronInProcess ?? false,
    };

    await this.redisService.set(key, JSON.stringify(next));
    return true;
  }
}
