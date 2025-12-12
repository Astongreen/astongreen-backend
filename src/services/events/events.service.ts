import {
  Injectable,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import EthersService from '../ethers/ethers.service';
import { BlocksService } from '../block/block.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { EventInfo } from './entities/event.entity';
import {
  DEFAULT_CONTRACTS,
  FACTORY_EVENTS,
} from 'src/common/enums/events.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventInfo) private eventRepository: Repository<EventInfo>,
    @Inject(forwardRef(() => EthersService))
    private readonly ethersService: EthersService,
    private readonly blockService: BlocksService,
  ) {}

  async getEvents(
    contract: DEFAULT_CONTRACTS,
    startBlock: bigint,
    network: any,
    currentBlock: number,
  ): Promise<any> {
    const chainType = network.chainType;
    let blockInfo: any = await this.blockService.getBlockInfo(
      contract,
      startBlock,
      chainType,
      currentBlock,
    );

    if (
      blockInfo.startBlock <= blockInfo.endBlock &&
      !blockInfo.cronInProcess
    ) {
      await this.blockService.updateCronStatus(contract, chainType, true);
      try {
        const contractInstance: any = await this.ethersService.getContract(
          chainType,
          contract,
        );

        let getAllEvents = await this.ethersService.getPastEventsWithRetry(
          contractInstance,
          contract,
          {
            fromBlock: blockInfo.startBlock,
            toBlock: blockInfo.endBlock,
          },
          chainType,
        );

        if (getAllEvents?.length) {
          getAllEvents = getAllEvents.map((event: any) => {
            return {
              eventName: event.fragment.name,
              transactionHash: network.explorer + 'tx/' + event.transactionHash,
              index: event.index,
              blockNumber: event.blockNumber,
              address: event.address,
              data: event.args.reduce((acc: any, value: any, index: number) => {
                acc[event.fragment.inputs[index].name] = value;
                return acc;
              }, {}),
            };
          });

          console.log('Events fetched: ', getAllEvents);

          await this.blockService.saveBlockInfo(
            contract,
            getAllEvents[getAllEvents.length - 1].blockNumber,
            chainType,
          );

          const provider = this.ethersService.getProvider(
            network.rpcUrl,
            network.chainType,
          );

          for (const eventInformation of getAllEvents) {
            if (
              eventInformation.transactionHash.includes('0x') &&
              !eventInformation.transactionHash.startsWith('0x')
            ) {
              const idx = eventInformation.transactionHash.indexOf('0x');
              eventInformation.transactionHash =
                eventInformation.transactionHash.slice(idx);
            }

            eventInformation.data['transactionHash'] =
              eventInformation.transactionHash;
            const receipt = await provider.getTransactionReceipt(
              eventInformation.transactionHash,
            );
            eventInformation.data['userAddress'] = receipt?.from;

            if (eventInformation.eventName) {
              switch (eventInformation.eventName) {
                case FACTORY_EVENTS.TOKEN_DEPLOYED:
                  console.log('Token deployed: ', eventInformation.data);
                  break;
                default:
                  break;
              }
            }
          }
        } else {
          await this.blockService.saveBlockInfo(
            contract,
            Number(blockInfo.endBlock),
            chainType,
          );
        }
      } finally {
        await this.blockService.updateCronStatus(contract, chainType, false);
      }
    } else {
      await this.blockService.saveBlockInfo(
        contract,
        Number(blockInfo.endBlock),
        chainType,
      );
    }
  }

  async checkEventExist(
    contract: string,
    transactionHash: string,
    logIndex: number,
    blockNumber: number,
    chainType: string,
  ) {
    try {
      let result = await this.eventRepository.findOne({
        where: {
          contract,
          transactionHash: Like(`%${transactionHash}%`),
          logIndex,
          blockNumber,
          chainType,
        },
      });

      if (result) {
        return false;
      }

      const savedResult = await this.eventRepository.save({
        contract,
        transactionHash,
        logIndex,
        blockNumber,
        chainType,
      });
      return savedResult;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
