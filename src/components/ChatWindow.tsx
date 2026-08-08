"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/storage";

export default function ChatWindow({
  user,
  messages,
  sendMessage,
  back,
}: any) {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleSend() {
    const text = message.trim();

    if (!text || uploading) return;

    try {
      await sendMessage(text);
      setMessage("");
    } catch (error) {
      console.error("Message sending failed:", error);
    }
  }

  async function handleImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("حجم الصورة يجب أن يكون أقل من 10MB");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const imageUrl = await uploadImage(file);

      await sendMessage("", imageUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("فشل رفع الصورة");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <section
      className="
        relative
        flex
        h-full
        min-h-0
        flex-col
        overflow-hidden
        bg-[var(--background)]
        text-[var(--text-primary)]
      "
    >
      {/* =====================================================
          BACKGROUND LIGHT
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -top-32
          right-1/4
          h-72
          w-72
          rounded-full
          bg-blue-500/[0.035]
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-1/4
          -left-32
          h-80
          w-80
          rounded-full
          bg-purple-500/[0.025]
          blur-3xl
        "
      />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          relative
          z-20
          flex
          h-[76px]
          shrink-0
          items-center
          gap-3
          border-b
          border-[var(--glass-border)]
          bg-[var(--glass-bg)]
          px-3
          sm:px-5

          backdrop-blur-3xl
          backdrop-saturate-150

          shadow-[0_8px_35px_rgba(0,0,0,0.08)]
        "
      >
        {/* Mobile back */}

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
            transition-all
            duration-200
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
            items-center
            justify-center
            overflow-hidden
            rounded-full
            border
            border-[var(--glass-border)]
            bg-[var(--glass-bg-strong)]

            shadow-[inset_0_1px_0_var(--glass-highlight)]

            text-lg
            font-bold
          "
        >
          {user?.name?.[0]?.toUpperCase() || "U"}

          {/* Online indicator */}

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
              shadow-[0_0_10px_rgba(52,211,153,0.6)]
            "
          />
        </div>

        {/* User info */}

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold sm:text-lg">
            {user?.name || "مستخدم"}
          </h2>

          <div className="mt-0.5 flex items-center gap-1.5">
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-emerald-400
              "
            />

            <p className="truncate text-xs text-[var(--text-secondary)] sm:text-sm">
              {user?.status || "متصل"}
            </p>
          </div>
        </div>
      </header>

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      <div
        className="
          relative
          z-10
          flex-1
          min-h-0
          overflow-y-auto
          overscroll-contain

          px-3
          py-5
          sm:px-5

          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-5">
            <div
              className="
                liquid-glass
                w-full
                max-w-xs
                px-6
                py-6
                text-center
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
                  shadow-[inset_0_1px_0_var(--glass-highlight)]
                "
              >
                💬
              </div>

              <p className="font-bold">
                ابدأ المحادثة
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                أرسل أول رسالة إلى {user?.name || "صديقك"}
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-4xl flex-col gap-2.5">
            {messages.map((msg: any, index: number) => {
              const isMine = msg.sender === "me";

              return (
                <div
                  key={msg.id || index}
                  className={`
                    flex
                    w-full
                    ${isMine ? "justify-end" : "justify-start"}
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
                            shadow-[0_8px_25px_rgba(0,0,0,0.12)]
                          `
                          : `
                            liquid-glass
                            rounded-bl-[8px]
                          `
                      }
                    `}
                  >
                    {/* Glass highlight */}

                    {!isMine && (
                      <div
                        className="
                          pointer-events-none
                          absolute
                          inset-x-0
                          top-0
                          h-px
                          bg-[var(--glass-highlight)]
                        "
                      />
                    )}

                    {/* Image */}

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
                        className="block w-full text-left"
                      >
                        <img
                          src={msg.imageUrl}
                          alt="صورة مرسلة"
                          className="
                            block
                            max-h-[360px]
                            max-w-full
                            rounded-[18px]
                            object-cover
                            transition-transform
                            duration-300
                            hover:scale-[1.015]
                          "
                        />
                      </button>
                    )}

                    {/* Text */}

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

                    {/* Time */}

                    {msg.time && (
                      <p
                        className={`
                          mt-1.5
                          text-right
                          text-[10px]

                          ${
                            isMine
                              ? "opacity-50"
                              : "text-[var(--text-muted)]"
                          }
                        `}
                      >
                        {msg.time}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =====================================================
          INPUT AREA
      ===================================================== */}

      <div
        className="
          relative
          z-20
          shrink-0

          border-t
          border-[var(--glass-border)]

          bg-[var(--glass-bg)]
          px-3
          pt-3
          backdrop-blur-3xl
          backdrop-saturate-150

          sm:px-4
          sm:pt-4

          pb-[max(12px,env(safe-area-inset-bottom))]
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-4xl
            items-center
            gap-2

            rounded-[26px]

            border
            border-[var(--glass-border)]

            bg-[var(--glass-bg-strong)]

            p-1.5

            shadow-[0_10px_35px_rgba(0,0,0,0.12)]

            backdrop-blur-3xl
            backdrop-saturate-150

            transition-all
            duration-300

            focus-within:border-[var(--glass-highlight)]
            focus-within:shadow-[0_12px_40px_rgba(0,0,0,0.16)]
          "
        >
          {/* Hidden file input */}

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={handleImage}
          />

          {/* Image button */}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="إرسال صورة"
            className="
              glass-button
              flex
              h-11
              w-11
              min-w-11
              items-center
              justify-center
              rounded-full
              text-lg

              transition-all
              duration-200

              active:scale-90

              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            🖼️
          </button>

          {/* Input */}

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={uploading}
            className="
              min-w-0
              flex-1
              bg-transparent
              px-2
              py-2
              text-[15px]
              text-[var(--text-primary)]
              outline-none

              placeholder:text-[var(--text-muted)]

              disabled:opacity-50
            "
            placeholder={
              uploading
                ? "جاري رفع الصورة..."
                : "اكتب رسالة..."
            }
          />

          {/* Send */}

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
              h-11
              w-11
              min-w-11
              items-center
              justify-center
              rounded-full

              bg-[var(--accent)]
              text-[var(--accent-foreground)]

              font-bold

              shadow-[0_5px_20px_rgba(0,0,0,0.15)]

              transition-all
              duration-200

              hover:scale-[1.03]
              active:scale-90

              disabled:cursor-not-allowed
              disabled:opacity-35
              disabled:hover:scale-100
            "
          >
            {uploading ? "…" : "➤"}
          </button>
        </div>
      </div>
    </section>
  );
}