import { Module } from '@nestjs/common';

import { DatabaseModule } from '../infrastructure/database/database.module';

import { GlobalEntityIdentifiersRepository } from './repositories/global-entity-identifiers.repository';
import { GlobalEntityIdentifiersService } from './services/global-entity-identifiers.service';

@Module({
  providers: [
    GlobalEntityIdentifiersService,
    {
      provide: 'IGlobalEntityIdentifiersRepository',
      useClass: GlobalEntityIdentifiersRepository,
    },
  ],
  imports: [DatabaseModule],
  exports: [GlobalEntityIdentifiersService],
})
export class GlobalEntityIdentifiersModule {}
