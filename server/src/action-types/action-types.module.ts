import { Module } from '@nestjs/common';

import { CloudinaryModule } from '../helpers/cloudinary';
import { HabitsModule } from '../habits/habits.module';

import { ActionTypesController } from './controllers/action-types.controller';
import { ActionTypesRepository } from './repositories/action-types.repository';
import { ActionTypesService } from './services/action-types.service';

@Module({
  controllers: [ActionTypesController],
  providers: [
    ActionTypesService,
    {
      provide: 'IActionTypesRepository',
      useClass: ActionTypesRepository,
    },
  ],
  imports: [CloudinaryModule, HabitsModule],
  exports: [ActionTypesService, 'IActionTypesRepository'],
})
export class ActionTypesModule {}
