import { FeatureEntity } from '../../domain/entities/feature.entity';

export interface FeatureFilterOptions {
  ready?: boolean;
  completedAt?: Date;
}

export interface IFeaturesRepository {
  /**
   * Find all features, optionally filtered
   * @param filters - Optional filters for ready and completedAt
   * @returns Promise<FeatureEntity[]>
   */
  findAll(filters?: FeatureFilterOptions): Promise<FeatureEntity[]>;

  /**
   * Find a single feature by ID
   * @param id - Feature UUID
   * @returns Promise<FeatureEntity | null>
   */
  findById(id: string): Promise<FeatureEntity | null>;
}
