"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import MessageInput from "@/components/chat/MessageInput";
import VoiceMessage from "@/components/chat/VoiceMessage";

import {
  listenToUserPresence,
  type UserPresence,
  formatLastSeen,
} from "@/lib/chat/presence";

// =========================================================
// TYPES
// =========================================================

type ReplyToMessage = {
  id: string;
  text?: string;
  imageUrl?: string | null;
  voiceUrl?: string | null;
  userId?: string;
};

type ChatMessage = {
  id: string;

  text: string;

  imageUrl: string | null;

  voiceUrl: string | null;

  voiceDuration: number | null;

  sender: "me" | "other";

  type: "text" | "image" | "voice" | "mixed";

  userId: string;

  createdAt: any;

  updatedAt: any;

  edited: boolean;

  deleted: boolean;

  replyTo: ReplyToMessage | null;

  reactions: Record<string, string>;

  seenBy: Record<string, boolean>;

  time: string;
};

type User = {
  id?: string;
  uid?: string;
  name?: string;
  username?: string;
  avatarUrl?: string | null;
  photoURL?: string | null;
  status?: string;
  online?: boolean;
};

type ChatWindowProps = {
  currentUserUid: string;

  user: User;

  messages: ChatMessage[];

  back: () => void;

  onClearChat: () => Promise<void>;

  onArchiveChat: () => void | Promise<void>;

  onUnarchiveChat: () => void | Promise<void>;

  isArchived: boolean;
};

// =========================================================
// HELPERS
// =========================================================

function getFriendUid(
  user: User
): string {
  return (
    user.id ||
    user.uid ||
    ""
  );
}

function getMessageDate(
  timestamp: any
): Date | null {
  if (!timestamp) {
    return null;
  }

  try {
    if (
      typeof timestamp.toDate ===
      "function"
    ) {
      return timestamp.toDate();
    }

    if (
      timestamp instanceof Date
    ) {
      return timestamp;
    }

    if (
      typeof timestamp === "number"
    ) {
      return new Date(timestamp);
    }

    if (
      typeof timestamp === "string"
    ) {
      const date =
        new Date(timestamp);

      return Number.isNaN(
        date.getTime()
      )
        ? null
        : date;
    }

    return null;
  } catch {
    return null;
  }
}

