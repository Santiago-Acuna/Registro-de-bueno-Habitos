import { Module } from '@nestjs/common';
import { BooksController } from './controllers/books.controller';
import { BooksService } from './services/books.service';
import { BooksRepository } from './repositories/books.repository';

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