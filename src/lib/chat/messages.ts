import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase";

// =========================================================
// TYPES
// =========================================================

export type MessageType =
  | "text"
  | "image"
  | "voice"
  | "mixed";

export type ReplyMessage = {
  id: string;
  text?: string;
  imageUrl?: string | null;
  voiceUrl?: string | null;
  userId?: string;
};

export type ChatMessage = {
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

  replyTo: ReplyMessage | null;

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
  return [uid1, uid2]
    .sort()
    .join("_");
}

// =========================================================
// MESSAGE COLLECTION
// =========================================================

function messagesRef(
  uid1: string,
  uid2: string
) {
  const chatId =
    getChatId(
      uid1,
      uid2
    );

  return collection(
    db,
    "chats",
    chatId,
    "messages"
  );
}

// =========================================================
// NORMALIZE MESSAGE
// =========================================================

function normalizeMessage(
  id: string,
  data: any
): ChatMessage {
  return {
    id,

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
      detectMessageType(data),

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

// =========================================================
// DETECT MESSAGE TYPE
// =========================================================

function detectMessageType(
  data: any
): MessageType {
  if (
    data.imageUrl &&
    data.voiceUrl
  ) {
    return "mixed";
  }

  if (data.imageUrl) {
    return "image";
  }

  if (data.voiceUrl) {
    return "voice";
  }

  return "text";
}

// =========================================================
// SEND TEXT MESSAGE
// =========================================================

export async function sendTextMessage(
  senderUid: string,
  receiverUid: string,
  text: string,
  replyTo:
    | ReplyMessage
    | null = null
): Promise<string> {
  const cleanText =
    text.trim();

  if (!senderUid) {
    throw new Error(
      "Missing sender UID"
    );
  }

  if (!receiverUid) {
    throw new Error(
      "Missing receiver UID"
    );
  }

  if (!cleanText) {
    throw new Error(
      "Message cannot be empty"
    );
  }

  const ref =
    await addDoc(
      messagesRef(
        senderUid,
        receiverUid
      ),
      {
        text: cleanText,

        imageUrl: null,

        voiceUrl: null,

        voiceDuration: null,

        userId:
          senderUid,

        type: "text",

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),

        edited: false,

        deleted: false,

        replyTo,

        reactions: {},

        seenBy: {
          [senderUid]:
            true,
        },
      }
    );

  return ref.id;
}

// =========================================================
// SEND IMAGE MESSAGE
// =========================================================

export async function sendImageMessage(
  senderUid: string,
  receiverUid: string,
  imageUrl: string,
  caption: string = "",
  replyTo:
    | ReplyMessage
    | null = null
): Promise<string> {
  if (!senderUid) {
    throw new Error(
      "Missing sender UID"
    );
  }

  if (!receiverUid) {
    throw new Error(
      "Missing receiver UID"
    );
  }

  if (!imageUrl) {
    throw new Error(
      "Missing image URL"
    );
  }

  const ref =
    await addDoc(
      messagesRef(
        senderUid,
        receiverUid
      ),
      {
        text:
          caption.trim(),

        imageUrl,

        voiceUrl: null,

        voiceDuration: null,

        userId:
          senderUid,

        type: "image",

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),

        edited: false,

        deleted: false,

        replyTo,

        reactions: {},

        seenBy: {
          [senderUid]:
            true,
        },
      }
    );

  return ref.id;
}

// =========================================================
// SEND VOICE MESSAGE
// =========================================================

export async function sendVoiceMessage(
  senderUid: string,
  receiverUid: string,
  voiceUrl: string,
  duration: number = 0,
  replyTo:
    | ReplyMessage
    | null = null
): Promise<string> {
  if (!senderUid) {
    throw new Error(
      "Missing sender UID"
    );
  }

  if (!receiverUid) {
    throw new Error(
      "Missing receiver UID"
    );
  }

  if (!voiceUrl) {
    throw new Error(
      "Missing voice URL"
    );
  }

  const ref =
    await addDoc(
      messagesRef(
        senderUid,
        receiverUid
      ),
      {
        text: "",

        imageUrl: null,

        voiceUrl,

        voiceDuration:
          duration,

        userId:
          senderUid,

        type: "voice",

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),

        edited: false,

        deleted: false,

        replyTo,

        reactions: {},

        seenBy: {
          [senderUid]:
            true,
        },
      }
    );

  return ref.id;
}

