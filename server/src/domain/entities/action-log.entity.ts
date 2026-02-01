import { UUID } from '../shared/types/common';

export class ActionLog {
  constructor(
    public readonly id: UUID,
    public readonly startTime: Date,
    public readonly endTime: Date | null,
    public readonly durationSeconds: number | null,
    public readonly actionDate: Date,
    public readonly actionTypeId: UUID,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
