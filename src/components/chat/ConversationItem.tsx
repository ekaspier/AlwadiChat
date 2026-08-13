"use client";

import React, {
  useMemo,
} from "react";

import type {
  Conversation,
} from "@/lib/chat/conversations";

import type {
  UserPresence,
} from "@/lib/chat/presence";

// =========================================================
// TYPES
// =========================================================

export type ConversationUser = {
  uid: string;

  displayName?: string | null;

  username?: string | null;

  photoURL?: string | null;

  avatarUrl?: string | null;

  email?: string | null;
};

type ConversationItemProps = {
  conversation: Conversation;

  user: ConversationUser;

  selected?: boolean;

  presence?: UserPresence | null;

  onClick?: () => void;

  onArchive?: () => void;

  onUnarchive?: () => void;

  showArchived?: boolean;

  className?: string;
};

// =========================================================
// HELPERS
// =========================================================

function getUserName(
  user: ConversationUser
): string {
  return (
    user.displayName ||
    user.username ||
    user.email ||
    "مستخدم"
  );
}

function getInitials(
  name: string
): string {
  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length === 0) {
    return "؟";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function formatConversationTime(
  value: any
): string {
  if (!value) {
    return "";
  }

  try {
    const date =
      typeof value?.toDate ===
      "function"
        ? value.toDate()
        : value instanceof Date
          ? value
          : new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    const now =
      new Date();

    const sameDay =
      date.toDateString() ===
      now.toDateString();

    if (sameDay) {
      return date.toLocaleTimeString(
        "ar-DE",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    }

    const yesterday =
      new Date(now);

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    if (
      date.toDateString() ===
      yesterday.toDateString()
    ) {
      return "أمس";
    }

    const diff =
      now.getTime() -
      date.getTime();

    const days =
      Math.floor(
        diff /
          (1000 *
            60 *
            60 *
            24)
      );

    if (
      days < 7 &&
      days >= 0
    ) {
      return date.toLocaleDateString(
        "ar-DE",
        {
          weekday: "long",
        }
      );
    }

    return date.toLocaleDateString(
      "ar-DE",
      {
        day: "2-digit",
        month: "2-digit",
      }
    );
  } catch {
    return "";
  }
}

function getLastMessagePreview(
  conversation: Conversation
): string {
  const message =
    conversation.lastMessage?.trim() ??
    "";

  if (message) {
    return message;
  }

  switch (
    conversation.lastMessageType
  ) {
    case "image":
      return "📷 صورة";

    case "voice":
      return "🎤 رسالة صوتية";

    case "system":
      return "رسالة نظام";

    default:
      return "ابدأ المحادثة";
  }
}

// =========================================================
// COMPONENT
// =========================================================

export default function ConversationItem({
  conversation,
  user,
  selected = false,
  presence = null,
  onClick,
  onArchive,
  onUnarchive,
  showArchived = false,
  className = "",
}: ConversationItemProps) {
  const name =
    useMemo(
      () => getUserName(user),
      [user]
    );

  const initials =
    useMemo(
      () => getInitials(name),
      [name]
    );

  const preview =
    useMemo(
      () =>
        getLastMessagePreview(
          conversation
        ),
      [conversation]
    );

  const time =
    useMemo(
      () =>
        formatConversationTime(
          conversation.lastMessageAt
        ),
      [
        conversation.lastMessageAt,
      ]
    );

  const unread =
    Math.max(
      0,
      conversation.unreadCount ??
        0
    );

  const archived =
    conversation.isArchived ??
    false;

  const photo =
    user.photoURL ||
    user.avatarUrl ||
    null;

  // =======================================================
  // ARCHIVE ACTION
  // =======================================================

  const handleArchive =
    (
      event: React.MouseEvent
    ) => {
      event.stopPropagation();

      if (archived) {
        onUnarchive?.();
      } else {
        onArchive?.();
      }
    };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div
      className={[
        "group relative",
        className,
      ].join(" ")}
      dir="rtl"
    >
      <button
        type="button"
        onClick={onClick}
        className={[
          "relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-right transition-all duration-200",
          selected
            ? "bg-white/[0.12] shadow-lg"
            : "hover:bg-white/[0.06]",
          archived
            ? "opacity-80"
            : "",
        ].join(" ")}
      >
        {/* =================================================
            AVATAR
        ================================================= */}

        <div
          className="
            relative
            h-12
            w-12
            shrink-0
          "
        >
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="
                h-12
                w-12
                rounded-full
                object-cover
                ring-1
                ring-white/10
              "
            />
          ) : (
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-indigo-500
                to-purple-600
                text-sm
                font-semibold
                text-white
                ring-1
                ring-white/10
              "
            >
              {initials}
            </div>
          )}

          {/* ONLINE DOT */}

          {presence?.online && (
            <span
              className="
                absolute
                bottom-0
                left-0
                h-3.5
                w-3.5
                rounded-full
                border-2
                border-[#111114]
                bg-emerald-500
                shadow-[0_0_8px_rgba(16,185,129,0.7)]
              "
              title="متصل الآن"
            />
          )}
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            min-w-0
            flex-1
          "
        >
          {/* NAME + TIME */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-2
            "
          >
            <div
              className={[
                "min-w-0 truncate text-sm font-semibold",
                unread > 0
                  ? "text-white"
                  : "text-white/90",
              ].join(" ")}
            >
              {name}
            </div>

            {time && (
              <span
                className={[
                  "shrink-0 text-[11px]",
                  unread > 0
                    ? "font-medium text-indigo-400"
                    : "text-white/35",
                ].join(" ")}
              >
                {time}
              </span>
            )}
          </div>

          {/* MESSAGE + BADGE */}

          <div
            className="
              mt-1
              flex
              items-center
              gap-2
            "
          >
            <div
              className={[
                "min-w-0 flex-1 truncate text-xs",
                unread > 0
                  ? "font-medium text-white/75"
                  : "text-white/40",
              ].join(" ")}
            >
              {preview}
            </div>

            {/* UNREAD */}

            {unread > 0 && (
              <span
                className="
                  flex
                  min-h-5
                  min-w-5
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-indigo-500
                  px-1.5
                  text-[10px]
                  font-bold
                  text-white
                  shadow-[0_0_10px_rgba(99,102,241,0.35)]
                "
              >
                {unread > 99
                  ? "99+"
                  : unread}
              </span>
            )}
          </div>
        </div>

        {/* ARCHIVED ICON */}

        {archived && (
          <div
            className="
              shrink-0
              text-white/30
            "
            title="مؤرشفة"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M3 6h18" />
              <path d="M5 6l1 14h12l1-14" />
              <path d="M9 10h6" />
              <path d="M4 6l1-3h14l1 3" />
            </svg>
          </div>
        )}
      </button>

      {/* ===================================================
          HOVER ACTION
      =================================================== */}

      {(onArchive ||
        onUnarchive) && (
        <button
          type="button"
          onClick={
            handleArchive
          }
          className="
            absolute
            left-2
            top-1/2
            hidden
            h-8
            w-8
            -translate-y-1/2
            items-center
            justify-center
            rounded-xl
            bg-black/40
            text-white/50
            backdrop-blur-md
            transition
            hover:bg-white/10
            hover:text-white
            group-hover:flex
          "
          title={
            archived
              ? "إلغاء الأرشفة"
              : "أرشفة المحادثة"
          }
          aria-label={
            archived
              ? "إلغاء الأرشفة"
              : "أرشفة المحادثة"
          }
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            {archived ? (
              <>
                <path d="M3 7h18" />
                <path d="M5 7l1 13h12l1-13" />
                <path d="M9 11h6" />
                <path d="M5 4h14l1 3H4z" />
              </>
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M5 6l1 14h12l1-14" />
                <path d="M9 10h6" />
                <path d="M4 6l1-3h14l1 3" />
              </>
            )}
          </svg>
        </button>
      )}
    </div>
  );
}