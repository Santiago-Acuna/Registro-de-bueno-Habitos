import { Injectable, Logger, Inject } from '@nestjs/common';
import { validate as isUUID } from 'uuid';

import { UUID } from '../../domain/shared/types/common';
import { IdentifierIcon } from '../../domain/value-objects/identifier-icon';
import { IdentifierName } from '../../domain/value-objects/identifier-name';
import {
  NotFoundError,
  ConflictError,
  ValidationException,
} from '../../infrastructure/exceptions/app.exceptions';
import {
  CreateGlobalEntityIdentifierData,
  UpdateGlobalEntityIdentifierData,
  GlobalEntityIdentifierData,
  IGlobalEntityIdentifiersRepository,
} from '../interfaces/global-entity-identifiers-repository.interface';

@Injectable()
export class GlobalEntityIdentifiersService {
  private readonly logger = new Logger(GlobalEntityIdentifiersService.name);
  private readonly validEntityTypes = ['habit', 'action-type'];

  constructor(
    @Inject('IGlobalEntityIdentifiersRepository')
    private readonly repository: IGlobalEntityIdentifiersRepository
  ) {}

  async create(data: CreateGlobalEntityIdentifierData): Promise<GlobalEntityIdentifierData> {
    this.logger.log(`Creating global entity identifier: ${data.name} for ${data.entityType}`);

    // Validate name using IdentifierName value object
    let identifierName: IdentifierName;
    try {
      identifierName = IdentifierName.create(data.name);
    } catch (error) {
      const message = (error as Error).message;
      // Map value object error messages to service-level messages
      if (message.includes('cannot be empty')) {
        throw new ValidationException('Name cannot be empty');
      }
      if (message.includes('cannot exceed')) {
        throw new ValidationException('Name cannot exceed 50 characters');
      }
      throw new ValidationException(message);
    }

    // Validate icon using IdentifierIcon value object
    let identifierIcon: IdentifierIcon;
    try {
      identifierIcon = IdentifierIcon.create(data.icon);
    } catch (error) {
      const message = (error as Error).message;
      // Map value object error messages to service-level messages
      if (message.includes('cannot be empty')) {
        throw new ValidationException('Icon cannot be empty');
      }
      throw new ValidationException(message);
    }

    // Validate entity type
    if (!this.validEntityTypes.includes(data.entityType)) {
      throw new ValidationException('Entity type must be one of: habit, action-type');
    }

    // Get trimmed values for conflict checking
    const trimmedName = identifierName.getValue();
    const trimmedIcon = identifierIcon.getValue();

    // Check for name conflict
    const nameExists = await this.repository.existsByName(trimmedName);
    if (nameExists) {
      throw new ConflictError(`Global entity identifier with name '${trimmedName}' already exists`);
    }

    // Check for icon conflict
    const iconExists = await this.repository.existsByIcon(trimmedIcon);
    if (iconExists) {
      throw new ConflictError(`Global entity identifier with icon '${trimmedIcon}' already exists`);
    }

    // Create with trimmed values
    const createData: CreateGlobalEntityIdentifierData = {
      ...data,
      name: trimmedName,
      icon: trimmedIcon,
    };

    const result = await this.repository.create(createData);

    this.logger.log(`Successfully created global entity identifier with id: ${result.id}`);

    return result;
  }

  async findById(id: UUID): Promise<GlobalEntityIdentifierData> {
    this.logger.log(`Fetching global entity identifier with id: ${id}`);

    // Validate UUID format
    if (!isUUID(id)) {
      throw new ValidationException('Invalid UUID format');
    }

    const result = await this.repository.findById(id);

    if (!result) {
      throw new NotFoundError('Global entity identifier');
    }

    return result;
  }

  async findByName(name: string): Promise<GlobalEntityIdentifierData | null> {
    // Validate name using IdentifierName value object
    let identifierName: IdentifierName;
    try {
      identifierName = IdentifierName.create(name);
    } catch (error) {
      const message = (error as Error).message;
      // Map value object error messages to service-level messages
      if (message.includes('cannot be empty')) {
        throw new ValidationException('Name cannot be empty');
      }
      throw new ValidationException(message);
    }

    return this.repository.findByName(identifierName.getValue());
  }

