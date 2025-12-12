import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import {
  DEFAULT_CONTRACTS,
  FACTORY_EVENTS,
} from 'src/common/enums/events.enum';
import { BlocksService } from '../block/block.service';
import { EventsService } from '../events/events.service';
import { NetworksService } from '../networks/networks.service';
import { FACTORY_ABI } from 'src/abis/factory.abi';

@Injectable()
export default class EthersService {
  private providers: Record<string, ethers.JsonRpcProvider> = {};
  private contractAddresses: any[] = [];
  private contractInstances: Record<string, any> = {};
  private ethersProvider: Record<string, ethers.JsonRpcProvider> = {};

  constructor(
    private readonly blockService: BlocksService,
    @Inject('ETHERS_PROVIDER')
    providers: Record<string, ethers.JsonRpcProvider>,
    @Inject('CONTRACT_ADDRESSES') contractAddresses: any,
    private readonly networkService: NetworksService,
    @Inject(forwardRef(() => EventsService))
    private readonly eventService: EventsService,
  ) {
    this.ethersProvider = providers;
    this.contractAddresses = contractAddresses;
  }

  async onModuleInit() {
    try {
      this.createContractInstance();
    } catch (error) {
      console.error(
        `Failed to initialize contract instances: ${error.message}`,
      );
    }
  }

  createContractInstance() {
    this.contractAddresses.forEach((contract: any) => {
      this.contractInstances[contract.chainType] = {
        factoryInstance: new ethers.Contract(
          contract.factoryContractAddress,
          FACTORY_ABI,
          this.ethersProvider[contract.chainType],
        ),
      };
    });
  }

  getProvider(rpcUrl: string, cacheKey?: string) {
    const key = cacheKey || rpcUrl;
    if (!this.providers[key]) {
      this.providers[key] = new ethers.JsonRpcProvider(rpcUrl);
    }
    return this.providers[key];
  }

  async getContract(chainType: string, contract: string, address: string = '') {
    let contractInstance: any;
    switch (contract) {
      case DEFAULT_CONTRACTS.FACTORY:
        contractInstance =
          this.contractInstances?.[chainType]?.factoryInstance ??
          (await this.createEthersInstance(chainType, contract));
        break;
    }
    return contractInstance;
  }

  async getCurrentBlockNumber(chainType: string): Promise<number> {
    try {
      if (!this.ethersProvider[chainType]) {
        throw new Error(`No provider found for chain type: ${chainType}`);
      }

      const provider = this.ethersProvider[chainType];

      const maxRetries = 3;
      const baseDelayMs = 750;
      let lastError: any;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const currentBlock = await provider.getBlockNumber();
          return currentBlock;
        } catch (error: any) {
          lastError = error;
          const isTimeout =
            error?.code === 'TIMEOUT' ||
            /timeout/i.test(String(error?.message));
          const isNetworkish =
            error?.code === 'SERVER_ERROR' || error?.code === 'NETWORK_ERROR';
          if (attempt < maxRetries - 1 && (isTimeout || isNetworkish)) {
            const delay = baseDelayMs * Math.pow(2, attempt);
            console.warn(
              `getBlockNumber retry ${attempt + 1}/${maxRetries - 1} for ${chainType} due to ${
                error?.code || error?.message
              }. Waiting ${delay}ms...`,
            );
            await this.delay(delay);
            continue;
          }
          break;
        }
      }

