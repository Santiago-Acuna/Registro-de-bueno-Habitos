import { Controller, Get, Param, ParseIntPipe, UseGuards, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { ProgrammingLanguageResponseDto } from '../dto/programming-language-response.dto';
import { ProgrammingLanguagesService } from '../services/programming-languages.service';

@ApiTags('programming-languages')
@Controller('programming-languages')
@UseGuards(ThrottlerGuard)
export class ProgrammingLanguagesController {
  constructor(private readonly programmingLanguagesService: ProgrammingLanguagesService) {}

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get all programming languages' })
  @ApiResponse({
    status: 200,
    description: 'List of all programming languages',
    type: [ProgrammingLanguageResponseDto],
  })
  async findAll(): Promise<ProgrammingLanguageResponseDto[]> {
    return this.programmingLanguagesService.findAll();
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Get programming language by ID' })
  @ApiResponse({
    status: 200,
    description: 'Programming Language found',
    type: ProgrammingLanguageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Programming Language not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProgrammingLanguageResponseDto> {
    return this.programmingLanguagesService.findOne(id);
  }
}
