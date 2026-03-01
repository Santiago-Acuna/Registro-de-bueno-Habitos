import { Injectable } from '@nestjs/common';

import { ExternalDependencyEntity } from '../../domain/entities/external-dependency.entity';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { IExternalDependenciesRepository } from '../interfaces/external-dependencies-repository.interface';

@Injectable()
export class ExternalDependenciesRepository implements IExternalDependenciesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ExternalDependencyEntity[]> {
    const data = await this.prisma.externalDependencies.findMany({
      orderBy: { id: 'asc' },
    });

    return data.map(item => this.mapToDomain(item));
  }

  async findById(id: number): Promise<ExternalDependencyEntity | null> {
    const data = await this.prisma.externalDependencies.findUnique({
      where: { id },
    });

    return data ? this.mapToDomain(data) : null;
  }

  async count(): Promise<number> {
    return this.prisma.externalDependencies.count();
  }

  private mapToDomain(data: {
    id: number;
    name: string;
    programmingLanguageId: number | null;
    icon: string | null;
  }): ExternalDependencyEntity {
    return new ExternalDependencyEntity(data.id, data.name, data.programmingLanguageId, data.icon);
  }
}
