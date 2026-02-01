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
    const {
      externalDependencyId,
      actionId,
      commitTypeId,
      commitScopeId,
      programmingLanguageId,
      featuresId,
      ...rest
    } = data;

    const createData: Record<string, unknown> = {
      ...rest,
      actionLogs: { connect: { id: actionId as string } },
      subtypesDevelopmentLogsCommitTypeIdTosubtypes: { connect: { id: commitTypeId as number } },
      subtypesDevelopmentLogsCommitScopeIdTosubtypes: { connect: { id: commitScopeId as number } },
      programmingLanguages: { connect: { id: programmingLanguageId as number } },
    };

    if (featuresId) {
      createData['features'] = { connect: { id: featuresId as string } };
    }

    const createdLog = await this.prisma.developmentLogs.create({
      data: createData as any,
    });

    if (externalDependencyId != null) {
      await this.prisma.developmentLogsExternalDependencies.create({
        data: {
          developmentLogId: createdLog.id,
          externalDependencyId: externalDependencyId as number,
        },
      });
    }
  }

  getLogTypeName(): string {
    return 'development';
  }
}
