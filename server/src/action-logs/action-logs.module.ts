import { Module } from '@nestjs/common';

import { PrismaService } from '../infrastructure/database/prisma.service';

import { ActionLogsController } from './controllers/action-logs.controller';
import { ActionLogsRepository } from './repositories/action-logs.repository';
import { DevelopmentLogStrategy } from './repositories/strategies/development-log.strategy';
import { ILogTableStrategy } from './repositories/strategies/interfaces/log-table-strategy.interface';
import { LogTableStrategyRegistry } from './repositories/strategies/log-table-strategy.registry';
import { PronunciationLogStrategy } from './repositories/strategies/pronunciation-log.strategy';
import { ReadingLogStrategy } from './repositories/strategies/reading-log.strategy';
import { ActionLogsService } from './services/action-logs.service';
import { LogValidationService } from './services/log-validation.service';

@Module({
  controllers: [ActionLogsController],
  providers: [
    PrismaService,
    ActionLogsService,
    LogValidationService,
    DevelopmentLogStrategy,
    ReadingLogStrategy,
    PronunciationLogStrategy,
    {
      provide: 'LOG_TABLE_STRATEGIES',
      useFactory: (
        developmentStrategy: DevelopmentLogStrategy,
        readingStrategy: ReadingLogStrategy,
        pronunciationStrategy: PronunciationLogStrategy
      ): ILogTableStrategy[] => [developmentStrategy, readingStrategy, pronunciationStrategy],
      inject: [DevelopmentLogStrategy, ReadingLogStrategy, PronunciationLogStrategy],
    },
    LogTableStrategyRegistry,
    {
      provide: 'IActionLogsRepository',
      useClass: ActionLogsRepository,
    },
  ],
  exports: [ActionLogsService],
})
export class ActionLogsModule {}
