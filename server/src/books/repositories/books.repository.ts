import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class BooksRepository {
  constructor(private readonly prisma: PrismaService) {
    console.log(this.prisma)
  }
  // TODO: Implement books repository methods
  // This is a placeholder for the books functionality
}