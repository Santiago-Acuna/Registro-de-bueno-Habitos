import { Module } from '@nestjs/common';

import { ActionLogsController } from './controllers/action-logs.controller';
import { ActionLogsService } from './services/action-logs.service';

@Module({
  controllers: [ActionLogsController],
  providers: [
    ActionLogsService,
    {
      provide: 'IActionLogsRepository',
      useValue: {},
    },
  ],
  exports: [ActionLogsService],
})
export class ActionLogsModule {}
