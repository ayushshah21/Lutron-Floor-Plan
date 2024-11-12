// hooks/useFloorplanManager.tsx
import { useRouter } from "next/navigation";

/**
 * Hook to manage floorplan opening and interactions.
 */
export const useFloorplanManager = () => {
  const router = useRouter();

  const openFloorplan = (fileId: string) => {
    router.push(`/editor/${fileId}`);
  };

  return {
    openFloorplan,
  };
};

export default useFloorplanManager;
