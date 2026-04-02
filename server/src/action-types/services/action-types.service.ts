import { Injectable, Inject, Logger } from '@nestjs/common';

import { ActionType } from '../../domain/entities/action-type.entity';
import { PaginatedResult, UUID } from '../../domain/shared/types/common';
import { IdentifierIcon } from '../../domain/value-objects/identifier-icon';
import { IdentifierName } from '../../domain/value-objects/identifier-name';
import { CloudinaryService } from '../../helpers/cloudinary/cloudinary.service';
import { IHabitsRepository } from '../../habits/interfaces/habits-repository.interface';
import { PaginatedResponseDto } from '../../infrastructure/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../infrastructure/dto/pagination-query.dto';
import {
  NotFoundError,
  ConflictError,
  ValidationException,
} from '../../infrastructure/exceptions/app.exceptions';
import { ActionTypeResponseDto } from '../dto/action-type-response.dto';
import { CreateActionTypeDto } from '../dto/create-action-type.dto';
import { UpdateActionTypeDto } from '../dto/update-action-type.dto';
import {
  ActionTypeFilterOptions,
  IActionTypesRepository,
} from '../interfaces/action-types-repository.interface';

@Injectable()
export class ActionTypesService {
  private readonly logger = new Logger(ActionTypesService.name);

  constructor(
    @Inject('IActionTypesRepository')
    private readonly actionTypesRepository: IActionTypesRepository,
    @Inject('IHabitsRepository')
    private readonly habitsRepository: IHabitsRepository,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async create(
    createActionTypeDto: CreateActionTypeDto,
    icon?: Express.Multer.File
  ): Promise<ActionTypeResponseDto> {
    this.logger.log(`Creating new action type: ${createActionTypeDto.name}`);

    // Check if action type with same name already exists for this habit
    const existingActionType = await this.actionTypesRepository.findByNameAndHabitId(
      createActionTypeDto.name,
      createActionTypeDto.habitId
    );
    if (existingActionType) {
      throw new ConflictError(
        `ActionType with name '${createActionTypeDto.name}' already exists for this habit`
      );
    }

    const habit = await this.habitsRepository.findById(createActionTypeDto.habitId);
    if (!habit) {
      throw new NotFoundError('Habit', createActionTypeDto.habitId);
    }

    let iconValue: string | undefined;

    if (!habit.isSimple()) {
      if (!icon) {
        throw new ValidationException('Icon is required for non-simple habits');
      }

      const result = await this.cloudinaryService.uploadImage(icon, {
        public_id: icon.originalname.split('.')[0] as string,
        folder: 'action-types',
        resourceType: 'auto',
      });

      if (!result.success) {
        throw new ValidationException(
          result.error?.message ?? 'Failed to upload image. Uncontrolled error'
        );
      }

      if (!result.url || result.url.trim() === '') {
        throw new ValidationException('Icon must be a non-empty string');
      }

      iconValue = result.url;
    }

    try {
      const actionTypeName = IdentifierName.create(createActionTypeDto.name);

      const createActionTypeData: { name: string; habitId: UUID; icon?: string } = {
        name: actionTypeName.getValue(),
        habitId: createActionTypeDto.habitId,
      };

      if (iconValue) {
        const actionTypeIcon = IdentifierIcon.create(iconValue);
        createActionTypeData.icon = actionTypeIcon.getValue();
      }

      const savedActionType = await this.actionTypesRepository.create(createActionTypeData);

      this.logger.log(`Successfully created action type with id: ${savedActionType.id}`);

      return this.mapToResponse(savedActionType);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Icon')) {
        throw new ValidationException(error.message);
      }
      if (error instanceof Error && error.message.includes('Identifier name')) {
        throw new ValidationException(error.message);
      }
      throw error;
    }
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
    filters?: ActionTypeFilterOptions
  ): Promise<PaginatedResponseDto<ActionTypeResponseDto>> {
    this.logger.log(
      `Fetching action types - page: ${paginationQuery.page}, limit: ${paginationQuery.limit}`
    );

    const result: PaginatedResult<ActionType> = await this.actionTypesRepository.findAll(
      {
        page: paginationQuery.page ?? 1,
        limit: paginationQuery.limit ?? 10,
      },
      filters
    );

    const responseData = result.data.map(actionType => this.mapToResponse(actionType));

    return new PaginatedResponseDto(responseData, result.total, result.page, result.limit);
  }

