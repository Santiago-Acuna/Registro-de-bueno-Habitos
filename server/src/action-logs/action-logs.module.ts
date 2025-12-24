import { Module } from '@nestjs/common';

import { PrismaService } from '../infrastructure/database/prisma.service';

import { ActionLogsController } from './controllers/action-logs.controller';
import { ActionLogsRepository } from './repositories/action-logs.repository';
import { ActionLogsService } from './services/action-logs.service';

@Module({
  controllers: [ActionLogsController],
  providers: [
    PrismaService,
    ActionLogsService,
    {
      provide: 'IActionLogsRepository',
      useClass: ActionLogsRepository,
    },
  ],
  exports: [ActionLogsService],
})
export class ActionLogsModule {}
