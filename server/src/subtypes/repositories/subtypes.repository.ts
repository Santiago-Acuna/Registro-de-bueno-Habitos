import { Injectable } from '@nestjs/common';

import { SubtypeEntity } from '../../domain/entities/subtype.entity';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  ISubtypesRepository,
  SubtypeFilterOptions,
} from '../interfaces/subtypes-repository.interface';

@Injectable()
export class SubtypesRepository implements ISubtypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: SubtypeFilterOptions): Promise<SubtypeEntity[]> {
    const where = this.buildWhereClause(filters);

    const data = await this.prisma.subtypes.findMany({
      ...(where ? { where } : {}),
      orderBy: { id: 'asc' },
    });

    return data.map(item => this.mapToDomain(item));
  }

  async findById(id: number): Promise<SubtypeEntity | null> {
    const data = await this.prisma.subtypes.findUnique({
      where: { id },
    });

    return data ? this.mapToDomain(data) : null;
  }

  async findByTypeId(typeId: number): Promise<SubtypeEntity[]> {
    const data = await this.prisma.subtypes.findMany({
      where: { typeId },
      orderBy: { id: 'asc' },
    });

    return data.map(item => this.mapToDomain(item));
  }

  async count(filters?: SubtypeFilterOptions): Promise<number> {
    const where = this.buildWhereClause(filters);
    if (where) {
      return this.prisma.subtypes.count({ where });
    }
    return this.prisma.subtypes.count();
  }

  private buildWhereClause(filters?: SubtypeFilterOptions): { typeId?: number } | undefined {
    if (!filters) {
      return undefined;
    }

    const where: { typeId?: number } = {};

    if (filters.typeId !== undefined) {
      where.typeId = filters.typeId;
    }

    return Object.keys(where).length > 0 ? where : undefined;
  }

  private mapToDomain(data: {
    id: number;
    typeId: number;
    name: string;
    description: string;
  }): SubtypeEntity {
    return new SubtypeEntity(data.id, data.typeId, data.name, data.description);
  }
}
