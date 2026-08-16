import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  addDoc,
  writeBatch,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

// =========================================================
// TYPES
// =========================================================

export type NotificationType =
  | "message"
  | "friend_request"
  | "friend_accept"
  | "system";

export type Notification = {
  id: string;

  userId: string;

  senderId: string | null;

  type: NotificationType;

  title: string;

  message: string;

  chatId: string | null;

  friendRequestId: string | null;

  read: boolean;

  createdAt: Timestamp | null;

  data?: Record<string, unknown>;
};

// =========================================================
// NOTIFICATIONS COLLECTION
//
// users/{userId}/notifications
// =========================================================

function getNotificationsRef(userId: string) {
  return collection(
    db,
    "users",
    userId,
    "notifications"
  );
}

// =========================================================
// NORMALIZE NOTIFICATION
// =========================================================

function normalizeNotification(
  id: string,
  data: any
): Notification {
  return {
    id,

    userId:
      data.userId ?? "",

    senderId:
      data.senderId ??
      null,

    type:
      data.type ??
      "system",

    title:
      data.title ??
      "",

    message:
      data.message ??
      "",

    chatId:
      data.chatId ??
      null,

    friendRequestId:
      data.friendRequestId ??
      null,

    read:
      data.read ??
      false,

    createdAt:
      data.createdAt ??
      null,

    data:
      data.data ??
      undefined,
  };
}

// =========================================================
// CREATE NOTIFICATION
// =========================================================

export async function createNotification(
  userId: string,
  options: {
    senderId?: string | null;

    type: NotificationType;

    title: string;

    message: string;

    chatId?: string | null;

    friendRequestId?: string | null;

    data?: Record<string, unknown>;
  }
): Promise<string> {
  if (!userId) {
    throw new Error(
      "Missing notification user ID"
    );
  }

  if (!options.title.trim()) {
    throw new Error(
      "Notification title cannot be empty"
    );
  }

  if (!options.message.trim()) {
    throw new Error(
      "Notification message cannot be empty"
    );
  }

  const notificationRef =
    await addDoc(
      getNotificationsRef(userId),
      {
        userId,

        senderId:
          options.senderId ??
          null,

        type:
          options.type,

        title:
          options.title.trim(),

        message:
          options.message.trim(),

        chatId:
          options.chatId ??
          null,

        friendRequestId:
          options.friendRequestId ??
          null,

        read: false,

        createdAt:
          serverTimestamp(),

        data:
          options.data ??
          null,
      }
    );

  return notificationRef.id;
}

// =========================================================
// GET ONE NOTIFICATION
// =========================================================

export async function getNotification(
  userId: string,
  notificationId: string
): Promise<Notification | null> {
  if (
    !userId ||
    !notificationId
  ) {
    return null;
  }

  const notificationRef =
    doc(
      db,
      "users",
      userId,
      "notifications",
      notificationId
    );

  const { getDoc } =
    await import(
      "firebase/firestore"
    );

  const snapshot =
    await getDoc(
      notificationRef
    );

  if (!snapshot.exists()) {
    return null;
  }

  return normalizeNotification(
    snapshot.id,
    snapshot.data()
  );
}

// =========================================================
// GET NOTIFICATIONS
// =========================================================

export async function getNotifications(
  userId: string,
  maxResults: number = 50
): Promise<Notification[]> {
  if (!userId) {
    return [];
  }

  const notificationsRef =
    getNotificationsRef(userId);

  const q =
    query(
      notificationsRef,
      orderBy(
        "createdAt",
        "desc"
      ),
      limit(
        Math.max(
          1,
          maxResults
        )
      )
    );

  const snapshot =
    await getDocs(q);

  return snapshot.docs.map(
    (notificationDoc) =>
      normalizeNotification(
        notificationDoc.id,
        notificationDoc.data()
      )
  );
}

// =========================================================
// LISTEN TO NOTIFICATIONS
// =========================================================

export function listenToNotifications(
  userId: string,
  callback: (
    notifications: Notification[]
  ) => void
) {
  if (!userId) {
    callback([]);

    return () => {};
  }

  const notificationsRef =
    getNotificationsRef(userId);

  const q =
    query(
      notificationsRef,
      orderBy(
        "createdAt",
        "desc"
      ),
      limit(50)
    );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications =
        snapshot.docs.map(
          (notificationDoc) =>
            normalizeNotification(
              notificationDoc.id,
              notificationDoc.data()
            )
        );

      callback(
        notifications
      );
    },
    (error) => {
      console.error(
        "Notifications listener failed:",
        error
      );

      callback([]);
    }
  );
}

// =========================================================
// MARK AS READ
// =========================================================

export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  if (
    !userId ||
    !notificationId
  ) {
    return;
  }

  const notificationRef =
    doc(
      db,
      "users",
      userId,
      "notifications",
      notificationId
    );

  await updateDoc(
    notificationRef,
    {
      read: true,
    }
  );
}

// =========================================================
// MARK AS UNREAD
// =========================================================

