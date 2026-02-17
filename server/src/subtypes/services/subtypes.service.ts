import { Inject, Injectable, Logger } from '@nestjs/common';

import { SubtypeEntity } from '../../domain/entities/subtype.entity';
import { NotFoundError } from '../../infrastructure/exceptions/app.exceptions';
import { SubtypeResponseDto } from '../dto/subtype-response.dto';
import {
  ISubtypesRepository,
  SubtypeFilterOptions,
} from '../interfaces/subtypes-repository.interface';

@Injectable()
export class SubtypesService {
  private readonly logger = new Logger(SubtypesService.name);

  constructor(
    @Inject('ISubtypesRepository')
    private readonly subtypesRepository: ISubtypesRepository
  ) {}

  async findAll(filters?: SubtypeFilterOptions): Promise<SubtypeResponseDto[]> {
    this.logger.log('Fetching all subtypes');

    const subtypes = await this.subtypesRepository.findAll(filters);

    return subtypes.map(subtype => this.mapToResponse(subtype));
  }

  async findOne(id: number): Promise<SubtypeResponseDto> {
    this.logger.log(`Fetching subtype with id: ${id}`);

    const subtype = await this.subtypesRepository.findById(id);
    if (!subtype) {
      throw new NotFoundError('Subtype', String(id));
    }

    return this.mapToResponse(subtype);
  }

  private mapToResponse(subtype: SubtypeEntity): SubtypeResponseDto {
    return {
      id: subtype.id,
      typeId: subtype.typeId,
      name: subtype.name,
      description: subtype.description,
    };
  }
}
