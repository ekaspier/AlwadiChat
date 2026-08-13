import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase";

// =========================================================
// TYPES
// =========================================================

export type ReadReceipt = {
  messageId: string;
  userId: string;
  seen: boolean;
};

export type SeenBy = Record<
  string,
  boolean
>;

export type ReadReceiptsMap = Record<
  string,
  SeenBy
>;

// =========================================================
// CHAT ID
// =========================================================

export function getReadReceiptChatId(
  uid1: string,
  uid2: string
): string {
  return [uid1, uid2]
    .sort()
    .join("_");
}

// =========================================================
// MESSAGES COLLECTION
// =========================================================

function messagesCollectionRef(
  myUid: string,
  friendUid: string
) {
  const chatId =
    getReadReceiptChatId(
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

// =========================================================
// MESSAGE REF
// =========================================================

function messageRef(
  myUid: string,
  friendUid: string,
  messageId: string
) {
  return doc(
    messagesCollectionRef(
      myUid,
      friendUid
    ),
    messageId
  );
}

// =========================================================
// MARK ONE MESSAGE AS READ
// =========================================================

export async function markMessageAsRead(
  myUid: string,
  friendUid: string,
  messageId: string
): Promise<void> {
  if (
    !myUid ||
    !friendUid ||
    !messageId
  ) {
    return;
  }

  const ref =
    messageRef(
      myUid,
      friendUid,
      messageId
    );

  const snapshot =
    await getDoc(ref);

  if (!snapshot.exists()) {
    return;
  }

  const data =
    snapshot.data();

  // لا داعي للتعديل إذا كانت مقروءة أصلًا
  if (
    data.seenBy?.[myUid] ===
    true
  ) {
    return;
  }

  const seenBy: SeenBy = {
    ...(data.seenBy ?? {}),
    [myUid]: true,
  };

  await updateDoc(
    ref,
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
): Promise<void> {
  if (
    !myUid ||
    !friendUid
  ) {
    return;
  }

  const messagesRef =
    messagesCollectionRef(
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

  /*
   * Firestore batch limit = 500
   *
   * لذلك نقسم الرسائل إلى مجموعات
   * حتى لو كان عند المستخدم آلاف الرسائل.
   */

  const unreadDocs =
    snapshot.docs.filter(
      (messageDoc) => {
        const data =
          messageDoc.data();

        return (
          data.userId !== myUid &&
          data.seenBy?.[myUid] !==
            true
        );
      }
    );

  if (unreadDocs.length === 0) {
    return;
  }

  for (
    let i = 0;
    i < unreadDocs.length;
    i += 500
  ) {
    const batch =
      writeBatch(db);

    const chunk =
      unreadDocs.slice(
        i,
        i + 500
      );

    chunk.forEach(
      (messageDoc) => {
        const data =
          messageDoc.data();

        const seenBy: SeenBy = {
          ...(data.seenBy ?? {}),
          [myUid]: true,
        };

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
}

// =========================================================
// CHECK IF MESSAGE WAS READ BY USER
// =========================================================

export async function isMessageRead(
  myUid: string,
  friendUid: string,
  messageId: string,
  userId: string
): Promise<boolean> {
  if (
    !myUid ||
    !friendUid ||
    !messageId ||
    !userId
  ) {
    return false;
  }

  const ref =
    messageRef(
      myUid,
      friendUid,
      messageId
    );

  const snapshot =
    await getDoc(ref);

  if (!snapshot.exists()) {
    return false;
  }

  const data =
    snapshot.data();

  return (
    data.seenBy?.[userId] ===
    true
  );
}

// =========================================================
// GET MESSAGE SEEN BY
// =========================================================

export async function getMessageSeenBy(
  myUid: string,
  friendUid: string,
  messageId: string
): Promise<SeenBy> {
  if (
    !myUid ||
    !friendUid ||
    !messageId
  ) {
    return {};
  }

  const ref =
    messageRef(
      myUid,
      friendUid,
      messageId
    );

  const snapshot =
    await getDoc(ref);

  if (!snapshot.exists()) {
    return {};
  }

  return {
    ...(snapshot.data()
      ?.seenBy ?? {}),
  };
}

// =========================================================
// GET USERS WHO READ MESSAGE
// =========================================================

export async function getMessageReadUsers(
  myUid: string,
  friendUid: string,
  messageId: string
): Promise<string[]> {
  const seenBy =
    await getMessageSeenBy(
      myUid,
      friendUid,
      messageId
    );

  return Object.entries(
    seenBy
  )
    .filter(
      ([, seen]) =>
        seen === true
    )
    .map(
      ([userId]) =>
        userId
    );
}

// =========================================================
// LISTEN TO ONE MESSAGE READ STATUS
// =========================================================

export function listenToMessageRead(
  myUid: string,
  friendUid: string,
  messageId: string,
  callback: (
    seenBy: SeenBy
  ) => void
) {
  if (
    !myUid ||
    !friendUid ||
    !messageId
  ) {
    callback({});

    return () => {};
  }

  const ref =
    messageRef(
      myUid,
      friendUid,
      messageId
    );

  return onSnapshot(
    ref,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback({});
        return;
      }

      const data =
        snapshot.data();

      callback({
        ...(data.seenBy ?? {}),
      });
    },
    (error) => {
      console.error(
        "Read receipt listener failed:",
        error
      );

      callback({});
    }
  );
}

// =========================================================
// LISTEN TO ALL READ RECEIPTS
//
// يستمع فقط للرسائل التي أرسلها المستخدم الحالي.
// =========================================================

export function listenToReadReceipts(
  myUid: string,
  friendUid: string,
  callback: (
    receipts: ReadReceiptsMap
  ) => void
) {
  if (
    !myUid ||
    !friendUid
  ) {
    callback({});

    return () => {};
  }

  const messagesRef =
    messagesCollectionRef(
      myUid,
      friendUid
    );

  const q =
    query(
      messagesRef,
      where(
        "userId",
        "==",
        myUid
      )
    );

  return onSnapshot(
    q,
    (snapshot) => {
      const receipts:
        ReadReceiptsMap = {};

      snapshot.docs.forEach(
        (messageDoc) => {
          const data =
            messageDoc.data();

          receipts[
            messageDoc.id
          ] = {
            ...(data.seenBy ?? {}),
          };
        }
      );

      callback(
        receipts
      );
    },
    (error) => {
      console.error(
        "Read receipts listener failed:",
        error
      );

      callback({});
    }
  );
}

// =========================================================
// GET UNREAD MESSAGE COUNT
//
// الرسائل التي أرسلها الصديق
// ولم يقرأها المستخدم الحالي.
// =========================================================

export async function getUnreadMessageCount(
  myUid: string,
  friendUid: string
): Promise<number> {
  if (
    !myUid ||
    !friendUid
  ) {
    return 0;
  }

  const messagesRef =
    messagesCollectionRef(
      myUid,
      friendUid
    );

  const q =
    query(
      messagesRef,
      where(
        "userId",
        "==",
        friendUid
      )
    );

  const snapshot =
    await getDocs(q);

  let count = 0;

  snapshot.docs.forEach(
    (messageDoc) => {
      const data =
        messageDoc.data();

      if (
        data.seenBy?.[myUid] !==
        true
      ) {
        count++;
      }
    }
  );

  return count;
}

// =========================================================
// LISTEN TO UNREAD MESSAGE COUNT
// =========================================================

export function listenToUnreadMessageCount(
  myUid: string,
  friendUid: string,
  callback: (
    count: number
  ) => void
) {
  if (
    !myUid ||
    !friendUid
  ) {
    callback(0);

    return () => {};
  }

  const messagesRef =
    messagesCollectionRef(
      myUid,
      friendUid
    );

  const q =
    query(
      messagesRef,
      where(
        "userId",
        "==",
        friendUid
      )
    );

  return onSnapshot(
    q,
    (snapshot) => {
      let count = 0;

      snapshot.docs.forEach(
        (messageDoc) => {
          const data =
            messageDoc.data();

          if (
            data.seenBy?.[myUid] !==
            true
          ) {
            count++;
          }
        }
      );

      callback(count);
    },
    (error) => {
      console.error(
        "Unread count listener failed:",
        error
      );

      callback(0);
    }
  );
}

// =========================================================
// MARK CHAT AS READ
// =========================================================

export async function markChatAsRead(
  myUid: string,
  friendUid: string
): Promise<void> {
  await markAllMessagesAsRead(
    myUid,
    friendUid
  );
}

// =========================================================
// GET READ RECEIPT STATUS
//
// مفيدة للـ UI:
// true = الطرف الآخر قرأ الرسالة
// false = لم يقرأها بعد
// =========================================================

export function hasUserReadMessage(
  seenBy:
    | SeenBy
    | undefined
    | null,
  userId: string
): boolean {
  if (
    !seenBy ||
    !userId
  ) {
    return false;
  }

  return (
    seenBy[userId] ===
    true
  );
}

// =========================================================
// GET MESSAGE STATUS
//
// للرسائل التي أرسلها المستخدم:
//
// sending
// sent
// seen
//
// ملاحظة:
// هذا يعتمد على seenBy الموجود في الرسالة.
// =========================================================

export function getMessageReadStatus(
  message: {
    userId?: string;
    seenBy?: SeenBy;
  },
  myUid: string,
  friendUid: string
):
  | "sent"
  | "seen"
  | "unknown" {
  if (
    !message ||
    !myUid
  ) {
    return "unknown";
  }

  if (
    message.userId !==
    myUid
  ) {
    return "unknown";
  }

  if (
    message.seenBy?.[
      friendUid
    ] === true
  ) {
    return "seen";
  }

  return "sent";
}