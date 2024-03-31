import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase'; // Adjust this path as needed

const useAuthRedirect = () => {
  const [isLoading, setIsLoading] = useState(true); // Initial loading state
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user && pathname === '/login') {
        router.push('/home');
      } else if (!user && pathname !== '/login') {
        router.push('/login');
      } else {
        setIsLoading(false); // Set loading to false when auth state is determined
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return { isLoading }; // Return loading state
};

export default useAuthRedirect;
