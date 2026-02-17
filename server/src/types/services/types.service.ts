import { Inject, Injectable, Logger } from '@nestjs/common';

import { TypeEntity } from '../../domain/entities/type.entity';
import { NotFoundError } from '../../infrastructure/exceptions/app.exceptions';
import { TypeResponseDto } from '../dto/type-response.dto';
import { ITypesRepository } from '../interfaces/types-repository.interface';

@Injectable()
export class TypesService {
  private readonly logger = new Logger(TypesService.name);

  constructor(
    @Inject('ITypesRepository')
    private readonly typesRepository: ITypesRepository
  ) {}

  async findAll(): Promise<TypeResponseDto[]> {
    this.logger.log('Fetching all types');

    const types = await this.typesRepository.findAll();

    return types.map(type => this.mapToResponse(type));
  }

  async findOne(id: number): Promise<TypeResponseDto> {
    this.logger.log(`Fetching type with id: ${id}`);

    const type = await this.typesRepository.findById(id, true);
    if (!type) {
      throw new NotFoundError('Type', String(id));
    }

    return this.mapToResponse(type);
  }

  private mapToResponse(type: TypeEntity): TypeResponseDto {
    const response: TypeResponseDto = {
      id: type.id,
      name: type.name,
      description: type.description,
    };

    if (type.subtypes) {
      response.subtypes = type.subtypes.map(subtype => ({
        id: subtype.id,
        typeId: subtype.typeId,
        name: subtype.name,
        description: subtype.description,
      }));
    }

    return response;
  }
}
