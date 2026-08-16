
import type {
  NotificationType,
  NotificationToastData,
} from "@/components/notifications/NotificationToast";

// =========================================================
// TYPES
// =========================================================

export type NotificationPayload = {
  id?: string;

  type?:
    | NotificationType
    | string;

  title?: string;

  message?: string;

  duration?: number;

  userId?: string;

  senderId?: string;

  friendUid?: string;

  conversationId?: string;

  messageId?: string;

  createdAt?: unknown;

  read?: boolean;

  data?: Record<
    string,
    unknown
  >;
};

// =========================================================
// NORMALIZE TYPE
// =========================================================

export function normalizeNotificationType(
  type?: string
): NotificationType {
  switch (type) {
    case "message":
      return "message";

    case "friend":
    case "friendRequest":
    case "friend_request":
      return "friend";

    case "success":
      return "success";

    case "error":
      return "error";

    case "info":
      return "info";

    default:
      return "info";
  }
}

// =========================================================
// CREATE NOTIFICATION
// =========================================================

export function createNotification(
  payload: NotificationPayload
): NotificationToastData {
  return {
    id:
      payload.id,

    type:
      normalizeNotificationType(
        payload.type
      ),

    title:
      payload.title ??
      "إشعار جديد",

    message:
      payload.message ??
      "",

    duration:
      payload.duration ??
      4000,
  };
}

// =========================================================
// MESSAGE NOTIFICATION
// =========================================================

export function createMessageNotification(
  senderName?: string,
  message?: string
): NotificationToastData {
  return {
    type: "message",

    title:
      senderName
        ? `رسالة من ${senderName}`
        : "رسالة جديدة",

    message:
      message ??
      "وصلتك رسالة جديدة",

    duration: 5000,
  };
}

// =========================================================
// FRIEND REQUEST NOTIFICATION
// =========================================================

export function createFriendRequestNotification(
  senderName?: string
): NotificationToastData {
  return {
    type: "friend",

    title:
      "طلب صداقة جديد",

    message:
      senderName
        ? `${senderName} أرسل لك طلب صداقة`
        : "لديك طلب صداقة جديد",

    duration: 5000,
  };
}

// =========================================================
// SUCCESS
// =========================================================

export function createSuccessNotification(
  title: string,
  message?: string
): NotificationToastData {
  return {
    type: "success",

    title,

    message:
      message ?? "",

    duration: 3000,
  };
}

// =========================================================
// ERROR
// =========================================================

export function createErrorNotification(
  title: string,
  message?: string
): NotificationToastData {
  return {
    type: "error",

    title,

    message:
      message ?? "",

    duration: 5000,
  };
}

// =========================================================
// INFO
// =========================================================

export function createInfoNotification(
  title: string,
  message?: string
): NotificationToastData {
  return {
    type: "info",

    title,

    message:
      message ?? "",

    duration: 4000,
  };
}

// =========================================================
// MESSAGE PREVIEW
// =========================================================

export function getMessagePreview(
  data: {
    text?: string | null;

    imageUrl?: string | null;

    voiceUrl?: string | null;
  }
): string {
  const text =
    data.text?.trim() ??
    "";

  if (text) {
    return text;
  }

  if (
    data.imageUrl &&
    data.voiceUrl
  ) {
    return "📷 🎤 صورة ورسالة صوتية";
  }

  if (data.imageUrl) {
    return "📷 صورة";
  }

  if (data.voiceUrl) {
    return "🎤 رسالة صوتية";
  }

  return "رسالة جديدة";
}

// =========================================================
// BUILD MESSAGE NOTIFICATION
// =========================================================

export function buildMessageNotification(
  senderName: string,
  messageData: {
    text?: string | null;

    imageUrl?: string | null;

    voiceUrl?: string | null;
  }
): NotificationToastData {
  return createMessageNotification(
    senderName,
    getMessagePreview(
      messageData
    )
  );
}

// =========================================================
// BUILD FRIEND REQUEST
// =========================================================

export function buildFriendRequestNotification(
  senderName: string
): NotificationToastData {
  return createFriendRequestNotification(
    senderName
  );
}

// =========================================================
// CHECK VALID NOTIFICATION
// =========================================================

export function isValidNotification(
  notification:
    | NotificationToastData
    | null
    | undefined
): notification is NotificationToastData {
  if (!notification) {
    return false;
  }

  if (
    !notification.title ||
    typeof notification.title !==
      "string"
  ) {
    return false;
  }

  return true;
}

// =========================================================
// CLEAN NOTIFICATION TEXT
// =========================================================

export function cleanNotificationText(
  value:
    | string
    | null
    | undefined
): string {
  if (!value) {
    return "";
  }

  return value
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

// =========================================================
// NOTIFICATION DURATION
// =========================================================

export function getNotificationDuration(
  type?: NotificationType
): number {
  switch (type) {
    case "error":
      return 5000;

    case "message":
      return 5000;

    case "friend":
      return 5000;

    case "success":
      return 3000;

    default:
      return 4000;
  }
}
