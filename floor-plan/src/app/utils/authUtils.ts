// utils/authUtils.ts
import { signOut } from 'firebase/auth';

export const signOutWithGoogle = async (auth: any) => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error(err);
  }
};
