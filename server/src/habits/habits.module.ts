import { Module } from '@nestjs/common';

import { CloudinaryModule } from '../helpers/cloudinary';

import { HabitsController } from './controllers/habits.controller';
import { HabitsRepository } from './repositories/habits.repository';
import { HabitsService } from './services/habits.service';

@Module({
  controllers: [HabitsController],
  providers: [
    HabitsService,
    {
      provide: 'IHabitsRepository',
      useClass: HabitsRepository,
    },
  ],
  imports: [CloudinaryModule],
  exports: [HabitsService, 'IHabitsRepository'],
})
export class HabitsModule {}
