import { useEffect } from "react";
import { useCustomDispatch, useCustomSelector } from "@/redux/hooks/hooks";
import { fetchProgrammingLanguages } from "@/redux/slices/programming-languages";
import { fetchExternalDependencies } from "@/redux/slices/external-dependencies";
import { fetchSubtypes } from "@/redux/slices/subtypes";
import type { LogColumn } from "@/redux/slices/log-columns";
import type { SelectOption } from "@/components/utils/terminator-form/inputs/SelectInput";

export type SelectSource = "programmingLanguages" | "externalDependencies" | "subtypes";

export function useSelectSources(logColumns: LogColumn[]) {
  const dispatch = useCustomDispatch();

  const neededSources = new Set(
    logColumns
      .filter((col) => col.type === "select_simple" || col.type === "select_multiple")
      .map((col) => col.selectSource)
      .filter((source): source is SelectSource => source != null)
  );

  // Stable string key — the effect only re-runs when the actual set of
  // needed sources changes, not on every render.
  const sourcesKey = [...neededSources].sort().join(",");

  const programmingLanguages = useCustomSelector((s) => s.programmingLanguages.programmingLanguages);
  const programmingLanguagesLoading = useCustomSelector((s) => s.programmingLanguages.isLoading);
  const externalDependencies = useCustomSelector((s) => s.externalDependencies.externalDependencies);
  const externalDependenciesLoading = useCustomSelector((s) => s.externalDependencies.isLoading);
  const subtypes = useCustomSelector((s) => s.subtypes.subtypes);
  const subtypesLoading = useCustomSelector((s) => s.subtypes.isLoading);

  useEffect(() => {
    if (neededSources.has("programmingLanguages")) dispatch(fetchProgrammingLanguages());
    if (neededSources.has("externalDependencies")) dispatch(fetchExternalDependencies());
    if (neededSources.has("subtypes")) dispatch(fetchSubtypes());
  }, [dispatch, sourcesKey]);

  const optionsBySource: Record<SelectSource, SelectOption[]> = {
    programmingLanguages: programmingLanguages.map((l) => ({ id: l.id, name: l.name, icon: l.icon })),
    externalDependencies: externalDependencies.map((d) => ({ id: d.id, name: d.name, icon: d.icon })),
    subtypes: subtypes.map((s) => ({ id: s.id, name: s.name })),
  };

  const isLoadingBySource: Record<SelectSource, boolean> = {
    programmingLanguages: programmingLanguagesLoading,
    externalDependencies: externalDependenciesLoading,
    subtypes: subtypesLoading,
  };

  return { optionsBySource, isLoadingBySource };
}
