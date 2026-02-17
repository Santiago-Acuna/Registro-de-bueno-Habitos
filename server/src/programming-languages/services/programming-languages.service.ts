import { Inject, Injectable, Logger } from '@nestjs/common';

import { ProgrammingLanguageEntity } from '../../domain/entities/programming-language.entity';
import { NotFoundError } from '../../infrastructure/exceptions/app.exceptions';
import { ProgrammingLanguageResponseDto } from '../dto/programming-language-response.dto';
import { IProgrammingLanguagesRepository } from '../interfaces/programming-languages-repository.interface';

@Injectable()
export class ProgrammingLanguagesService {
  private readonly logger = new Logger(ProgrammingLanguagesService.name);

  constructor(
    @Inject('IProgrammingLanguagesRepository')
    private readonly programmingLanguagesRepository: IProgrammingLanguagesRepository
  ) {}

  async findAll(): Promise<ProgrammingLanguageResponseDto[]> {
    this.logger.log('Fetching all programming languages');

    const programmingLanguages = await this.programmingLanguagesRepository.findAll();

    return programmingLanguages.map(language => this.mapToResponse(language));
  }

  async findOne(id: number): Promise<ProgrammingLanguageResponseDto> {
    this.logger.log(`Fetching programming language with id: ${id}`);

    const programmingLanguage = await this.programmingLanguagesRepository.findById(id);
    if (!programmingLanguage) {
      throw new NotFoundError('Programming Language', String(id));
    }

    return this.mapToResponse(programmingLanguage);
  }

  private mapToResponse(language: ProgrammingLanguageEntity): ProgrammingLanguageResponseDto {
    return {
      id: language.id,
      name: language.name,
    };
  }
}
