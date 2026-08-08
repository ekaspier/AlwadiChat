"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

import { listenToAuth } from "@/lib/authListener";

import {
  listenToMessages,
  sendMessage as sendFirestoreMessage,
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
// HOME
// =========================================================

export default function Home() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);

  const [selectedUser, setSelectedUser] =
    useState<SelectedUser | null>(null);

  const [showChat, setShowChat] = useState(false);

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
  // LISTEN TO CURRENT CONVERSATION
  // =======================================================

  useEffect(() => {
    if (!currentUser || !selectedUser) {
      setMessages([]);
      return;
    }

    const unsubscribe = listenToMessages(
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
  // SELECT FRIEND
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
  // BACK ON MOBILE
  // =======================================================

  function handleBack() {
    setShowChat(false);
  }

  // =======================================================
  // LOADING
  // =======================================================

  if (!currentUser) {
    return null;
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <main
      className="
        flex
        h-[100dvh]
        min-h-0
        w-full
        overflow-hidden
        bg-[var(--background)]
      "
    >
      {/* =================================================
          SIDEBAR
      ================================================= */}

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

      {/* =================================================
          CHAT AREA
      ================================================= */}

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
            user={selectedUser}
            messages={messages}
            sendMessage={sendMessage}
            back={handleBack}
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
              bg-[var(--background)]
            "
          >
            {/* Ambient background */}

            <div
              className="
                pointer-events-none
                absolute
                h-72
                w-72
                -translate-y-20
                rounded-full
                bg-blue-500/10
                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                bottom-0
                right-0
                h-72
                w-72
                rounded-full
                bg-purple-500/5
                blur-3xl
              "
            />

            {/* Empty state */}

            <div
              className="
                relative
                z-10
                mx-6
                max-w-sm
                text-center
              "
            >
              <div
                className="
                  mx-auto
                  mb-5
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-[28px]
                  border
                  border-[var(--glass-border)]
                  bg-[var(--glass-bg-strong)]
                  text-3xl
                  shadow-[0_20px_60px_rgba(0,0,0,0.25)]
                  backdrop-blur-2xl
                "
              >
                💬
              </div>

              <h2 className="text-xl font-bold">
                AlwadiChat
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  text-[var(--text-muted)]
                "
              >
                اختر صديقاً لبدء المحادثة
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}