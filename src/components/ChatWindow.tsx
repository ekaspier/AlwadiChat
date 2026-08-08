"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  uploadImage,
} from "@/lib/storage";

export default function ChatWindow({
  user,
  messages,
  sendMessage,
  clearChat,
  back,
}: any) {

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    confirmingClear,
    setConfirmingClear,
  ] = useState(false);

  const fileRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const messagesContainerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  // =========================================================
  // AUTO SCROLL
  // =========================================================

  useEffect(() => {

    const container =
      messagesContainerRef.current;

    if (!container) {
      return;
    }

    requestAnimationFrame(() => {

      container.scrollTo({
        top:
          container.scrollHeight -
          container.clientHeight,

        behavior: "smooth",
      });

    });

  }, [messages]);

  // =========================================================
  // SEND TEXT
  // =========================================================

  async function handleSend() {

    const text =
      message.trim();

    if (
      !text ||
      uploading
    ) {
      return;
    }

    try {

      await sendMessage(
        text
      );

      setMessage("");

    } catch (error) {

      console.error(
        "Message sending failed:",
        error
      );

    }

  }

  // =========================================================
  // SEND IMAGE
  // =========================================================

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
        await uploadImage(
          file
        );

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

  // =========================================================
  // CLEAR CHAT
  // =========================================================

  async function handleClearChat() {

    if (!clearChat) {
      return;
    }

    try {

      await clearChat();

      setConfirmingClear(
        false
      );

    } catch (error) {

      console.error(
        "Clear chat failed:",
        error
      );

      alert(
        "تعذر مسح المحادثة"
      );
    }

  }

  return (

    <section
      className="
        relative
        flex
        h-full
        min-h-0
        w-full
        flex-col
        overflow-hidden
      "
    >

      {/* =====================================================
          PREMIUM MESSAGE ANIMATION
      ===================================================== */}

      <style>{`

        @keyframes messageFromRight {

          0% {
            opacity: 0;
            transform:
              translate3d(
                22px,
                8px,
                0
              )
              scale(.965);

            filter: blur(5px);
          }

          55% {
            opacity: .92;

            transform:
              translate3d(
                -2px,
                0,
                0
              )
              scale(1.005);

            filter: blur(.8px);
          }

          100% {
            opacity: 1;

            transform:
              translate3d(
                0,
                0,
                0
              )
              scale(1);

            filter: blur(0);
          }

        }

        @keyframes messageFromLeft {

          0% {
            opacity: 0;

            transform:
              translate3d(
                -22px,
                8px,
                0
              )
              scale(.965);

            filter: blur(5px);
          }

          55% {
            opacity: .92;

            transform:
              translate3d(
                2px,
                0,
                0
              )
              scale(1.005);

            filter: blur(.8px);
          }

          100% {
            opacity: 1;

            transform:
              translate3d(
                0,
                0,
                0
              )
              scale(1);

            filter: blur(0);
          }

        }

        .message-enter-right {

          animation:
            messageFromRight
            420ms
            cubic-bezier(
              .22,
              1,
              .36,
              1
            )
            both;

          transform-origin:
            right bottom;

          will-change:
            transform,
            opacity,
            filter;
        }

        .message-enter-left {

          animation:
            messageFromLeft
            420ms
            cubic-bezier(
              .22,
              1,
              .36,
              1
            )
            both;

          transform-origin:
            left bottom;

          will-change:
            transform,
            opacity,
            filter;
        }

        @media (
          prefers-reduced-motion: reduce
        ) {

          .message-enter-right,
          .message-enter-left {
            animation: none;
          }

        }

      `}</style>

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -top-32
          right-1/4
          z-0
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
          z-0
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
          z-30
          flex
          h-[76px]
          shrink-0
          items-center
          gap-3
          border-b
          border-[var(--glass-border)]
          bg-[var(--glass-bg)]
          px-3
          shadow-[0_8px_35px_rgba(0,0,0,0.08)]
          backdrop-blur-3xl
          backdrop-saturate-150
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
            text-lg
            font-bold
            shadow-[inset_0_1px_0_var(--glass-highlight)]
          "
        >

          {user?.name?.[0]
            ?.toUpperCase() ||
            "U"}

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

        {/* =================================================
            CLEAR CHAT BUTTON
            Double click only
        ================================================= */}

        <button
          type="button"
          onDoubleClick={() =>
            setConfirmingClear(
              true
            )
          }
          aria-label="خيارات المحادثة"
          title="انقر مرتين لمسح المحادثة"
          className="
            glass-button
            flex
            h-11
            w-11
            shrink-0
            select-none
            items-center
            justify-center
            rounded-full
            text-xl
            font-bold
            text-[var(--text-secondary)]
            transition-all
            duration-200
            active:scale-90
          "
        >
          ⋯
        </button>

      </header>

      {/* =====================================================
          CLEAR CONFIRMATION
      ===================================================== */}

      {confirmingClear && (
        <div
          className="
            absolute
            right-4
            top-[88px]
            z-50
            w-[min(300px,calc(100vw-32px))]
            rounded-[22px]
            border
            border-[var(--glass-border)]
            bg-[var(--glass-bg-ultra)]
            p-4
            shadow-[0_20px_60px_rgba(0,0,0,0.30)]
            backdrop-blur-3xl
          "
        >

          <p
            className="
              font-semibold
              text-[var(--text-primary)]
            "
          >
            مسح محتوى المحادثة؟
          </p>

          <p
            className="
              mt-1.5
              text-xs
              leading-5
              text-[var(--text-secondary)]
            "
          >
            ستختفي الرسائل القديمة
            من محادثتك. لن يتم حذفها
            من الطرف الآخر.
          </p>

          <div
            className="
              mt-4
              flex
              gap-2
            "
          >

            <button
              type="button"
              onClick={
                handleClearChat
              }
              className="
                flex-1
                rounded-[14px]
                bg-red-500
                px-3
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-red-400
                active:scale-95
              "
            >
              مسح
            </button>

            <button
              type="button"
              onClick={() =>
                setConfirmingClear(
                  false
                )
              }
              className="
                flex-1
                rounded-[14px]
                border
                border-[var(--glass-border)]
                bg-[var(--glass-bg-strong)]
                px-3
                py-2.5
                text-sm
                font-semibold
                transition
                hover:bg-[var(--glass-bg-ultra)]
                active:scale-95
              "
            >
              إلغاء
            </button>

          </div>

        </div>
      )}

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      <div
        ref={
          messagesContainerRef
        }
        className="
          relative
          z-10
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          px-3
          pb-24
          pt-5
          sm:px-5
          sm:pb-28
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >

        {messages.length === 0 ? (

          <div
            className="
              flex
              h-full
              items-center
              justify-center
              px-5
            "
          >

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

          <div
            className="
              mx-auto
              flex
              max-w-4xl
              flex-col
              gap-2.5
            "
          >

            {messages.map(
              (
                msg: any,
                index: number
              ) => {

                const isMine =
                  msg.sender ===
                  "me";

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

                      ${
                        isMine
                          ? "message-enter-right"
                          : "message-enter-left"
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
                              shadow-[0_8px_25px_rgba(0,0,0,0.12)]
                            `
                            : `
                              liquid-glass
                              rounded-bl-[8px]
                            `
                        }
                      `}
                    >

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
                          className="
                            block
                            w-full
                            text-left
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
              }
            )}

            <div
              className="
                h-4
                w-full
                shrink-0
              "
              aria-hidden="true"
            />

          </div>

        )}

      </div>

      {/* =====================================================
          INPUT BAR
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          right-0
          z-40
          px-3
          pb-[max(10px,env(safe-area-inset-bottom))]
          pt-3
          sm:px-5
          sm:pb-5
        "
      >

        <div
          className="
            pointer-events-auto
            mx-auto
            flex
            max-w-4xl
            items-end
            gap-2
          "
        >

          {/* Image button */}

          <button
            type="button"
            onClick={() =>
              fileRef.current?.click()
            }
            disabled={
              uploading
            }
            aria-label="إرسال صورة"
            className="
              glass-button
              flex
              h-[48px]
              w-[48px]
              min-w-[48px]
              items-center
              justify-center
              rounded-full
              border-[var(--glass-border)]
              bg-[var(--glass-bg-strong)]
              text-xl
              shadow-[0_8px_30px_rgba(0,0,0,0.18)]
              backdrop-blur-3xl
              transition-all
              duration-200
              active:scale-90
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            🖼️
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={
              handleImage
            }
          />

          {/* Message pill */}

          <div
            className="
              flex
              min-h-[48px]
              flex-1
              items-center
              rounded-[26px]
              border
              border-transparent
              bg-transparent
              px-1.5
            "
          >

            <div
              className="
                flex
                min-h-[48px]
                flex-1
                items-center
                rounded-[26px]
                border
                border-[var(--glass-border)]
                bg-[var(--glass-bg-strong)]
                px-1.5
                shadow-[0_10px_35px_rgba(0,0,0,0.20),inset_0_1px_0_var(--glass-highlight)]
                backdrop-blur-3xl
                backdrop-saturate-180
                transition-all
                duration-300
                focus-within:border-[var(--glass-highlight)]
                focus-within:bg-[var(--glass-bg-ultra)]
                focus-within:shadow-[0_12px_40px_rgba(0,0,0,0.24),inset_0_1px_0_var(--glass-highlight)]
              "
            >

              <input
                value={
                  message
                }
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
                disabled={
                  uploading
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
                placeholder={
                  uploading
                    ? "جاري رفع الصورة..."
                    : "اكتب رسالة..."
                }
              />

              <button
                type="button"
                onClick={
                  handleSend
                }
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
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--accent)]
                  text-[var(--accent-foreground)]
                  text-base
                  font-bold
                  shadow-[0_5px_20px_rgba(0,0,0,0.18)]
                  transition-all
                  duration-200
                  hover:scale-[1.04]
                  active:scale-90
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                  disabled:hover:scale-100
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

    </section>
  );
}