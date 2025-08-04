import { BaseEntity, UUID } from '@/shared/types/common';
import { TimeRange } from '@/domain/value-objects/time-range';

export interface ActionProps extends BaseEntity {
  habitId: UUID;
  timeRange: TimeRange;
  durationSeconds: number | null;
  actionDate: Date | null;
}

export class Action implements ActionProps {
  constructor(
    public readonly id: UUID,
    public readonly habitId: UUID,
    public readonly timeRange: TimeRange,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly durationSeconds: number | null = null,
    public readonly actionDate: Date | null = null
  ) {}

  public static create(
    id: UUID,
    habitId: UUID,
    startTime: Date,
    endTime?: Date,
    createdAt?: Date,
    updatedAt?: Date
  ): Action {
    const timeRange = TimeRange.create(startTime, endTime);
    const now = new Date();
    
    const durationSeconds = timeRange.getDurationInSeconds();
    const actionDate = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());

    return new Action(
      id,
      habitId,
      timeRange,
      createdAt || now,
      updatedAt || now,
      durationSeconds,
      actionDate
    );
  }

  public complete(endTime: Date): Action {
    const completedTimeRange = this.timeRange.complete(endTime);
    const durationSeconds = completedTimeRange.getDurationInSeconds();

    return new Action(
      this.id,
      this.habitId,
      completedTimeRange,
      this.createdAt,
      new Date(),
      durationSeconds,
      this.actionDate
    );
  }

  public getStartTime(): Date {
    return this.timeRange.getStartTime();
  }

  public getEndTime(): Date | null {
    return this.timeRange.getEndTime();
  }

  public getDurationInMinutes(): number | null {
    return this.timeRange.getDurationInMinutes();
  }

  public isCompleted(): boolean {
    return this.timeRange.isCompleted();
  }

  public isOngoing(): boolean {
    return !this.timeRange.isCompleted();
  }

  public equals(other: Action): boolean {
    return this.id === other.id;
  }
}