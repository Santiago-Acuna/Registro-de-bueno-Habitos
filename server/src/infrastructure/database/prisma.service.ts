import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

type QueryEvent = {
  query: string;
  params: string;
  duration: number;
};

type LogEvent = {
  message: string;
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'pretty',
    });

    // Set up logging handlers with proper types
    (
      this as PrismaClient & { $on: (event: 'query', handler: (e: QueryEvent) => void) => void }
    ).$on('query', (e: QueryEvent) => {
      this.logger.debug(`Query: ${e.query}`);
      this.logger.debug(`Params: ${e.params}`);
      this.logger.debug(`Duration: ${e.duration}ms`);
    });

    (this as PrismaClient & { $on: (event: 'error', handler: (e: LogEvent) => void) => void }).$on(
      'error',
      (e: LogEvent) => {
        this.logger.error('Database error:', e.message);
      }
    );

    (this as PrismaClient & { $on: (event: 'warn', handler: (e: LogEvent) => void) => void }).$on(
      'warn',
      (e: LogEvent) => {
        this.logger.warn('Database warning:', e.message);
      }
    );

    (this as PrismaClient & { $on: (event: 'info', handler: (e: LogEvent) => void) => void }).$on(
      'info',
      (e: LogEvent) => {
        this.logger.log('Database info:', e.message);
      }
    );
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.log('✅ Database disconnected successfully');
    } catch (error) {
      this.logger.error('❌ Failed to disconnect from database:', error);
    }
  }

  /**
   * Enables shutdown hooks for graceful application shutdown
   */
  enableShutdownHooks(app: { close?: () => Promise<void> }): void {
    // Use process events instead of Prisma events for shutdown handling
    const handler = async (): Promise<void> => {
      await this.$disconnect();
      // Type coercion allows runtime error if close doesn't exist
      await (app as { close: () => Promise<void> }).close();
    };

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('beforeExit', handler);
  }

  /**
   * Health check method for database connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
