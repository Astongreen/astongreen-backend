import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = parseInt(this.configService.get<string>('REDIS_PORT', '6379'), 10);
    const password = this.configService.get<string>('REDIS_PASSWORD', '');

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      retryStrategy: (times) => {
        if (times > 10) {
          this.logger.warn('Redis connection retry limit reached. Will continue retrying...');
          return null; // Continue retrying indefinitely
        }
        const delay = Math.min(times * 100, 5000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    // Error handling
    this.client.on('error', (error) => {
      this.logger.error(`Redis connection error: ${error.message}`, error.stack);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis client connecting...');
    });

    this.client.on('ready', () => {
      this.logger.log('Redis client ready');
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      this.logger.warn('Redis client reconnecting...');
    });
  }

  async onModuleInit() {
    try {
      this.logger.log('Initializing Redis connection...');
      await this.verifyConnection();
      this.logger.log('✅ Redis connection verified successfully');
    } catch (error) {
      this.logger.warn(`⚠️  Failed to verify Redis connection: ${error.message}`);
      this.logger.warn('Application will continue without Redis. Redis will retry connection in the background.');
      // Don't throw error - allow app to start without Redis
      // The client will continue to retry in the background
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }

  /**
   * Verify Redis connection by performing a PING command
   */
  async verifyConnection(): Promise<boolean> {
    try {
      // Check if already connected
      if (this.client.status === 'ready') {
        const result = await this.client.ping();
        if (result === 'PONG') {
          this.logger.log(`Redis PING successful - Connected to ${this.client.options.host}:${this.client.options.port}`);
          return true;
        }
      }
      
      // Try to connect if not already connected
      if (this.client.status === 'wait' || this.client.status === 'end') {
        await this.client.connect();
        const result = await this.client.ping();
        
        if (result === 'PONG') {
          this.logger.log(`Redis PING successful - Connected to ${this.client.options.host}:${this.client.options.port}`);
          return true;
        }
      }
      
      throw new Error('Redis PING did not return PONG');
    } catch (error) {
      this.logger.error(`Redis connection verification failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the Redis client instance
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * Check if Redis is connected
   */
  isConnected(): boolean {
    return this.client.status === 'ready';
  }

  // Common Redis operations with connection checks
  async get(key: string): Promise<string | null> {
    if (!this.isConnected()) {
      this.logger.warn('Redis not connected. Operation skipped.');
      return null;
    }
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Redis GET operation failed: ${error.message}`);
      return null;
    }
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<'OK' | null> {
    if (!this.isConnected()) {
      this.logger.warn('Redis not connected. Operation skipped.');
      return null;
    }
    try {
      if (expirySeconds) {
        return await this.client.setex(key, expirySeconds, value);
      }
      return await this.client.set(key, value);
    } catch (error) {
      this.logger.error(`Redis SET operation failed: ${error.message}`);
      return null;
    }
  }

  async del(key: string): Promise<number> {
    if (!this.isConnected()) {
      this.logger.warn('Redis not connected. Operation skipped.');
      return 0;
    }
    try {
      return await this.client.del(key);
    } catch (error) {
      this.logger.error(`Redis DEL operation failed: ${error.message}`);
      return 0;
    }
  }

  async exists(key: string): Promise<number> {
    if (!this.isConnected()) {
      this.logger.warn('Redis not connected. Operation skipped.');
      return 0;
    }
    try {
      return await this.client.exists(key);
    } catch (error) {
      this.logger.error(`Redis EXISTS operation failed: ${error.message}`);
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (!this.isConnected()) {
      this.logger.warn('Redis not connected. Operation skipped.');
      return 0;
    }
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Redis EXPIRE operation failed: ${error.message}`);
      return 0;
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.isConnected()) {
      this.logger.warn('Redis not connected. Operation skipped.');
      return -2;
    }
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Redis TTL operation failed: ${error.message}`);
      return -2;
    }
  }
}

