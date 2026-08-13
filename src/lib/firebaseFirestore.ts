import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  writeBatch,
  limit,
  Timestamp,
} from "firebase/firestore";

import { db } from "./firebase";

// =========================================================
// TYPES
// =========================================================

export type MessageType =
  | "text"
  | "image"
  | "voice"
  | "mixed";

export type ReplyToMessage = {
  id: string;
  text?: string;
  imageUrl?: string | null;
  voiceUrl?: string | null;
  userId?: string;
};

export type FirestoreChatMessage = {
  id: string;

  text: string;

  imageUrl: string | null;

  voiceUrl: string | null;

  voiceDuration: number | null;

  userId: string;

  type: MessageType;

  createdAt: Timestamp | null;

  updatedAt: Timestamp | null;

  edited: boolean;

  deleted: boolean;

  replyTo: ReplyToMessage | null;

  reactions: Record<string, string>;

  seenBy: Record<string, boolean>;
};

// =========================================================
// CHAT ID
// =========================================================
// إنشاء معرف ثابت بين أي مستخدمين.
// =========================================================

export function getChatId(
  uid1: string,
  uid2: string
): string {
  return [uid1, uid2]
    .sort()
    .join("_");
}

// =========================================================
// CHAT REFERENCES
// =========================================================

function getMessagesCollection(
  myUid: string,
  friendUid: string
) {
  const chatId =
    getChatId(
      myUid,
      friendUid
    );

  return collection(
    db,
    "chats",
    chatId,
    "messages"
  );
}

function getChatDocument(
  myUid: string,
  friendUid: string
) {
  const chatId =
    getChatId(
      myUid,
      friendUid
    );

  return doc(
    db,
    "chats",
    chatId
  );
}

// =========================================================
// SEND MESSAGE
// =========================================================
// يدعم:
// - نص
// - صورة
// - Voice
// - Reply
// =========================================================

export async function sendMessage(
  myUid: string,
  friendUid: string,
  text: string = "",
  imageUrl: string | null = null,
  options?: {
    voiceUrl?: string | null;
    voiceDuration?: number | null;
    replyTo?: ReplyToMessage | null;
  }
): Promise<string> {
  if (
    !myUid ||
    !friendUid
  ) {
    throw new Error(
      "Missing user ID"
    );
  }

  const cleanText =
    text.trim();

  const voiceUrl =
    options?.voiceUrl ??
    null;

  const voiceDuration =
    options?.voiceDuration ??
    null;

  const replyTo =
    options?.replyTo ??
    null;

  let type: MessageType =
    "text";

  if (
    imageUrl &&
    voiceUrl
  ) {
    type = "mixed";
  } else if (imageUrl) {
    type = "image";
  } else if (voiceUrl) {
    type = "voice";
  }

  if (
    !cleanText &&
    !imageUrl &&
    !voiceUrl
  ) {
    throw new Error(
      "Message cannot be empty"
    );
  }

  const messagesRef =
    getMessagesCollection(
      myUid,
      friendUid
    );

  const messageRef =
    await addDoc(
      messagesRef,
      {
        text: cleanText,

        imageUrl,

        voiceUrl,

        voiceDuration,

        userId: myUid,

        type,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),

        edited: false,

        deleted: false,

        replyTo,

        reactions: {},

        seenBy: {
          [myUid]: true,
        },
      }
    );

  // =======================================================
  // UPDATE CHAT SUMMARY
  // =======================================================

  const chatRef =
    getChatDocument(
      myUid,
      friendUid
    );

  await setDoc(
    chatRef,
    {
      participants: [
        myUid,
        friendUid,
      ],

      lastMessage: {
        text:
          cleanText ||
          (imageUrl
            ? "📷 صورة"
            : voiceUrl
            ? "🎙️ رسالة صوتية"
            : ""),
        senderId: myUid,
        type,
        updatedAt:
          serverTimestamp(),
      },

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    }
  );

  return messageRef.id;
}

// =========================================================
// SEND VOICE MESSAGE
// =========================================================

export async function sendVoiceMessage(
  myUid: string,
  friendUid: string,
  voiceUrl: string,
  duration: number = 0,
  replyTo:
    | ReplyToMessage
    | null = null
): Promise<string> {
  if (!voiceUrl) {
    throw new Error(
      "Missing voice URL"
    );
  }

  return sendMessage(
    myUid,
    friendUid,
    "",
    null,
    {
      voiceUrl,
      voiceDuration:
        duration,
      replyTo,
    }
  );
}

