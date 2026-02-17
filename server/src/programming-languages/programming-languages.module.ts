import { Module } from '@nestjs/common';

import { ProgrammingLanguagesController } from './controllers/programming-languages.controller';
import { ProgrammingLanguagesRepository } from './repositories/programming-languages.repository';
import { ProgrammingLanguagesService } from './services/programming-languages.service';

@Module({
  controllers: [ProgrammingLanguagesController],
  providers: [
    ProgrammingLanguagesService,
    {
      provide: 'IProgrammingLanguagesRepository',
      useClass: ProgrammingLanguagesRepository,
    },
  ],
  exports: [ProgrammingLanguagesService, 'IProgrammingLanguagesRepository'],
})
export class ProgrammingLanguagesModule {}
