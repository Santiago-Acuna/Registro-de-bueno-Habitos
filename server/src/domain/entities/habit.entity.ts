import { BaseEntity, HabitComplexity, SoftDeletable, UUID } from '../shared/types/common';
import { IdentifierIcon } from '../value-objects/identifier-icon';
import { IdentifierName } from '../value-objects/identifier-name';
import { GlobalEntityIdentifier } from './global-entity-identifier.entity';

export interface HabitProps extends BaseEntity, SoftDeletable {
  habitType: HabitComplexity;
  totalActionsCount: number;
  lastActionDate: Date | null;
  globalEntityIdentifier: GlobalEntityIdentifier;
}

export class Habit implements HabitProps {
  constructor(
    public readonly id: UUID,
    public readonly habitType: HabitComplexity,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly isActive: boolean,
    public readonly totalActionsCount: number,
    public readonly lastActionDate: Date | null,
    public readonly globalEntityIdentifier: GlobalEntityIdentifier
  ) {
    this.validateDate(createdAt, 'createdAt');
    this.validateDate(updatedAt, 'updatedAt');
    if (lastActionDate !== null) {
      this.validateDate(lastActionDate, 'lastActionDate');
    }
    this.validateGlobalEntityIdentifier(globalEntityIdentifier);
  }

  public updateName(newName: string): Habit {
    const updatedName = IdentifierName.create(newName);
    const updatedGlobalIdentifier = new GlobalEntityIdentifier(
      this.globalEntityIdentifier.id,
      updatedName,
      this.globalEntityIdentifier.icon,
      this.globalEntityIdentifier.entityType,
      this.globalEntityIdentifier.entityId
    );

    return new Habit(
      this.id,
      this.habitType,
      this.createdAt,
      new Date(),
      this.isActive,
      this.totalActionsCount,
      this.lastActionDate,
      updatedGlobalIdentifier
    );
  }

  public updateIcon(newIconUrl: string): Habit {
    const updatedIcon = IdentifierIcon.create(newIconUrl);
    const updatedGlobalIdentifier = new GlobalEntityIdentifier(
      this.globalEntityIdentifier.id,
      this.globalEntityIdentifier.name,
      updatedIcon,
      this.globalEntityIdentifier.entityType,
      this.globalEntityIdentifier.entityId
    );

    return new Habit(
      this.id,
      this.habitType,
      this.createdAt,
      new Date(),
      this.isActive,
      this.totalActionsCount,
      this.lastActionDate,
      updatedGlobalIdentifier
    );
  }

  public deactivate(): Habit {
    return new Habit(
      this.id,
      this.habitType,
      this.createdAt,
      new Date(),
      false,
      this.totalActionsCount,
      this.lastActionDate,
      this.globalEntityIdentifier
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

  private validateDate(date: Date | null, fieldName: string): void {
    // lastActionDate can be null (no action yet)
    if (fieldName === 'lastActionDate' && date === null) {
      return;
    }

    if (date === null || date === undefined) {
      throw new Error(`Invalid date: ${fieldName} must be a Date object`);
    }

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

  private validateGlobalEntityIdentifier(globalEntityIdentifier: GlobalEntityIdentifier): void {
    if (!globalEntityIdentifier || !(globalEntityIdentifier instanceof GlobalEntityIdentifier)) {
      throw new Error('globalEntityIdentifier must be a valid GlobalEntityIdentifier instance');
    }
  }

  public equals(other: Habit): boolean {
    return this.id === other.id;
  }
}
