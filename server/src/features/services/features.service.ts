import { Inject, Injectable, Logger } from '@nestjs/common';

import { FeatureEntity } from '../../domain/entities/feature.entity';
import { NotFoundError } from '../../infrastructure/exceptions/app.exceptions';
import { FeatureResponseDto } from '../dto/feature-response.dto';
import { IFeaturesRepository, FeatureFilterOptions } from '../interfaces/features-repository.interface';

@Injectable()
export class FeaturesService {
  private readonly logger = new Logger(FeaturesService.name);

  constructor(
    @Inject('IFeaturesRepository')
    private readonly featuresRepository: IFeaturesRepository
  ) {}

  async findAll(filters?: FeatureFilterOptions): Promise<FeatureResponseDto[]> {
    this.logger.log('Fetching all features');

    const features = await this.featuresRepository.findAll(filters);

    return features.map(feature => this.mapToResponse(feature));
  }

  async findOne(id: string): Promise<FeatureResponseDto> {
    this.logger.log(`Fetching feature with id: ${id}`);

    const feature = await this.featuresRepository.findById(id);
    if (!feature) {
      throw new NotFoundError('Feature', id);
    }

    return this.mapToResponse(feature);
  }

  private mapToResponse(feature: FeatureEntity): FeatureResponseDto {
    return {
      id: feature.id,
      name: feature.name,
      description: feature.description,
      ready: feature.ready,
      completedAt: feature.completedAt,
    };
  }
}
