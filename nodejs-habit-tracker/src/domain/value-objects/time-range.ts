export class TimeRange {
  private static readonly MAX_DURATION_HOURS = 24;

  private constructor(
    private readonly startTime: Date,
    private readonly endTime: Date | null = null
  ) {}

  public static create(startTime: Date, endTime?: Date): TimeRange {
    if (!startTime || !(startTime instanceof Date)) {
      throw new Error('Start time must be a valid Date');
    }

    if (startTime > new Date()) {
      throw new Error('Start time cannot be in the future');
    }

    if (endTime) {
      if (!(endTime instanceof Date)) {
        throw new Error('End time must be a valid Date');
      }

      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }

      const durationHours = this.calculateDurationInHours(startTime, endTime);
      if (durationHours > this.MAX_DURATION_HOURS) {
        throw new Error(`Duration cannot exceed ${this.MAX_DURATION_HOURS} hours`);
      }
    }

    return new TimeRange(startTime, endTime || null);
  }

  public getStartTime(): Date {
    return new Date(this.startTime);
  }

  public getEndTime(): Date | null {
    return this.endTime ? new Date(this.endTime) : null;
  }

  public getDurationInMinutes(): number | null {
    if (!this.endTime) {
      return null;
    }
    return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60);
  }

  public getDurationInSeconds(): number | null {
    if (!this.endTime) {
      return null;
    }
    return Math.floor((this.endTime.getTime() - this.startTime.getTime()) / 1000);
  }

  public isCompleted(): boolean {
    return this.endTime !== null;
  }

  public complete(endTime: Date): TimeRange {
    return TimeRange.create(this.startTime, endTime);
  }

  private static calculateDurationInHours(startTime: Date, endTime: Date): number {
    return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  }
}