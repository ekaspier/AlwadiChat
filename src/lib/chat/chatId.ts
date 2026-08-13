// =========================================================
// CHAT ID UTILITIES
// =========================================================

/**
 * إنشاء ID ثابت للمحادثة بين مستخدمين.
 *
 * نفس الشخصين سيحصلان دائمًا على نفس الـ ID
 * بغض النظر عن ترتيب الـ UID.
 *
 * مثال:
 * getChatId("AAA", "BBB")
 * getChatId("BBB", "AAA")
 *
 * النتيجة في الحالتين:
 * AAA_BBB
 */

// =========================================================
// GET CHAT ID
// =========================================================

export function getChatId(
  uid1: string,
  uid2: string
): string {
  if (!uid1 || !uid2) {
    throw new Error(
      "Both user IDs are required"
    );
  }

  if (uid1 === uid2) {
    throw new Error(
      "A chat cannot be created with the same user"
    );
  }

  return [uid1, uid2]
    .sort()
    .join("_");
}

// =========================================================
// SAFE GET CHAT ID
// =========================================================
// نسخة لا ترمي Error.
// مفيدة داخل components والـ listeners.
//

export function safeGetChatId(
  uid1?: string | null,
  uid2?: string | null
): string | null {
  if (!uid1 || !uid2) {
    return null;
  }

  if (uid1 === uid2) {
    return null;
  }

  return [uid1, uid2]
    .sort()
    .join("_");
}

// =========================================================
// CHECK CHAT ID
// =========================================================

export function isValidChatId(
  chatId?: string | null
): boolean {
  if (!chatId) {
    return false;
  }

  const parts =
    chatId.split("_");

  if (parts.length !== 2) {
    return false;
  }

  if (
    !parts[0] ||
    !parts[1]
  ) {
    return false;
  }

  if (
    parts[0] === parts[1]
  ) {
    return false;
  }

  return true;
}

// =========================================================
// GET USERS FROM CHAT ID
// =========================================================

export function getUsersFromChatId(
  chatId: string
): [string, string] | null {
  if (
    !isValidChatId(chatId)
  ) {
    return null;
  }

  const parts =
    chatId.split("_");

  return [
    parts[0],
    parts[1],
  ];
}

// =========================================================
// CHECK IF USER BELONGS TO CHAT
// =========================================================

export function isUserInChat(
  chatId: string,
  uid: string
): boolean {
  if (
    !isValidChatId(chatId) ||
    !uid
  ) {
    return false;
  }

  const users =
    getUsersFromChatId(
      chatId
    );

  if (!users) {
    return false;
  }

  return (
    users[0] === uid ||
    users[1] === uid
  );
}

// =========================================================
// GET OTHER USER
// =========================================================

export function getOtherUserFromChatId(
  chatId: string,
  myUid: string
): string | null {
  const users =
    getUsersFromChatId(
      chatId
    );

  if (!users || !myUid) {
    return null;
  }

  if (users[0] === myUid) {
    return users[1];
  }

  if (users[1] === myUid) {
    return users[0];
  }

  return null;
}

// =========================================================
// COMPARE CHAT IDS
// =========================================================

export function sameChat(
  chatId1?: string | null,
  chatId2?: string | null
): boolean {
  if (
    !chatId1 ||
    !chatId2
  ) {
    return false;
  }

  return (
    chatId1 === chatId2
  );
}

// =========================================================
// GET CHAT ID WITHOUT THROWING
// =========================================================

export function createChatId(
  uid1?: string | null,
  uid2?: string | null
): string | null {
  return safeGetChatId(
    uid1,
    uid2
  );
}

// =========================================================
// DEFAULT EXPORT
// =========================================================

export default getChatId;