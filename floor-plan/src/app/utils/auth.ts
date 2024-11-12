// utils/auth.ts
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";

/**
 * Utility function to handle Google sign out.
 */
export const signOutWithGoogle = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Error signing out: ", error);
  }
};

/**
 * Utility function to check if the user is authenticated.
 */
export const checkAuthState = async () => {
  try {
    // Assuming auth.currentUser is used to verify authentication
    const user = auth.currentUser;
    if (user) {
      console.log("User is signed in: ", user.email);
      return user;
    } else {
      console.log("No user is signed in.");
      return null;
    }
  } catch (error) {
    console.error("Error checking authentication state: ", error);
    return null;
  }
};

export default {
  signOutWithGoogle,
  checkAuthState,
};
