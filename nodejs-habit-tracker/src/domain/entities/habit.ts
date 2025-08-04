import { BaseEntity, HabitComplexity, SoftDeletable, UUID } from '@/shared/types/common';
import { HabitName } from '@/domain/value-objects/habit-name';

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
    public readonly lastActionDate: Date | null = null
  ) {
    this.validateLogo(logo);
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

    return new Habit(
      id,
      habitName,
      habitType,
      logo,
      createdAt || now,
      updatedAt || now
    );
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
      new Date(),
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
      new Date(),
      false,
      this.totalActionsCount,
      this.lastActionDate
    );
  }

  public incrementActionCount(): Habit {
    return new Habit(
      this.id,
      this.name,
      this.habitType,
      this.logo,
      this.createdAt,
      new Date(),
      this.isActive,
      this.totalActionsCount + 1,
      new Date()
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

  public equals(other: Habit): boolean {
    return this.id === other.id;
  }
}