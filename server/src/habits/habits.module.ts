import { Module } from '@nestjs/common';
import { HabitsController } from './controllers/habits.controller';
import { HabitsService } from './services/habits.service';
import { HabitsRepository } from './repositories/habits.repository';
import { CloudinaryModule } from '../helpers/cloudinary';

@Module({
  controllers: [HabitsController],
  providers: [
    HabitsService,
    {
      provide: 'IHabitsRepository',
      useClass: HabitsRepository,
    },
  ],
  imports:[CloudinaryModule],
  exports: [HabitsService],
})
export class HabitsModule {}