// hooks/useFilterOptions.tsx
import { useState } from "react";

/**
 * Hook to manage filter options such as home, recent, starred, and shared views.
 */
export const useFilterOptions = () => {
  const [filterCondition, setFilterCondition] = useState<string>("Home");

  const handleClickFilterOptions = (filterParameter: string) => {
    setFilterCondition(filterParameter);
  };

  return {
    filterCondition,
    handleClickFilterOptions,
  };
};

export default useFilterOptions;
