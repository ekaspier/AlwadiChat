
"use client";

type UnreadBadgeProps = {
  count?: number;
  max?: number;
  className?: string;
};

export default function UnreadBadge({
  count = 0,
  max = 99,
  className = "",
}: UnreadBadgeProps) {
  if (!count || count <= 0) {
    return null;
  }

  const displayCount =
    count > max
      ? `${max}+`
      : String(count);

  return (
    <span
      className={`inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold leading-none text-white shadow-sm ${className}`}
      aria-label={`${count} رسائل غير مقروءة`}
    >
      {displayCount}
    </span>
  );
}
