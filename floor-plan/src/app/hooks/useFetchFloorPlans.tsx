// hooks/useFilterToggle.tsx
import { Dispatch, SetStateAction } from 'react';

const useFilterToggle = (
  setFilterByContributors: Dispatch<SetStateAction<boolean>>,
  setSelectedFolder: Dispatch<SetStateAction<string | null>>
) => {
  const handleClickHome = () => {
    setFilterByContributors(false);
    setSelectedFolder(null);
  };

  const handleClickSharedWithMe = () => {
    setFilterByContributors(true);
    setSelectedFolder(null);
  };

  return { handleClickHome, handleClickSharedWithMe };
};

export default useFilterToggle;