      console.error(`Error fetching block number for ${chainType}:`, lastError);
      throw lastError;
    } catch (error) {
      console.error(`Error fetching block number for ${chainType}:`, error);
      throw error;
    }
  }

  async createEthersInstance(
    chainType: string,
    contract: string,
    dynamicAddress: string = '',
  ) {
    const address =
      dynamicAddress || (await this.getContractAddress(contract, chainType));
    if (!address) {
      throw new Error(
        `Contract address not found for ${contract} on ${chainType}`,
      );
    }

    const provider = this.ethersProvider[chainType];

    if (!provider) {
      throw new Error(`No provider found for chainType: ${chainType}`);
    }

    return new ethers.Contract(
      address,
      await this.getContractAbi(contract),
      provider,
    );
  }

  async getContractAddress(contract: string, chainType?: string) {
    if (!chainType) {
      const config = await this.networkService.getConfig();
      chainType = config.Networks[0].chainType;
    }
    const entry = this.contractAddresses.find(
      (obj: { chainType: string }) => obj.chainType === chainType,
    );
    if (!entry) return undefined;
    switch (contract) {
      case DEFAULT_CONTRACTS.FACTORY:
        return entry.factoryContractAddress;
    }
  }

  async getContractAbi(contract: string) {
    const abis = {
      [DEFAULT_CONTRACTS.FACTORY]: FACTORY_ABI,
    };
    const abi = abis[contract as keyof typeof abis];
    if (!abi) {
      throw new Error(`Contract ABI for ${contract} not available.`);
    }

    return abi;
  }

  async getPastEventsWithRetry(
    contractInstance: ethers.Contract,
    contract: DEFAULT_CONTRACTS,
    filterOptions: { fromBlock?: number; toBlock?: number },
    chainType: string,
    maxRetries = 1,
    retryDelay = 500,
  ): Promise<any> {
    try {
      let retries = 0;
      let allEvents: any[] = [];
      if (!filterOptions.fromBlock || isNaN(Number(filterOptions.fromBlock))) {
        throw new Error(`Invalid fromBlock value: ${filterOptions.fromBlock}`);
      }

      while (retries < maxRetries) {
        try {
          const fromBlock =
            filterOptions.fromBlock && !isNaN(Number(filterOptions.fromBlock))
              ? parseInt(filterOptions.fromBlock.toString())
              : undefined;

          const toBlock =
            filterOptions.toBlock && !isNaN(Number(filterOptions.toBlock))
              ? parseInt(filterOptions.toBlock.toString())
              : 'latest';

          // Build a single OR-topics filter for all events of this contract
          const iface: any = (contractInstance as any).interface;
          const eventNames: string[] = (FACTORY_EVENTS as any)[contract] ?? [];
          const topicsOr: string[] = [];
          const formatInputType = (input: any): string => {
            // Handle tuple and tuple[] recursively
            if (input.type === 'tuple' || input.type === 'tuple[]') {
              const inner = `(${(input.components || [])
                .map((c: any) => formatInputType(c))
                .join(',')})`;
              return input.type.endsWith('[]') ? `${inner}[]` : inner;
            }
            return input.type;
          };
          const filters: any = (contractInstance as any).filters || {};
          for (const name of eventNames) {
            // 1) Prefer filter-provided topic (most reliable)
            try {
              const f =
                typeof filters[name] === 'function'
                  ? filters[name]()
                  : undefined;
              const t0 = f?.topics?.[0];
              if (t0) {
                topicsOr.push(t0);
                continue;
              }
            } catch {}

            // 2) Fallback to interface fragment + hashing
            let frag: any | undefined;
            try {
              if (typeof iface.getEvent === 'function') {
                frag = iface.getEvent(name);
              }
            } catch {}
            if (!frag && Array.isArray(iface.fragments)) {
              const matches = iface.fragments.filter(
                (f: any) => f?.type === 'event' && f?.name === name,
              );
              frag = matches[0];
            }
            if (frag && Array.isArray(frag.inputs)) {
              const signature = `${frag.name}(${frag.inputs
                .map((i: any) => formatInputType(i))
                .join(',')})`;
              const topic = (ethers as any).id
                ? (ethers as any).id(signature)
                : (ethers as any).utils?.id?.(signature);
              if (topic) topicsOr.push(topic);
            }
          }

          const provider = this.ethersProvider[chainType];
          const address: string =
            (contractInstance as any).target ??
            (contractInstance as any).address;

          const logs = await provider.getLogs({
            address,
            topics: [topicsOr],
            fromBlock,
            toBlock,
          });

          const parsedEvents = logs.map((log: any) => {
            const parsed = iface.parseLog(log);
            return {
              ...log,
              ...parsed,
              index: log.index,
            };
          });

          allEvents = await this.concatUniqueByKey(
            [],
            parsedEvents,
            contract,
            chainType,
          );

          break;
        } catch (error: any) {
          console.error(
            `Error retrieving past events (Attempt ${retries + 1}):`,
            error.message,
          );

          retries++;
          if (retries === maxRetries) {
            throw new Error('Max retries reached while fetching past events.');
          }
          await this.delay(retryDelay);
        }
      }

      return allEvents;
    } catch (error) {
      console.error(`Error fetching past events: ${error.message}`);
      throw error;
    }
  }

  async delay(time: any) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  async concatUniqueByKey(
    allEvents: any,
    pastEvents: any,
    contract: string,
    chainType: string,
  ) {
    for (const obj of pastEvents) {
      const { transactionHash, index: logIndex, blockNumber, ...rest } = obj;
      const exists = await this.checkMultipleValuesInArray(allEvents, {
        transactionHash,
        logIndex,
        blockNumber,
      });

      if (!exists) {
        let checkEvent = await this.eventService.checkEventExist(
          contract,
          obj.transactionHash,
          Number(logIndex),
          obj.blockNumber,
          chainType,
        );

        if (checkEvent) allEvents.push(obj);
      }
    }
    return allEvents;
  }

  async checkMultipleValuesInArray(array: any, criteria: any) {
    return array.some((obj: any) =>
      Object.keys(criteria).every((key) => obj[key] === criteria[key]),
    );
  }

  async callGetMethod(
    method: string,
    data: unknown[],
    contractType: DEFAULT_CONTRACTS,
    network: any,
    dynamicAddress = '',
  ): Promise<unknown> {
    try {
      const contract: any = await this.getContract(
        network.chainType,
        contractType,
        dynamicAddress,
      );
      const fn = contract?.[method];
      if (typeof fn !== 'function')
        throw new Error('Contract method not found.');

      const result = await fn(...Array.prototype.slice.call(data));

      return result;
    } catch (error) {
      console.error(`Error calling get method: ${error.message}`);
      throw error;
    }
  }

  async callSendMethod(
    method: string,
    data: unknown[],
    contractType: DEFAULT_CONTRACTS,
    network: any,
    dynamicAddress = '',
    overrides: Record<string, any> = {},
  ): Promise<unknown> {
    try {
      const provider = this.getProvider(network.rpcUrl, network.chainType);
      const signer = new ethers.Wallet(network.privateKey, provider);

      const contract: any = await this.getContract(
        network.chainType,
        contractType,
        dynamicAddress,
      );
      const contractWithSigner = contract.connect(signer);
      const fn = contractWithSigner?.[method];
      if (typeof fn !== 'function')
        throw new Error('Contract method not found.');

      const tx = await fn(...Array.prototype.slice.call(data), overrides);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error(`Error calling send method: ${error.message}`);
      throw error;
    }
  }

  async getStartEndBlock(
    type: string,
    contractStartBlock: string,
    network: any,
  ): Promise<any> {
    let fromBlock = contractStartBlock;
    const eventBatchSize = (await this.networkService.getConfig())
      .eventBatchSize;
    const blockInfo: any = await this.blockService.getBlockInfo(
      type,
      network.chainType,
      network.chainType,
      network.chainType,
    );
    if (blockInfo) {
      if (blockInfo.cronInProcess) return false;
      if (blockInfo.lastBlock)
        fromBlock = (parseInt(blockInfo.lastBlock) + 1).toString();
    }
    const startBlock = fromBlock;
    const provider = this.getProvider(network.rpcUrl, network.chainType);
    const currentBlock = await provider.getBlockNumber();
    let endBlock = parseInt(startBlock) + parseInt(eventBatchSize);
    if (parseInt(startBlock) + parseInt(eventBatchSize) > currentBlock) {
      endBlock = currentBlock as any;
    }
    return { startBlock, endBlock: endBlock.toString() };
  }
}
