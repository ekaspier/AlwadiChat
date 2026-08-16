"use client";

import { useEffect, useRef } from "react";

import type {
  ChatMessage,
  ReplyMessage,
} from "@/lib/chat/messages";

type MessageContextMenuProps = {
  message: ChatMessage;

  x: number;
  y: number;

  isMine: boolean;

  onClose: () => void;

  onReply?: (
    message: ReplyMessage
  ) => void;

  onEdit?: (
    message: ChatMessage
  ) => void;

  onDelete?: (
    message: ChatMessage
  ) => void;

  onPermanentDelete?: (
    message: ChatMessage
  ) => void;

  onReaction?: (
    message: ChatMessage,
    emoji: string
  ) => void;

  onCopy?: (
    message: ChatMessage
  ) => void;
};

const reactions = [
  "❤️",
  "😂",
  "👍",
  "😮",
  "😢",
  "😡",
];

export default function MessageContextMenu({
  message,
  x,
  y,
  isMine,
  onClose,
  onReply,
  onEdit,
  onDelete,
  onPermanentDelete,
  onReaction,
  onCopy,
}: MessageContextMenuProps) {
  const menuRef =
    useRef<HTMLDivElement | null>(null);

  // =====================================================
  // CLOSE WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
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
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [onClose]);

  // =====================================================
  // CLOSE ESC
  // =====================================================

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
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
  // KEEP MENU INSIDE SCREEN
  // =====================================================

  const menuWidth = 230;
  const menuHeight = 360;

  const safeX = Math.min(
    Math.max(
      8,
      x
    ),
    window.innerWidth -
      menuWidth -
      8
  );

  const safeY = Math.min(
    Math.max(
      8,
      y
    ),
    window.innerHeight -
      menuHeight -
      8
  );

  // =====================================================
  // REPLY
  // =====================================================

  function handleReply() {
    onReply?.({
      id: message.id,
      text: message.text,
      imageUrl:
        message.imageUrl,
      voiceUrl:
        message.voiceUrl,
      userId:
        message.userId,
    });

    onClose();
  }

  // =====================================================
  // EDIT
  // =====================================================

  function handleEdit() {
    if (!isMine) {
      return;
    }

    if (message.deleted) {
      return;
    }

    onEdit?.(message);

    onClose();
  }

  // =====================================================
  // DELETE
  // =====================================================

  function handleDelete() {
    if (!isMine) {
      return;
    }

    if (message.deleted) {
      return;
    }

    onDelete?.(message);

    onClose();
  }

  // =====================================================
  // PERMANENT DELETE
  // =====================================================

  function handlePermanentDelete() {
    if (!isMine) {
      return;
    }

    onPermanentDelete?.(
      message
    );

    onClose();
  }

  // =====================================================
  // COPY
  // =====================================================

  async function handleCopy() {
    if (
      !message.text ||
      message.deleted
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        message.text
      );

      onCopy?.(message);
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }

    onClose();
  }

  // =====================================================
  // REACTION
  // =====================================================

  function handleReaction(
    emoji: string
  ) {
    onReaction?.(
      message,
      emoji
    );

    onClose();
  }

  // =====================================================
  // MENU ITEM
  // =====================================================

  function MenuItem({
    icon,
    label,
    onClick,
    danger = false,
    disabled = false,
  }: {
    icon: string;
    label: string;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
  }) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-sm transition ${
          disabled
            ? "cursor-not-allowed opacity-30"
            : danger
            ? "text-red-400 hover:bg-red-500/10"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-base">
          {icon}
        </span>

        <span>
          {label}
        </span>
      </button>
    );
  }

  return (
    <>
      {/* =================================================
          BACKDROP
      ================================================= */}

      <div
        className="fixed inset-0 z-[9998]"
        onContextMenu={(event) => {
          event.preventDefault();
          onClose();
        }}
      />

      {/* =================================================
          MENU
      ================================================= */}

      <div
        ref={menuRef}
        dir="rtl"
        className="fixed z-[9999] w-[230px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-2xl"
        style={{
          left: safeX,
          top: safeY,
        }}
      >
        {/* =================================================
            REACTIONS
        ================================================= */}

        <div className="mb-2 rounded-xl border border-white/5 bg-white/[0.03] p-2">
          <div className="mb-2 px-1 text-[10px] font-semibold text-white/40">
            تفاعل
          </div>

          <div className="flex items-center justify-between gap-1">
            {reactions.map(
              (emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() =>
                    handleReaction(
                      emoji
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-lg transition hover:scale-110 hover:bg-white/10"
                >
                  {emoji}
                </button>
              )
            )}
          </div>
        </div>

        {/* =================================================
            REPLY
        ================================================= */}

        <MenuItem
          icon="↩️"
          label="الرد"
          onClick={
            handleReply
          }
        />

        {/* =================================================
            COPY
        ================================================= */}

        <MenuItem
          icon="📋"
          label="نسخ النص"
          onClick={
            handleCopy
          }
          disabled={
            !message.text ||
            message.deleted
          }
        />

        {/* =================================================
            EDIT
        ================================================= */}

        {isMine && (
          <MenuItem
            icon="✏️"
            label="تعديل الرسالة"
            onClick={
              handleEdit
            }
            disabled={
              message.deleted ||
              message.type !==
                "text"
            }
          />
        )}

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div className="my-2 h-px bg-white/10" />

        {/* =================================================
            DELETE
        ================================================= */}

        {isMine && (
          <MenuItem
            icon="🗑️"
            label="حذف الرسالة"
            onClick={
              handleDelete
            }
            danger
            disabled={
              message.deleted
            }
          />
        )}

        {/* =================================================
            PERMANENT DELETE
        ================================================= */}

        {isMine && (
          <MenuItem
            icon="❌"
            label="حذف نهائي"
            onClick={
              handlePermanentDelete
            }
            danger
          />
        )}

        {/* =================================================
            CLOSE
        ================================================= */}

        <MenuItem
          icon="✕"
          label="إلغاء"
          onClick={onClose}
        />
      </div>
    </>
  );
}