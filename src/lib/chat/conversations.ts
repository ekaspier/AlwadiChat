import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  limit,
  increment,
  writeBatch,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

// =========================================================
// TYPES
// =========================================================

export type ConversationMessageType =
  | "text"
  | "image"
  | "voice"
  | "mixed"
  | "system";

export type Conversation = {
  id: string;

  userId: string;

  friendId: string;

  lastMessage: string;

  lastMessageType: ConversationMessageType;

  lastMessageAt: Timestamp | null;

  unreadCount: number;

  isArchived: boolean;

  updatedAt: Timestamp | null;
};

// =========================================================
// CHAT / CONVERSATION ID
// =========================================================

export function getConversationId(
  uid1: string,
  uid2: string
): string {
  if (!uid1 || !uid2) {
    throw new Error("Missing user ID");
  }

  return [uid1, uid2]
    .sort()
    .join("_");
}

// =========================================================
// CONVERSATION REF
// =========================================================

function getConversationRef(
  myUid: string,
  friendUid: string
) {
  const conversationId =
    getConversationId(
      myUid,
      friendUid
    );

  return doc(
    db,
    "users",
    myUid,
    "conversations",
    conversationId
  );
}

// =========================================================
// CONVERSATIONS COLLECTION
// =========================================================

function getConversationsRef(
  myUid: string
) {
  return collection(
    db,
    "users",
    myUid,
    "conversations"
  );
}

// =========================================================
// NORMALIZE
// =========================================================

function normalizeConversation(
  id: string,
  data: any
): Conversation {
  return {
    id,

    userId:
      data.userId ?? "",

    friendId:
      data.friendId ?? "",

    lastMessage:
      data.lastMessage ?? "",

    lastMessageType:
      data.lastMessageType ??
      "text",

    lastMessageAt:
      data.lastMessageAt instanceof Timestamp
        ? data.lastMessageAt
        : null,

    unreadCount:
      typeof data.unreadCount === "number"
        ? Math.max(
            0,
            data.unreadCount
          )
        : 0,

    isArchived:
      data.isArchived ?? false,

    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt
        : null,
  };
}

// =========================================================
// CREATE CONVERSATION
// =========================================================

