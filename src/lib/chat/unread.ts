import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

// =========================================================
// TYPES
// =========================================================

export type UnreadInfo = {
  count: number;
  lastUnreadMessageId: string | null;
};

// =========================================================
// CHAT ID
// =========================================================

export function getUnreadChatId(
  uid1: string,
  uid2: string
): string {
  return [uid1, uid2]
    .sort()
    .join("_");
}

// =========================================================
// MESSAGES REFERENCE
// =========================================================

function getMessagesRef(
  myUid: string,
  friendUid: string
) {
  const chatId =
    getUnreadChatId(
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
// GET UNREAD COUNT
// =========================================================

export async function getUnreadCount(
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
    getMessagesRef(
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

      // الرسالة غير مقروءة
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
// GET FULL UNREAD INFO
// =========================================================

export async function getUnreadInfo(
  myUid: string,
  friendUid: string
): Promise<UnreadInfo> {
  if (
    !myUid ||
    !friendUid
  ) {
    return {
      count: 0,
      lastUnreadMessageId:
        null,
    };
  }

  const messagesRef =
    getMessagesRef(
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

  let lastUnreadMessageId:
    | string
    | null = null;

  let latestTime = 0;

  snapshot.docs.forEach(
    (messageDoc) => {
      const data =
        messageDoc.data();

      if (
        data.seenBy?.[myUid] ===
        true
      ) {
        return;
      }

      count++;

      const timestamp =
        data.createdAt;

      let time = 0;

      if (
        timestamp &&
        typeof timestamp.toMillis ===
          "function"
      ) {
        time =
          timestamp.toMillis();
      }

      if (
        time >= latestTime
      ) {
        latestTime = time;

        lastUnreadMessageId =
          messageDoc.id;
      }
    }
  );

  return {
    count,
    lastUnreadMessageId,
  };
}

// =========================================================
// LISTEN TO UNREAD COUNT
// =========================================================

export function listenToUnreadCount(
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
    getMessagesRef(
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
        "Unread listener failed:",
        error
      );

      callback(0);
    }
  );
}

// =========================================================
// LISTEN TO FULL UNREAD INFO
// =========================================================

export function listenToUnreadInfo(
  myUid: string,
  friendUid: string,
  callback: (
    info: UnreadInfo
  ) => void
) {
  if (
    !myUid ||
    !friendUid
  ) {
    callback({
      count: 0,
      lastUnreadMessageId:
        null,
    });

    return () => {};
  }

  const messagesRef =
    getMessagesRef(
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

      let lastUnreadMessageId:
        | string
        | null = null;

      let latestTime = 0;

      snapshot.docs.forEach(
        (messageDoc) => {
          const data =
            messageDoc.data();

          if (
            data.seenBy?.[myUid] ===
            true
          ) {
            return;
          }

          count++;

          const timestamp =
            data.createdAt;

          let time = 0;

          if (
            timestamp &&
            typeof timestamp.toMillis ===
              "function"
          ) {
            time =
              timestamp.toMillis();
          }

          if (
            time >= latestTime
          ) {
            latestTime = time;

            lastUnreadMessageId =
              messageDoc.id;
          }
        }
      );

      callback({
        count,
        lastUnreadMessageId,
      });
    },
    (error) => {
      console.error(
        "Unread info listener failed:",
        error
      );

      callback({
        count: 0,
        lastUnreadMessageId:
          null,
      });
    }
  );
}

// =========================================================
// HAS UNREAD MESSAGES
// =========================================================

export async function hasUnreadMessages(
  myUid: string,
  friendUid: string
): Promise<boolean> {
  const count =
    await getUnreadCount(
      myUid,
      friendUid
    );

  return count > 0;
}

// =========================================================
// LISTEN TO HAS UNREAD
// =========================================================

export function listenToHasUnreadMessages(
  myUid: string,
  friendUid: string,
  callback: (
    hasUnread: boolean
  ) => void
) {
  return listenToUnreadCount(
    myUid,
    friendUid,
    (count) => {
      callback(count > 0);
    }
  );
}

// =========================================================
// GET TOTAL UNREAD FROM MULTIPLE CHATS
// =========================================================

export async function getTotalUnreadCount(
  myUid: string,
  friendUids: string[]
): Promise<number> {
  if (
    !myUid ||
    !friendUids ||
    friendUids.length === 0
  ) {
    return 0;
  }

  const uniqueFriendUids =
    Array.from(
      new Set(
        friendUids.filter(
          Boolean
        )
      )
    );

  if (
    uniqueFriendUids.length ===
    0
  ) {
    return 0;
  }

  const results =
    await Promise.all(
      uniqueFriendUids.map(
        (friendUid) =>
          getUnreadCount(
            myUid,
            friendUid
          )
      )
    );

  return results.reduce(
    (
      total,
      count
    ) =>
      total + count,
    0
  );
}

// =========================================================
// LISTEN TO TOTAL UNREAD
// =========================================================
// يرجع مجموع كل الرسائل غير المقروءة
// من جميع المحادثات.
// =========================================================

export function listenToTotalUnreadCount(
  myUid: string,
  friendUids: string[],
  callback: (
    total: number
  ) => void
) {
  if (
    !myUid ||
    !friendUids ||
    friendUids.length ===
      0
  ) {
    callback(0);

    return () => {};
  }

  const uniqueFriendUids =
    Array.from(
      new Set(
        friendUids.filter(
          Boolean
        )
      )
    );

  const unsubscribers =
    uniqueFriendUids.map(
      (friendUid) =>
        listenToUnreadCount(
          myUid,
          friendUid,
          () => {
            // يتم الحساب الكامل
            // بالأسفل.
            recalculate();
          }
        )
    );

  let destroyed = false;

  async function recalculate() {
    if (destroyed) {
      return;
    }

    try {
      const total =
        await getTotalUnreadCount(
          myUid,
          uniqueFriendUids
        );

      if (!destroyed) {
        callback(total);
      }
    } catch (error) {
      console.error(
        "Total unread calculation failed:",
        error
      );

      if (!destroyed) {
        callback(0);
      }
    }
  }

  // أول حساب
  recalculate();

  return () => {
    destroyed = true;

    unsubscribers.forEach(
      (unsubscribe) => {
        try {
          unsubscribe();
        } catch {
          // ignore
        }
      }
    );
  };
}

// =========================================================
// RESET LOCAL UNREAD
// =========================================================
// لا نحذف أي شيء هنا.
// فقط نعيد الاستعلام بعد markAllMessagesAsRead.
// =========================================================

export async function refreshUnreadCount(
  myUid: string,
  friendUid: string,
  callback?: (
    count: number
  ) => void
) {
  const count =
    await getUnreadCount(
      myUid,
      friendUid
    );

  callback?.(count);

  return count;
}

// =========================================================
// ALIASES
// =========================================================
// أسماء بديلة حتى نقدر نستخدم الملف
// بسهولة مع باقي المشروع.
// =========================================================

export const getUnreadMessageCount =
  getUnreadCount;

export const listenToUnreadMessageCount =
  listenToUnreadCount;

export const getTotalUnreadMessages =
  getTotalUnreadCount;