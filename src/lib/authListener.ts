import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseAuthConfig";


export function listenToAuth(
  callback: (user:any) => void
) {

  return onAuthStateChanged(
    auth,
    (user) => {

      callback(user);

    }
  );

}