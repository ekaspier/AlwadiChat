"use client";

import { useEffect, useState } from "react";

type ImagePreviewProps = {
  file?: File | null;
  imageUrl?: string | null;

  onCancel?: () => void;
  onSend?: () => void;

  sending?: boolean;
  disabled?: boolean;

  caption?: string;
  onCaptionChange?: (
    caption: string
  ) => void;
};

export default function ImagePreview({
  file = null,
  imageUrl = null,
  onCancel,
  onSend,
  sending = false,
  disabled = false,
  caption = "",
  onCaptionChange,
}: ImagePreviewProps) {
  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  // =====================================================
  // CREATE LOCAL PREVIEW
  // =====================================================

  useEffect(() => {
    if (!file) {
      setPreviewUrl(
        imageUrl || null
      );

      return;
    }

    const url =
      URL.createObjectURL(file);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, imageUrl]);

  // =====================================================
  // NOTHING TO PREVIEW
  // =====================================================

  if (!previewUrl) {
    return null;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">

      {/* BACKDROP */}

      <button
        type="button"
        aria-label="إغلاق"
        onClick={() => {
          if (!sending) {
            onCancel?.();
          }
        }}
        className="absolute inset-0 cursor-default"
      />

      {/* PREVIEW CARD */}

      <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">

          <div>
            <h2 className="text-sm font-semibold text-white">
              معاينة الصورة
            </h2>

            {file && (
              <p className="mt-0.5 max-w-[280px] truncate text-xs text-white/40">
                {file.name}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={sending}
            onClick={() =>
              onCancel?.()
            }
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-white/50 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            ×
          </button>

        </div>

        {/* IMAGE */}

        <div className="flex max-h-[65vh] min-h-[240px] items-center justify-center bg-black p-3">

          <img
            src={previewUrl}
            alt="معاينة الصورة"
            className="max-h-[60vh] max-w-full rounded-2xl object-contain"
          />

        </div>

        {/* CAPTION */}

        {onCaptionChange && (
          <div className="border-t border-white/10 p-3">

            <textarea
              value={caption}
              onChange={(event) =>
                onCaptionChange(
                  event.target.value
                )
              }
              disabled={
                disabled ||
                sending
              }
              rows={2}
              placeholder="أضف تعليقاً للصورة..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-500/40"
            />

          </div>
        )}

        {/* ACTIONS */}

        <div className="flex items-center gap-2 border-t border-white/10 p-3">

          <button
            type="button"
            disabled={sending}
            onClick={() =>
              onCancel?.()
            }
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
          >
            إلغاء
          </button>

          {onSend && (
            <button
              type="button"
              disabled={
                disabled ||
                sending
              }
              onClick={() =>
                onSend()
              }
              className="flex flex-1 items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending
                ? "جاري الإرسال..."
                : "إرسال الصورة ➤"}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}