import { Injectable } from '@nestjs/common';

import { ProgrammingLanguageEntity } from '../../domain/entities/programming-language.entity';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { IProgrammingLanguagesRepository } from '../interfaces/programming-languages-repository.interface';

@Injectable()
export class ProgrammingLanguagesRepository implements IProgrammingLanguagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ProgrammingLanguageEntity[]> {
    const data = await this.prisma.programmingLanguages.findMany({
      orderBy: { id: 'asc' },
    });

    return data.map(item => this.mapToDomain(item));
  }

  async findById(id: number): Promise<ProgrammingLanguageEntity | null> {
    const data = await this.prisma.programmingLanguages.findUnique({
      where: { id },
    });

    return data ? this.mapToDomain(data) : null;
  }

  async count(): Promise<number> {
    return this.prisma.programmingLanguages.count();
  }

  private mapToDomain(data: { id: number; name: string; image: string | null }): ProgrammingLanguageEntity {
    return new ProgrammingLanguageEntity(data.id, data.name, data.image);
  }
}
