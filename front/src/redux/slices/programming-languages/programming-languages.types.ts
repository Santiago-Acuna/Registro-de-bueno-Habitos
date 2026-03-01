export interface ProgrammingLanguage {
  id: number;
  name: string;
  icon: string;
}

export interface ProgrammingLanguagesState {
  programmingLanguages: ProgrammingLanguage[];
  isLoading: boolean;
  error: string | null;
}
