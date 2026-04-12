import { Module } from '@nestjs/common';

import { PrismaService } from '../infrastructure/database/prisma.service';

import { ActionLogsController } from './controllers/action-logs.controller';
import { ActionLogsRepository } from './repositories/action-logs.repository';
import { DevelopmentLogStrategy } from './repositories/strategies/development-log.strategy';
import { ILogTableStrategy } from './repositories/strategies/interfaces/log-table-strategy.interface';
import { LogTableStrategyRegistry } from './repositories/strategies/log-table-strategy.registry';
import { ProcrastinatingWhenIWakeUpLogStrategy } from './repositories/strategies/procrastinating-when-i-wake-up-log.strategy';
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
    ProcrastinatingWhenIWakeUpLogStrategy,
    {
      provide: 'LOG_TABLE_STRATEGIES',
      useFactory: (
        developmentStrategy: DevelopmentLogStrategy,
        readingStrategy: ReadingLogStrategy,
        pronunciationStrategy: PronunciationLogStrategy,
        procrastinatingWhenIWakeUpStrategy: ProcrastinatingWhenIWakeUpLogStrategy
      ): ILogTableStrategy[] => [
        developmentStrategy,
        readingStrategy,
        pronunciationStrategy,
        procrastinatingWhenIWakeUpStrategy,
      ],
      inject: [
        DevelopmentLogStrategy,
        ReadingLogStrategy,
        PronunciationLogStrategy,
        ProcrastinatingWhenIWakeUpLogStrategy,
      ],
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
