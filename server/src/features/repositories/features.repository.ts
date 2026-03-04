import { Injectable } from '@nestjs/common';

import { FeatureEntity } from '../../domain/entities/feature.entity';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { FeatureFilterOptions, IFeaturesRepository } from '../interfaces/features-repository.interface';

@Injectable()
export class FeaturesRepository implements IFeaturesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: FeatureFilterOptions): Promise<FeatureEntity[]> {
    const where = this.buildWhereClause(filters);

    const data = await this.prisma.features.findMany({
      ...(where ? { where } : {}),
      orderBy: { name: 'asc' },
    });

    return data.map(item => this.mapToDomain(item));
  }

  async findById(id: string): Promise<FeatureEntity | null> {
    const data = await this.prisma.features.findUnique({
      where: { id },
    });

    return data ? this.mapToDomain(data) : null;
  }

  private buildWhereClause(
    filters?: FeatureFilterOptions
  ): Record<string, unknown> | undefined {
    if (!filters) return undefined;

    const where: Record<string, unknown> = {};

    if (filters.ready !== undefined) {
      where['ready'] = filters.ready;
    }

    if (filters.completedAt !== undefined) {
      where['completedAt'] = filters.completedAt;
    }

    return Object.keys(where).length > 0 ? where : undefined;
  }

  private mapToDomain(data: {
    id: string;
    name: string;
    description: string;
    ready: boolean;
    completedAt: Date | null;
  }): FeatureEntity {
    return new FeatureEntity(
      data.id,
      data.name,
      data.description,
      data.ready,
      data.completedAt
    );
  }
}
