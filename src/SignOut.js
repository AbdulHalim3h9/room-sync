// SignOut.js
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";

const logOut = async () => {
  try {
    await signOut(auth);
    console.log("User signed out.");
  } catch (error) {
    console.error("Error signing out:", error.message);
  }
};

export default logOut;
