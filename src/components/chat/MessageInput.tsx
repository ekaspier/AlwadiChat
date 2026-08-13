"use client";

import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  sendImageMessage,
  sendTextMessage,
  sendVoiceMessage,
} from "@/lib/chat/messages";

import { uploadImage } from "@/lib/storage";

import VoiceRecorder from "./VoiceRecorder";

type ReplyMessage = {
  id: string;
  text?: string;
  imageUrl?: string | null;
  voiceUrl?: string | null;
  userId?: string;
};

type MessageInputProps = {
  myUid: string;
  friendUid: string;

  replyTo?: ReplyMessage | null;

  onCancelReply?: () => void;

  onMessageSent?: () => void;

  disabled?: boolean;
};

const EMOJIS = [
  "😀",
  "😂",
  "🤣",
  "😍",
  "🥰",
  "😘",
  "😎",
  "🤔",
  "😢",
  "😭",
  "😡",
  "😱",
  "🤩",
  "😴",
  "🤯",
  "🥳",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "🤍",
  "🔥",
  "👍",
  "👎",
  "👏",
  "🙏",
  "💯",
  "✨",
  "🎉",
  "😂",
  "😅",
  "😉",
  "🙌",
  "💪",
  "👀",
  "💔",
  "❤️‍🔥",
];

