"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

import { listenToAuth } from "@/lib/authListener";

import {
  listenToMessages,
  clearChat,
  isChatArchived as isChatArchivedFirestore,
  archiveChat,
  unarchiveChat,
} from "@/lib/firebaseFirestore";

// =========================================================
// TYPES
// =========================================================

type SelectedUser = {
  id: string;
  name: string;
  status?: string;
};

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

// =========================================================
// HELPERS
// =========================================================

function formatMessageTime(createdAt: any): string {
  if (!createdAt) {
    return "";
  }

  try {
    let date: Date | null = null;

    if (typeof createdAt?.toDate === "function") {
      date = createdAt.toDate();
    } else if (createdAt instanceof Date) {
      date = createdAt;
    } else if (typeof createdAt === "number") {
      date = new Date(createdAt);
    } else if (typeof createdAt === "string") {
      date = new Date(createdAt);
    }

    if (!date || Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("ar-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// =========================================================
// HOME
// =========================================================

export default function Home() {
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<any>(null);

  const [selectedUser, setSelectedUser] =
    useState<SelectedUser | null>(null);

  const [showChat, setShowChat] =
    useState(false);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [archivedState, setArchivedState] =
    useState(false);

  // =======================================================
  // AUTH
  // =======================================================

  useEffect(() => {
    const unsubscribe = listenToAuth((user: any) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setCurrentUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  // =======================================================
  // LISTEN TO CURRENT CHAT
  // =======================================================

  useEffect(() => {
    if (!currentUser?.uid || !selectedUser?.id) {
      setMessages([]);
      setArchivedState(false);
      return;
    }

    let cancelled = false;

    const myUid: string = currentUser.uid;
    const friendUid: string = selectedUser.id;

    async function loadArchiveState() {
      try {
        const archived =
          await isChatArchivedFirestore(
            myUid,
            friendUid
          );

        if (!cancelled) {
          setArchivedState(archived);
        }
      } catch (error) {
        console.error(
          "Failed to check archive state:",
          error
        );

        if (!cancelled) {
          setArchivedState(false);
        }
      }
    }

    void loadArchiveState();

    const unsubscribe = listenToMessages(
      myUid,
      friendUid,
      (data) => {
        if (cancelled) {
          return;
        }

        const formatted: ChatMessage[] =
          data.map((msg) => ({
            id: msg.id,

            text: msg.text ?? "",

            imageUrl:
              msg.imageUrl ?? null,

            voiceUrl:
              msg.voiceUrl ?? null,

            voiceDuration:
              msg.voiceDuration ?? null,

            sender:
              msg.userId === myUid
                ? "me"
                : "other",

            type:
              msg.type ?? "text",

            userId:
              msg.userId ?? "",

            createdAt:
              msg.createdAt ?? null,

            updatedAt:
              msg.updatedAt ?? null,

            edited:
              msg.edited ?? false,

            deleted:
              msg.deleted ?? false,

            replyTo:
              msg.replyTo ?? null,

            reactions:
              msg.reactions ?? {},

            seenBy:
              msg.seenBy ?? {},

            time:
              formatMessageTime(
                msg.createdAt
              ),
          }));

        setMessages(formatted);
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [
    currentUser?.uid,
    selectedUser?.id,
  ]);

  // =======================================================
  // SELECT USER
  // =======================================================

  function selectUser(user: SelectedUser) {
    setSelectedUser(user);
    setShowChat(true);
  }

  // =======================================================
  // CLEAR CHAT
  // =======================================================

  async function handleClearChat() {
    if (
      !currentUser?.uid ||
      !selectedUser?.id
    ) {
      return;
    }

    const myUid: string =
      currentUser.uid;

    const friendUid: string =
      selectedUser.id;

    await clearChat(
      myUid,
      friendUid
    );

    setMessages([]);
  }

  // =======================================================
  // ARCHIVE
  // =======================================================

  async function handleArchiveChat() {
    if (
      !currentUser?.uid ||
      !selectedUser?.id
    ) {
      return;
    }

    const myUid: string =
      currentUser.uid;

    const friendUid: string =
      selectedUser.id;

    await archiveChat(
      myUid,
      friendUid
    );

    setArchivedState(true);

    window.dispatchEvent(
      new Event(
        "alwadi-chat-archive-changed"
      )
    );

    setSelectedUser(null);
    setShowChat(false);
    setMessages([]);
  }

  // =======================================================
  // UNARCHIVE
  // =======================================================

  async function handleUnarchiveChat() {
    if (
      !currentUser?.uid ||
      !selectedUser?.id
    ) {
      return;
    }

    const myUid: string =
      currentUser.uid;

    const friendUid: string =
      selectedUser.id;

    await unarchiveChat(
      myUid,
      friendUid
    );

    setArchivedState(false);

    window.dispatchEvent(
      new Event(
        "alwadi-chat-archive-changed"
      )
    );

    setSelectedUser(null);
    setShowChat(false);
    setMessages([]);
  }

  // =======================================================
  // BACK
  // =======================================================

  function handleBack() {
    setShowChat(false);
  }

  // =======================================================
  // LOADING
  // =======================================================

  if (!currentUser) {
    return (
      <main
        className="
          flex
          min-h-[100dvh]
          items-center
          justify-center
          bg-[var(--background)]
          text-[var(--text-primary)]
        "
      >
        <div
          className="
            liquid-glass
            flex
            items-center
            gap-3
            rounded-full
            px-6
            py-4
          "
        >
          <span
            className="
              h-2
              w-2
              animate-pulse
              rounded-full
              bg-emerald-400
            "
          />

          <span className="text-sm">
            جاري التحميل...
          </span>
        </div>
      </main>
    );
  }

  // =======================================================
  // APP
  // =======================================================

  return (
    <main
      dir="rtl"
      className="
        relative
        flex
        h-[100dvh]
        min-h-[100dvh]
        w-full
        overflow-hidden
        bg-[var(--background)]
        text-[var(--text-primary)]
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          -left-32
          -top-32
          z-0
          h-96
          w-96
          rounded-full
          bg-blue-500/[0.08]
          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          top-1/3
          z-0
          h-96
          w-96
          rounded-full
          bg-purple-500/[0.07]
          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-[-180px]
          left-1/3
          z-0
          h-96
          w-96
          rounded-full
          bg-cyan-500/[0.035]
          blur-[130px]
        "
      />

      <div
        className="
          relative
          z-10
          flex
          h-full
          min-h-0
          w-full
          overflow-hidden
          bg-transparent
        "
      >
        <aside
          className={`
            relative
            z-20
            h-full
            min-h-0
            w-full
            shrink-0
            md:block
            md:w-[360px]
            lg:w-[390px]
            xl:w-[410px]

            ${
              showChat
                ? "hidden md:block"
                : "block"
            }
          `}
        >
          <Sidebar
            setSelectedUser={selectUser}
          />
        </aside>

        <section
          className={`
            relative
            z-10
            flex
            h-full
            min-h-0
            min-w-0
            flex-1
            flex-col
            overflow-hidden

            ${
              showChat
                ? "block"
                : "hidden md:flex"
            }
          `}
        >
          {selectedUser ? (
            <ChatWindow
              currentUserUid={
                currentUser.uid
              }

              user={selectedUser}

              messages={messages}

              back={handleBack}

              onClearChat={
                handleClearChat
              }

              onArchiveChat={
                handleArchiveChat
              }

              onUnarchiveChat={
                handleUnarchiveChat
              }

              isArchived={
                archivedState
              }
            />
          ) : (
            <div
              className="
                relative
                flex
                h-full
                min-h-0
                w-full
                items-center
                justify-center
                overflow-hidden
                bg-transparent
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  h-[420px]
                  w-[420px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-white/[0.025]
                  blur-[100px]
                "
              />

              <div
                className="
                  relative
                  z-10
                  mx-6
                  w-full
                  max-w-md
                  text-center
                "
              >
                <div
                  className="
                    liquid-glass-strong
                    mx-auto
                    flex
                    h-24
                    w-24
                    items-center
                    justify-center
                    rounded-[30px]
                    text-4xl
                  "
                >
                  💬
                </div>

                <h1
                  className="
                    mt-7
                    text-2xl
                    font-bold
                    tracking-tight
                  "
                >
                  AlwadiChat
                </h1>

                <p
                  className="
                    mx-auto
                    mt-3
                    max-w-sm
                    text-sm
                    leading-7
                    text-[var(--text-secondary)]
                  "
                >
                  اختر محادثة من القائمة
                  للبدء بالدردشة مع أصدقائك.
                </p>

                <div
                  className="
                    liquid-glass
                    mx-auto
                    mt-7
                    flex
                    w-fit
                    items-center
                    gap-2
                    rounded-full
                    px-4
                    py-2.5
                    text-xs
                    text-[var(--text-muted)]
                  "
                >
                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-emerald-400
                    "
                  />

                  آمن • سريع • خاص
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}