// =========================================================
// LISTEN TO MESSAGES
// =========================================================
// realtime listener
// =========================================================

export function listenToMessages(
  myUid: string,
  friendUid: string,
  callback: (
    messages: FirestoreChatMessage[]
  ) => void
) {
  if (
    !myUid ||
    !friendUid
  ) {
    return () => {};
  }

  const messagesRef =
    getMessagesCollection(
      myUid,
      friendUid
    );

  const q =
    query(
      messagesRef,
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
          (
            messageDoc
          ) => {
            const data =
              messageDoc.data();

            return {
              id: messageDoc.id,

              text:
                data.text ??
                "",

              imageUrl:
                data.imageUrl ??
                null,

              voiceUrl:
                data.voiceUrl ??
                null,

              voiceDuration:
                data.voiceDuration ??
                null,

              userId:
                data.userId ??
                "",

              type:
                data.type ??
                "text",

              createdAt:
                data.createdAt ??
                null,

              updatedAt:
                data.updatedAt ??
                null,

              edited:
                data.edited ??
                false,

              deleted:
                data.deleted ??
                false,

              replyTo:
                data.replyTo ??
                null,

              reactions:
                data.reactions ??
                {},

              seenBy:
                data.seenBy ??
                {},
            };
          }
        );

      callback(
        messages
      );
    },
    (error) => {
      console.error(
        "Messages listener failed:",
        error
      );
    }
  );
}

// =========================================================
// GET MESSAGES ONCE
// =========================================================

export async function getMessages(
  myUid: string,
  friendUid: string
): Promise<FirestoreChatMessage[]> {
  if (
    !myUid ||
    !friendUid
  ) {
    return [];
  }

  const messagesRef =
    getMessagesCollection(
      myUid,
      friendUid
    );

  const q =
    query(
      messagesRef,
      orderBy(
        "createdAt",
        "asc"
      )
    );

  const snapshot =
    await getDocs(q);

  return snapshot.docs.map(
    (messageDoc) => {
      const data =
        messageDoc.data();

      return {
        id: messageDoc.id,

        text:
          data.text ??
          "",

        imageUrl:
          data.imageUrl ??
          null,

        voiceUrl:
          data.voiceUrl ??
          null,

        voiceDuration:
          data.voiceDuration ??
          null,

        userId:
          data.userId ??
          "",

        type:
          data.type ??
          "text",

        createdAt:
          data.createdAt ??
          null,

        updatedAt:
          data.updatedAt ??
          null,

        edited:
          data.edited ??
          false,

        deleted:
          data.deleted ??
          false,

        replyTo:
          data.replyTo ??
          null,

        reactions:
          data.reactions ??
          {},

        seenBy:
          data.seenBy ??
          {},
      };
    }
  );
}

// =========================================================
// EDIT MESSAGE
// =========================================================

export async function editMessage(
  myUid: string,
  friendUid: string,
  messageId: string,
  newText: string
) {
  const cleanText =
    newText.trim();

  if (!cleanText) {
    throw new Error(
      "Message cannot be empty"
    );
  }

  const messageRef =
    doc(
      getMessagesCollection(
        myUid,
        friendUid
      ),
      messageId
    );

  const existing =
    await getDoc(
      messageRef
    );

  if (!existing.exists()) {
    throw new Error(
      "Message not found"
    );
  }

  const data =
    existing.data();

  if (
    data.userId !==
    myUid
  ) {
    throw new Error(
      "You can only edit your own messages"
    );
  }

  await updateDoc(
    messageRef,
    {
      text: cleanText,

      edited: true,

      updatedAt:
        serverTimestamp(),
    }
  );

  // تحديث آخر رسالة إذا كانت هذه
  // هي آخر رسالة في المحادثة.

  const chatRef =
    getChatDocument(
      myUid,
      friendUid
    );

  const chatSnapshot =
    await getDoc(
      chatRef
    );

  if (
    chatSnapshot.exists()
  ) {
    const chatData =
      chatSnapshot.data();

    if (
      chatData.lastMessage
        ?.messageId ===
      messageId
    ) {
      await updateDoc(
        chatRef,
        {
          "lastMessage.text":
            cleanText,

          "lastMessage.updatedAt":
            serverTimestamp(),
        }
      );
    }
  }
}

// =========================================================
// DELETE MESSAGE FOR EVERYONE
// =========================================================