  async findByIcon(icon: string): Promise<GlobalEntityIdentifierData | null> {
    // Validate icon using IdentifierIcon value object
    let identifierIcon: IdentifierIcon;
    try {
      identifierIcon = IdentifierIcon.create(icon);
    } catch (error) {
      const message = (error as Error).message;
      // Map value object error messages to service-level messages
      if (message.includes('cannot be empty')) {
        throw new ValidationException('Icon cannot be empty');
      }
      throw new ValidationException(message);
    }

    return this.repository.findByIcon(identifierIcon.getValue());
  }

  async findByEntityTypeAndId(
    entityType: string,
    entityId: UUID
  ): Promise<GlobalEntityIdentifierData | null> {
    // Validate entity type
    if (!this.validEntityTypes.includes(entityType)) {
      throw new ValidationException('Entity type must be one of: habit, action-type');
    }

    return this.repository.findByEntityTypeAndId(entityType, entityId);
  }

  async update(
    id: UUID,
    data: UpdateGlobalEntityIdentifierData
  ): Promise<GlobalEntityIdentifierData> {
    // Find existing identifier first
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Global entity identifier');
    }

    const updateData: UpdateGlobalEntityIdentifierData = {};

    // Validate and check name if provided
    if (data.name !== undefined) {
      // Validate name using IdentifierName value object
      let identifierName: IdentifierName;
      try {
        identifierName = IdentifierName.create(data.name);
      } catch (error) {
        const message = (error as Error).message;
        // Map value object error messages to service-level messages
        if (message.includes('cannot be empty')) {
          throw new ValidationException('Name cannot be empty');
        }
        throw new ValidationException(message);
      }

      const trimmedName = identifierName.getValue();

      // Only check for conflicts if name is actually changing
      if (trimmedName !== existing.name) {
        const nameExists = await this.repository.existsByName(trimmedName);
        if (nameExists) {
          throw new ConflictError(
            `Global entity identifier with name '${trimmedName}' already exists`
          );
        }
      }

      updateData.name = trimmedName;
    }

    // Validate and check icon if provided
    if (data.icon !== undefined) {
      // Validate icon using IdentifierIcon value object
      let identifierIcon: IdentifierIcon;
      try {
        identifierIcon = IdentifierIcon.create(data.icon);
      } catch (error) {
        const message = (error as Error).message;
        // Map value object error messages to service-level messages
        if (message.includes('cannot be empty')) {
          throw new ValidationException('Icon cannot be empty');
        }
        throw new ValidationException(message);
      }

      const trimmedIcon = identifierIcon.getValue();

      // Only check for conflicts if icon is actually changing
      if (trimmedIcon !== existing.icon) {
        const iconExists = await this.repository.existsByIcon(trimmedIcon);
        if (iconExists) {
          throw new ConflictError(
            `Global entity identifier with icon '${trimmedIcon}' already exists`
          );
        }
      }

      updateData.icon = trimmedIcon;
    }

    return this.repository.update(id, updateData);
  }

  async delete(id: UUID): Promise<void> {
    // Check if identifier exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Global entity identifier');
    }

    await this.repository.delete(id);
  }

  async existsByName(name: string): Promise<boolean> {
    // Validate name using IdentifierName value object
    let identifierName: IdentifierName;
    try {
      identifierName = IdentifierName.create(name);
    } catch (error) {
      const message = (error as Error).message;
      // Map value object error messages to service-level messages
      if (message.includes('cannot be empty')) {
        throw new ValidationException('Name cannot be empty');
      }
      throw new ValidationException(message);
    }

    return this.repository.existsByName(identifierName.getValue());
  }

  async existsByIcon(icon: string): Promise<boolean> {
    // Validate icon using IdentifierIcon value object
    let identifierIcon: IdentifierIcon;
    try {
      identifierIcon = IdentifierIcon.create(icon);
    } catch (error) {
      const message = (error as Error).message;
      // Map value object error messages to service-level messages
      if (message.includes('cannot be empty')) {
        throw new ValidationException('Icon cannot be empty');
      }
      throw new ValidationException(message);
    }

    return this.repository.existsByIcon(identifierIcon.getValue());
  }
}
