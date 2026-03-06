import { useEffect } from "react";
import { useCustomDispatch, useCustomSelector } from "@/redux/hooks/hooks";
import { fetchFeatures } from "@/redux/slices/features";
import type { FetchFeaturesParams, Feature } from "@/redux/slices/features";

interface UseFeaturesReturn {
  data: Feature[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}

export const useFeatures = (options: FetchFeaturesParams = {}): UseFeaturesReturn => {
  const dispatch = useCustomDispatch();
  const { features, isLoading, error } = useCustomSelector(
    (state) => state.features
  );

  useEffect(() => {
    dispatch(fetchFeatures(options));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, JSON.stringify(options)]);

  return {
    data: features,
    isLoading,
    isError: error !== null,
    error,
  };
};
