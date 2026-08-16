
"use client";

import type { ReplyMessage } from "@/lib/chat/messages";

type ReplyPreviewProps = {
  message: ReplyMessage | null | undefined;
  onCancel: () => void;
};

export default function ReplyPreview({
  message,
  onCancel,
}: ReplyPreviewProps) {
  if (!message) {
    return null;
  }

  const text =
    message.text?.trim() || "";

  const hasImage =
    Boolean(message.imageUrl);

  const hasVoice =
    Boolean(message.voiceUrl);

  function getPreview() {
    if (text) {
      return text;
    }

    if (hasImage && hasVoice) {
      return "📷 🎤 صورة ورسالة صوتية";
    }

    if (hasImage) {
      return "📷 صورة";
    }

    if (hasVoice) {
      return "🎤 رسالة صوتية";
    }

    return "رسالة";
  }

  return (
    <div
      dir="rtl"
      className="mb-2 flex w-full items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 px-3 py-2"
    >
      {/* Preview image / icon */}

      {hasImage ? (
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
          <img
            src={message.imageUrl!}
            alt="الصورة المقتبس منها"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-lg">
          {hasVoice ? "🎤" : "💬"}
        </div>
      )}

      {/* Text */}

      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold text-blue-400">
          الرد على رسالة
        </div>

        <div className="mt-0.5 truncate text-sm text-white/60">
          {getPreview()}
        </div>
      </div>

      {/* Cancel */}

      <button
        type="button"
        onClick={onCancel}
        aria-label="إلغاء الرد"
        title="إلغاء الرد"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-white/50 transition hover:bg-white/10 hover:text-white"
      >
        ×
      </button>
    </div>
  );
}
