"use client";

import { useEffect, useRef, useState } from "react";

type EmojiPickerProps = {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
};

const EMOJI_CATEGORIES = {
  "😀 وجوه": [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "🤯",
    "😳",
    "🥵",
    "🥶",
    "😱",
    "😨",
    "😰",
    "😥",
    "😓",
    "🤗",
    "🤔",
    "🫣",
    "🤭",
    "🤫",
    "🤥",
    "😶",
    "😐",
    "😑",
    "😬",
    "🙄",
    "😯",
    "😦",
    "😧",
    "😮",
    "😲",
    "🥱",
    "😴",
    "🤤",
    "😪",
    "😵",
    "🤐",
    "🥴",
    "🤢",
    "🤮",
    "🤧",
    "😷",
    "🤒",
    "🤕",
  ],

  "❤️ رموز": [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "❤️‍🔥",
    "❤️‍🩹",
    "💯",
    "💢",
    "💥",
    "💫",
    "💦",
    "💨",
    "💬",
    "💭",
    "🔥",
    "✨",
    "⭐",
    "🌟",
    "💎",
    "🎉",
    "🎊",
    "✅",
    "❌",
    "⭕",
    "⚡",
    "💡",
    "🔔",
    "🔕",
    "🔒",
    "🔓",
  ],

  "👍 إيماءات": [
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "👇",
    "☝️",
    "✋",
    "🤚",
    "🖐️",
    "🖖",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤝",
    "🙏",
    "💪",
    "👊",
    "✊",
    "🤛",
    "🤜",
    "👋",
    "🤏",
    "✍️",
    "💅",
    "👀",
    "👁️",
    "🧠",
    "👂",
    "👃",
    "👄",
  ],

  "🐶 حيوانات": [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🙈",
    "🙉",
    "🙊",
    "🐒",
    "🐔",
    "🐧",
    "🐦",
    "🐤",
    "🦆",
    "🦅",
    "🦉",
    "🐺",
    "🐗",
    "🐴",
    "🦄",
    "🐝",
    "🐛",
    "🦋",
    "🐌",
    "🐞",
    "🐜",
    "🕷️",
    "🐢",
    "🐍",
    "🦎",
    "🦖",
    "🐙",
    "🦑",
    "🦀",
    "🐠",
    "🐟",
    "🐡",
    "🐬",
    "🐳",
    "🦈",
    "🐊",
  ],

  "🍔 طعام": [
    "🍎",
    "🍐",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🫐",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🥑",
    "🍆",
    "🥔",
    "🥕",
    "🌽",
    "🌶️",
    "🥒",
    "🥬",
    "🥦",
    "🧄",
    "🧅",
    "🍞",
    "🥐",
    "🥖",
    "🧀",
    "🥚",
    "🍳",
    "🥞",
    "🧇",
    "🥓",
    "🍔",
    "🍟",
    "🍕",
    "🌭",
    "🌮",
    "🌯",
    "🥗",
    "🍿",
    "🍩",
    "🍪",
    "🎂",
    "🍰",
    "🍫",
    "🍭",
    "🍬",
    "🍦",
    "☕",
    "🧃",
    "🥤",
  ],

  "⚽ رياضة": [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🥎",
    "🎾",
    "🏐",
    "🏉",
    "🥏",
    "🎱",
    "🏓",
    "🏸",
    "🏒",
    "🏑",
    "🥍",
    "🏏",
    "🥊",
    "🥋",
    "⛳",
    "🏹",
    "🎣",
    "🤿",
    "🏆",
    "🥇",
    "🥈",
    "🥉",
    "🏅",
    "🎮",
    "🎯",
    "🎲",
    "🎸",
    "🎹",
    "🥁",
    "🎤",
    "🎧",
  ],

  "🚗 سفر": [
    "🚗",
    "🚕",
    "🚙",
    "🚌",
    "🚎",
    "🏎️",
    "🚓",
    "🚑",
    "🚒",
    "🚐",
    "🚚",
    "🚛",
    "🚜",
    "🏍️",
    "🚲",
    "✈️",
    "🚀",
    "🛸",
    "🚁",
    "🚢",
    "⛵",
    "🚂",
    "🚆",
    "🚇",
    "🚉",
    "🏠",
    "🏢",
    "🏥",
    "🏦",
    "🏫",
    "🗼",
    "🗽",
    "🕌",
    "⛪",
    "🕋",
    "🌍",
    "🌎",
    "🌏",
    "🌙",
    "☀️",
    "⭐",
    "🌈",
  ],
} as const;

