import { Module } from '@nestjs/common';

import { SubtypesController } from './controllers/subtypes.controller';
import { SubtypesRepository } from './repositories/subtypes.repository';
import { SubtypesService } from './services/subtypes.service';

@Module({
  controllers: [SubtypesController],
  providers: [
    SubtypesService,
    {
      provide: 'ISubtypesRepository',
      useClass: SubtypesRepository,
    },
  ],
  exports: [SubtypesService, 'ISubtypesRepository'],
})
export class SubtypesModule {}
