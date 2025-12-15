import { Module } from '@nestjs/common';

import { CloudinaryModule } from '../helpers/cloudinary';

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
  imports: [CloudinaryModule],
  exports: [ActionTypesService, 'IActionTypesRepository'],
})
export class ActionTypesModule {}
