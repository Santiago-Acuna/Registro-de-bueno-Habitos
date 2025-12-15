import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ActionTypesModule } from '../../action-types/action-types.module';
import { HabitsModule } from '../../habits/habits.module';

import { FrontConfigController } from './frontConfig.controller';
import { FrontConfigService } from './frontConfig.service';

@Module({
  imports: [ConfigModule, HabitsModule, ActionTypesModule],
  controllers: [FrontConfigController],
  providers: [FrontConfigService],
  exports: [FrontConfigService],
})
export class FrontConfigModule {}