type CategoryName = keyof typeof EMOJI_CATEGORIES;

export default function EmojiPicker({
  onSelect,
  onClose,
}: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] =
    useState<CategoryName>("😀 وجوه");

  const pickerRef =
    useRef<HTMLDivElement | null>(null);

  // =========================================================
  // إغلاق الـ Picker عند الضغط خارجه
  // =========================================================

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(
          event.target as Node
        )
      ) {
        onClose?.();
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

  // =========================================================
  // إغلاق عند الضغط على Escape
  // =========================================================

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onClose]);

  // =========================================================
  // اختيار Emoji
  // =========================================================

  function handleEmojiClick(
    emoji: string
  ) {
    onSelect(emoji);
  }

  const categories =
    Object.keys(
      EMOJI_CATEGORIES
    ) as CategoryName[];

  const emojis =
    EMOJI_CATEGORIES[
      activeCategory
    ];

  return (
    <div
      ref={pickerRef}
      dir="rtl"
      className="
        absolute
        bottom-[calc(100%+12px)]
        right-0
        z-50
        w-[340px]
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-[#151515]/95
        shadow-2xl
        backdrop-blur-2xl
        animate-in
        fade-in
        zoom-in-95
        duration-150
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-white/10
          px-4
          py-3
        "
      >
        <div>
          <h3
            className="
              text-sm
              font-semibold
              text-white
            "
          >
            الإيموجي
          </h3>

          <p
            className="
              mt-0.5
              text-[11px]
              text-white/40
            "
          >
            اختر إيموجي لإضافته للرسالة
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            onClose?.()
          }
          aria-label="إغلاق"
          className="
            flex
            h-8
            w-8
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

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <div
        className="
          flex
          gap-1
          overflow-x-auto
          border-b
          border-white/10
          px-2
          py-2
          scrollbar-none
        "
      >
        {categories.map(
          (category) => {
            const icon =
              category.split(
                " "
              )[0];

            return (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setActiveCategory(
                    category
                  )
                }
                title={category}
                className={`
                  flex
                  h-9
                  min-w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-lg
                  transition
                  ${
                    activeCategory ===
                    category
                      ? "bg-white/15 scale-105"
                      : "hover:bg-white/10"
                  }
                `}
              >
                {icon}
              </button>
            );
          }
        )}
      </div>

      {/* =====================================================
          EMOJI GRID
      ===================================================== */}

      <div
        className="
          h-[280px]
          overflow-y-auto
          p-3
          scrollbar-thin
        "
      >
        <div
          className="
            mb-2
            text-xs
            font-medium
            text-white/40
          "
        >
          {activeCategory}
        </div>

        <div
          className="
            grid
            grid-cols-8
            gap-1
          "
        >
          {emojis.map(
            (emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                type="button"
                onClick={() =>
                  handleEmojiClick(
                    emoji
                  )
                }
                aria-label={`إضافة ${emoji}`}
                className="
                  flex
                  aspect-square
                  items-center
                  justify-center
                  rounded-lg
                  text-[25px]
                  transition
                  hover:scale-125
                  hover:bg-white/10
                  active:scale-95
                "
              >
                {emoji}
              </button>
            )
          )}
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div
        className="
          border-t
          border-white/10
          px-3
          py-2
          text-center
          text-[10px]
          text-white/30
        "
      >
        اضغط على أي إيموجي لإضافته إلى الرسالة
      </div>
    </div>
  );
}