export async function createConversation(
  myUid: string,
  friendUid: string
): Promise<void> {
  if (!myUid || !friendUid) {
    throw new Error(
      "Missing user ID"
    );
  }

  const conversationRef =
    getConversationRef(
      myUid,
      friendUid
    );

  await setDoc(
    conversationRef,
    {
      id: conversationRef.id,

      userId: myUid,

      friendId: friendUid,

      lastMessage: "",

      lastMessageType: "text",

      lastMessageAt: null,

      unreadCount: 0,

      isArchived: false,

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

// =========================================================
// UPDATE CONVERSATION
// =========================================================

export async function updateConversation(
  myUid: string,
  friendUid: string,
  data: {
    lastMessage?: string;

    lastMessageType?:
      | ConversationMessageType;

    lastMessageAt?: any;

    unreadCount?: number;

    isArchived?: boolean;
  }
): Promise<void> {
  if (!myUid || !friendUid) {
    throw new Error(
      "Missing user ID"
    );
  }

  const conversationRef =
    getConversationRef(
      myUid,
      friendUid
    );

  await setDoc(
    conversationRef,
    {
      id: conversationRef.id,

      userId: myUid,

      friendId: friendUid,

      ...(data.lastMessage !==
      undefined
        ? {
            lastMessage:
              data.lastMessage,
          }
        : {}),

      ...(data.lastMessageType !==
      undefined
        ? {
            lastMessageType:
              data.lastMessageType,
          }
        : {}),

      ...(data.lastMessageAt !==
      undefined
        ? {
            lastMessageAt:
              data.lastMessageAt,
          }
        : {}),

      ...(data.unreadCount !==
      undefined
        ? {
            unreadCount:
              Math.max(
                0,
                data.unreadCount
              ),
          }
        : {}),

      ...(data.isArchived !==
      undefined
        ? {
            isArchived:
              data.isArchived,
          }
        : {}),

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

// =========================================================
// UPDATE LAST MESSAGE
// =========================================================

export async function updateLastMessage(
  myUid: string,
  friendUid: string,
  lastMessage: string,
  lastMessageType:
    ConversationMessageType = "text"
) {
  await updateConversation(
    myUid,
    friendUid,
    {
      lastMessage,
      lastMessageType,
      lastMessageAt:
        serverTimestamp(),
    }
  );
}

// =========================================================
// GET ONE CONVERSATION
// =========================================================

export async function getConversation(
  myUid: string,
  friendUid: string
): Promise<Conversation | null> {
  if (!myUid || !friendUid) {
    return null;
  }

  const conversationRef =
    getConversationRef(
      myUid,
      friendUid
    );

  const snapshot =
    await getDoc(
      conversationRef
    );

  if (!snapshot.exists()) {
    return null;
  }

  return normalizeConversation(
    snapshot.id,
    snapshot.data()
  );
}

// =========================================================
// GET ALL CONVERSATIONS
// =========================================================

export async function getConversations(
  myUid: string
): Promise<Conversation[]> {
  if (!myUid) {
    return [];
  }

  const q = query(
    getConversationsRef(myUid),
    orderBy(
      "lastMessageAt",
      "desc"
    )
  );

  const snapshot =
    await getDocs(q);

  return snapshot.docs.map(
    (conversationDoc) =>
      normalizeConversation(
        conversationDoc.id,
        conversationDoc.data()
      )
  );
}

// =========================================================
// REALTIME CONVERSATIONS
// =========================================================

export function listenToConversations(
  myUid: string,
  callback: (
    conversations: Conversation[]
  ) => void
) {
  if (!myUid) {
    callback([]);

    return () => {};
  }

  const q = query(
    getConversationsRef(myUid),
    orderBy(
      "lastMessageAt",
      "desc"
    )
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const conversations =
        snapshot.docs.map(
          (conversationDoc) =>
            normalizeConversation(
              conversationDoc.id,
              conversationDoc.data()
            )
        );

      callback(
        conversations
      );
    },
    (error) => {
      console.error(
        "Conversations listener failed:",
        error
      );

      callback([]);
    }
  );
}

// =========================================================
// RECENT CONVERSATIONS
// =========================================================

export async function getRecentConversations(
  myUid: string,
  maxResults: number = 20
): Promise<Conversation[]> {
  if (!myUid) {
    return [];
  }

  const safeLimit =
    Math.max(
      1,
      Math.min(
        100,
        maxResults
      )
    );

  const q = query(
    getConversationsRef(myUid),
    orderBy(
      "lastMessageAt",
      "desc"
    ),
    limit(safeLimit)
  );

  const snapshot =
    await getDocs(q);

  return snapshot.docs.map(
    (conversationDoc) =>
      normalizeConversation(
        conversationDoc.id,
        conversationDoc.data()
      )
  );
}

// =========================================================
// ARCHIVE
// =========================================================

export async function markConversationArchived(
  myUid: string,
  friendUid: string
) {
  await updateConversation(
    myUid,
    friendUid,
    {
      isArchived: true,
    }
  );
}

// =========================================================
// UNARCHIVE
// =========================================================

export async function markConversationUnarchived(
  myUid: string,
  friendUid: string
) {
  await updateConversation(
    myUid,
    friendUid,
    {
      isArchived: false,
    }
  );
}

// =========================================================
// SET UNREAD COUNT
// =========================================================

export async function setConversationUnreadCount(
  myUid: string,
  friendUid: string,
  count: number
) {
  if (!myUid || !friendUid) {
    return;
  }

  await updateConversation(
    myUid,
    friendUid,
    {
      unreadCount:
        Math.max(
          0,
          Math.floor(count)
        ),
    }
  );
}

// =========================================================
// INCREMENT UNREAD
// =========================================================

export async function incrementConversationUnread(
  myUid: string,
  friendUid: string
) {
  if (!myUid || !friendUid) {
    return;
  }

  const conversationRef =
    getConversationRef(
      myUid,
      friendUid
    );

  await setDoc(
    conversationRef,
    {
      id: conversationRef.id,

      userId: myUid,

      friendId: friendUid,

      lastMessage: "",

      lastMessageType: "text",

      unreadCount:
        increment(1),

      isArchived: false,

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

// =========================================================
// RESET UNREAD
// =========================================================

export async function resetConversationUnread(
  myUid: string,
  friendUid: string
) {
  await setConversationUnreadCount(
    myUid,
    friendUid,
    0
  );
}

// =========================================================
// ARCHIVED FILTER
// =========================================================

export function getActiveConversations(
  conversations: Conversation[]
): Conversation[] {
  return conversations.filter(
    (conversation) =>
      !conversation.isArchived
  );
}

// =========================================================
// ARCHIVED FILTER
// =========================================================

export function getArchivedConversations(
  conversations: Conversation[]
): Conversation[] {
  return conversations.filter(
    (conversation) =>
      conversation.isArchived
  );
}

// =========================================================
// DELETE ONE CONVERSATION DOCUMENT
// ملاحظة:
// هذا يحذف بيانات القائمة فقط.
// الرسائل نفسها تبقى في chats.
// =========================================================

export async function deleteConversation(
  myUid: string,
  friendUid: string
) {
  if (!myUid || !friendUid) {
    return;
  }

  const conversationRef =
    getConversationRef(
      myUid,
      friendUid
    );

  const batch =
    writeBatch(db);

  batch.delete(
    conversationRef
  );

  await batch.commit();
}

// =========================================================
// DELETE ALL CONVERSATION DOCUMENTS
// =========================================================

export async function deleteAllConversations(
  myUid: string
) {
  if (!myUid) {
    return;
  }

  const snapshot =
    await getDocs(
      getConversationsRef(myUid)
    );

  if (snapshot.empty) {
    return;
  }

  for (
    let i = 0;
    i < snapshot.docs.length;
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
      (conversationDoc) => {
        batch.delete(
          conversationDoc.ref
        );
      }
    );

    await batch.commit();
  }
}

// =========================================================
// TOTAL UNREAD
// =========================================================

export function getTotalUnreadCount(
  conversations: Conversation[]
): number {
  return conversations.reduce(
    (total, conversation) =>
      total +
      Math.max(
        0,
        conversation.unreadCount
      ),
    0
  );
}

// =========================================================
// HAS UNREAD
// =========================================================

export function hasUnreadMessages(
  conversation: Conversation
): boolean {
  return (
    conversation.unreadCount > 0
  );
}