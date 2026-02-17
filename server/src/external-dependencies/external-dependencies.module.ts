import { Module } from '@nestjs/common';

import { ExternalDependenciesController } from './controllers/external-dependencies.controller';
import { ExternalDependenciesRepository } from './repositories/external-dependencies.repository';
import { ExternalDependenciesService } from './services/external-dependencies.service';

@Module({
  controllers: [ExternalDependenciesController],
  providers: [
    ExternalDependenciesService,
    {
      provide: 'IExternalDependenciesRepository',
      useClass: ExternalDependenciesRepository,
    },
  ],
  exports: [ExternalDependenciesService, 'IExternalDependenciesRepository'],
})
export class ExternalDependenciesModule {}
