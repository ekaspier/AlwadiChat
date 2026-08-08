"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { uploadImage } from "@/lib/storage";

// =========================================================
// TYPES
// =========================================================

type ChatWindowProps = {
  user: any;
  messages: any[];

  sendMessage: (
    text: string,
    imageUrl?: string | null
  ) => Promise<void>;

  back: () => void;
};

// =========================================================
// CHAT WINDOW
// =========================================================

export default function ChatWindow({
  user,
  messages,
  sendMessage,
  back,
}: ChatWindowProps) {
  const [message, setMessage] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  const fileRef =
    useRef<HTMLInputElement | null>(null);

  const messagesContainerRef =
    useRef<HTMLDivElement | null>(null);

  // =======================================================
  // AUTO SCROLL
  //
  // IMPORTANT:
  // Only the messages container scrolls.
  // Header + input never move.
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
  // SEND TEXT
  // =======================================================

  async function handleSend() {
    const text =
      message.trim();

    if (!text || uploading) {
      return;
    }

    try {
      await sendMessage(text);

      setMessage("");
    } catch (error) {
      console.error(
        "Message sending failed:",
        error
      );
    }
  }

  // =======================================================
  // SEND IMAGE
  // =======================================================

  async function handleImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      alert(
        "حجم الصورة يجب أن يكون أقل من 10MB"
      );

      e.target.value = "";

      return;
    }

    try {
      setUploading(true);

      const imageUrl =
        await uploadImage(file);

      await sendMessage(
        "",
        imageUrl
      );
    } catch (error) {
      console.error(
        "Image upload failed:",
        error
      );

      alert(
        "فشل رفع الصورة"
      );
    } finally {
      setUploading(false);

      e.target.value = "";
    }
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <div
      className="
        flex
        h-full
        min-h-0
        w-full
        flex-col
        overflow-hidden
        bg-[var(--background)]
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <header
        className="
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
        {/* Back */}

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

        {/* Avatar */}

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
          {user?.name?.[0]
            ?.toUpperCase() || "U"}

          <span
            className="
              absolute
              bottom-0
              right-0
              h-3.5
              w-3.5
              rounded-full
              border-2
              border-[var(--background)]
              bg-emerald-400
            "
          />
        </div>

        {/* User information */}

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <h2
            className="
              truncate
              text-base
              font-bold
              sm:text-lg
            "
          >
            {user?.name ||
              "مستخدم"}
          </h2>

          <div
            className="
              mt-0.5
              flex
              items-center
              gap-1.5
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

            <p
              className="
                truncate
                text-xs
                text-[var(--text-secondary)]
                sm:text-sm
              "
            >
              {user?.status ||
                "متصل"}
            </p>
          </div>
        </div>
      </header>

      {/* =================================================
          MESSAGES CONTAINER

          THIS IS THE ONLY SCROLLABLE ELEMENT.
      ================================================= */}

      <div
        ref={
          messagesContainerRef
        }
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
          {/* Empty */}

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
                  {user?.name ||
                    "صديقك"}
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map(
                (
                  msg: any,
                  index: number
                ) => {
                  const isMine =
                    msg.sender === "me";

                  return (
                    <div
                      key={
                        msg.id ||
                        index
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
                                bg-[var(--glass-bg-strong)]
                                text-[var(--text-primary)]
                              `
                          }
                        `}
                      >
                        {/* IMAGE */}

                        {msg.imageUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                msg.imageUrl,
                                "_blank",
                                "noopener,noreferrer"
                              )
                            }
                            className="
                              block
                              w-full
                            "
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

                        {/* TEXT */}

                        {msg.text && (
                          <p
                            className={`
                              break-words
                              whitespace-pre-wrap
                              text-[15px]
                              leading-6

                              ${
                                msg.imageUrl
                                  ? "mt-2"
                                  : ""
                              }
                            `}
                          >
                            {msg.text}
                          </p>
                        )}

                        {/* TIME */}

                        {msg.time && (
                          <p
                            className="
                              mt-1.5
                              text-right
                              text-[10px]
                              opacity-50
                            "
                          >
                            {msg.time}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }
              )}

              {/* Bottom space */}

              <div
                className="
                  h-3
                  w-full
                  shrink-0
                "
                aria-hidden="true"
              />
            </>
          )}
        </div>
      </div>

      {/* =================================================
          INPUT BAR

          IMPORTANT:
          This is OUTSIDE the scroll container.
          Messages can never push it down.
      ================================================= */}

      <div
        className="
          shrink-0
          border-t
          border-[var(--glass-border)]
          bg-[var(--background)]
          px-3
          py-3
          pb-[max(12px,env(safe-area-inset-bottom))]
          sm:px-5
        "
      >
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-4xl
            items-center
            gap-2
          "
        >
          {/* IMAGE BUTTON */}

          <button
            type="button"
            onClick={() =>
              fileRef.current?.click()
            }
            disabled={uploading}
            aria-label="إرسال صورة"
            className="
              glass-button
              flex
              h-12
              w-12
              min-w-12
              shrink-0
              items-center
              justify-center
              rounded-full
              text-xl
              transition
              active:scale-90
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            🖼️
          </button>

          {/* FILE INPUT */}

          <input
            ref={fileRef}
            type="file"
            accept="
              image/jpeg,
              image/png,
              image/webp,
              image/gif
            "
            hidden
            onChange={handleImage}
          />

          {/* MESSAGE BAR */}

          <div
            className="
              flex
              min-w-0
              flex-1
              items-center
              rounded-[26px]
              border
              border-[var(--glass-border)]
              bg-[var(--glass-bg-strong)]
              px-1.5
            "
          >
            <input
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key ===
                    "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();

                  handleSend();
                }
              }}
              disabled={uploading}
              placeholder={
                uploading
                  ? "جاري رفع الصورة..."
                  : "اكتب رسالة..."
              }
              className="
                min-w-0
                flex-1
                bg-transparent
                px-3
                py-2.5
                text-[15px]
                text-[var(--text-primary)]
                outline-none
                placeholder:text-[var(--text-muted)]
                disabled:opacity-50
              "
            />

            {/* SEND */}

            <button
              type="button"
              onClick={handleSend}
              disabled={
                uploading ||
                !message.trim()
              }
              aria-label="إرسال الرسالة"
              className="
                flex
                h-10
                w-10
                min-w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[var(--accent)]
                text-[var(--accent-foreground)]
                text-base
                font-bold
                transition
                active:scale-90
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              {uploading
                ? "…"
                : "➤"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}