// hooks/useFileHandler.tsx
import { useState } from "react";

/**
 * Hook to handle file input and related operations.
 */
export const useFileHandler = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  return {
    file,
    handleFileChange,
  };
};

export default useFileHandler;
