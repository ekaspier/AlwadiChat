import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

import { db } from "./firebase";

// =========================================================
// CHAT ID
// إنشاء معرف ثابت للمحادثة بين شخصين
// =========================================================

function getChatId(
  uid1: string,
  uid2: string
) {
  return [uid1, uid2]
    .sort()
    .join("_");
}

// =========================================================
// SEND MESSAGE
// إرسال رسالة نصية أو صورة
// =========================================================

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
      createdAt:
        serverTimestamp(),
    }
  );
}

// =========================================================
// LISTEN TO MESSAGES
// الاستماع للرسائل لحظياً
// =========================================================

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
    (snapshot) => {
      const messages =
        snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      callback(messages);
    }
  );
}

// =========================================================
// CLEAR CHAT
// حذف جميع رسائل محادثة واحدة
// =========================================================

export async function clearChat(
  myUid: string,
  friendUid: string
) {
  const chatId = getChatId(
    myUid,
    friendUid
  );

  const messagesRef =
    collection(
      db,
      "chats",
      chatId,
      "messages"
    );

  const snapshot =
    await getDocs(
      messagesRef
    );

  if (snapshot.empty) {
    return;
  }

  await Promise.all(
    snapshot.docs.map(
      (messageDoc) =>
        deleteDoc(
          messageDoc.ref
        )
    )
  );
}

// =========================================================
// CLEAR ALL CHATS
// حذف جميع محادثات المستخدم
// =========================================================

export async function clearAllChats(
  myUid: string,
  friendUids: string[]
) {
  if (
    !myUid ||
    !friendUids ||
    friendUids.length === 0
  ) {
    return;
  }

  // منع التكرار
  const uniqueFriendUids =
    Array.from(
      new Set(friendUids)
    );

  await Promise.all(
    uniqueFriendUids.map(
      (friendUid) =>
        clearChat(
          myUid,
          friendUid
        )
    )
  );
}