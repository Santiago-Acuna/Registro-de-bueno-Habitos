export interface Feature {
  id: string;
  name: string;
  description: string;
  ready: boolean;
  completed_at: Date | null;
}

export interface FeaturesState {
  features: Feature[];
  isLoading: boolean;
  error: string | null;
}

export interface FetchFeaturesParams {
  ready?: boolean;
  completed_at?: string;
}
