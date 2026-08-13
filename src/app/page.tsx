"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

import { listenToAuth } from "@/lib/authListener";

import {
  listenToMessages,
  sendMessage as sendFirestoreMessage,
  clearChat,
} from "@/lib/firebaseFirestore";

// =========================================================
// TYPES
// =========================================================

type SelectedUser = {
  id: string;
  name: string;
  status?: string;
};

type ChatMessage = {
  id?: string;
  text?: string;
  imageUrl?: string | null;
  sender: "me" | "other";
  time?: string;
};

// =========================================================
// ARCHIVE EVENT
// =========================================================

const ARCHIVE_EVENT =
  "alwadi-chat-archive-changed";

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

  // =======================================================
  // AUTHENTICATION
  // =======================================================

  useEffect(() => {
    const unsubscribe = listenToAuth(
      (user: any) => {
        if (!user) {
          router.push("/login");
          return;
        }

        setCurrentUser(user);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [router]);

  // =======================================================
  // LISTEN TO CURRENT CHAT
  // =======================================================

  useEffect(() => {
    if (!currentUser || !selectedUser) {
      setMessages([]);
      return;
    }

    const unsubscribe =
      listenToMessages(
        currentUser.uid,
        selectedUser.id,
        (data: any[]) => {
          const formatted: ChatMessage[] =
            data.map((msg: any) => ({
              id: msg.id,
              text: msg.text ?? "",
              imageUrl: msg.imageUrl ?? null,

              sender:
                msg.userId === currentUser.uid
                  ? "me"
                  : "other",

              time: "",
            }));

          setMessages(formatted);
        }
      );

    return () => {
      unsubscribe();
    };
  }, [currentUser, selectedUser]);

  // =======================================================
  // SELECT USER
  // =======================================================

  function selectUser(user: SelectedUser) {
    setSelectedUser(user);
    setShowChat(true);
  }

  // =======================================================
  // SEND MESSAGE
  // =======================================================

  async function sendMessage(
    text: string,
    imageUrl: string | null = null
  ) {
    if (!currentUser || !selectedUser) {
      return;
    }

    await sendFirestoreMessage(
      currentUser.uid,
      selectedUser.id,
      text,
      imageUrl
    );
  }

  // =======================================================
  // CLEAR CURRENT CHAT
  // =======================================================

  async function handleClearChat() {
    if (!currentUser || !selectedUser) {
      return;
    }

    try {
      await clearChat(
        currentUser.uid,
        selectedUser.id
      );

      setMessages([]);
    } catch (error) {
      console.error(
        "Failed to clear chat:",
        error
      );

      throw error;
    }
  }

  // =======================================================
  // ARCHIVE CURRENT CHAT
  // =======================================================

  function handleArchiveChat() {
    if (!currentUser || !selectedUser) {
      return;
    }

    try {
      const storageKey =
        `alwadi-archived-chats-${currentUser.uid}`;

      const saved =
        localStorage.getItem(storageKey);

      const archived: string[] =
        saved ? JSON.parse(saved) : [];

      if (
        !archived.includes(selectedUser.id)
      ) {
        archived.push(selectedUser.id);
      }

      localStorage.setItem(
        storageKey,
        JSON.stringify(archived)
      );

      // Notify Sidebar immediately
      window.dispatchEvent(
        new Event(ARCHIVE_EVENT)
      );

      // Close current chat
      setSelectedUser(null);
      setShowChat(false);
      setMessages([]);
    } catch (error) {
      console.error(
        "Failed to archive chat:",
        error
      );

      throw error;
    }
  }

  // =======================================================
  // UNARCHIVE CURRENT CHAT
  // =======================================================

  function handleUnarchiveChat() {
    if (!currentUser || !selectedUser) {
      return;
    }

    try {
      const storageKey =
        `alwadi-archived-chats-${currentUser.uid}`;

      const saved =
        localStorage.getItem(storageKey);

      const archived: string[] =
        saved ? JSON.parse(saved) : [];

      const updated =
        archived.filter(
          (id) => id !== selectedUser.id
        );

      localStorage.setItem(
        storageKey,
        JSON.stringify(updated)
      );

      // Notify Sidebar
      window.dispatchEvent(
        new Event(ARCHIVE_EVENT)
      );

      // Return to main conversations
      setSelectedUser(null);
      setShowChat(false);
      setMessages([]);
    } catch (error) {
      console.error(
        "Failed to unarchive chat:",
        error
      );

      throw error;
    }
  }

  // =======================================================
  // CHECK IF CHAT IS ARCHIVED
  // =======================================================

  function isChatArchived(
    friendUid: string
  ) {
    if (!currentUser) {
      return false;
    }

    try {
      const storageKey =
        `alwadi-archived-chats-${currentUser.uid}`;

      const saved =
        localStorage.getItem(storageKey);

      if (!saved) {
        return false;
      }

      const archived: string[] =
        JSON.parse(saved);

      return archived.includes(friendUid);
    } catch {
      return false;
    }
  }

  // =======================================================
  // BACK MOBILE
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
      {/* AMBIENT LIGHT */}

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

      {/* APP FRAME */}

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
        {/* SIDEBAR */}

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

        {/* CHAT AREA */}

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
              currentUserUid={currentUser.uid}
              user={selectedUser}
              messages={messages}
              sendMessage={sendMessage}
              back={handleBack}
              onClearChat={handleClearChat}
              onArchiveChat={
                handleArchiveChat
              }
              onUnarchiveChat={
                handleUnarchiveChat
              }
              isArchived={isChatArchived(
                selectedUser.id
              )}
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