import { Injectable, Inject, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { IHabitsRepository } from '../interfaces/habits-repository.interface';
import { Habit } from '../../domain/entities/habit.entity';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { UpdateHabitDto } from '../dto/update-habit.dto';
import { HabitResponseDto } from '../dto/habit-response.dto';
import { PaginationQueryDto } from '../../infrastructure/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../infrastructure/dto/paginated-response.dto';
import { 
  PaginatedResult, 
  FilterOptions, 
  UUID 
} from '../../domain/shared/types/common';
import { 
  NotFoundError, 
  ConflictError,
  ValidationException 
} from '../../infrastructure/exceptions/app.exceptions';

@Injectable()
export class HabitsService {
  private readonly logger = new Logger(HabitsService.name);

  constructor(
    @Inject('IHabitsRepository')
    private readonly habitsRepository: IHabitsRepository
  ) {}

  async create(createHabitDto: CreateHabitDto): Promise<HabitResponseDto> {
    this.logger.log(`Creating new habit: ${createHabitDto.name}`);

    // Check if habit with same name already exists
    const existingHabit = await this.habitsRepository.findByName(createHabitDto.name);
    if (existingHabit) {
      throw new ConflictError(`Habit with name '${createHabitDto.name}' already exists`);
    }

    try {
      // Create domain entity
      const habit = Habit.create(
        uuidv4(),
        createHabitDto.name,
        createHabitDto.habitType,
        createHabitDto.logo
      );

      // Save to repository
      const savedHabit = await this.habitsRepository.create(habit);

      this.logger.log(`Successfully created habit with id: ${savedHabit.id}`);
      
      return this.mapToResponse(savedHabit);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Logo')) {
        throw new ValidationException(error.message);
      }
      if (error instanceof Error && error.message.includes('Habit name')) {
        throw new ValidationException(error.message);
      }
      throw error;
    }
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
    filters?: FilterOptions
  ): Promise<PaginatedResponseDto<HabitResponseDto>> {
    this.logger.log(`Fetching habits - page: ${paginationQuery.page}, limit: ${paginationQuery.limit}`);

    const result: PaginatedResult<Habit> = await this.habitsRepository.findAll(
      {
        page: paginationQuery.page || 1,
        limit: paginationQuery.limit || 10,
      },
      filters
    );

    const responseData = result.data.map((habit) => this.mapToResponse(habit));

    return new PaginatedResponseDto(
      responseData,
      result.total,
      result.page,
      result.limit
    );
  }

  async findOne(id: UUID): Promise<HabitResponseDto> {
    this.logger.log(`Fetching habit with id: ${id}`);

    const habit = await this.habitsRepository.findById(id);
    if (!habit) {
      throw new NotFoundError('Habit', id);
    }

    return this.mapToResponse(habit);
  }

  async update(id: UUID, updateHabitDto: UpdateHabitDto): Promise<HabitResponseDto> {
    this.logger.log(`Updating habit with id: ${id}`);

    // Check if habit exists
    const existingHabit = await this.habitsRepository.findById(id);
    if (!existingHabit) {
      throw new NotFoundError('Habit', id);
    }

    // Check for name conflicts if name is being updated
    if (updateHabitDto.name && updateHabitDto.name !== existingHabit.name.getValue()) {
      const habitWithSameName = await this.habitsRepository.findByName(updateHabitDto.name);
      if (habitWithSameName && habitWithSameName.id !== id) {
        throw new ConflictError(`Habit with name '${updateHabitDto.name}' already exists`);
      }
    }

    try {
      // Update the domain entity
      let updatedHabit = existingHabit;

      if (updateHabitDto.name) {
        updatedHabit = updatedHabit.updateName(updateHabitDto.name);
      }

      if (updateHabitDto.logo) {
        updatedHabit = updatedHabit.updateLogo(updateHabitDto.logo);
      }

      // Save updated entity
      const savedHabit = await this.habitsRepository.update(id, updatedHabit);

      this.logger.log(`Successfully updated habit with id: ${id}`);
      
      return this.mapToResponse(savedHabit);
    } catch (error) {
      if (error instanceof Error && (error.message.includes('Logo') || error.message.includes('Habit name'))) {
        throw new ValidationException(error.message);
      }
      throw error;
    }
  }

  async remove(id: UUID): Promise<void> {
    this.logger.log(`Removing habit with id: ${id}`);

    // Check if habit exists
    const existingHabit = await this.habitsRepository.findById(id);
    if (!existingHabit) {
      throw new NotFoundError('Habit', id);
    }

    await this.habitsRepository.delete(id);
    this.logger.log(`Successfully removed habit with id: ${id}`);
  }

  async incrementActionCount(id: UUID): Promise<HabitResponseDto> {
    this.logger.log(`Incrementing action count for habit with id: ${id}`);

    const updatedHabit = await this.habitsRepository.incrementActionCount(id);
    
    this.logger.log(`Successfully incremented action count for habit with id: ${id}`);
    
    return this.mapToResponse(updatedHabit);
  }

  private mapToResponse(habit: Habit): HabitResponseDto {
    return {
      id: habit.id,
      name: habit.name.getValue(),
      habitType: habit.habitType,
      logo: habit.logo,
      isActive: habit.isActive,
      totalActionsCount: habit.totalActionsCount,
      lastActionDate: habit.lastActionDate,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
    };
  }
}