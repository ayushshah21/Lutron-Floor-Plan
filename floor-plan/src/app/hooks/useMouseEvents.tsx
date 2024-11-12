// hooks/useMouseEvents.tsx
import { useState } from "react";

/**
 * Hook to handle mouse events like hover and leave.
 */
export const useMouseEvents = () => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return {
    isHovered,
    handleMouseEnter,
    handleMouseLeave,
  };
};

export default useMouseEvents;
