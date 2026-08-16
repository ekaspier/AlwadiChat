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

export default function MessageInput({
  myUid,
  friendUid,
  replyTo = null,
  onCancelReply,
  onMessageSent,
  disabled = false,
}: MessageInputProps) {
  const [text, setText] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [showEmoji, setShowEmoji] =
    useState(false);

  const [
    showVoiceRecorder,
    setShowVoiceRecorder,
  ] = useState(false);

  const [
    selectedImage,
    setSelectedImage,
  ] = useState<File | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  // =====================================================
  // EMOJIS
  // =====================================================

  const emojis = [
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
    "❤️",
    "🔥",
    "👍",
    "👎",
    "👏",
    "🙏",
    "🎉",
    "💯",
    "✨",
    "⭐",
    "🥳",
    "😴",
    "🤝",
    "❤️‍🔥",
    "🚀",
    "💀",
    "😈",
    "🤍",
  ];

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
      sending
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
      setShowEmoji(false);

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

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      alert(
        "حجم الصورة يجب أن يكون أقل من 10MB"
      );

      return;
    }

    setSelectedImage(file);

    event.target.value = "";
  }

  // =====================================================
  // SEND IMAGE
  // =====================================================

  async function handleSendImage() {
    if (
      !selectedImage ||
      !myUid ||
      !friendUid ||
      sending
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
      setShowEmoji(false);

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
      sending
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

      setShowVoiceRecorder(false);

      onCancelReply?.();
      onMessageSent?.();
    } catch (error) {
      console.error(
        "Failed to send voice message:",
        error
      );

      alert(
        "تعذر إرسال الرسالة الصوتية"
      );
    } finally {
      setSending(false);
    }
  }

  // =====================================================
  // OPEN VOICE
  // =====================================================

  function openVoiceRecorder() {
    setShowEmoji(false);
    setShowVoiceRecorder(true);
  }

  // =====================================================
  // CLOSE VOICE
  // =====================================================

  function closeVoiceRecorder() {
    setShowVoiceRecorder(false);
  }

  // =====================================================
  // IMAGE PREVIEW URL
  // =====================================================

  const [
    imagePreviewUrl,
    setImagePreviewUrl,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!selectedImage) {
      setImagePreviewUrl(null);
      return;
    }

    const url =
      URL.createObjectURL(
        selectedImage
      );

    setImagePreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedImage]);

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      dir="rtl"
      className="
        relative
        w-full
        border-t
        border-white/10
        bg-black/30
        p-3
        backdrop-blur-xl
      "
    >
      {/* REPLY PREVIEW */}

      {replyTo && (
        <div
          className="
            mb-2
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-3
          "
        >
          <div
            className="
              h-10
              w-1
              rounded-full
              bg-blue-500
            "
          />

          <div className="min-w-0 flex-1">
            <div
              className="
                text-xs
                font-semibold
                text-blue-400
              "
            >
              الرد على رسالة
            </div>

            <div
              className="
                mt-1
                truncate
                text-sm
                text-white/60
              "
            >
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
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              text-lg
              text-white/50
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            ×
          </button>
        </div>
      )}

      {/* IMAGE PREVIEW */}

      {selectedImage && (
        <div
          className="
            mb-2
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-2
          "
        >
          {imagePreviewUrl && (
            <img
              src={imagePreviewUrl}
              alt="معاينة الصورة"
              className="
                h-16
                w-16
                rounded-xl
                object-cover
              "
            />
          )}

          <div className="min-w-0 flex-1">
            <div
              className="
                truncate
                text-sm
                text-white
              "
            >
              {selectedImage.name}
            </div>

            <div
              className="
                mt-1
                text-xs
                text-white/40
              "
            >
              {(
                selectedImage.size /
                1024 /
                1024
              ).toFixed(2)}{" "}
              MB
            </div>
          </div>

          <button
            type="button"
            onClick={
              cancelImage
            }
            disabled={sending}
            className="
              rounded-xl
              px-3
              py-2
              text-sm
              text-red-400
              transition
              hover:bg-red-500/10
              disabled:opacity-40
            "
          >
            إلغاء
          </button>
        </div>
      )}

      {/* EMOJI PANEL */}

      {showEmoji &&
        !showVoiceRecorder && (
          <div
            className="
              absolute
              bottom-full
              right-3
              mb-2
              w-[300px]
              max-w-[calc(100vw-24px)]
              rounded-2xl
              border
              border-white/10
              bg-zinc-950/95
              p-3
              shadow-2xl
              backdrop-blur-2xl
            "
          >
            <div
              className="
                mb-2
                flex
                items-center
                justify-between
              "
            >
              <span
                className="
                  text-xs
                  font-semibold
                  text-white/50
                "
              >
                الإيموجي
              </span>

              <button
                type="button"
                onClick={() =>
                  setShowEmoji(false)
                }
                className="
                  text-sm
                  text-white/40
                  hover:text-white
                "
              >
                ×
              </button>
            </div>

            <div
              className="
                grid
                grid-cols-8
                gap-1
              "
            >
              {emojis.map(
                (emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    disabled={
                      disabled ||
                      sending
                    }
                    onClick={() =>
                      addEmoji(
                        emoji
                      )
                    }
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      text-lg
                      transition
                      hover:scale-110
                      hover:bg-white/10
                      disabled:opacity-30
                    "
                  >
                    {emoji}
                  </button>
                )
              )}
            </div>
          </div>
        )}

      {/* VOICE RECORDER */}

      {showVoiceRecorder ? (
        <div
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-3
          "
        >
          <VoiceRecorder
            onRecorded={
              handleVoiceRecorded
            }
            onCancel={
              closeVoiceRecorder
            }
          />
        </div>
      ) : (
        <div
          className="
            flex
            items-end
            gap-2
          "
        >
          {/* EMOJI */}

          <button
            type="button"
            disabled={
              disabled ||
              sending
            }
            onClick={() =>
              setShowEmoji(
                (current) =>
                  !current
              )
            }
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              text-xl
              text-white/60
              transition
              hover:bg-white/10
              hover:text-white
              disabled:opacity-30
            "
            title="إيموجي"
          >
            😊
          </button>

          {/* IMAGE */}

          <button
            type="button"
            disabled={
              disabled ||
              sending
            }
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              text-xl
              text-white/60
              transition
              hover:bg-white/10
              hover:text-white
              disabled:opacity-30
            "
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

          {/* TEXT */}

          <textarea
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
            className="
              max-h-32
              min-h-11
              flex-1
              resize-none
              rounded-2xl
              border
              border-white/10
              bg-white/5
              px-4
              py-3
              text-sm
              text-white
              outline-none
              transition
              placeholder:text-white/30
              focus:border-blue-500/40
              focus:bg-white/[0.07]
            "
          />

          {/* SEND */}

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
              className="
                flex
                h-11
                min-w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-blue-600
                px-4
                text-white
                transition
                hover:bg-blue-500
                disabled:opacity-40
              "
              title="إرسال الصورة"
            >
              {sending
                ? "..."
                : "➤"}
            </button>
          ) : text.trim() ? (
            <button
              type="button"
              disabled={
                disabled ||
                sending
              }
              onClick={() =>
                void handleSendText()
              }
              className="
                flex
                h-11
                min-w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-blue-600
                px-4
                text-white
                transition
                hover:bg-blue-500
                disabled:opacity-40
              "
              title="إرسال"
            >
              {sending
                ? "..."
                : "➤"}
            </button>
          ) : (
            <button
              type="button"
              disabled={
                disabled ||
                sending
              }
              onClick={
                openVoiceRecorder
              }
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                text-xl
                text-white/60
                transition
                hover:bg-white/10
                hover:text-white
                disabled:opacity-30
              "
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