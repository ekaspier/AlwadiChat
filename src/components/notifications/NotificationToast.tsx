
"use client";

import {
  useEffect,
} from "react";

export type NotificationType =
  | "message"
  | "friend"
  | "success"
  | "error"
  | "info";

export type NotificationToastData = {
  id?: string;

  type?: NotificationType;

  title: string;

  message?: string;

  duration?: number;
};

type NotificationToastProps = {
  notification:
    | NotificationToastData
    | null
    | undefined;

  onClose: () => void;
};

export default function NotificationToast({
  notification,
  onClose,
}: NotificationToastProps) {
  useEffect(() => {
    if (!notification) {
      return;
    }

    const duration =
      notification.duration ??
      4000;

    if (duration <= 0) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        onClose();
      }, duration);

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    notification,
    onClose,
  ]);

  if (!notification) {
    return null;
  }

  const type =
    notification.type ??
    "info";

  const icon =
    type === "message"
      ? "💬"
      : type === "friend"
      ? "👤"
      : type === "success"
      ? "✓"
      : type === "error"
      ? "!"
      : "ⓘ";

  const accentClass =
    type === "message"
      ? "border-blue-500/30"
      : type === "friend"
      ? "border-purple-500/30"
      : type === "success"
      ? "border-emerald-500/30"
      : type === "error"
      ? "border-red-500/30"
      : "border-white/10";

  const iconClass =
    type === "message"
      ? "bg-blue-500/15 text-blue-400"
      : type === "friend"
      ? "bg-purple-500/15 text-purple-400"
      : type === "success"
      ? "bg-emerald-500/15 text-emerald-400"
      : type === "error"
      ? "bg-red-500/15 text-red-400"
      : "bg-white/10 text-white/60";

  return (
    <div
      dir="rtl"
      role="status"
      aria-live="polite"
      className={`pointer-events-auto flex w-[min(380px,calc(100vw-32px))] items-start gap-3 rounded-2xl border bg-zinc-950/90 p-3 text-white shadow-2xl backdrop-blur-xl ${accentClass}`}
    >
      {/* ICON */}

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${iconClass}`}
      >
        {icon}
      </div>

      {/* CONTENT */}

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-white">
          {notification.title}
        </div>

        {notification.message && (
          <div className="mt-1 line-clamp-2 text-xs leading-5 text-white/55">
            {notification.message}
          </div>
        )}
      </div>

      {/* CLOSE */}

      <button
        type="button"
        onClick={onClose}
        aria-label="إغلاق الإشعار"
        title="إغلاق"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-white/40 transition hover:bg-white/10 hover:text-white"
      >
        ×
      </button>
    </div>
  );
}
