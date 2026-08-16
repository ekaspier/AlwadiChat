"use client";

import { useEffect, useRef } from "react";

export type MessageAction =
  | "reply"
  | "edit"
  | "copy"
  | "delete"
  | "permanentDelete"
  | "react";

type MessageActionsMenuProps = {
  messageId: string;

  isOwnMessage: boolean;
  isDeleted?: boolean;

  x: number;
  y: number;

  onClose: () => void;

  onReply?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onPermanentDelete?: () => void;
  onReact?: () => void;
};

type MenuItemProps = {
  label: string;
  icon: string;

  danger?: boolean;

  disabled?: boolean;

  onClick: () => void;
};

function MenuItem({
  label,
  icon,
  danger = false,
  disabled = false,
  onClick,
}: MenuItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
        "text-right text-sm transition",
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-white/80 hover:bg-white/10 hover:text-white",
        disabled
          ? "cursor-not-allowed opacity-30"
          : "",
      ].join(" ")}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center text-base">
        {icon}
      </span>

      <span className="flex-1">
        {label}
      </span>
    </button>
  );
}

export default function MessageActionsMenu({
  messageId,
  isOwnMessage,
  isDeleted = false,

  x,
  y,

  onClose,

  onReply,
  onEdit,
  onCopy,
  onDelete,
  onPermanentDelete,
  onReact,
}: MessageActionsMenuProps) {
  const menuRef =
    useRef<HTMLDivElement | null>(
      null
    );

  // =====================================================
  // CLOSE WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    function handlePointerDown(
      event: PointerEvent
    ) {
      const target =
        event.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(
          target
        )
      ) {
        onClose();
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, [onClose]);

  // =====================================================
  // ESC
  // =====================================================

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  // =====================================================
  // ACTION WRAPPER
  // =====================================================

  function execute(
    action?: () => void
  ) {
    onClose();

    if (action) {
      action();
    }
  }

  // =====================================================
  // POSITION
  // =====================================================

  const menuWidth = 220;
  const menuHeight = isOwnMessage
    ? 360
    : 230;

  const padding = 12;

  const viewportWidth =
    typeof window !== "undefined"
      ? window.innerWidth
      : 1280;

  const viewportHeight =
    typeof window !== "undefined"
      ? window.innerHeight
      : 720;

  let left = x;
  let top = y;

  if (
    left + menuWidth >
    viewportWidth - padding
  ) {
    left =
      viewportWidth -
      menuWidth -
      padding;
  }

  if (left < padding) {
    left = padding;
  }

  if (
    top + menuHeight >
    viewportHeight - padding
  ) {
    top =
      viewportHeight -
      menuHeight -
      padding;
  }

  if (top < padding) {
    top = padding;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      ref={menuRef}
      className="fixed z-[200] w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-2xl"
      style={{
        left,
        top,
      }}
      data-message-id={
        messageId
      }
    >
      {/* HEADER */}

      <div className="px-3 pb-2 pt-1">
        <div className="text-[11px] font-medium text-white/30">
          إجراءات الرسالة
        </div>
      </div>

      {/* REPLY */}

      {onReply && (
        <MenuItem
          label="الرد"
          icon="↩️"
          disabled={false}
          onClick={() =>
            execute(onReply)
          }
        />
      )}

      {/* REACTION */}

      {onReact && !isDeleted && (
        <MenuItem
          label="إضافة تفاعل"
          icon="❤️"
          onClick={() =>
            execute(onReact)
          }
        />
      )}

      {/* COPY */}

      {onCopy && !isDeleted && (
        <MenuItem
          label="نسخ الرسالة"
          icon="📋"
          onClick={() =>
            execute(onCopy)
          }
        />
      )}

      {/* EDIT */}

      {isOwnMessage &&
        !isDeleted &&
        onEdit && (
          <MenuItem
            label="تعديل"
            icon="✏️"
            onClick={() =>
              execute(onEdit)
            }
          />
        )}

      {/* SEPARATOR */}

      {isOwnMessage &&
        !isDeleted &&
        onDelete && (
          <div className="my-1 border-t border-white/10" />
        )}

      {/* SOFT DELETE */}

      {isOwnMessage &&
        !isDeleted &&
        onDelete && (
          <MenuItem
            label="حذف الرسالة"
            icon="🗑️"
            danger
            onClick={() =>
              execute(onDelete)
            }
          />
        )}

      {/* PERMANENT DELETE */}

      {isOwnMessage &&
        onPermanentDelete && (
          <MenuItem
            label="حذف نهائي"
            icon="⚠️"
            danger
            onClick={() => {
              const confirmed =
                window.confirm(
                  "هل أنت متأكد من حذف الرسالة نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
                );

              if (
                !confirmed
              ) {
                return;
              }

              execute(
                onPermanentDelete
              );
            }}
          />
        )}

      {/* DELETED MESSAGE */}

      {isDeleted && (
        <div className="px-3 py-2 text-xs leading-5 text-white/30">
          هذه الرسالة محذوفة.
        </div>
      )}
    </div>
  );
}