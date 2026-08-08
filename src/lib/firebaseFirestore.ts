import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  deleteField,
  Timestamp,
} from "firebase/firestore";

import { db } from "./firebase";

// =========================================================
// CHAT ID
// نفس المحادثة دائماً بين نفس الشخصين
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
// CHAT DOCUMENT
// =========================================================

function getChatRef(
  uid1: string,
  uid2: string
) {
  const chatId = getChatId(
    uid1,
    uid2
  );

  return doc(
    db,
    "chats",
    chatId
  );
}

// =========================================================
// SEND MESSAGE
//
// عند إرسال رسالة جديدة:
// 1. يتم تحديث المحادثة
// 2. يتم إلغاء حالة المسح الخاصة بالمرسل
// 3. يتم إضافة الرسالة
//
// النتيجة:
// إذا كان الطرف الآخر يرى نقطة حمراء بسبب Clear Chat
// فإن النقطة تختفي عندما نرسل رسالة جديدة.
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

  const chatRef = doc(
    db,
    "chats",
    chatId
  );

  await setDoc(
    chatRef,
    {
      members: [
        myUid,
        friendUid,
      ],

      updatedAt:
        serverTimestamp(),

      clearedAt: {
        [myUid]:
          deleteField(),
      },
    },
    {
      merge: true,
    }
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
// CLEAR CHAT FOR CURRENT USER
//
// لا نحذف الرسائل فعلياً من Firestore.
//
// فقط نسجل وقت المسح للمستخدم الحالي.
//
// الطرف الآخر سيشاهد نقطة حمراء بجانب اسم هذا المستخدم.
// =========================================================

export async function clearChatForUser(
  myUid: string,
  friendUid: string
) {
  const chatRef =
    getChatRef(
      myUid,
      friendUid
    );

  await setDoc(
    chatRef,
    {
      members: [
        myUid,
        friendUid,
      ],

      updatedAt:
        serverTimestamp(),

      clearedAt: {
        [myUid]:
          serverTimestamp(),
      },
    },
    {
      merge: true,
    }
  );
}

// =========================================================
// LISTEN TO MESSAGES
//
// يستمع:
// 1. للرسائل
// 2. لوقت مسح المستخدم الحالي
//
// الرسائل القديمة قبل clearedAt لا تظهر للمستخدم.
// =========================================================

export function listenToMessages(
  myUid: string,
  friendUid: string,
  callback: any
) {
  const chatId =
    getChatId(
      myUid,
      friendUid
    );

  const chatRef =
    doc(
      db,
      "chats",
      chatId
    );

  const messagesRef =
    collection(
      db,
      "chats",
      chatId,
      "messages"
    );

  const q =
    query(
      messagesRef,
      orderBy(
        "createdAt",
        "asc"
      )
    );

  let latestMessages: any[] = [];

  let clearedAt:
    | number
    | null = null;

  // =======================================================
  // UPDATE DISPLAYED MESSAGES
  // =======================================================

  function updateVisibleMessages() {
    const visibleMessages =
      latestMessages.filter(
        (message: any) => {

          if (!clearedAt) {
            return true;
          }

          if (!message.createdAt) {
            return true;
          }

          let messageTime =
            0;

          if (
            message.createdAt
              instanceof Timestamp
          ) {
            messageTime =
              message.createdAt.toMillis();
          } else if (
            typeof message
              .createdAt
              ?.toMillis ===
              "function"
          ) {
            messageTime =
              message.createdAt.toMillis();
          }

          if (!messageTime) {
            return true;
          }

          return (
            messageTime >
            clearedAt
          );
        }
      );

    callback(
      visibleMessages
    );
  }

  // =======================================================
  // LISTEN TO CHAT METADATA
  // =======================================================

  const unsubscribeChat =
    onSnapshot(
      chatRef,
      (snapshot) => {

        if (!snapshot.exists()) {
          clearedAt = null;

          updateVisibleMessages();

          return;
        }

        const data =
          snapshot.data();

        const userClearedAt =
          data?.clearedAt?.[
            myUid
          ];

        if (!userClearedAt) {
          clearedAt = null;
        } else if (
          userClearedAt
            instanceof Timestamp
        ) {
          clearedAt =
            userClearedAt.toMillis();
        } else if (
          typeof userClearedAt
            ?.toMillis ===
            "function"
        ) {
          clearedAt =
            userClearedAt.toMillis();
        } else {
          clearedAt = null;
        }

        updateVisibleMessages();
      }
    );

  // =======================================================
  // LISTEN TO MESSAGES
  // =======================================================

  const unsubscribeMessages =
    onSnapshot(
      q,
      (snapshot) => {

        latestMessages =
          snapshot.docs.map(
            (messageDoc) => ({
              id:
                messageDoc.id,

              ...messageDoc.data(),
            })
          );

        updateVisibleMessages();
      }
    );

  // =======================================================
  // COMBINED UNSUBSCRIBE
  // =======================================================

  return () => {
    unsubscribeChat();
    unsubscribeMessages();
  };
}

// =========================================================
// LISTEN TO CHAT STATUS
//
// إذا friendUid مسح المحادثة:
// clearedByFriend = true
//
// إذا friendUid أرسل رسالة جديدة:
// sendMessage() يحذف clearedAt الخاص به
// وبالتالي:
// clearedByFriend = false
// =========================================================

export function listenToChatStatus(
  myUid: string,
  friendUid: string,
  callback: (
    status: {
      clearedByFriend: boolean;
    }
  ) => void
) {
  const chatId =
    getChatId(
      myUid,
      friendUid
    );

  const chatRef =
    doc(
      db,
      "chats",
      chatId
    );

  return onSnapshot(
    chatRef,
    (snapshot) => {

      if (!snapshot.exists()) {
        callback({
          clearedByFriend:
            false,
        });

        return;
      }

      const data =
        snapshot.data();

      const clearedAt =
        data?.clearedAt;

      const friendCleared =
        !!clearedAt?.[
          friendUid
        ];

      callback({
        clearedByFriend:
          friendCleared,
      });
    }
  );
}