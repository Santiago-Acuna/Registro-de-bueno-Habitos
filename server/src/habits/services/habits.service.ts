import { Injectable, Inject, Logger } from '@nestjs/common';
import { Habit } from '../../domain/entities/habit.entity';
import { PaginatedResult, FilterOptions, UUID } from '../../domain/shared/types/common';
import { HabitName } from '../../domain/value-objects/habit-name';
import { CloudinaryService } from '../../helpers/cloudinary/cloudinary.service';
import { PaginatedResponseDto } from '../../infrastructure/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../infrastructure/dto/pagination-query.dto';
import {
  NotFoundError,
  ConflictError,
  ValidationException,
} from '../../infrastructure/exceptions/app.exceptions';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { HabitResponseDto } from '../dto/habit-response.dto';
import { UpdateHabitDto } from '../dto/update-habit.dto';
import { IHabitsRepository } from '../interfaces/habits-repository.interface';

@Injectable()
export class HabitsService {
  private readonly logger = new Logger(HabitsService.name);

  constructor(
    @Inject('IHabitsRepository')
    private readonly habitsRepository: IHabitsRepository,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async create(
    createHabitDto: CreateHabitDto,
    logo: Express.Multer.File
  ): Promise<HabitResponseDto> {
    this.logger.log(`Creating new habit: ${createHabitDto.name}`);

    // Check if habit with same name already exists
    const existingHabit = await this.habitsRepository.findByName(createHabitDto.name);
    if (existingHabit) {
      throw new ConflictError(`Habit with name '${createHabitDto.name}' already exists`);
    }

    const result = await this.cloudinaryService.uploadImage(logo, {
      public_id: logo.originalname.split('.')[0] as string,
      folder: 'habits',
      resourceType: 'auto',
    });
    const imageUrl = result.url;
    if (!result.success) {
      throw new ValidationException(
        result.error?.message || 'Failed to upload image. Uncontrolled error'
      );
    }

    // Validate that Cloudinary returned a valid URL
    if (!imageUrl || imageUrl.trim() === '') {
      throw new ValidationException('Logo must be a non-empty string');
    }

    try {
      // Validate domain rules before saving
      const habitName = HabitName.create(createHabitDto.name);

      // Create habit data for repository
      const createHabitData = {
        name: habitName.getValue(),
        habitType: createHabitDto.habitType,
        logo: imageUrl!,
      };

      // Save to repository
      const savedHabit = await this.habitsRepository.create(createHabitData);

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
    this.logger.log(
      `Fetching habits - page: ${paginationQuery.page}, limit: ${paginationQuery.limit}`
    );

    const result: PaginatedResult<Habit> = await this.habitsRepository.findAll(
      {
        page: paginationQuery.page || 1,
        limit: paginationQuery.limit || 10,
      },
      filters
    );

    const responseData = result.data.map(habit => this.mapToResponse(habit));

    return new PaginatedResponseDto(responseData, result.total, result.page, result.limit);
  }

  async findOne(id: UUID): Promise<HabitResponseDto> {
    this.logger.log(`Fetching habit with id: ${id}`);

    const habit = await this.habitsRepository.findById(id);
    if (!habit) {
      throw new NotFoundError('Habit', id);
    }

    return this.mapToResponse(habit);
  }

  async update(id: UUID, updateHabitDto: UpdateHabitDto, logo?: Express.Multer.File): Promise<HabitResponseDto> {
    this.logger.log(`Updating habit with id: ${id}`);

    // Check if habit exists
    const existingHabit = await this.habitsRepository.findById(id);
    if (!existingHabit) {
      throw new NotFoundError('Habit', id);
    }

    // Check for name conflicts if name is being updated
    if ('name' in updateHabitDto && updateHabitDto.name !== undefined && updateHabitDto.name !== existingHabit.name.getValue()) {
      const habitWithSameName = await this.habitsRepository.findByName(updateHabitDto.name);
      if (habitWithSameName && habitWithSameName.id !== id) {
        throw new ConflictError(`Habit with name '${updateHabitDto.name}' already exists`);
      }
    }

    try {
      // Update the domain entity
      let updatedHabit = existingHabit;

      // Handle name update
      if ('name' in updateHabitDto && updateHabitDto.name !== undefined) {
        updatedHabit = updatedHabit.updateName(updateHabitDto.name);
      }

      // Handle logo update from file upload parameter
      if (logo) {
        // Check file size limit (2MB for updates)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (logo.size > maxSize) {
          throw new ValidationException('Logo size cannot exceed 2MB');
        }

        // Upload new logo
        const result = await this.cloudinaryService.uploadImage(logo, {
          public_id: logo.originalname.split('.')[0] as string,
          folder: 'habits',
          resourceType: 'auto',
        });

        if (!result.success) {
          throw new ValidationException(
            result.error?.message || 'Failed to upload image. Uncontrolled error'
          );
        }

        // Validate that Cloudinary returned a valid URL
        if (!result.url || result.url.trim() === '') {
          throw new ValidationException('Logo must be a non-empty string');
        }

        updatedHabit = updatedHabit.updateLogo(result.url);
      }

      // Handle logo removal via removeLogo field
      if (updateHabitDto.removeLogo === 'true') {
        updatedHabit = updatedHabit.updateLogo('');
      }

      // Save updated entity
      const savedHabit = await this.habitsRepository.update(id, updatedHabit);

      this.logger.log(`Successfully updated habit with id: ${id}`);

      return this.mapToResponse(savedHabit);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('Logo') || error.message.includes('Habit name'))
      ) {
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


  private mapToResponse(habit: Habit): HabitResponseDto {
    return {
      id: habit.id,
      name: habit.name.getValue(),
      habitType: habit.habitType,
      logo: habit.logo,
      isActive: habit.isActive,
      totalActionsCount: habit.totalActionsCount,
      lastActionDate: habit.lastActionDate ? new Date(habit.lastActionDate) : null,
      createdAt: new Date(habit.createdAt),
      updatedAt: new Date(habit.updatedAt),
    };
  }
}
