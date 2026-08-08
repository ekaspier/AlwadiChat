import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";


// إنشاء معرف ثابت للمحادثة بين شخصين
function getChatId(
  uid1: string,
  uid2: string
) {

  return [uid1, uid2]
    .sort()
    .join("_");

}



// إرسال رسالة نصية أو صورة
export async function sendMessage(

  myUid: string,

  friendUid: string,

  text: string = "",

  imageUrl: string | null = null

) {


  const chatId = getChatId(
    myUid,
    friendUid
  );



  await addDoc(

    collection(
      db,
      "chats",
      chatId,
      "messages"
    ),

    {

      text,

      imageUrl,

      userId: myUid,

      createdAt: serverTimestamp()

    }

  );


}



// الاستماع للرسائل لحظياً

export function listenToMessages(

  myUid: string,

  friendUid: string,

  callback: any

) {


  const chatId = getChatId(
    myUid,
    friendUid
  );



  const q = query(

    collection(
      db,
      "chats",
      chatId,
      "messages"
    ),

    orderBy(
      "createdAt",
      "asc"
    )

  );



  return onSnapshot(

    q,

    (snapshot)=>{


      const messages = snapshot.docs.map(doc=>({

        id: doc.id,

        ...doc.data()

      }));


      callback(messages);


    }

  );


}