export async function markNotificationAsUnread(
  userId: string,
  notificationId: string
): Promise<void> {
  if (
    !userId ||
    !notificationId
  ) {
    return;
  }

  const notificationRef =
    doc(
      db,
      "users",
      userId,
      "notifications",
      notificationId
    );

  await updateDoc(
    notificationRef,
    {
      read: false,
    }
  );
}

// =========================================================
// MARK ALL AS READ
// =========================================================

export async function markAllNotificationsAsRead(
  userId: string
): Promise<void> {
  if (!userId) {
    return;
  }

  const notificationsRef =
    getNotificationsRef(userId);

  const q =
    query(
      notificationsRef,
      where(
        "read",
        "==",
        false
      )
    );

  const snapshot =
    await getDocs(q);

  if (snapshot.empty) {
    return;
  }

  // Firestore batch limit = 500
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
      (notificationDoc) => {
        batch.update(
          notificationDoc.ref,
          {
            read: true,
          }
        );
      }
    );

    await batch.commit();
  }
}

// =========================================================
// GET UNREAD COUNT
// =========================================================

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  if (!userId) {
    return 0;
  }

  const notificationsRef =
    getNotificationsRef(userId);

  const q =
    query(
      notificationsRef,
      where(
        "read",
        "==",
        false
      )
    );

  const snapshot =
    await getDocs(q);

  return snapshot.size;
}

// =========================================================
// LISTEN TO UNREAD COUNT
// =========================================================

export function listenToUnreadNotificationCount(
  userId: string,
  callback: (
    count: number
  ) => void
) {
  if (!userId) {
    callback(0);

    return () => {};
  }

  const notificationsRef =
    getNotificationsRef(userId);

  const q =
    query(
      notificationsRef,
      where(
        "read",
        "==",
        false
      )
    );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.size
      );
    },
    (error) => {
      console.error(
        "Unread notification listener failed:",
        error
      );

      callback(0);
    }
  );
}

// =========================================================
// DELETE ONE NOTIFICATION
// =========================================================

export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<void> {
  if (
    !userId ||
    !notificationId
  ) {
    return;
  }

  const notificationRef =
    doc(
      db,
      "users",
      userId,
      "notifications",
      notificationId
    );

  await deleteDoc(
    notificationRef
  );
}

// =========================================================
// DELETE ALL NOTIFICATIONS
// =========================================================

export async function deleteAllNotifications(
  userId: string
): Promise<void> {
  if (!userId) {
    return;
  }

  const snapshot =
    await getDocs(
      getNotificationsRef(
        userId
      )
    );

  if (snapshot.empty) {
    return;
  }

  // Firestore batch limit = 500
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
      (notificationDoc) => {
        batch.delete(
          notificationDoc.ref
        );
      }
    );

    await batch.commit();
  }
}

// =========================================================
// DELETE READ NOTIFICATIONS
// =========================================================

export async function deleteReadNotifications(
  userId: string
): Promise<void> {
  if (!userId) {
    return;
  }

  const notificationsRef =
    getNotificationsRef(userId);

  const q =
    query(
      notificationsRef,
      where(
        "read",
        "==",
        true
      )
    );

  const snapshot =
    await getDocs(q);

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
      (notificationDoc) => {
        batch.delete(
          notificationDoc.ref
        );
      }
    );

    await batch.commit();
  }
}

// =========================================================
// MESSAGE NOTIFICATION
// =========================================================

export async function createMessageNotification(
  receiverUid: string,
  senderUid: string,
  message: string,
  chatId: string
): Promise<string> {
  return createNotification(
    receiverUid,
    {
      senderId:
        senderUid,

      type:
        "message",

      title:
        "رسالة جديدة",

      message:
        message ||
        "لديك رسالة جديدة",

      chatId,
    }
  );
}

// =========================================================
// FRIEND REQUEST NOTIFICATION
// =========================================================

export async function createFriendRequestNotification(
  receiverUid: string,
  senderUid: string,
  requestId: string
): Promise<string> {
  return createNotification(
    receiverUid,
    {
      senderId:
        senderUid,

      type:
        "friend_request",

      title:
        "طلب صداقة جديد",

      message:
        "أرسل لك شخص طلب صداقة",

      friendRequestId:
        requestId,
    }
  );
}

// =========================================================
// FRIEND ACCEPT NOTIFICATION
// =========================================================

export async function createFriendAcceptNotification(
  receiverUid: string,
  senderUid: string
): Promise<string> {
  return createNotification(
    receiverUid,
    {
      senderId:
        senderUid,

      type:
        "friend_accept",

      title:
        "تم قبول طلب الصداقة",

      message:
        "تمت إضافة صديق جديد إلى قائمة أصدقائك",
    }
  );
}

// =========================================================
// SYSTEM NOTIFICATION
// =========================================================

export async function createSystemNotification(
  userId: string,
  title: string,
  message: string,
  data?: Record<string, unknown>
): Promise<string> {
  return createNotification(
    userId,
    {
      type:
        "system",

      title,

      message,

      data,
    }
  );
}

// =========================================================
// FORMAT NOTIFICATION TIME
// =========================================================

export function formatNotificationTime(
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
// FORMAT NOTIFICATION DATE
// =========================================================

export function formatNotificationDate(
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

  return date.toLocaleDateString(
    "ar-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}