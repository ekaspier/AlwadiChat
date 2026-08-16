
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
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

export function getChatId(
  uid1: string,
  uid2: string
): string {
  return [uid1, uid2].sort().join("_");
}

// =========================================================
// CHAT REFERENCES
// =========================================================

function getMessagesCollection(
  myUid: string,
  friendUid: string
) {
  const chatId = getChatId(
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
  const chatId = getChatId(
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
// MESSAGE FORMATTER
// =========================================================

function formatMessage(
  messageDoc: any
): FirestoreChatMessage {
  const data = messageDoc.data();

  return {
    id: messageDoc.id,

    text:
      data.text ?? "",

    imageUrl:
      data.imageUrl ?? null,

    voiceUrl:
      data.voiceUrl ?? null,

    voiceDuration:
      data.voiceDuration ?? null,

    userId:
      data.userId ?? "",

    type:
      data.type ?? "text",

    createdAt:
      data.createdAt ?? null,

    updatedAt:
      data.updatedAt ?? null,

    edited:
      data.edited ?? false,

    deleted:
      data.deleted ?? false,

    replyTo:
      data.replyTo ?? null,

    reactions:
      data.reactions ?? {},

    seenBy:
      data.seenBy ?? {},
  };
}

// =========================================================
// SEND MESSAGE
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
  if (!myUid || !friendUid) {
    throw new Error(
      "Missing user ID"
    );
  }

  const cleanText =
    text.trim();

  const voiceUrl =
    options?.voiceUrl ?? null;

  const voiceDuration =
    options?.voiceDuration ?? null;

  const replyTo =
    options?.replyTo ?? null;

  let type: MessageType =
    "text";

  if (
    imageUrl &&
    voiceUrl
  ) {
    type = "mixed";
  } else if (
    imageUrl
  ) {
    type = "image";
  } else if (
    voiceUrl
  ) {
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
  // CHAT SUMMARY
  // =======================================================

  const chatRef =
    getChatDocument(
      myUid,
      friendUid
    );

  const lastMessageText =
    cleanText ||
    (imageUrl
      ? "📷 صورة"
      : voiceUrl
      ? "🎙️ رسالة صوتية"
      : "");

  await setDoc(
    chatRef,
    {
      participants: [
        myUid,
        friendUid,
      ],

      lastMessage: {
        messageId:
          messageRef.id,

        text:
          lastMessageText,

        senderId:
          myUid,

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

  const messagesQuery =
    query(
      messagesRef,
      orderBy(
        "createdAt",
        "asc"
      )
    );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages =
        snapshot.docs.map(
          formatMessage
        );

      callback(messages);
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
// GET MESSAGES
// =========================================================

export async function getMessages(
  myUid: string,
  friendUid: string
): Promise<
  FirestoreChatMessage[]
> {
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

  const messagesQuery =
    query(
      messagesRef,
      orderBy(
        "createdAt",
        "asc"
      )
    );

  const snapshot =
    await getDocs(
      messagesQuery
    );

  return snapshot.docs.map(
    formatMessage
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
    data.userId !== myUid
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

          updatedAt:
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
    data.userId !== myUid
  ) {
    throw new Error(
      "You can only delete your own messages"
    );
  }

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

  // Update chat preview if needed
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
            "🗑️ رسالة محذوفة",

          "lastMessage.updatedAt":
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );
    }
  }
}

// =========================================================
// PERMANENT DELETE MESSAGE
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
    data.userId !== myUid
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

  const reactions = {
    ...(data.reactions ?? {}),
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

  const seenBy = {
    ...(data.seenBy ?? {}),
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

  let hasUpdates = false;

  snapshot.docs.forEach(
    (messageDoc) => {
      const data =
        messageDoc.data();

      if (
        data.userId === myUid
      ) {
        return;
      }

      const seenBy = {
        ...(data.seenBy ?? {}),
      };

      if (
        seenBy[myUid]
      ) {
        return;
      }

      seenBy[myUid] =
        true;

      batch.update(
        messageDoc.ref,
        {
          seenBy,
        }
      );

      hasUpdates =
        true;
    }
  );

  if (hasUpdates) {
    await batch.commit();
  }
}

// =========================================================
// CLEAR ONE CHAT
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

  if (!snapshot.empty) {
    const docs =
      snapshot.docs;

    for (
      let i = 0;
      i < docs.length;
      i += 450
    ) {
      const batch =
        writeBatch(db);

      const chunk =
        docs.slice(
          i,
          i + 450
        );

      chunk.forEach(
        (messageDoc) => {
          batch.delete(
            messageDoc.ref
          );
        }
      );

      await batch.commit();
    }
  }

  const chatRef =
    getChatDocument(
      myUid,
      friendUid
    );

  await setDoc(
    chatRef,
    {
      lastMessage:
        null,

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
      userId:
        friendUid,

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
        snapshot.docs.map(
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

  for (
    const friendUid of
    uniqueFriendUids
  ) {
    try {
      await clearChat(
        myUid,
        friendUid
      );
    } catch (error) {
      console.error(
        `Failed to clear chat with ${friendUid}:`,
        error
      );
    }
  }
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

  const messagesQuery =
    query(
      messagesRef,
      orderBy(
        "createdAt",
        "desc"
      ),
      limit(1)
    );

  const snapshot =
    await getDocs(
      messagesQuery
    );

  if (snapshot.empty) {
    return null;
  }

  return formatMessage(
    snapshot.docs[0]
  );
}
