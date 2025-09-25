import { BaseEntity, HabitComplexity, SoftDeletable, UUID } from '../shared/types/common';
import { HabitName } from '../value-objects/habit-name';

export interface HabitProps extends BaseEntity, SoftDeletable {
  name: HabitName;
  habitType: HabitComplexity;
  logo: string;
  totalActionsCount: number;
  lastActionDate: Date | null;
}

export class Habit implements HabitProps {
  constructor(
    public readonly id: UUID,
    public readonly name: HabitName,
    public readonly habitType: HabitComplexity,
    public readonly logo: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly isActive: boolean = true,
    public readonly totalActionsCount: number = 0,
    public readonly lastActionDate: Date | null = null,
    skipValidation: boolean = false
  ) {
    if (!skipValidation) {
      this.validateLogo(logo);
    }
    this.validateDate(createdAt, 'createdAt');
    this.validateDate(updatedAt, 'updatedAt');
    if (lastActionDate !== null) {
      this.validateDate(lastActionDate, 'lastActionDate');
    }
  }

  // Public factory method for creating new habits
  public static createNew(
    id: UUID,
    name: HabitName,
    habitType: HabitComplexity,
    logo: string,
    createdAt: Date,
    updatedAt: Date,
    isActive?: boolean,
    totalActionsCount?: number,
    lastActionDate?: Date | null
  ): Habit {
    return new Habit(
      id,
      name,
      habitType,
      logo,
      createdAt,
      updatedAt,
      isActive,
      totalActionsCount,
      lastActionDate
    );
  }

  // Public factory method for updating habits (allows empty logo)
  public static createUpdated(
    id: UUID,
    name: HabitName,
    habitType: HabitComplexity,
    logo: string,
    createdAt: Date,
    updatedAt: Date,
    isActive?: boolean,
    totalActionsCount?: number,
    lastActionDate?: Date | null
  ): Habit {
    return new Habit(
      id,
      name,
      habitType,
      logo,
      createdAt,
      updatedAt,
      isActive,
      totalActionsCount,
      lastActionDate
    );
  }

  public static create(
    id: UUID,
    name: string,
    habitType: HabitComplexity,
    logo: string,
    createdAt?: Date,
    updatedAt?: Date
  ): Habit {
    const habitName = HabitName.create(name);
    const now = new Date();

    // Validate logo for creation (must be non-empty)
    if (typeof logo !== 'string' || logo === '' || !logo) {
      throw new Error('Logo must be a non-empty string');
    }

    // Validate provided dates if they are provided (not undefined)
    // null values should be rejected with proper error messages
    let finalCreatedAt: Date;
    let finalUpdatedAt: Date;

    if (createdAt === undefined) {
      finalCreatedAt = now;
    } else {
      if (createdAt === null || !(createdAt instanceof Date)) {
        throw new Error('Invalid date: createdAt must be a Date object');
      }
      if (isNaN(createdAt.getTime())) {
        throw new Error('Invalid date: createdAt must be a valid Date object');
      }
      finalCreatedAt = createdAt;
    }

    if (updatedAt === undefined) {
      finalUpdatedAt = now;
    } else {
      if (updatedAt === null || !(updatedAt instanceof Date)) {
        throw new Error('Invalid date: updatedAt must be a Date object');
      }
      if (isNaN(updatedAt.getTime())) {
        throw new Error('Invalid date: updatedAt must be a valid Date object');
      }
      finalUpdatedAt = updatedAt;
    }

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
      new Date(),
      this.isActive,
      this.totalActionsCount,
      this.lastActionDate,
      true // Skip validation since name and logo are already validated
    );
  }

  public updateLogo(newLogo: string): Habit {
    // Validate logo for update (allows empty string for removal)
    this.validateLogoForUpdate(newLogo);

    return new Habit(
      this.id,
      this.name,
      this.habitType,
      newLogo,
      this.createdAt,
      new Date(),
      this.isActive,
      this.totalActionsCount,
      this.lastActionDate,
      true // Skip validation since we already validated above
    );
  }

  public deactivate(): Habit {
    return new Habit(
      this.id,
      this.name,
      this.habitType,
      this.logo,
      this.createdAt,
      new Date(),
      false,
      this.totalActionsCount,
      this.lastActionDate,
      true // Skip validation since current values are already valid
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
    if (typeof logo !== 'string' || logo === '' || !logo) {
      throw new Error('Logo must be a non-empty string');
    }

    // Maximum 2MB for base64 encoded images
    const maxSize = 2 * 1024 * 1024;
    if (logo.length > maxSize) {
      throw new Error('Logo size cannot exceed 2MB');
    }
  }

  private validateLogoForUpdate(logo: string): void {
    if (typeof logo !== 'string') {
      throw new Error('Logo must be a string');
    }

    // Allow empty string for logo removal
    if (logo === '') {
      return;
    }

    // Maximum 2MB for base64 encoded images
    const maxSize = 2 * 1024 * 1024;
    if (logo.length > maxSize) {
      throw new Error('Logo size cannot exceed 2MB');
    }
  }

  private validateDate(date: Date, fieldName: string): void {
    if (!(date instanceof Date)) {
      if (fieldName === 'lastActionDate') {
        throw new Error(`Invalid date: ${fieldName} must be a valid Date object or null`);
      }
      throw new Error(`Invalid date: ${fieldName} must be a valid Date object`);
    }

    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${fieldName} must be a valid Date object`);
    }
  }

  public equals(other: Habit): boolean {
    return this.id === other.id;
  }
}
