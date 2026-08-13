"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

export type ChatSearchMessage = {
  id: string;
  text?: string | null;
  userId?: string;
  imageUrl?: string | null;
  voiceUrl?: string | null;
  deleted?: boolean;
};

type ChatSearchProps = {
  messages?: ChatSearchMessage[];

  onResultClick?: (
    messageId: string
  ) => void;

  placeholder?: string;

  className?: string;

  autoFocus?: boolean;
};

export default function ChatSearch({
  messages = [],
  onResultClick,
  placeholder = "البحث في المحادثة...",
  className = "",
  autoFocus = false,
}: ChatSearchProps) {
  const [search, setSearch] =
    useState("");

  const [
    currentResult,
    setCurrentResult,
  ] = useState(0);

  // =========================================================
  // SEARCH RESULTS
  // =========================================================

  const results = useMemo(() => {
    const value =
      search.trim().toLocaleLowerCase();

    if (!value) {
      return [];
    }

    return messages.filter(
      (message) => {
        if (
          message.deleted
        ) {
          return false;
        }

        const text =
          message.text
            ?.toLocaleLowerCase() ??
          "";

        return text.includes(value);
      }
    );
  }, [messages, search]);

  // =========================================================
  // RESET RESULT INDEX
  // =========================================================

  useEffect(() => {
    setCurrentResult(0);
  }, [search]);

  // =========================================================
  // SCROLL TO RESULT
  // =========================================================

  useEffect(() => {
    if (
      results.length === 0
    ) {
      return;
    }

    const message =
      results[currentResult];

    if (!message) {
      return;
    }

    onResultClick?.(
      message.id
    );
  }, [
    currentResult,
    results,
    onResultClick,
  ]);

  // =========================================================
  // NEXT RESULT
  // =========================================================

  const nextResult = () => {
    if (
      results.length === 0
    ) {
      return;
    }

    setCurrentResult(
      (current) =>
        (current + 1) %
        results.length
    );
  };

  // =========================================================
  // PREVIOUS RESULT
  // =========================================================

  const previousResult = () => {
    if (
      results.length === 0
    ) {
      return;
    }

    setCurrentResult(
      (current) =>
        (current - 1 +
          results.length) %
        results.length
    );
  };

  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  const clearSearch = () => {
    setSearch("");
    setCurrentResult(0);
  };

  // =========================================================
  // KEYBOARD
  // =========================================================

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Enter"
    ) {
      if (
        event.shiftKey
      ) {
        previousResult();
      } else {
        nextResult();
      }

      return;
    }

    if (
      event.key === "Escape"
    ) {
      clearSearch();
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className={[
        "relative w-full",
        className,
      ].join(" ")}
      dir="rtl"
    >
      <div
        className="
          flex
          items-center
          gap-2
          rounded-2xl
          border
          border-white/10
          bg-white/[0.06]
          px-3
          py-2
          backdrop-blur-xl
          transition
          focus-within:border-white/20
          focus-within:bg-white/[0.09]
        "
      >
        {/* SEARCH ICON */}

        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="
            shrink-0
            text-white/50
          "
        >
          <circle
            cx="11"
            cy="11"
            r="7"
          />

          <path
            d="m20 20-3.5-3.5"
          />
        </svg>

        {/* INPUT */}

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          onKeyDown={
            handleKeyDown
          }
          placeholder={
            placeholder
          }
          autoFocus={autoFocus}
          className="
            min-w-0
            flex-1
            bg-transparent
            text-sm
            text-white
            outline-none
            placeholder:text-white/35
          "
          aria-label="البحث في المحادثة"
        />

        {/* RESULT COUNT */}

        {search.trim() && (
          <span
            className="
              shrink-0
              whitespace-nowrap
              text-xs
              text-white/45
            "
          >
            {results.length > 0
              ? `${currentResult + 1}/${results.length}`
              : "لا توجد نتائج"}
          </span>
        )}

        {/* PREVIOUS */}

        {results.length >
          0 && (
          <button
            type="button"
            onClick={
              previousResult
            }
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-white/60
              transition
              hover:bg-white/10
              hover:text-white
              active:scale-95
            "
            title="النتيجة السابقة"
            aria-label="النتيجة السابقة"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}

        {/* NEXT */}

        {results.length >
          0 && (
          <button
            type="button"
            onClick={nextResult}
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-white/60
              transition
              hover:bg-white/10
              hover:text-white
              active:scale-95
            "
            title="النتيجة التالية"
            aria-label="النتيجة التالية"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}

        {/* CLEAR */}

        {search && (
          <button
            type="button"
            onClick={
              clearSearch
            }
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-white/50
              transition
              hover:bg-white/10
              hover:text-white
              active:scale-95
            "
            title="مسح البحث"
            aria-label="مسح البحث"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6 6 18" />
            </svg>
          </button>
        )}
      </div>

      {/* SEARCH RESULTS */}

      {search.trim() &&
        results.length > 0 && (
          <div
            className="
              absolute
              right-0
              left-0
              z-50
              mt-2
              max-h-80
              overflow-y-auto
              rounded-2xl
              border
              border-white/10
              bg-[#17171b]/95
              p-2
              shadow-2xl
              backdrop-blur-2xl
            "
          >
            {results.map(
              (
                message,
                index
              ) => {
                const isActive =
                  index ===
                  currentResult;

                return (
                  <button
                    key={
                      message.id
                    }
                    type="button"
                    onClick={() => {
                      setCurrentResult(
                        index
                      );

                      onResultClick?.(
                        message.id
                      );
                    }}
                    className={[
                      "block w-full rounded-xl px-3 py-2 text-right transition",
                      isActive
                        ? "bg-white/12"
                        : "hover:bg-white/[0.06]",
                    ].join(" ")}
                  >
                    <div
                      className="
                        mb-1
                        text-[10px]
                        text-white/35
                      "
                    >
                      {index + 1} من{" "}
                      {
                        results.length
                      }
                    </div>

                    <div
                      className="
                        line-clamp-2
                        text-sm
                        text-white/80
                      "
                    >
                      {
                        message.text
                      }
                    </div>
                  </button>
                );
              }
            )}
          </div>
        )}

      {/* NO RESULTS */}

      {search.trim() &&
        results.length ===
          0 && (
          <div
            className="
              absolute
              right-0
              left-0
              z-50
              mt-2
              rounded-2xl
              border
              border-white/10
              bg-[#17171b]/95
              px-4
              py-5
              text-center
              text-sm
              text-white/45
              shadow-2xl
              backdrop-blur-2xl
            "
          >
            لا توجد رسائل تطابق البحث
          </div>
        )}
    </div>
  );
}