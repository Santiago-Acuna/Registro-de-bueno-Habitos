import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service';

import { ILogTableStrategy } from './interfaces/log-table-strategy.interface';

/**
 * Strategy implementation for Development logs
 * Handles insertions into the developmentLogs table
 */
@Injectable()
export class DevelopmentLogStrategy implements ILogTableStrategy {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Record<string, unknown>): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.prisma.developmentLogs.create({ data: data as any });
  }

  getLogTypeName(): string {
    return 'development';
  }
}