  async findByHabitId(
    habitId: UUID,
    paginationQuery: PaginationQueryDto,
    filters?: ActionTypeFilterOptions
  ): Promise<PaginatedResponseDto<ActionTypeResponseDto>> {
    const result: PaginatedResult<ActionType> = await this.actionTypesRepository.findByHabitId(
      habitId,
      {
        page: paginationQuery.page ?? 1,
        limit: paginationQuery.limit ?? 10,
      },
      filters
    );

    const responseData = result.data.map(actionType => this.mapToResponse(actionType));

    return new PaginatedResponseDto(responseData, result.total, result.page, result.limit);
  }

  async findOne(id: UUID): Promise<ActionTypeResponseDto> {
    this.logger.log(`Fetching action type with id: ${id}`);

    const actionType = await this.actionTypesRepository.findById(id);
    if (!actionType) {
      throw new NotFoundError('ActionType', id);
    }

    return this.mapToResponse(actionType);
  }

  async update(
    id: UUID,
    updateActionTypeDto: UpdateActionTypeDto,
    icon?: Express.Multer.File
  ): Promise<ActionTypeResponseDto> {
    this.logger.log(`Updating action type with id: ${id}`);

    // Check if action type exists
    const existingActionType = await this.actionTypesRepository.findById(id);
    if (!existingActionType) {
      throw new NotFoundError('ActionType', id);
    }

    // Check for name conflicts if name is being updated
    if (
      'name' in updateActionTypeDto &&
      updateActionTypeDto.name !== undefined &&
      updateActionTypeDto.name !== existingActionType.globalEntityIdentifier.name.getValue()
    ) {
      const actionTypeWithSameName = await this.actionTypesRepository.findByNameAndHabitId(
        updateActionTypeDto.name,
        existingActionType.habitId
      );
      if (actionTypeWithSameName && actionTypeWithSameName.id !== id) {
        throw new ConflictError(
          `ActionType with name '${updateActionTypeDto.name}' already exists for this habit`
        );
      }
    }

    try {
      const updateData: { name?: string; icon?: string } = {};

      // Handle name update
      if ('name' in updateActionTypeDto && updateActionTypeDto.name !== undefined) {
        const actionTypeName = IdentifierName.create(updateActionTypeDto.name);
        updateData.name = actionTypeName.getValue();
      }

      // Handle icon update from file upload parameter
      if (icon) {
        // Upload new icon
        const result = await this.cloudinaryService.uploadImage(icon, {
          public_id: icon.originalname.split('.')[0] as string,
          folder: 'action-types',
          resourceType: 'auto',
        });

        if (!result.success) {
          throw new ValidationException(
            result.error?.message ?? 'Failed to upload image. Uncontrolled error'
          );
        }

        // Validate that Cloudinary returned a valid URL
        if (!result.url || result.url.trim() === '') {
          throw new ValidationException('Icon must be a non-empty string');
        }

        const actionTypeIcon = IdentifierIcon.create(result.url);
        updateData.icon = actionTypeIcon.getValue();
      }

      // Save updated entity
      const savedActionType = await this.actionTypesRepository.update(id, updateData);

      this.logger.log(`Successfully updated action type with id: ${id}`);

      return this.mapToResponse(savedActionType);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('Icon') || error.message.includes('Identifier name'))
      ) {
        throw new ValidationException(error.message);
      }
      throw error;
    }
  }

  async remove(id: UUID): Promise<void> {
    this.logger.log(`Removing action type with id: ${id}`);

    // Check if action type exists
    const existingActionType = await this.actionTypesRepository.findById(id);
    if (!existingActionType) {
      throw new NotFoundError('ActionType', id);
    }

    await this.actionTypesRepository.delete(id);
    this.logger.log(`Successfully removed action type with id: ${id}`);
  }

  private mapToResponse(actionType: ActionType): ActionTypeResponseDto {
    return {
      id: actionType.id,
      name: actionType.globalEntityIdentifier.name.getValue(),
      icon: actionType.globalEntityIdentifier.icon?.getValue() ?? null,
      habitId: actionType.habitId,
      totalActionsCount: actionType.totalActionsCount,
      lastActionDate: actionType.lastActionDate ? new Date(actionType.lastActionDate) : null,
      createdAt: new Date(actionType.createdAt),
      updatedAt: new Date(actionType.updatedAt),
    };
  }
}
