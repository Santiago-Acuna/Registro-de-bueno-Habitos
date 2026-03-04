export interface LogColumnValidation {
  id: string;
  validationFunctionId: string;
  functionName: string;
  functionCode: string;
  isForFront: boolean;
}

export interface LogColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select_simple' | 'select_multiple';
  logTypeId: string;
  selectSource?: string | null;
  validations: LogColumnValidation[];
}

export interface LogColumnsState {
  logColumns: LogColumn[];
  isLoading: boolean;
  error: string | null;
}
