import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service';

import { ILogTableStrategy } from './interfaces/log-table-strategy.interface';

/**
 * Strategy implementation for Reading logs
 * Handles insertions into the readingLogs table
 */
@Injectable()
export class ReadingLogStrategy implements ILogTableStrategy {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Record<string, unknown>): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.prisma.readingLogs.create({ data: data as any });
  }

  getLogTypeName(): string {
    return 'reading';
  }
}
