export interface ExternalDependency {
  id: number;
  name: string;
  icon: string;
  programmingLanguageId: number | null;
}

export interface ExternalDependenciesState {
  externalDependencies: ExternalDependency[];
  isLoading: boolean;
  error: string | null;
}
