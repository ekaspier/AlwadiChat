import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

import { auth } from "@/lib/firebaseAuthConfig";


// تسجيل حساب جديد
export async function registerUser(
  email:string,
  password:string
){

  const result = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  return result;

}



// تسجيل دخول
export async function loginUser(
  email:string,
  password:string
){

  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return result;

}