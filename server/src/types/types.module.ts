import { Module } from '@nestjs/common';

import { TypesController } from './controllers/types.controller';
import { TypesRepository } from './repositories/types.repository';
import { TypesService } from './services/types.service';

@Module({
  controllers: [TypesController],
  providers: [
    TypesService,
    {
      provide: 'ITypesRepository',
      useClass: TypesRepository,
    },
  ],
  exports: [TypesService, 'ITypesRepository'],
})
export class TypesModule {}
