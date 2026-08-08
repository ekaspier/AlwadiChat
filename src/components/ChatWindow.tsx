"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Image as ImageIcon,
  MoreHorizontal,
  Send,
  Trash2,
  X,
} from "lucide-react";

import { uploadImage } from "@/lib/storage";

type ChatWindowProps = {
  user: {
    id?: string;
    name?: string;
    status?: string;
  };

  messages: {
    id?: string;
    text?: string;
    imageUrl?: string | null;
    sender: "me" | "other";
    time?: string;
  }[];

  sendMessage: (
    text: string,
    imageUrl?: string | null
  ) => Promise<void>;

  clearChat?: () => Promise<void>;

  back: () => void;
};

export default function ChatWindow({
  user,
  messages,
  sendMessage,
  clearChat,
  back,
}: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [confirmingClear, setConfirmingClear] =
    useState(false);

  const fileRef =
    useRef<HTMLInputElement | null>(null);

  const messagesContainerRef =
    useRef<HTMLDivElement | null>(null);

  // =========================================================
  // AUTO SCROLL
  // =========================================================

  useEffect(() => {
    const container =
      messagesContainerRef.current;

    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages]);

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  async function handleSend() {
    const text = message.trim();

    if (!text || uploading) return;

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

  // =========================================================
  // SEND IMAGE
  // =========================================================

  async function handleImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      alert(
        "حجم الصورة يجب أن يكون أقل من 10MB"
      );

      event.target.value = "";

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

      alert("فشل رفع الصورة");
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  }

  // =========================================================
  // CLEAR CHAT
  // =========================================================

  async function handleClearChat() {
    if (!clearChat) return;

    try {
      await clearChat();

      setConfirmingClear(false);
      setMenuOpen(false);
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

  // =========================================================
  // ENTER
  // =========================================================

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSend();
    }
  }

  return (
    <section
      dir="rtl"
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
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          relative
          z-30
          flex
          h-[68px]
          shrink-0
          items-center
          gap-2.5
          border-b
          border-[var(--glass-border)]
          bg-[var(--glass-bg)]
          px-3
          shadow-[0_4px_24px_rgba(0,0,0,0.06)]
          backdrop-blur-3xl
          backdrop-saturate-150
          sm:h-[72px]
          sm:px-5
        "
      >

        {/* BACK */}

        <button
          type="button"
          onClick={back}
          aria-label="العودة"
          className="
            glass-button
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            text-[var(--text-secondary)]
            transition
            active:scale-90
            md:hidden
          "
        >
          <ArrowLeft
            className="h-5 w-5"
          />
        </button>

        {/* AVATAR */}

        <div
          className="
            relative
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-full
            border
            border-[var(--glass-border)]
            bg-[var(--glass-bg-strong)]
            text-base
            font-bold
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
              h-3
              w-3
              rounded-full
              border-2
              border-[var(--background)]
              bg-emerald-400
            "
          />
        </div>

        {/* USER */}

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <h2
            className="
              truncate
              text-[15px]
              font-bold
              sm:text-base
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

            <span
              className="
                truncate
                text-[11px]
                text-[var(--text-secondary)]
                sm:text-xs
              "
            >
              {user?.status ||
                "متصل الآن"}
            </span>
          </div>
        </div>

        {/* MORE */}

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
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            text-[var(--text-secondary)]
            transition
            active:scale-90
          "
        >
          <MoreHorizontal
            className="h-5 w-5"
          />
        </button>
      </header>

      {/* =====================================================
          MENU
      ===================================================== */}

      {menuOpen && (
        <>
          <div
            className="
              fixed
              inset-0
              z-[90]
            "
            onClick={() =>
              setMenuOpen(false)
            }
          />

          <div
            className="
              absolute
              left-3
              top-[76px]
              z-[100]
              w-[210px]
              overflow-hidden
              rounded-[20px]
              border
              border-[var(--glass-border)]
              bg-[var(--glass-bg-ultra)]
              p-1.5
              shadow-[0_20px_60px_rgba(0,0,0,0.25)]
              backdrop-blur-3xl
            "
          >

            {clearChat && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmingClear(true);
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-[15px]
                  px-3
                  py-3
                  text-right
                  text-sm
                  text-red-400
                  transition
                  hover:bg-red-500/10
                  active:scale-[0.98]
                "
              >
                <Trash2
                  className="h-5 w-5"
                />

                <span>
                  مسح المحادثة
                </span>
              </button>
            )}

          </div>
        </>
      )}

      {/* =====================================================
          CLEAR CONFIRMATION
      ===================================================== */}

      {confirmingClear && (
        <>
          <div
            className="
              absolute
              inset-0
              z-[150]
              bg-black/20
              backdrop-blur-[2px]
            "
            onClick={() =>
              setConfirmingClear(false)
            }
          />

          <div
            className="
              absolute
              left-1/2
              top-1/2
              z-[200]
              w-[calc(100%-32px)]
              max-w-[340px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-[24px]
              border
              border-[var(--glass-border)]
              bg-[var(--glass-bg-ultra)]
              p-5
              shadow-[0_30px_100px_rgba(0,0,0,0.35)]
              backdrop-blur-3xl
            "
          >

            <div
              className="
                flex
                items-start
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500/10
                  text-red-400
                "
              >
                <Trash2
                  className="h-5 w-5"
                />
              </div>

              <div
                className="
                  min-w-0
                  flex-1
                "
              >
                <h3
                  className="
                    font-bold
                    text-[var(--text-primary)]
                  "
                >
                  مسح المحادثة؟
                </h3>

                <p
                  className="
                    mt-1.5
                    text-xs
                    leading-5
                    text-[var(--text-secondary)]
                  "
                >
                  ستختفي الرسائل القديمة
                  من محادثتك فقط، ولن يتم
                  حذفها من الطرف الآخر.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setConfirmingClear(false)
                }
                aria-label="إغلاق"
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-[var(--text-muted)]
                  transition
                  hover:bg-[var(--glass-bg-strong)]
                "
              >
                <X
                  className="h-5 w-5"
                />
              </button>

            </div>

            <div
              className="
                mt-5
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
                  setConfirmingClear(false)
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
                  text-[var(--text-primary)]
                  transition
                  hover:bg-[var(--glass-bg-ultra)]
                  active:scale-95
                "
              >
                إلغاء
              </button>

            </div>

          </div>
        </>
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
          pb-[92px]
          pt-4
          sm:px-5
          sm:pb-[100px]
          sm:pt-5
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
                w-full
                max-w-xs
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
                  rounded-full
                  border
                  border-[var(--glass-border)]
                  bg-[var(--glass-bg-strong)]
                  text-2xl
                  font-bold
                  shadow-[0_15px_45px_rgba(0,0,0,0.10)]
                "
              >
                {user?.name?.[0]
                  ?.toUpperCase() ||
                  "U"}
              </div>

              <p
                className="
                  font-bold
                  text-[var(--text-primary)]
                "
              >
                {user?.name ||
                  "مستخدم"}
              </p>

              <p
                className="
                  mt-1.5
                  text-xs
                  leading-5
                  text-[var(--text-secondary)]
                "
              >
                ابدأ المحادثة بإرسال
                أول رسالة
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
              gap-1.5
            "
          >

            {messages.map(
              (msg, index) => {

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
                          ? "justify-start"
                          : "justify-end"
                      }
                    `}
                  >

                    <div
                      className={`
                        max-w-[78%]
                        overflow-hidden
                        rounded-[22px]
                        px-3.5
                        py-2.5
                        shadow-[0_3px_12px_rgba(0,0,0,0.06)]
                        sm:max-w-[65%]

                        ${
                          isMine
                            ? `
                              rounded-br-[7px]
                              bg-[var(--accent)]
                              text-[var(--accent-foreground)]
                            `
                            : `
                              rounded-bl-[7px]
                              border
                              border-[var(--glass-border)]
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
                              msg.imageUrl!,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                          className="
                            block
                            w-full
                            overflow-hidden
                            rounded-[16px]
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
                              object-cover
                            "
                          />
                        </button>
                      )}

                      {/* TEXT */}

                      {msg.text && (
                        <p
                          className={`
                            whitespace-pre-wrap
                            break-words
                            text-[15px]
                            leading-[1.45]
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
                        <div
                          className={`
                            mt-1
                            text-[9px]
                            ${
                              isMine
                                ? "opacity-60"
                                : "text-[var(--text-muted)]"
                            }
                          `}
                        >
                          {msg.time}
                        </div>
                      )}

                    </div>

                  </div>
                );
              }
            )}

            <div
              className="
                h-2
                shrink-0
              "
              aria-hidden="true"
            />

          </div>

        )}

      </div>

      {/* =====================================================
          INSTAGRAM DM INPUT
      ===================================================== */}

      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          z-40
          px-3
          pb-[max(8px,env(safe-area-inset-bottom))]
          pt-2
          sm:px-5
          sm:pb-4
        "
      >

        <div
          className="
            mx-auto
            flex
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
              flex
              h-[46px]
              w-[46px]
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-[var(--glass-border)]
              bg-[var(--glass-bg-strong)]
              text-[var(--text-secondary)]
              shadow-[0_5px_25px_rgba(0,0,0,0.12)]
              backdrop-blur-3xl
              transition
              hover:bg-[var(--glass-bg-ultra)]
              active:scale-90
              disabled:opacity-40
            "
          >
            <ImageIcon
              className="h-[21px] w-[21px]"
            />
          </button>

          {/* FILE */}

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
            onChange={
              handleImage
            }
          />

          {/* MESSAGE INPUT */}

          <div
            className="
              flex
              h-[46px]
              min-w-0
              flex-1
              items-center
              rounded-full
              border
              border-[var(--glass-border)]
              bg-[var(--glass-bg-strong)]
              px-1.5
              shadow-[0_5px_25px_rgba(0,0,0,0.12)]
              backdrop-blur-3xl
              backdrop-saturate-150
              transition
              focus-within:border-[var(--glass-highlight)]
              focus-within:bg-[var(--glass-bg-ultra)]
            "
          >

            <input
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              disabled={uploading}
              type="text"
              inputMode="text"
              autoComplete="off"
              placeholder={
                uploading
                  ? "جاري رفع الصورة..."
                  : "رسالة..."
              }
              className="
                min-w-0
                flex-1
                bg-transparent
                px-3
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
              onClick={
                handleSend
              }
              disabled={
                uploading ||
                !message.trim()
              }
              aria-label="إرسال"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[var(--accent)]
                text-[var(--accent-foreground)]
                shadow-[0_4px_15px_rgba(0,0,0,0.14)]
                transition
                hover:scale-105
                active:scale-90
                disabled:cursor-default
                disabled:opacity-0
                disabled:hover:scale-100
              "
            >
              <Send
                className="h-[17px] w-[17px]"
              />
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}