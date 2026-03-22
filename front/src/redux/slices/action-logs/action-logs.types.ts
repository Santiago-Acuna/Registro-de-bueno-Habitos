export interface CreateActionLogPayload {
  startTime: Date;
  actionTypeId: string;
  logTypeInfo?: Record<string, unknown>;
}

export interface ActionLog {
  id: string;
  startTime: string;
  endTime: string | null;
  durationSeconds: number | null;
  actionDate: string;
  actionTypeId: string;
  createdAt: string;
  updatedAt: string;
  logTypeData: Record<string, unknown> | null;
}

export interface ActionLogsState {
  isLoading: boolean;
  error: string | null;
  logsByActionType: Record<string, ActionLog[]>;
}
