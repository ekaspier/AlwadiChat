import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import { storage } from "./firebase";



export async function uploadImage(
  file: File
) {

  const imageRef = ref(
    storage,
    `chatImages/${Date.now()}_${file.name}`
  );


  await uploadBytes(
    imageRef,
    file
  );


  const url = await getDownloadURL(
    imageRef
  );


  return url;

}