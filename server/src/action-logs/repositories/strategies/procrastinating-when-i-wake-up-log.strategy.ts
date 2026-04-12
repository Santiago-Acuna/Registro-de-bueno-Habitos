import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service';

import { ILogTableStrategy } from './interfaces/log-table-strategy.interface';

/**
 * Strategy implementation for Procrastinating When I Wake Up logs
 * Handles insertions into the procrastinating_when_i_wake_up table
 */
@Injectable()
export class ProcrastinatingWhenIWakeUpLogStrategy implements ILogTableStrategy {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Record<string, unknown>): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.prisma.procrastinatingWhenIWakeUp.create({ data: data as any });
  }

  getLogTypeName(): string {
    return 'procrastinating_when_i_wake_up';
  }
}
