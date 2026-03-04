export interface Subtype {
  id: number;
  name: string;
  typeId: number;
  description: string;
}

export interface SubtypesState {
  subtypes: Subtype[];
  isLoading: boolean;
  error: string | null;
}
