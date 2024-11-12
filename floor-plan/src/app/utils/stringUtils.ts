// utils/stringUtils.ts

/**
 * Utility function to truncate long names.
 * @param name - The name to truncate.
 * @param maxLength - The maximum length of the truncated string.
 * @returns A truncated version of the input name.
 */
export const truncateName = (name: string, maxLength: number = 20): string => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };
  
  export default truncateName;
  