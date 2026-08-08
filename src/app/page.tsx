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

export default function Home() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] =
    useState<SelectedUser | null>(null);

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  /*
   * Authentication
   */
  useEffect(() => {
    const unsubscribe = listenToAuth((user: any) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, [router]);

  /*
   * Listen to current conversation
   */
  useEffect(() => {
    if (!currentUser || !selectedUser) {
      setMessages([]);
      return;
    }

    const unsubscribe = listenToMessages(
      currentUser.uid,
      selectedUser.id,
      (data: any[]) => {
        const formatted: ChatMessage[] = data.map((msg: any) => ({
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

    return () => unsubscribe();
  }, [currentUser, selectedUser]);

  /*
   * Select friend
   */
  function selectUser(user: SelectedUser) {
    setSelectedUser(user);
    setShowChat(true);
  }

  /*
   * Send text or image message
   */
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

  /*
   * Back to friends on mobile
   */
  function handleBack() {
    setShowChat(false);
  }

  /*
   * Loading
   */
  if (!currentUser) {
    return (
      <main className="min-h-[100dvh] bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />

          <p className="text-sm text-white/50">
            Loading...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="
        relative
        w-full
        h-[100dvh]
        overflow-hidden
        bg-black
        text-white
        flex
      "
    >
      {/* 
        Friends / Navigation
        Mobile:
        full screen when no chat is selected

        Desktop:
        fixed width sidebar
      */}
      <aside
        className={`
          relative
          h-full
          w-full
          md:w-[360px]
          lg:w-[390px]
          shrink-0

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

      {/*
        Chat area
      */}
      <section
        className={`
          relative
          flex-1
          min-w-0
          h-full

          ${
            showChat
              ? "block"
              : "hidden md:block"
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
              h-full
              flex
              items-center
              justify-center
              overflow-hidden
              bg-black
            "
          >
            {/* Ambient background */}
            <div
              className="
                pointer-events-none
                absolute
                w-72
                h-72
                rounded-full
                bg-blue-500/10
                blur-3xl
                -translate-y-20
              "
            />

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
                  w-20
                  h-20
                  rounded-[28px]

                  bg-white/[0.07]
                  border
                  border-white/[0.12]

                  backdrop-blur-2xl
                  shadow-[0_20px_60px_rgba(0,0,0,0.35)]

                  flex
                  items-center
                  justify-center

                  text-3xl
                "
              >
                💬
              </div>

              <h2 className="text-xl font-bold text-white">
                AlwadiChat
              </h2>

              <p className="mt-2 text-sm text-white/40">
                اختر صديقاً لبدء المحادثة
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}