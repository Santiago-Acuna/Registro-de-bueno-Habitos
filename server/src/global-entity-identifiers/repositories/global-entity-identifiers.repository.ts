import { Injectable } from '@nestjs/common';

import { PaginatedResult, PaginationParams, UUID } from '../../domain/shared/types/common';
import { IdentifierIcon } from '../../domain/value-objects/identifier-icon';
import { IdentifierName } from '../../domain/value-objects/identifier-name';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ConflictError, NotFoundError } from '../../infrastructure/exceptions/app.exceptions';
import {
  CreateGlobalEntityIdentifierData,
  GlobalEntityIdentifierData,
  GlobalEntityIdentifierFilterOptions,
  IGlobalEntityIdentifiersRepository,
  UpdateGlobalEntityIdentifierData,
} from '../interfaces/global-entity-identifiers-repository.interface';

@Injectable()
export class GlobalEntityIdentifiersRepository implements IGlobalEntityIdentifiersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateGlobalEntityIdentifierData): Promise<GlobalEntityIdentifierData> {
    IdentifierName.create(data.name);
    IdentifierIcon.create(data.icon);

    try {
      const result = await this.prisma.globalEntityIdentifiers.create({
        data: {
          name: data.name,
          icon: data.icon,
          entityType: data.entityType,
          entityId: data.entityId,
        },
      });

      return {
        id: result.id,
        name: result.name,
        icon: result.icon,
        entityType: result.entityType,
        entityId: result.entityId,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        const meta = (error as { meta?: { target?: string[] } }).meta;
        const target = meta?.target;

        if (target && target.includes('name') && target.includes('icon')) {
          throw new ConflictError(
            'Global entity identifier with this name and icon combination already exists'
          );
        }
        if (target && target.includes('name')) {
          throw new ConflictError(
            `Global entity identifier with name '${data.name}' already exists`
          );
        }
        if (target && target.includes('icon')) {
          throw new ConflictError(
            `Global entity identifier with icon '${data.icon}' already exists`
          );
        }
        if (target && target.includes('entityType') && target.includes('entityId')) {
          throw new ConflictError('Global entity identifier already exists for this entity');
        }
      }
      throw error;
    }
  }

  async findById(id: UUID): Promise<GlobalEntityIdentifierData | null> {
    const result = await this.prisma.globalEntityIdentifiers.findUnique({
      where: { id },
    });

    if (!result) {
      return null;
    }

    IdentifierName.create(result.name);
    IdentifierIcon.create(result.icon);

    return {
      id: result.id,
      name: result.name,
      icon: result.icon,
      entityType: result.entityType,
      entityId: result.entityId,
    };
  }

  async findByName(name: string): Promise<GlobalEntityIdentifierData | null> {
    const result = await this.prisma.globalEntityIdentifiers.findUnique({
      where: { name },
    });

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      name: result.name,
      icon: result.icon,
      entityType: result.entityType,
      entityId: result.entityId,
    };
  }

  async findByIcon(icon: string): Promise<GlobalEntityIdentifierData | null> {
    const result = await this.prisma.globalEntityIdentifiers.findUnique({
      where: { icon },
    });

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      name: result.name,
      icon: result.icon,
      entityType: result.entityType,
      entityId: result.entityId,
    };
  }

  async findByEntityTypeAndId(
    entityType: string,
    entityId: UUID
  ): Promise<GlobalEntityIdentifierData | null> {
    const result = await this.prisma.globalEntityIdentifiers.findFirst({
      where: {
        entityType,
        entityId,
      },
    });

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      name: result.name,
      icon: result.icon,
      entityType: result.entityType,
      entityId: result.entityId,
    };
  }

  async findAll(
    params?: PaginationParams | GlobalEntityIdentifierFilterOptions,
    filters?: GlobalEntityIdentifierFilterOptions
  ): Promise<PaginatedResult<GlobalEntityIdentifierData> | GlobalEntityIdentifierData[]> {
    const isPaginated =
      params && 'page' in params && 'limit' in params && params.page && params.limit;

    if (isPaginated) {
      const { page, limit } = params as PaginationParams;
      const skip = (page - 1) * limit;

      const where = this.buildWhereClause(filters);

      const countArgs = where ? { where } : undefined;

      const [data, total] = await Promise.all([
        this.prisma.globalEntityIdentifiers.findMany({
          ...(where ? { where } : {}),
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        this.prisma.globalEntityIdentifiers.count(countArgs),
      ]);

      const items = data.map(item => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
        entityType: item.entityType,
        entityId: item.entityId,
      }));

      return {
        data: items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    const filterOptions = (params as GlobalEntityIdentifierFilterOptions) ?? filters;
    const where = this.buildWhereClause(filterOptions);
    const orderByField = filterOptions?.orderBy ?? 'name';

    const data = await this.prisma.globalEntityIdentifiers.findMany({
      ...(where ? { where } : {}),
      orderBy: { [orderByField]: 'asc' },
    });

    return data.map(item => ({
      id: item.id,
      name: item.name,
      icon: item.icon,
      entityType: item.entityType,
      entityId: item.entityId,
    }));
  }

  async findByEntityType(
    entityType: string,
    params: PaginationParams
  ): Promise<PaginatedResult<GlobalEntityIdentifierData>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.globalEntityIdentifiers.findMany({
        where: { entityType },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.globalEntityIdentifiers.count({ where: { entityType } }),
    ]);

    const items = data.map(item => ({
      id: item.id,
      name: item.name,
      icon: item.icon,
      entityType: item.entityType,
      entityId: item.entityId,
    }));

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: UUID,
    data: UpdateGlobalEntityIdentifierData
  ): Promise<GlobalEntityIdentifierData> {
    if (data.name) {
      IdentifierName.create(data.name);
    }
    if (data.icon) {
      IdentifierIcon.create(data.icon);
    }

    try {
      const result = await this.prisma.globalEntityIdentifiers.update({
        where: { id },
        data,
      });

      return {
        id: result.id,
        name: result.name,
        icon: result.icon,
        entityType: result.entityType,
        entityId: result.entityId,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'P2025') {
          throw new NotFoundError(`Global entity identifier with id ${id} not found`);
        }
        if (error.code === 'P2002') {
          throw new ConflictError('Global entity identifier with this value already exists');
        }
      }
      throw error;
    }
  }

  async delete(id: UUID): Promise<void> {
    try {
      await this.prisma.globalEntityIdentifiers.delete({
        where: { id },
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'P2025') {
          throw new NotFoundError(`Global entity identifier with id ${id} not found`);
        }
        if (error.code === 'P2003') {
          throw new Error(
            'Cannot delete global entity identifier because it is referenced by other entities'
          );
        }
      }
      throw error;
    }
  }

  async existsByName(name: string): Promise<boolean> {
    const result = await this.prisma.globalEntityIdentifiers.findUnique({
      where: { name },
    });
    return result !== null;
  }

  async existsByIcon(icon: string): Promise<boolean> {
    const result = await this.prisma.globalEntityIdentifiers.findUnique({
      where: { icon },
    });
    return result !== null;
  }

  async existsByNameAndIcon(name: string, icon: string): Promise<boolean> {
    const result = await this.prisma.globalEntityIdentifiers.findFirst({
      where: {
        name,
        icon,
      },
    });
    return result !== null;
  }

  async count(filters?: GlobalEntityIdentifierFilterOptions): Promise<number> {
    const where = this.buildWhereClause(filters);
    const countArgs = where ? { where } : undefined;
    return this.prisma.globalEntityIdentifiers.count(countArgs);
  }

  async countByEntityType(entityType: string): Promise<number> {
    return this.prisma.globalEntityIdentifiers.count({
      where: { entityType },
    });
  }

  async findByNamePrefix(namePrefix: string, limit: number): Promise<GlobalEntityIdentifierData[]> {
    const data = await this.prisma.globalEntityIdentifiers.findMany({
      where: {
        name: {
          startsWith: namePrefix,
        },
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return data.map(item => ({
      id: item.id,
      name: item.name,
      icon: item.icon,
      entityType: item.entityType,
      entityId: item.entityId,
    }));
  }

  private buildWhereClause(
    filters?: GlobalEntityIdentifierFilterOptions
  ): Record<string, unknown> | undefined {
    if (!filters) {
      return undefined;
    }

    const where: Record<string, unknown> = {};

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.namePrefix) {
      where.name = {
        startsWith: filters.namePrefix,
      };
    }

    return Object.keys(where).length > 0 ? where : undefined;
  }
}
