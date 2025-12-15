import { Injectable, Logger, Inject } from '@nestjs/common';

import { IActionTypesRepository } from '../../action-types/interfaces/action-types-repository.interface';
import { HabitComplexity } from '../../domain/shared/types/common';
import { IHabitsRepository } from '../../habits/interfaces/habits-repository.interface';

import { HabitsByTypeResponseDto } from './dto/habits-by-type-response.dto';

@Injectable()
export class FrontConfigService {
  private readonly logger = new Logger(FrontConfigService.name);

  constructor(
    @Inject('IHabitsRepository')
    private readonly habitsRepository: IHabitsRepository,
    @Inject('IActionTypesRepository')
    private readonly actionTypesRepository: IActionTypesRepository
  ) {}

  async getHabitsByType(): Promise<HabitsByTypeResponseDto> {
    this.logger.log('Fetching habits organized by type');

    const habitsResult = await this.habitsRepository.findAll(
      { page: 1, limit: 100 },
      { isActive: true }
    );

    const complexHabits: Record<string, string[]> = {};
    const simpleHabits: Record<string, string[]> = {};
    const withoutIntervalsHabits: Record<string, string[]> = {};

    for (const habit of habitsResult.data) {
      const habitName = habit.globalEntityIdentifier.name.getValue();
      const actionTypesResult = await this.actionTypesRepository.findByHabitId(
        habit.id,
        { page: 1, limit: 100 },
        { isActive: true }
      );

      const actionTypeNames = actionTypesResult.data.map(actionType => actionType.name);

      switch (habit.habitType) {
        case HabitComplexity.COMPLEX:
          complexHabits[habitName] = actionTypeNames;
          break;
        case HabitComplexity.SIMPLE:
          simpleHabits[habitName] = actionTypeNames;
          break;
        case HabitComplexity.WITHOUT_INTERVALS:
          withoutIntervalsHabits[habitName] = actionTypeNames;
          break;
      }
    }

    return {
      complex: Object.keys(complexHabits).length > 0 ? [complexHabits] : [],
      simple: Object.keys(simpleHabits).length > 0 ? [simpleHabits] : [],
      withoutintervals:
        Object.keys(withoutIntervalsHabits).length > 0 ? [withoutIntervalsHabits] : [],
    };
  }
}
