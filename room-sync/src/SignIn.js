// SignIn.js
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";

const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in:", userCredential.user);
  } catch (error) {
    console.error("Error signing in:", error.message);
  }
};

export default signIn;
