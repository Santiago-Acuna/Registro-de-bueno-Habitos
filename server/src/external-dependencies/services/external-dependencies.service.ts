import { Inject, Injectable, Logger } from '@nestjs/common';

import { ExternalDependencyEntity } from '../../domain/entities/external-dependency.entity';
import { NotFoundError } from '../../infrastructure/exceptions/app.exceptions';
import { ExternalDependencyResponseDto } from '../dto/external-dependency-response.dto';
import { IExternalDependenciesRepository } from '../interfaces/external-dependencies-repository.interface';

@Injectable()
export class ExternalDependenciesService {
  private readonly logger = new Logger(ExternalDependenciesService.name);

  constructor(
    @Inject('IExternalDependenciesRepository')
    private readonly externalDependenciesRepository: IExternalDependenciesRepository
  ) {}

  async findAll(): Promise<ExternalDependencyResponseDto[]> {
    this.logger.log('Fetching all external dependencies');

    const externalDependencies = await this.externalDependenciesRepository.findAll();

    return externalDependencies.map(externalDependency => this.mapToResponse(externalDependency));
  }

  async findOne(id: number): Promise<ExternalDependencyResponseDto> {
    this.logger.log(`Fetching external dependency with id: ${id}`);

    const externalDependency = await this.externalDependenciesRepository.findById(id);
    if (!externalDependency) {
      throw new NotFoundError('External Dependency', String(id));
    }

    return this.mapToResponse(externalDependency);
  }

  private mapToResponse(
    externalDependency: ExternalDependencyEntity
  ): ExternalDependencyResponseDto {
    return {
      id: externalDependency.id,
      name: externalDependency.name,
      programmingLanguageId: externalDependency.programmingLanguageId,
    };
  }
}
