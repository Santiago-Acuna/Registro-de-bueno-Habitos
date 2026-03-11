export interface CreateActionLogPayload {
  startTime: Date;
  actionTypeId: string;
  logTypeInfo?: Record<string, unknown>;
}

export interface ActionLogsState {
  isLoading: boolean;
  error: string | null;
}