export async function deleteMessage(
  myUid: string,
  friendUid: string,
  messageId: string
) {
  const messageRef =
    doc(
      getMessagesCollection(
        myUid,
        friendUid
      ),
      messageId
    );

  const existing =
    await getDoc(
      messageRef
    );

  if (!existing.exists()) {
    return;
  }

  const data =
    existing.data();

  if (
    data.userId !==
    myUid
  ) {
    throw new Error(
      "You can only delete your own messages"
    );
  }

  // Soft delete حتى ما نخرب
  // replies والـ message history.

  await updateDoc(
    messageRef,
    {
      text: "",

      imageUrl: null,

      voiceUrl: null,

      voiceDuration: null,

      deleted: true,

      updatedAt:
        serverTimestamp(),
    }
  );
}

// =========================================================
// DELETE MESSAGE PERMANENTLY
// =========================================================
// نستخدمها فقط إذا احتجنا حذف نهائي.
// =========================================================

export async function permanentlyDeleteMessage(
  myUid: string,
  friendUid: string,
  messageId: string
) {
  const messageRef =
    doc(
      getMessagesCollection(
        myUid,
        friendUid
      ),
      messageId
    );

  const existing =
    await getDoc(
      messageRef
    );

  if (!existing.exists()) {
    return;
  }

  const data =
    existing.data();

  if (
    data.userId !==
    myUid
  ) {
    throw new Error(
      "You can only delete your own messages"
    );
  }

  await deleteDoc(
    messageRef
  );
}

// =========================================================
// REACT TO MESSAGE
// =========================================================

export async function reactToMessage(
  myUid: string,
  friendUid: string,
  messageId: string,
  emoji: string
) {
  if (!emoji) {
    return;
  }

  const messageRef =
    doc(
      getMessagesCollection(
        myUid,
        friendUid
      ),
      messageId
    );

  const snapshot =
    await getDoc(
      messageRef
    );

  if (!snapshot.exists()) {
    throw new Error(
      "Message not found"
    );
  }

  const data =
    snapshot.data();

  const reactions =
    {
      ...(data.reactions ??
        {}),
    };

  if (
    reactions[myUid] ===
    emoji
  ) {
    delete reactions[
      myUid
    ];
  } else {
    reactions[myUid] =
      emoji;
  }

  await updateDoc(
    messageRef,
    {
      reactions,

      updatedAt:
        serverTimestamp(),
    }
  );
}

// =========================================================
// MARK MESSAGE AS READ
// =========================================================

export async function markMessageAsRead(
  myUid: string,
  friendUid: string,
  messageId: string
) {
  if (
    !myUid ||
    !friendUid ||
    !messageId
  ) {
    return;
  }

  const messageRef =
    doc(
      getMessagesCollection(
        myUid,
        friendUid
      ),
      messageId
    );

  const snapshot =
    await getDoc(
      messageRef
    );

  if (!snapshot.exists()) {
    return;
  }

  const data =
    snapshot.data();

  const seenBy =
    {
      ...(data.seenBy ??
        {}),
    };

  seenBy[myUid] =
    true;

  await updateDoc(
    messageRef,
    {
      seenBy,
    }
  );
}

// =========================================================
// MARK ALL MESSAGES AS READ
// =========================================================

export async function markAllMessagesAsRead(
  myUid: string,
  friendUid: string
) {
  if (
    !myUid ||
    !friendUid
  ) {
    return;
  }

  const messagesRef =
    getMessagesCollection(
      myUid,
      friendUid
    );

  const snapshot =
    await getDocs(
      messagesRef
    );

  if (snapshot.empty) {
    return;
  }

  const batch =
    writeBatch(db);

  snapshot.docs.forEach(
    (messageDoc) => {
      const data =
        messageDoc.data();

      if (
        data.userId ===
        myUid
      ) {
        return;
      }

      const seenBy =
        {
          ...(data.seenBy ??
            {}),
        };

      seenBy[myUid] =
        true;

      batch.update(
        messageDoc.ref,
        {
          seenBy,
        }
      );
    }
  );

  await batch.commit();
}

// =========================================================
// CLEAR CHAT
// =========================================================
// حذف جميع رسائل محادثة واحدة.
// =========================================================

