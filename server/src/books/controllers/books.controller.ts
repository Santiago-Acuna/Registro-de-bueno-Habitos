import { Controller, Get, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { BooksService } from '../services/books.service';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @Version('1')
  @ApiOperation({ 
    summary: 'Get all books',
    description: 'Retrieves a list of all books (placeholder implementation).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of books retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
  })
  async findAll(): Promise<{ message: string }> {
    return this.booksService.findAll();
  }
}