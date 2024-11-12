// utils/stringUtils.ts
export const truncateFloorPlanName = (name: string | undefined): string => {
    if (!name) return 'Unnamed File';
    return name.length > 10 ? `${name.substring(0, 7)}...` : name;
  };
  