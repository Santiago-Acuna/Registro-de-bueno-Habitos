import { Module } from '@nestjs/common';

import { FeaturesController } from './controllers/features.controller';
import { FeaturesRepository } from './repositories/features.repository';
import { FeaturesService } from './services/features.service';

@Module({
  controllers: [FeaturesController],
  providers: [
    FeaturesService,
    {
      provide: 'IFeaturesRepository',
      useClass: FeaturesRepository,
    },
  ],
  exports: [FeaturesService, 'IFeaturesRepository'],
})
export class FeaturesModule {}
