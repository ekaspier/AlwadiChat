import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";




// إنشاء ملف المستخدم بعد التسجيل

export async function createUserProfile(

  uid:string,

  username:string,

  email:string

){


  await addDoc(

    collection(
      db,
      "users"
    ),

    {

      uid,

      username,

      email,

      createdAt:serverTimestamp()

    }

  );


}







// البحث عن مستخدم بالـ Username

export async function searchUsers(

  username:string

){


  const q = query(

    collection(
      db,
      "users"
    ),

    where(
      "username",
      "==",
      username
    )

  );




  const snapshot = await getDocs(q);



  return snapshot.docs.map(doc=>({


    id:doc.id,

    ...doc.data()


  }));


}








// إرسال طلب صداقة

export async function sendFriendRequest(

  fromUid:string,

  toUid:string

){


  await addDoc(

    collection(
      db,
      "friendRequests"
    ),

    {

      from:fromUid,

      to:toUid,

      status:"pending",

      createdAt:serverTimestamp()

    }

  );


}








// جلب الملف الشخصي

export async function getUserProfile(

  uid:string

){


  const q = query(

    collection(
      db,
      "users"
    ),

    where(
      "uid",
      "==",
      uid
    )

  );




  const snapshot = await getDocs(q);




  if(snapshot.empty){

    return null;

  }




  return {


    id:snapshot.docs[0].id,


    ...snapshot.docs[0].data()


  };


}