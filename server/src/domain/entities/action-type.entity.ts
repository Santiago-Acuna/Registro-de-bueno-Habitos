import { BaseEntity, UUID } from '../shared/types/common';

import { GlobalEntityIdentifier } from './global-entity-identifier.entity';

export interface ActionTypeProps extends BaseEntity {
  habitId: UUID;
  totalActionsCount: number;
  lastActionDate: Date | null;
  globalEntityIdentifier: GlobalEntityIdentifier;
}

export class ActionType implements ActionTypeProps {
  constructor(
    public readonly id: UUID,
    public readonly habitId: UUID,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
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

  get name(): string {
    return this.globalEntityIdentifier.name.getValue();
  }

  get icon(): string {
    return this.globalEntityIdentifier.icon.getValue();
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      habitId: this.habitId,
      name: this.name,
      icon: this.icon,
      totalActionsCount: this.totalActionsCount,
      lastActionDate: this.lastActionDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
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

  public equals(other: ActionType): boolean {
    return this.id === other.id;
  }
}