// =========================================================
// SEND MIXED MESSAGE
// =========================================================

export async function sendMixedMessage(
  senderUid: string,
  receiverUid: string,
  options: {
    text?: string;

    imageUrl?: string | null;

    voiceUrl?: string | null;

    voiceDuration?: number | null;

    replyTo?:
      | ReplyMessage
      | null;
  }
): Promise<string> {
  const text =
    options.text?.trim() ??
    "";

  const imageUrl =
    options.imageUrl ??
    null;

  const voiceUrl =
    options.voiceUrl ??
    null;

  const voiceDuration =
    options.voiceDuration ??
    null;

  if (
    !text &&
    !imageUrl &&
    !voiceUrl
  ) {
    throw new Error(
      "Message cannot be empty"
    );
  }

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

  const ref =
    await addDoc(
      messagesRef(
        senderUid,
        receiverUid
      ),
      {
        text,

        imageUrl,

        voiceUrl,

        voiceDuration,

        userId:
          senderUid,

        type,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),

        edited: false,

        deleted: false,

        replyTo:
          options.replyTo ??
          null,

        reactions: {},

        seenBy: {
          [senderUid]:
            true,
        },
      }
    );

  return ref.id;
}

// =========================================================
// REALTIME MESSAGES
// =========================================================

export function listenToMessages(
  myUid: string,
  friendUid: string,
  callback: (
    messages: ChatMessage[]
  ) => void
) {
  if (
    !myUid ||
    !friendUid
  ) {
    callback([]);

    return () => {};
  }

  const q =
    query(
      messagesRef(
        myUid,
        friendUid
      ),
      orderBy(
        "createdAt",
        "asc"
      )
    );

  return onSnapshot(
    q,
    (snapshot) => {
      const result =
        snapshot.docs.map(
          (messageDoc) =>
            normalizeMessage(
              messageDoc.id,
              messageDoc.data()
            )
        );

      callback(result);
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
// GET ALL MESSAGES
// =========================================================

export async function getMessages(
  myUid: string,
  friendUid: string
): Promise<ChatMessage[]> {
  if (
    !myUid ||
    !friendUid
  ) {
    return [];
  }

  const q =
    query(
      messagesRef(
        myUid,
        friendUid
      ),
      orderBy(
        "createdAt",
        "asc"
      )
    );

  const snapshot =
    await getDocs(q);

  return snapshot.docs.map(
    (messageDoc) =>
      normalizeMessage(
        messageDoc.id,
        messageDoc.data()
      )
  );
}

// =========================================================
// GET ONE MESSAGE
// =========================================================

export async function getMessage(
  myUid: string,
  friendUid: string,
  messageId: string
): Promise<ChatMessage | null> {
  if (
    !myUid ||
    !friendUid ||
    !messageId
  ) {
    return null;
  }

  const ref =
    doc(
      messagesRef(
        myUid,
        friendUid
      ),
      messageId
    );

  const snapshot =
    await getDoc(ref);

  if (
    !snapshot.exists()
  ) {
    return null;
  }

  return normalizeMessage(
    snapshot.id,
    snapshot.data()
  );
}

// =========================================================
// EDIT MESSAGE
// =========================================================

export async function editMessage(
  myUid: string,
  friendUid: string,
  messageId: string,
  text: string
) {
  const cleanText =
    text.trim();

  if (!cleanText) {
    throw new Error(
      "Message cannot be empty"
    );
  }

  const ref =
    doc(
      messagesRef(
        myUid,
        friendUid
      ),
      messageId
    );

  const snapshot =
    await getDoc(ref);

  if (
    !snapshot.exists()
  ) {
    throw new Error(
      "Message not found"
    );
  }

  const data =
    snapshot.data();

  if (
    data.userId !==
    myUid
  ) {
    throw new Error(
      "You can only edit your own messages"
    );
  }

  if (
    data.deleted
  ) {
    throw new Error(
      "Deleted messages cannot be edited"
    );
  }

  await updateDoc(
    ref,
    {
      text: cleanText,

      edited: true,

      updatedAt:
        serverTimestamp(),
    }
  );
}

// =========================================================
// DELETE MESSAGE
// =========================================================
// Soft delete.
// الرسالة تبقى موجودة لكن محتواها يختفي.
// =========================================================

export async function deleteMessage(
  myUid: string,
  friendUid: string,
  messageId: string
) {
  const ref =
    doc(
      messagesRef(
        myUid,
        friendUid
      ),
      messageId
    );

  const snapshot =
    await getDoc(ref);

  if (
    !snapshot.exists()
  ) {
    return;
  }

  const data =
    snapshot.data();

  if (
    data.userId !==
    myUid
  ) {
    throw new Error(
      "You can only delete your own messages"
    );
  }

  await updateDoc(
    ref,
    {
      text:
        "تم حذف هذه الرسالة",

      imageUrl: null,

      voiceUrl: null,

      voiceDuration: null,

      deleted: true,

      edited: false,

      updatedAt:
        serverTimestamp(),
    }
  );
}

// =========================================================
// PERMANENT DELETE MESSAGE
// =========================================================

export async function permanentlyDeleteMessage(
  myUid: string,
  friendUid: string,
  messageId: string
) {
  const ref =
    doc(
      messagesRef(
        myUid,
        friendUid
      ),
      messageId
    );

  const snapshot =
    await getDoc(ref);

  if (
    !snapshot.exists()
  ) {
    return;
  }

  const data =
    snapshot.data();

  if (
    data.userId !==
    myUid
  ) {
    throw new Error(
      "You can only delete your own messages"
    );
  }

  await deleteDoc(ref);
}

// =========================================================
// REPLY
// =========================================================

export async function replyToMessage(
  senderUid: string,
  receiverUid: string,
  text: string,
  repliedMessage: ReplyMessage
): Promise<string> {
  return sendTextMessage(
    senderUid,
    receiverUid,
    text,
    repliedMessage
  );
}

// =========================================================
// REACTION
// =========================================================

export async function toggleReaction(
  myUid: string,
  friendUid: string,
  messageId: string,
  emoji: string
) {
  if (!emoji) {
    return;
  }

  const ref =
    doc(
      messagesRef(
        myUid,
        friendUid
      ),
      messageId
    );

  const snapshot =
    await getDoc(ref);

  if (
    !snapshot.exists()
  ) {
    return;
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
    ref,
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

  const ref =
    doc(
      messagesRef(
        myUid,
        friendUid
      ),
      messageId
    );

  const snapshot =
    await getDoc(ref);

  if (
    !snapshot.exists()
  ) {
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
    ref,
    {
      seenBy,
    }
  );
}

// =========================================================
// MARK ALL AS READ
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

  const snapshot =
    await getDocs(
      messagesRef(
        myUid,
        friendUid
      )
    );

  if (
    snapshot.empty
  ) {
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

  const snapshot =
    await getDocs(
      messagesRef(
        myUid,
        friendUid
      )
    );

  if (
    snapshot.empty
  ) {
    return;
  }

  // Firestore batch limit = 500
  // لذلك نقسم الحذف.

  for (
    let i = 0;
    i <
    snapshot.docs.length;
    i += 500
  ) {
    const batch =
      writeBatch(db);

    const chunk =
      snapshot.docs.slice(
        i,
        i + 500
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

// =========================================================
// CONVERT FIRESTORE TIME
// =========================================================

export function formatMessageTime(
  timestamp:
    | Timestamp
    | null
    | undefined
): string {
  if (!timestamp) {
    return "";
  }

  const date =
    timestamp.toDate();

  return date.toLocaleTimeString(
    "ar-DE",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

// =========================================================
// EXPORT ALIAS
// =========================================================
// حتى نقدر نستخدم الاسم القديم الموجود
// في بعض ملفات المشروع.
// =========================================================

export const sendMessage =
  sendTextMessage;