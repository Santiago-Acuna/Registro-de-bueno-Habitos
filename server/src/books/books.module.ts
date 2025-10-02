import { Module } from '@nestjs/common';

import { BooksController } from './controllers/books.controller';
import { BooksRepository } from './repositories/books.repository';
import { BooksService } from './services/books.service';

@Module({
  controllers: [BooksController],
  providers: [
    BooksService,
    {
      provide: 'IBooksRepository',
      useClass: BooksRepository,
    },
  ],
  exports: [BooksService],
})
export class BooksModule {}