function formatTime(
  timestamp: any
): string {
  const date =
    getMessageDate(timestamp);

  if (!date) {
    return "";
  }

  return date.toLocaleTimeString(
    "ar-DE",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

// =========================================================
// CHAT WINDOW
// =========================================================

export default function ChatWindow({
  currentUserUid,
  user,
  messages,
  back,
  onClearChat,
  onArchiveChat,
  onUnarchiveChat,
  isArchived,
}: ChatWindowProps) {
  const friendUid =
    getFriendUid(user);

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    showDeleteConfirm,
    setShowDeleteConfirm,
  ] = useState(false);

  const [
    deletingChat,
    setDeletingChat,
  ] = useState(false);

  const [
    presence,
    setPresence,
  ] = useState<UserPresence>({
    userId: friendUid,
    online: false,
    lastSeen: null,
  });

  const messagesContainerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  // =======================================================
  // PRESENCE
  // =======================================================

  useEffect(() => {
    if (!friendUid) {
      setPresence({
        userId: "",
        online: false,
        lastSeen: null,
      });

      return;
    }

    const unsubscribe =
      listenToUserPresence(
        friendUid,
        (nextPresence) => {
          setPresence(
            nextPresence
          );
        }
      );

    return unsubscribe;
  }, [friendUid]);

  // =======================================================
  // AUTO SCROLL
  // =======================================================

  useEffect(() => {
    const container =
      messagesContainerRef.current;

    if (!container) {
      return;
    }

    requestAnimationFrame(() => {
      container.scrollTop =
        container.scrollHeight;
    });
  }, [messages]);

  // =======================================================
  // DELETE CHAT
  // =======================================================

  async function confirmDeleteChat() {
    if (
      !currentUserUid ||
      !friendUid ||
      deletingChat
    ) {
      return;
    }

    try {
      setDeletingChat(true);

      await onClearChat();

      setShowDeleteConfirm(false);
      setMenuOpen(false);
    } catch (error) {
      console.error(
        "Delete chat failed:",
        error
      );

      alert(
        "فشل حذف المحادثة"
      );
    } finally {
      setDeletingChat(false);
    }
  }

  // =======================================================
  // ARCHIVE
  // =======================================================

  async function handleArchive() {
    try {
      await onArchiveChat();

      setMenuOpen(false);
    } catch (error) {
      console.error(
        "Archive chat failed:",
        error
      );

      alert(
        "فشل أرشفة المحادثة"
      );
    }
  }

  // =======================================================
  // UNARCHIVE
  // =======================================================

  async function handleUnarchive() {
    try {
      await onUnarchiveChat();

      setMenuOpen(false);
    } catch (error) {
      console.error(
        "Unarchive chat failed:",
        error
      );

      alert(
        "فشل إلغاء الأرشفة"
      );
    }
  }

  // =======================================================
  // USER
  // =======================================================

  const avatarUrl =
    user.avatarUrl ||
    user.photoURL ||
    null;

  const userName =
    user.name ||
    user.username ||
    "مستخدم";

  // =======================================================
  // UI
  // =======================================================

  return (
    <div
      className="
        relative
        flex
        h-full
        min-h-0
        w-full
        flex-col
        overflow-hidden
        bg-[var(--background)]
      "
      dir="rtl"
    >
      <header
        className="
          relative
          z-30
          flex
          h-[76px]
          min-h-[76px]
          shrink-0
          items-center
          gap-3
          border-b
          border-[var(--glass-border)]
          bg-[var(--glass-bg)]
          px-3
          sm:px-5
        "
      >
        <button
          type="button"
          onClick={back}
          aria-label="العودة"
          className="
            glass-button
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-full
            text-2xl
            text-[var(--text-secondary)]
            transition
            active:scale-90
            md:hidden
          "
        >
          ‹
        </button>

        <div
          className="
            relative
            flex
            h-12
            w-12
            min-w-12
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-full
            border
            border-[var(--glass-border)]
            bg-[var(--glass-bg-strong)]
            text-lg
            font-bold
          "
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              className="
                h-full
                w-full
                object-cover
              "
            />
          ) : (
            userName
              .charAt(0)
              .toUpperCase()
          )}

          <span
            className={`
              absolute
              bottom-0
              right-0
              h-3.5
              w-3.5
              rounded-full
              border-2
              border-[var(--background)]
              ${
                presence.online
                  ? "bg-emerald-400"
                  : "bg-zinc-500"
              }
            `}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2
            className="
              truncate
              text-base
              font-bold
              sm:text-lg
            "
          >
            {userName}
          </h2>

          <div
            className="
              mt-0.5
              flex
              min-w-0
              items-center
              gap-1.5
            "
          >
            <span
              className={`
                h-1.5
                w-1.5
                shrink-0
                rounded-full
                ${
                  presence.online
                    ? "bg-emerald-400"
                    : "bg-zinc-500"
                }
              `}
            />

            <p
              className="
                truncate
                text-xs
                text-[var(--text-secondary)]
                sm:text-sm
              "
            >
              {presence.online
                ? "متصل الآن"
                : presence.lastSeen
                ? `آخر ظهور ${formatLastSeen(
                    presence.lastSeen
                  )}`
                : "غير متصل"}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="اتصال"
          className="
            glass-button
            hidden
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-full
            text-lg
            transition
            active:scale-90
            sm:flex
          "
          title="اتصال"
        >
          📞
        </button>

        <button
          type="button"
          aria-label="مكالمة فيديو"
          className="
            glass-button
            hidden
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-full
            text-lg
            transition
            active:scale-90
            sm:flex
          "
          title="مكالمة فيديو"
        >
          📹
        </button>

        <button
          type="button"
          onClick={() =>
            setMenuOpen(
              (value) => !value
            )
          }
          aria-label="خيارات المحادثة"
          aria-expanded={menuOpen}
          className="
            glass-button
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-full
            text-2xl
            leading-none
            text-[var(--text-secondary)]
            transition
            active:scale-90
          "
        >
          ⋮
        </button>
      </header>

      {/* MENU */}

      {menuOpen && (
        <>
          <div
            className="
              fixed
              inset-0
              z-[9990]
              bg-black/25
              backdrop-blur-[2px]
            "
            onClick={() =>
              setMenuOpen(false)
            }
          />

          <div
            className="
              liquid-glass-menu
              fixed
              right-4
              top-[82px]
              z-[9999]
              w-[240px]
              p-2
            "
          >
            <button
              type="button"
              onClick={
                isArchived
                  ? handleUnarchive
                  : handleArchive
              }
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-[18px]
                px-4
                py-3.5
                text-right
                text-sm
                font-semibold
                transition
                hover:bg-white/[0.08]
                active:scale-[0.98]
              "
            >
              <span className="text-xl">
                {isArchived
                  ? "📂"
                  : "📦"}
              </span>

              <span>
                {isArchived
                  ? "إلغاء الأرشفة"
                  : "أرشفة المحادثة"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setShowDeleteConfirm(true);
              }}
              disabled={deletingChat}
              className="
                mt-1
                flex
                w-full
                items-center
                gap-3
                rounded-[18px]
                px-4
                py-3.5
                text-right
                text-sm
                font-semibold
                text-red-400
                transition
                hover:bg-red-500/[0.10]
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <span className="text-xl">
                🗑️
              </span>

              <span>
                حذف المحادثة
              </span>
            </button>
          </div>
        </>
      )}

      {/* DELETE CONFIRMATION */}

      {showDeleteConfirm && (
        <>
          <div
            className="
              fixed
              inset-0
              z-[10000]
              bg-black/60
              backdrop-blur-sm
            "
            onClick={() => {
              if (!deletingChat) {
                setShowDeleteConfirm(false);
              }
            }}
          />

          <div
            className="
              fixed
              left-1/2
              top-1/2
              z-[10001]
              w-[min(380px,calc(100vw-32px))]
              -translate-x-1/2
              -translate-y-1/2
              rounded-[28px]
              border
              border-white/10
              bg-[#151515]/95
              p-6
              text-white
              shadow-[0_30px_100px_rgba(0,0,0,0.7)]
              backdrop-blur-3xl
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-[20px]
                bg-red-500/10
                text-3xl
              "
            >
              🗑️
            </div>

            <h3
              className="
                mt-5
                text-center
                text-lg
                font-bold
              "
            >
              حذف المحادثة؟
            </h3>

            <p
              className="
                mt-2
                text-center
                text-sm
                leading-6
                text-white/50
              "
            >
              سيتم حذف جميع الرسائل
              مع {userName}.
              <br />

              <span
                className="
                  font-semibold
                  text-red-400/80
                "
              >
                لا يمكن التراجع عن
                هذا الإجراء.
              </span>
            </p>

            <div
              className="
                mt-6
                grid
                grid-cols-2
                gap-3
              "
            >
              <button
                type="button"
                disabled={deletingChat}
                onClick={() =>
                  setShowDeleteConfirm(false)
                }
                className="
                  rounded-[16px]
                  border
                  border-white/10
                  bg-white/[0.06]
                  px-4
                  py-3
                  font-semibold
                  text-white/80
                  transition
                  hover:bg-white/[0.10]
                  active:scale-[0.98]
                  disabled:opacity-40
                "
              >
                إلغاء
              </button>

              <button
                type="button"
                disabled={deletingChat}
                onClick={
                  confirmDeleteChat
                }
                className="
                  rounded-[16px]
                  bg-red-500
                  px-4
                  py-3
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-600
                  active:scale-[0.98]
                  disabled:opacity-50
                "
              >
                {deletingChat
                  ? "جاري الحذف..."
                  : "حذف المحادثة"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* MESSAGES */}

      <div
        ref={messagesContainerRef}
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          px-3
          py-4
          sm:px-5
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        <div
          className="
            mx-auto
            flex
            min-h-full
            w-full
            max-w-4xl
            flex-col
            gap-2.5
          "
        >
          {messages.length === 0 ? (
            <div
              className="
                flex
                flex-1
                items-center
                justify-center
                px-5
                text-center
              "
            >
              <div
                className="
                  liquid-glass
                  w-full
                  max-w-xs
                  px-6
                  py-6
                "
              >
                <div
                  className="
                    mx-auto
                    mb-4
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-[22px]
                    border
                    border-[var(--glass-border)]
                    bg-[var(--glass-bg-strong)]
                    text-3xl
                  "
                >
                  💬
                </div>

                <p className="font-bold">
                  ابدأ المحادثة
                </p>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-[var(--text-secondary)]
                  "
                >
                  أرسل أول رسالة إلى{" "}
                  {userName}
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map(
                (msg, index) => {
                  const isMine =
                    msg.userId ===
                    currentUserUid;

                  const time =
                    msg.time ||
                    formatTime(
                      msg.createdAt
                    );

                  return (
                    <div
                      key={
                        msg.id ||
                        `message-${index}`
                      }
                      className={`
                        flex
                        w-full
                        ${
                          isMine
                            ? "justify-end"
                            : "justify-start"
                        }
                      `}
                    >
                      <div
                        className={`
                          relative
                          max-w-[85%]
                          overflow-hidden
                          rounded-[24px]
                          px-4
                          py-3
                          shadow-[0_8px_30px_rgba(0,0,0,0.08)]
                          sm:max-w-[65%]

                          ${
                            isMine
                              ? `
                                rounded-br-[8px]
                                bg-[var(--accent)]
                                text-[var(--accent-foreground)]
                              `
                              : `
                                rounded-bl-[8px]
                                border
                                border-[var(--glass-border-soft)]
                                bg-[var(--glass-bg-strong)]
                                text-[var(--text-primary)]
                              `
                          }
                        `}
                      >
                        {msg.deleted ? (
                          <p
                            className="
                              italic
                              text-sm
                              opacity-60
                            "
                          >
                            تم حذف هذه الرسالة
                          </p>
                        ) : (
                          <>
                            {msg.replyTo && (
                              <div
                                className="
                                  mb-2
                                  rounded-xl
                                  border
                                  border-black/10
                                  bg-black/10
                                  px-3
                                  py-2
                                  text-xs
                                "
                              >
                                <div className="font-semibold opacity-70">
                                  رد على رسالة
                                </div>

                                <div className="mt-1 truncate opacity-60">
                                  {msg.replyTo.text ||
                                    (msg.replyTo.imageUrl
                                      ? "📷 صورة"
                                      : msg.replyTo.voiceUrl
                                      ? "🎤 رسالة صوتية"
                                      : "رسالة")}
                                </div>
                              </div>
                            )}

                            {msg.imageUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  window.open(
                                    msg.imageUrl!,
                                    "_blank",
                                    "noopener,noreferrer"
                                  )
                                }
                                className="block w-full"
                              >
                                <img
                                  src={
                                    msg.imageUrl
                                  }
                                  alt="صورة مرسلة"
                                  className="
                                    block
                                    max-h-[360px]
                                    max-w-full
                                    rounded-[18px]
                                    object-cover
                                  "
                                />
                              </button>
                            )}

                            {msg.voiceUrl && (
                              <div
                                className={`
                                  ${
                                    msg.imageUrl
                                      ? "mt-2"
                                      : ""
                                  }
                                  min-w-[230px]
                                `}
                              >
                                <VoiceMessage
                                  voiceUrl={
                                    msg.voiceUrl
                                  }
                                  duration={
                                    msg.voiceDuration ??
                                    0
                                  }
                                  isMine={
                                    isMine
                                  }
                                />
                              </div>
                            )}

                            {msg.text && (
                              <p
                                className={`
                                  break-words
                                  whitespace-pre-wrap
                                  text-[15px]
                                  leading-6
                                  ${
                                    msg.imageUrl ||
                                    msg.voiceUrl
                                      ? "mt-2"
                                      : ""
                                  }
                                `}
                              >
                                {msg.text}
                              </p>
                            )}

                            {time && (
                              <div
                                className="
                                  mt-1.5
                                  flex
                                  items-center
                                  justify-end
                                  gap-1.5
                                  text-[10px]
                                  opacity-50
                                "
                              >
                                {msg.edited && (
                                  <span>
                                    معدلة
                                  </span>
                                )}

                                <span>
                                  {time}
                                </span>

                                {isMine && (
                                  <span>
                                    {msg.seenBy &&
                                    friendUid &&
                                    msg.seenBy[
                                      friendUid
                                    ]
                                      ? "✓✓"
                                      : "✓"}
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                }
              )}

              <div className="h-3 w-full shrink-0" />
            </>
          )}
        </div>
      </div>

      {/* INPUT */}

      <div
        className="
          shrink-0
          border-t
          border-[var(--glass-border)]
          bg-[var(--background)]
          pb-[env(safe-area-inset-bottom)]
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-4xl
          "
        >
          {isArchived ? (
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
                px-4
                py-4
                text-sm
              "
            >
              <span className="text-[var(--text-secondary)]">
                هذه المحادثة مؤرشفة
              </span>

              <button
                type="button"
                onClick={
                  handleUnarchive
                }
                className="
                  rounded-xl
                  bg-[var(--accent)]
                  px-4
                  py-2
                  font-semibold
                  text-[var(--accent-foreground)]
                  transition
                  hover:opacity-90
                "
              >
                إلغاء الأرشفة
              </button>
            </div>
          ) : (
            <MessageInput
              myUid={
                currentUserUid
              }
              friendUid={
                friendUid
              }
              onMessageSent={() => {
                requestAnimationFrame(
                  () => {
                    const container =
                      messagesContainerRef.current;

                    if (container) {
                      container.scrollTop =
                        container.scrollHeight;
                    }
                  }
                );
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}