import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service';

import { ILogTableStrategy } from './interfaces/log-table-strategy.interface';

/**
 * Strategy implementation for Pronunciation logs
 * Handles insertions into the pronunciationLogs table
 */
@Injectable()
export class PronunciationLogStrategy implements ILogTableStrategy {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Record<string, unknown>): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.prisma.pronunciationLogs.create({ data: data as any });
  }

  getLogTypeName(): string {
    return 'pronunciation';
  }
}
