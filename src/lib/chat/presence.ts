import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase";

// =========================================================
// TYPES
// =========================================================

export type UserPresence = {
  userId: string;
  online: boolean;
  lastSeen: Timestamp | null;
};

// =========================================================
// PRESENCE REF
//
// users/{uid}/presence/status
// =========================================================

function getPresenceRef(
  userId: string
) {
  return doc(
    db,
    "users",
    userId,
    "presence",
    "status"
  );
}

// =========================================================
// NORMALIZE PRESENCE
// =========================================================

function normalizePresence(
  userId: string,
  data: any
): UserPresence {
  return {
    userId:
      data?.userId ??
      userId,

    online:
      data?.online ??
      false,

    lastSeen:
      data?.lastSeen ??
      null,
  };
}

// =========================================================
// SET USER ONLINE
// =========================================================

export async function setUserOnline(
  userId: string
): Promise<void> {
  if (!userId) {
    return;
  }

  const ref =
    getPresenceRef(userId);

  await setDoc(
    ref,
    {
      userId,
      online: true,
      lastSeen:
        serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

// =========================================================
// SET USER OFFLINE
// =========================================================

export async function setUserOffline(
  userId: string
): Promise<void> {
  if (!userId) {
    return;
  }

  const ref =
    getPresenceRef(userId);

  await setDoc(
    ref,
    {
      userId,
      online: false,
      lastSeen:
        serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

// =========================================================
// GET USER PRESENCE
// =========================================================

export async function getUserPresence(
  userId: string
): Promise<UserPresence | null> {
  if (!userId) {
    return null;
  }

  const ref =
    getPresenceRef(userId);

  const snapshot =
    await getDoc(ref);

  if (!snapshot.exists()) {
    return {
      userId,
      online: false,
      lastSeen: null,
    };
  }

  return normalizePresence(
    userId,
    snapshot.data()
  );
}

// =========================================================
// LISTEN TO USER PRESENCE
// REALTIME
// =========================================================

export function listenToUserPresence(
  userId: string,
  callback: (
    presence: UserPresence
  ) => void
): () => void {
  if (!userId) {
    callback({
      userId: "",
      online: false,
      lastSeen: null,
    });

    return () => {};
  }

  const ref =
    getPresenceRef(userId);

  return onSnapshot(
    ref,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback({
          userId,
          online: false,
          lastSeen: null,
        });

        return;
      }

      callback(
        normalizePresence(
          userId,
          snapshot.data()
        )
      );
    },
    (error) => {
      console.error(
        "Presence listener failed:",
        error
      );

      callback({
        userId,
        online: false,
        lastSeen: null,
      });
    }
  );
}

// =========================================================
// ALIAS
//
// بعض مكونات المشروع تستخدم:
// listenToPresence
//
// لذلك نوفر الاسم بدون ما نضطر نعدل كل الملفات.
// =========================================================

export const listenToPresence =
  listenToUserPresence;

// =========================================================
// IS USER ONLINE
// =========================================================

export async function isUserOnline(
  userId: string
): Promise<boolean> {
  const presence =
    await getUserPresence(
      userId
    );

  return (
    presence?.online ??
    false
  );
}

// =========================================================
// UPDATE LAST SEEN
// =========================================================

export async function updateLastSeen(
  userId: string
): Promise<void> {
  if (!userId) {
    return;
  }

  const ref =
    getPresenceRef(userId);

  await setDoc(
    ref,
    {
      userId,
      lastSeen:
        serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

// =========================================================
// START PRESENCE HEARTBEAT
//
// يبقي المستخدم Online ويحدث lastSeen
// =========================================================

export function startPresenceHeartbeat(
  userId: string,
  intervalMs: number = 30000
): () => void {
  if (
    !userId ||
    typeof window ===
      "undefined"
  ) {
    return () => {};
  }

  let stopped = false;

  const update =
    async () => {
      if (stopped) {
        return;
      }

      try {
        const ref =
          getPresenceRef(
            userId
          );

        await setDoc(
          ref,
          {
            userId,
            online: true,
            lastSeen:
              serverTimestamp(),
          },
          {
            merge: true,
          }
        );
      } catch (error) {
        console.error(
          "Presence heartbeat failed:",
          error
        );
      }
    };

  void update();

  const interval =
    window.setInterval(
      () => {
        void update();
      },
      intervalMs
    );

  return () => {
    stopped = true;

    window.clearInterval(
      interval
    );
  };
}

// =========================================================
// FORMAT LAST SEEN
// =========================================================

export function formatLastSeen(
  timestamp:
    | Timestamp
    | null
    | undefined
): string {
  if (!timestamp) {
    return "غير متاح";
  }

  const date =
    timestamp.toDate();

  return date.toLocaleString(
    "ar-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

// =========================================================
// PRESENCE LABEL
// =========================================================

export function getPresenceLabel(
  presence: UserPresence
): string {
  if (presence.online) {
    return "متصل الآن";
  }

  if (presence.lastSeen) {
    return `آخر ظهور ${formatLastSeen(
      presence.lastSeen
    )}`;
  }

  return "غير متصل";
}

// =========================================================
// PRESENCE LABEL FROM VALUES
// مفيد للمكونات التي لا تملك object كامل
// =========================================================

export function getPresenceText(
  online: boolean,
  lastSeen:
    | Timestamp
    | null
    | undefined
): string {
  if (online) {
    return "متصل الآن";
  }

  if (lastSeen) {
    return `آخر ظهور ${formatLastSeen(
      lastSeen
    )}`;
  }

  return "غير متصل";
}