export async function clearChat(
  myUid: string,
  friendUid: string
) {
  if (
    !myUid ||
    !friendUid
  ) {
    return;
  }

  const messagesRef =
    getMessagesCollection(
      myUid,
      friendUid
    );

  const snapshot =
    await getDocs(
      messagesRef
    );

  if (snapshot.empty) {
    return;
  }

  // Firestore batch maximum = 500
  // لذلك نقسم الرسائل إلى batches.

  const chunks: typeof snapshot.docs[] =
    [];

  for (
    let i = 0;
    i <
    snapshot.docs.length;
    i += 500
  ) {
    chunks.push(
      snapshot.docs.slice(
        i,
        i + 500
      )
    );
  }

  for (
    const chunk of chunks
  ) {
    const batch =
      writeBatch(db);

    chunk.forEach(
      (messageDoc) => {
        batch.delete(
          messageDoc.ref
        );
      }
    );

    await batch.commit();
  }

  // حذف ملخص المحادثة
  // مع إبقاء document فارغاً
  // إذا احتجناه لاحقاً.

  const chatRef =
    getChatDocument(
      myUid,
      friendUid
    );

  await setDoc(
    chatRef,
    {
      lastMessage: null,

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

// =========================================================
// ARCHIVE CHAT
// =========================================================

export async function archiveChat(
  myUid: string,
  friendUid: string
) {
  if (
    !myUid ||
    !friendUid
  ) {
    return;
  }

  const archiveRef =
    doc(
      db,
      "users",
      myUid,
      "archivedChats",
      friendUid
    );

  await setDoc(
    archiveRef,
    {
      userId: friendUid,

      archivedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

// =========================================================
// UNARCHIVE CHAT
// =========================================================

export async function unarchiveChat(
  myUid: string,
  friendUid: string
) {
  if (
    !myUid ||
    !friendUid
  ) {
    return;
  }

  const archiveRef =
    doc(
      db,
      "users",
      myUid,
      "archivedChats",
      friendUid
    );

  await deleteDoc(
    archiveRef
  );
}

// =========================================================
// LISTEN TO ARCHIVED CHATS
// =========================================================

export function listenToArchivedChats(
  myUid: string,
  callback: (
    friendUids: string[]
  ) => void
) {
  if (!myUid) {
    callback([]);

    return () => {};
  }

  const archivedRef =
    collection(
      db,
      "users",
      myUid,
      "archivedChats"
    );

  return onSnapshot(
    archivedRef,
    (snapshot) => {
      const ids =
        snapshot.docs
          .map(
            (archiveDoc) =>
              archiveDoc.id
          );

      callback(ids);
    },
    (error) => {
      console.error(
        "Archived chats listener failed:",
        error
      );

      callback([]);
    }
  );
}

// =========================================================
// IS CHAT ARCHIVED
// =========================================================

export async function isChatArchived(
  myUid: string,
  friendUid: string
): Promise<boolean> {
  if (
    !myUid ||
    !friendUid
  ) {
    return false;
  }

  const archiveRef =
    doc(
      db,
      "users",
      myUid,
      "archivedChats",
      friendUid
    );

  const snapshot =
    await getDoc(
      archiveRef
    );

  return snapshot.exists();
}

// =========================================================
// CLEAR ALL CHATS
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

  const uniqueFriendUids =
    Array.from(
      new Set(
        friendUids.filter(
          Boolean
        )
      )
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

// =========================================================
// GET LAST MESSAGE
// =========================================================

export async function getLastMessage(
  myUid: string,
  friendUid: string
): Promise<
  FirestoreChatMessage | null
> {
  if (
    !myUid ||
    !friendUid
  ) {
    return null;
  }

  const messagesRef =
    getMessagesCollection(
      myUid,
      friendUid
    );

  const q =
    query(
      messagesRef,
      orderBy(
        "createdAt",
        "desc"
      ),
      limit(1)
    );

  const snapshot =
    await getDocs(q);

  if (
    snapshot.empty
  ) {
    return null;
  }

  const messageDoc =
    snapshot.docs[0];

  const data =
    messageDoc.data();

  return {
    id: messageDoc.id,

    text:
      data.text ??
      "",

    imageUrl:
      data.imageUrl ??
      null,

    voiceUrl:
      data.voiceUrl ??
      null,

    voiceDuration:
      data.voiceDuration ??
      null,

    userId:
      data.userId ??
      "",

    type:
      data.type ??
      "text",

    createdAt:
      data.createdAt ??
      null,

    updatedAt:
      data.updatedAt ??
      null,

    edited:
      data.edited ??
      false,

    deleted:
      data.deleted ??
      false,

    replyTo:
      data.replyTo ??
      null,

    reactions:
      data.reactions ??
      {},

    seenBy:
      data.seenBy ??
      {},
  };
}