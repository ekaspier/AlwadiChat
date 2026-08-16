
"use client";

type TypingIndicatorProps = {
  visible?: boolean;
  text?: string;
  className?: string;
};

export default function TypingIndicator({
  visible = true,
  text = "يكتب الآن...",
  className = "",
}: TypingIndicatorProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      dir="rtl"
      className={`flex items-center gap-2 px-3 py-2 ${className}`}
      aria-live="polite"
      aria-label={text}
    >
      {/* Avatar-like bubble */}

      <div className="flex items-center gap-1 rounded-2xl rounded-br-md border border-white/10 bg-white/5 px-3 py-2 shadow-sm">
        <span className="text-xs text-white/50">
          {text}
        </span>

        {/* Animated dots */}

        <span className="flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50"
            style={{
              animationDelay: "0ms",
            }}
          />

          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50"
            style={{
              animationDelay: "150ms",
            }}
          />

          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50"
            style={{
              animationDelay: "300ms",
            }}
          />
        </span>
      </div>
    </div>
  );
}
