import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

import { db } from "../firebase";

// =========================================================
// TYPES
// =========================================================

export type TypingState = {
  userId: string;
  typing: boolean;
  updatedAt: any;
};

// =========================================================
// CHAT ID
// نفس معرف المحادثة المستخدم في messages.ts
// =========================================================

export function getTypingChatId(
  uid1: string,
  uid2: string
): string {
  return [uid1, uid2]
    .sort()
    .join("_");
}

// =========================================================
// TYPING DOCUMENT
//
// chats/{chatId}/typing/{userId}
// =========================================================

function typingRef(
  myUid: string,
  friendUid: string,
  userId: string
) {
  const chatId =
    getTypingChatId(
      myUid,
      friendUid
    );

  return doc(
    db,
    "chats",
    chatId,
    "typing",
    userId
  );
}

// =========================================================
// SET TYPING
// يبدأ المستخدم بالكتابة
// =========================================================

export async function setTyping(
  myUid: string,
  friendUid: string,
  isTyping: boolean
): Promise<void> {
  if (
    !myUid ||
    !friendUid
  ) {
    return;
  }

  const ref =
    typingRef(
      myUid,
      friendUid,
      myUid
    );

  if (!isTyping) {
    await deleteDoc(ref);
    return;
  }

  await setDoc(
    ref,
    {
      userId: myUid,
      typing: true,
      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

// =========================================================
// START TYPING
// =========================================================

export async function startTyping(
  myUid: string,
  friendUid: string
): Promise<void> {
  await setTyping(
    myUid,
    friendUid,
    true
  );
}

// =========================================================
// STOP TYPING
// =========================================================

export async function stopTyping(
  myUid: string,
  friendUid: string
): Promise<void> {
  await setTyping(
    myUid,
    friendUid,
    false
  );
}

// =========================================================
// LISTEN TO FRIEND TYPING
//
// يرجع true إذا الصديق يكتب حالياً.
// =========================================================

export function listenToTyping(
  myUid: string,
  friendUid: string,
  callback: (
    isTyping: boolean
  ) => void
) {
  if (
    !myUid ||
    !friendUid
  ) {
    callback(false);

    return () => {};
  }

  const ref =
    typingRef(
      myUid,
      friendUid,
      friendUid
    );

  return onSnapshot(
    ref,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(false);
        return;
      }

      const data =
        snapshot.data();

      callback(
        data.typing === true
      );
    },
    (error) => {
      console.error(
        "Typing listener failed:",
        error
      );

      callback(false);
    }
  );
}

// =========================================================
// GET FRIEND TYPING STATE
// =========================================================

export async function getTypingState(
  myUid: string,
  friendUid: string
): Promise<boolean> {
  if (
    !myUid ||
    !friendUid
  ) {
    return false;
  }

  const ref =
    typingRef(
      myUid,
      friendUid,
      friendUid
    );

  const snapshot =
    await getDoc(ref);

  if (!snapshot.exists()) {
    return false;
  }

  return (
    snapshot.data()
      ?.typing === true
  );
}

// =========================================================
// CLEAR TYPING
// =========================================================
// مفيدة عند:
// - إغلاق المحادثة
// - تغيير الصديق
// - تسجيل الخروج
// - إلغاء الكتابة
// =========================================================

export async function clearTyping(
  myUid: string,
  friendUid: string
): Promise<void> {
  if (
    !myUid ||
    !friendUid
  ) {
    return;
  }

  const ref =
    typingRef(
      myUid,
      friendUid,
      myUid
    );

  try {
    await deleteDoc(ref);
  } catch (error) {
    console.error(
      "Failed to clear typing state:",
      error
    );
  }
}

// =========================================================
// AUTO TYPING CONTROLLER
// =========================================================
// هذا يساعد MessageInput:
// كلما كتب المستخدم نرسل typing=true.
// وبعد فترة بدون كتابة نرسل typing=false.
//
// debounceMs = 1500ms افتراضياً
// =========================================================

export function createTypingController(
  myUid: string,
  friendUid: string,
  debounceMs: number = 1500
) {
  let timeout:
    | ReturnType<typeof setTimeout>
    | null = null;

  let destroyed = false;

  async function typing() {
    if (destroyed) {
      return;
    }

    try {
      await startTyping(
        myUid,
        friendUid
      );
    } catch (error) {
      console.error(
        "Failed to set typing:",
        error
      );
    }

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout =
      setTimeout(
        async () => {
          if (destroyed) {
            return;
          }

          try {
            await stopTyping(
              myUid,
              friendUid
            );
          } catch (error) {
            console.error(
              "Failed to stop typing:",
              error
            );
          }
        },
        debounceMs
      );
  }

  async function stop() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }

    try {
      await stopTyping(
        myUid,
        friendUid
      );
    } catch (error) {
      console.error(
        "Failed to stop typing:",
        error
      );
    }
  }

  async function destroy() {
    destroyed = true;

    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }

    try {
      await clearTyping(
        myUid,
        friendUid
      );
    } catch (error) {
      console.error(
        "Failed to destroy typing controller:",
        error
      );
    }
  }

  return {
    typing,
    stop,
    destroy,
  };
}