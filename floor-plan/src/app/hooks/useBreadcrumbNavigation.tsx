// hooks/useBreadcrumbNavigation.tsx
import { useState } from "react";

/**
 * Hook to manage breadcrumb navigation, including click and drop operations.
 */
export const useBreadcrumbNavigation = () => {
  const [breadcrumbPath, setBreadcrumbPath] = useState<{ id: string; name: string }[]>([{ id: "4", name: "Home" }]);

  const handleBreadcrumbClick = (crumb: { id: string; name: string }, index: number) => {
    const newPath = breadcrumbPath.slice(0, index + 1);
    setBreadcrumbPath(newPath);
  };

  const handleDropOnBreadcrumb = (crumbId: string) => {
    // Logic to handle drop on breadcrumb, e.g., moving a file to a folder
    console.log(`Dropped item on breadcrumb with ID: ${crumbId}`);
  };

  return {
    breadcrumbPath,
    handleBreadcrumbClick,
    handleDropOnBreadcrumb,
  };
};

export default useBreadcrumbNavigation;
