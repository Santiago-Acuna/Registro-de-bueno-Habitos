import { Injectable } from '@nestjs/common';

import { SubtypeEntity } from '../../domain/entities/subtype.entity';
import { TypeEntity } from '../../domain/entities/type.entity';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ITypesRepository } from '../interfaces/types-repository.interface';

@Injectable()
export class TypesRepository implements ITypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TypeEntity[]> {
    const data = await this.prisma.types.findMany({
      orderBy: { id: 'asc' },
    });

    return data.map(item => this.mapToDomain(item));
  }

  async findById(id: number, includeSubtypes = false): Promise<TypeEntity | null> {
    const data = await this.prisma.types.findUnique({
      where: { id },
      include: {
        subtypes: includeSubtypes,
      },
    });

    return data ? this.mapToDomain(data) : null;
  }

  async count(): Promise<number> {
    return this.prisma.types.count();
  }

  private mapToDomain(data: {
    id: number;
    name: string;
    description: string;
    subtypes?: Array<{
      id: number;
      typeId: number;
      name: string;
      description: string;
    }>;
  }): TypeEntity {
    const subtypes = data.subtypes?.map(
      st => new SubtypeEntity(st.id, st.typeId, st.name, st.description)
    );

    return new TypeEntity(data.id, data.name, data.description, subtypes);
  }
}