export default function MessageInput({
  myUid,
  friendUid,
  replyTo = null,
  onCancelReply,
  onMessageSent,
  disabled = false,
}: MessageInputProps) {
  const [text, setText] = useState("");

  const [sending, setSending] =
    useState(false);

  const [showEmoji, setShowEmoji] =
    useState(false);

  const [showVoiceRecorder, setShowVoiceRecorder] =
    useState(false);

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(null);

  // =====================================================
  // IMAGE PREVIEW URL
  // =====================================================

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview(null);
      return;
    }

    const url =
      URL.createObjectURL(selectedImage);

    setImagePreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedImage]);

  // =====================================================
  // AUTO RESIZE TEXTAREA
  // =====================================================

  useEffect(() => {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";

    textarea.style.height =
      `${Math.min(
        textarea.scrollHeight,
        128
      )}px`;
  }, [text]);

  // =====================================================
  // SEND TEXT
  // =====================================================

  async function handleSendText() {
    const cleanText =
      text.trim();

    if (
      !cleanText ||
      !myUid ||
      !friendUid ||
      sending ||
      disabled
    ) {
      return;
    }

    try {
      setSending(true);

      await sendTextMessage(
        myUid,
        friendUid,
        cleanText,
        replyTo
      );

      setText("");

      onCancelReply?.();

      onMessageSent?.();
    } catch (error) {
      console.error(
        "Failed to send text message:",
        error
      );

      alert(
        "تعذر إرسال الرسالة"
      );
    } finally {
      setSending(false);
    }
  }

  // =====================================================
  // KEYBOARD
  // =====================================================

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void handleSendText();

      return;
    }
  }

  // =====================================================
  // IMAGE SELECT
  // =====================================================

  function handleImageSelect(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "الملف المحدد ليس صورة"
      );

      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        "حجم الصورة يجب أن يكون أقل من 10MB"
      );

      return;
    }

    setSelectedImage(file);

    setShowEmoji(false);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  }

  // =====================================================
  // SEND IMAGE
  // =====================================================

  async function handleSendImage() {
    if (
      !selectedImage ||
      !myUid ||
      !friendUid ||
      sending ||
      disabled
    ) {
      return;
    }

    try {
      setSending(true);

      const imageUrl =
        await uploadImage(
          selectedImage
        );

      await sendImageMessage(
        myUid,
        friendUid,
        imageUrl,
        text.trim(),
        replyTo
      );

      setSelectedImage(null);

      setText("");

      onCancelReply?.();

      onMessageSent?.();
    } catch (error) {
      console.error(
        "Failed to send image:",
        error
      );

      alert(
        "تعذر إرسال الصورة"
      );
    } finally {
      setSending(false);
    }
  }

  // =====================================================
  // CANCEL IMAGE
  // =====================================================

  function cancelImage() {
    setSelectedImage(null);
  }

  // =====================================================
  // EMOJI
  // =====================================================

  function addEmoji(
    emoji: string
  ) {
    setText(
      (current) =>
        current + emoji
    );

    setShowEmoji(false);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }

  // =====================================================
  // VOICE RECORDED
  // =====================================================

  async function handleVoiceRecorded(
    audioUrl: string,
    duration: number
  ) {
    if (
      !audioUrl ||
      !myUid ||
      !friendUid ||
      sending ||
      disabled
    ) {
      return;
    }

    try {
      setSending(true);

      await sendVoiceMessage(
        myUid,
        friendUid,
        audioUrl,
        duration,
        replyTo
      );

      setShowVoiceRecorder(
        false
      );

      onCancelReply?.();

      onMessageSent?.();
    } catch (error) {
      console.error(
        "Failed to send voice:",
        error
      );

      alert(
        "تعذر إرسال التسجيل الصوتي"
      );
    } finally {
      setSending(false);
    }
  }

  // =====================================================
  // CLOSE EMOJI WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    if (!showEmoji) {
      return;
    }

    function handleOutsideClick(
      event: MouseEvent
    ) {
      const target =
        event.target as HTMLElement;

      if (
        !target.closest(
          "[data-emoji-panel]"
        )
      ) {
        setShowEmoji(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [showEmoji]);

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="relative w-full border-t border-white/10 bg-black/30 p-3 backdrop-blur-xl">

      {/* =================================================
          REPLY PREVIEW
      ================================================= */}

      {replyTo && (
        <div className="mb-2 flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 px-3 py-2">

          <div className="h-10 w-1 rounded-full bg-blue-500" />

          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-blue-400">
              الرد على الرسالة
            </div>

            <div className="truncate text-sm text-white/70">
              {replyTo.text ||
                (replyTo.imageUrl
                  ? "📷 صورة"
                  : replyTo.voiceUrl
                  ? "🎤 رسالة صوتية"
                  : "رسالة")}
            </div>
          </div>

          <button
            type="button"
            onClick={
              onCancelReply
            }
            disabled={sending}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* =================================================
          IMAGE PREVIEW
      ================================================= */}

      {selectedImage && (
        <div className="mb-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2">

          {imagePreview && (
            <img
              src={imagePreview}
              alt="معاينة الصورة"
              className="h-16 w-16 shrink-0 rounded-xl object-cover"
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-white">
              {selectedImage.name}
            </div>

            <div className="mt-1 text-xs text-white/40">
              الصورة جاهزة للإرسال
            </div>
          </div>

          <button
            type="button"
            onClick={
              cancelImage
            }
            disabled={sending}
            className="rounded-xl px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-40"
          >
            إلغاء
          </button>
        </div>
      )}

      {/* =================================================
          EMOJI PANEL
      ================================================= */}

      {showEmoji && (
        <div
          data-emoji-panel
          className="absolute bottom-full left-3 z-50 mb-2 w-[300px] rounded-2xl border border-white/10 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-white/60">
              الإيموجي
            </span>

            <button
              type="button"
              onClick={() =>
                setShowEmoji(false)
              }
              className="text-white/40 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="grid max-h-[220px] grid-cols-8 gap-1 overflow-y-auto">
            {EMOJIS.map(
              (
                emoji,
                index
              ) => (
                <button
                  key={`${emoji}-${index}`}
                  type="button"
                  onClick={() =>
                    addEmoji(
                      emoji
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-xl transition hover:bg-white/10"
                >
                  {emoji}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* =================================================
          VOICE RECORDER
      ================================================= */}

      {showVoiceRecorder ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">

          <VoiceRecorder
            onRecorded={
              handleVoiceRecorded
            }
            onCancel={() =>
              setShowVoiceRecorder(
                false
              )
            }
          />

        </div>
      ) : (
        <div className="flex items-end gap-2">

          {/* =================================================
              EMOJI
          ================================================= */}

          <button
            type="button"
            disabled={
              disabled ||
              sending
            }
            onClick={() =>
              setShowEmoji(
                (value) =>
                  !value
              )
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            title="إيموجي"
          >
            😊
          </button>

          {/* =================================================
              IMAGE
          ================================================= */}

          <button
            type="button"
            disabled={
              disabled ||
              sending
            }
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            title="إرسال صورة"
          >
            📷
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={
              handleImageSelect
            }
            className="hidden"
          />

          {/* =================================================
              TEXT
          ================================================= */}

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(event) =>
              setText(
                event.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            disabled={
              disabled ||
              sending
            }
            rows={1}
            placeholder="اكتب رسالة..."
            className="max-h-32 min-h-11 flex-1 resize-none overflow-y-auto rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-5 text-white outline-none placeholder:text-white/30 transition focus:border-blue-500/40 focus:bg-white/[0.07]"
          />

          {/* =================================================
              SEND IMAGE
          ================================================= */}

          {selectedImage ? (
            <button
              type="button"
              disabled={
                disabled ||
                sending
              }
              onClick={() =>
                void handleSendImage()
              }
              className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 px-4 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              title="إرسال الصورة"
            >
              {sending
                ? "..."
                : "➤"}
            </button>
          ) : text.trim() ? (
            /* =================================================
               SEND TEXT
            ================================================= */

            <button
              type="button"
              disabled={
                disabled ||
                sending
              }
              onClick={() =>
                void handleSendText()
              }
              className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 px-4 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              title="إرسال"
            >
              {sending
                ? "..."
                : "➤"}
            </button>
          ) : (
            /* =================================================
               VOICE
            ================================================= */

            <button
              type="button"
              disabled={
                disabled ||
                sending
              }
              onClick={() =>
                setShowVoiceRecorder(
                  true
                )
              }
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              title="رسالة صوتية"
            >
              🎤
            </button>
          )}

        </div>
      )}
    </div>
  );
}