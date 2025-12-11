import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly client: InstanceType<typeof Redis>;

    constructor(private readonly config: ConfigService) {
        const host = this.config.get<string>('REDIS_HOST', '127.0.0.1');
        const port = parseInt(this.config.get<string>('REDIS_PORT', '6379'), 10);
        const password = this.config.get<string>('REDIS_PASSWORD') || undefined;
        const db = parseInt(this.config.get<string>('REDIS_DB', '0'), 10);

        this.client = new Redis({
            host,
            port,
            password,
            db,
            keyPrefix: 'aston_green:',
            lazyConnect: false,
            maxRetriesPerRequest: 3,
        });
    }

    async onModuleDestroy() {
        try {
            await this.client.quit();
        } catch {
            await this.client.disconnect();
        }
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const payload = JSON.stringify(value);
        if (ttlSeconds && ttlSeconds > 0) {
            await this.client.set(key, payload, 'EX', ttlSeconds);
        } else {
            await this.client.set(key, payload);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        const raw = await this.client.get(key);
        if (!raw) return null;
        try {
            return JSON.parse(raw) as T;
        } catch {
            return null as any;
        }
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }
}


