import { signOut } from "firebase/auth";
import { auth } from "./firebaseAuthConfig";


export async function logout(){

  await signOut(auth);

}