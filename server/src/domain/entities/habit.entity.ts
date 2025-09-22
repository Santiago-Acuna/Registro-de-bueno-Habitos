import { BaseEntity, HabitComplexity, SoftDeletable, UUID } from '../shared/types/common';
import { HabitName } from '../value-objects/habit-name';

export interface HabitProps extends BaseEntity, SoftDeletable {
  name: HabitName;
  habitType: HabitComplexity;
  logo: string;
  totalActionsCount: number;
  lastActionDate: string | null;
}

export class Habit implements HabitProps {
  constructor(
    public readonly id: UUID,
    public readonly name: HabitName,
    public readonly habitType: HabitComplexity,
    public readonly logo: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly isActive: boolean = true,
    public readonly totalActionsCount: number = 0,
    public readonly lastActionDate: string | null = null
  ) {
    this.validateLogo(logo);
    this.validateIsoDate(createdAt, 'createdAt');
    this.validateIsoDate(updatedAt, 'updatedAt');
    if (lastActionDate !== null) {
      this.validateIsoDate(lastActionDate, 'lastActionDate');
    }
  }

  public static create(
    id: UUID,
    name: string,
    habitType: HabitComplexity,
    logo: string,
    createdAt?: string,
    updatedAt?: string
  ): Habit {
    const habitName = HabitName.create(name);
    const now = new Date().toISOString();

    // Validate provided dates, but allow undefined/null to use defaults
    const finalCreatedAt = createdAt === undefined || createdAt === null ? now : createdAt;
    const finalUpdatedAt = updatedAt === undefined || updatedAt === null ? now : updatedAt;

    return new Habit(id, habitName, habitType, logo, finalCreatedAt, finalUpdatedAt);
  }

  public updateName(newName: string): Habit {
    const updatedName = HabitName.create(newName);
    return new Habit(
      this.id,
      updatedName,
      this.habitType,
      this.logo,
      this.createdAt,
      new Date().toISOString(),
      this.isActive,
      this.totalActionsCount,
      this.lastActionDate
    );
  }

  public updateLogo(newLogo: string): Habit {
    this.validateLogo(newLogo);
    return new Habit(
      this.id,
      this.name,
      this.habitType,
      newLogo,
      this.createdAt,
      new Date().toISOString(),
      this.isActive,
      this.totalActionsCount,
      this.lastActionDate
    );
  }

  public deactivate(): Habit {
    return new Habit(
      this.id,
      this.name,
      this.habitType,
      this.logo,
      this.createdAt,
      new Date().toISOString(),
      false,
      this.totalActionsCount,
      this.lastActionDate
    );
  }


  public isComplex(): boolean {
    return this.habitType === HabitComplexity.COMPLEX;
  }

  public isSimple(): boolean {
    return this.habitType === HabitComplexity.SIMPLE;
  }

  public isWithoutIntervals(): boolean {
    return this.habitType === HabitComplexity.WITHOUT_INTERVALS;
  }

  private validateLogo(logo: string): void {
    if (!logo || typeof logo !== 'string') {
      throw new Error('Logo must be a non-empty string');
    }

    // Maximum 2MB for base64 encoded images
    const maxSize = 2 * 1024 * 1024;
    if (logo.length > maxSize) {
      throw new Error('Logo size cannot exceed 2MB');
    }
  }

  private validateIsoDate(dateString: string, fieldName: string): void {
    if (!dateString || typeof dateString !== 'string') {
      throw new Error(`Invalid date format: ${fieldName} must be a non-empty string`);
    }

    // Validate ISO 8601 format with UTC timezone for PostgreSQL compatibility
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    if (!isoDateRegex.test(dateString)) {
      throw new Error(`Invalid date format: ${fieldName} must be ISO 8601 format with UTC timezone (YYYY-MM-DDTHH:mm:ss.sssZ)`);
    }

    // Additional validation: ensure it's a valid date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${fieldName} must be a valid ISO 8601 date`);
    }

    // Normalize to compare (both should produce the same ISO string)
    const normalizedInput = dateString.includes('.') ? dateString : dateString.replace('Z', '.000Z');
    if (date.toISOString() !== normalizedInput) {
      throw new Error(`Invalid date format: ${fieldName} must be a valid ISO 8601 date`);
    }
  }

  public equals(other: Habit): boolean {
    return this.id === other.id;
  }
}
