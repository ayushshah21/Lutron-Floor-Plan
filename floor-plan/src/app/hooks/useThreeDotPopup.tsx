// hooks/useThreeDotPopup.tsx
import { useState } from "react";

/**
 * Hook to manage the UI state for the three-dot popup menu.
 */
export const useThreeDotPopup = () => {
  const [showThreeDotPopup, setShowThreeDotPopup] = useState<boolean>(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const handleThreeDotPopup = (fileId: string) => {
    setSelectedFileId(fileId);
    setShowThreeDotPopup((prev) => (selectedFileId === fileId ? !prev : true));
  };

  return {
    showThreeDotPopup,
    setShowThreeDotPopup,
    selectedFileId,
    setSelectedFileId,
    handleThreeDotPopup,
  };
};

export default useThreeDotPopup;
