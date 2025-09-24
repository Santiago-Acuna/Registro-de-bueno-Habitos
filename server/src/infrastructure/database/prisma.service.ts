import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
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

    // Set up logging handlers
    (this as any).$on('query', (e: any) => {
      this.logger.debug(`Query: ${e.query}`);
      this.logger.debug(`Params: ${e.params}`);
      this.logger.debug(`Duration: ${e.duration}ms`);
    });

    (this as any).$on('error', (e: any) => {
      this.logger.error('Database error:', e.message);
    });

    (this as any).$on('warn', (e: any) => {
      this.logger.warn('Database warning:', e.message);
    });

    (this as any).$on('info', (e: any) => {
      this.logger.log('Database info:', e.message);
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await (this as any).$connect();
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await (this as any).$disconnect();
      this.logger.log('✅ Database disconnected successfully');
    } catch (error) {
      this.logger.error('❌ Failed to disconnect from database:', error);
    }
  }

  /**
   * Enables soft delete behavior
   */
  async enableShutdownHooks(app: any): Promise<void> {
    // Use process events instead of Prisma events for shutdown handling
    process.on('beforeExit', async () => {
      await (this as any).$disconnect();
      await app.close();
    });
  }

  /**
   * Health check method for database connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      await (this as any).$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
