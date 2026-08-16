"use client";

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type VoiceMessageProps = {
  voiceUrl: string;
  duration?: number | null;
  isMine?: boolean;
};

export default function VoiceMessage({
  voiceUrl,
  duration = null,
  isMine = false,
}: VoiceMessageProps) {
  const audioRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const [
    isPlaying,
    setIsPlaying,
  ] = useState(false);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  const [
    audioDuration,
    setAudioDuration,
  ] = useState(
    duration ?? 0
  );

  useEffect(() => {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    const handleTimeUpdate = () => {
      setCurrentTime(
        audio.currentTime
      );
    };

    const handleLoadedMetadata = () => {
      if (
        Number.isFinite(
          audio.duration
        ) &&
        audio.duration > 0
      ) {
        setAudioDuration(
          audio.duration
        );
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    audio.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    audio.addEventListener(
      "ended",
      handleEnded
    );

    return () => {
      audio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      audio.removeEventListener(
        "ended",
        handleEnded
      );
    };
  }, []);

  useEffect(() => {
    if (
      duration !== null &&
      duration !== undefined &&
      duration > 0
    ) {
      setAudioDuration(duration);
    }
  }, [duration]);

  async function togglePlay() {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error(
        "Failed to play voice message:",
        error
      );

      setIsPlaying(false);
    }
  }

  function handleSeek(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    const newTime =
      Number(event.target.value);

    audio.currentTime =
      newTime;

    setCurrentTime(
      newTime
    );
  }

  function formatTime(
    seconds: number
  ) {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return "0:00";
    }

    const minutes =
      Math.floor(
        seconds / 60
      );

    const remainingSeconds =
      Math.floor(
        seconds % 60
      );

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  const totalDuration =
    audioDuration > 0
      ? audioDuration
      : duration ?? 0;

  const progress =
    totalDuration > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (currentTime /
              totalDuration) *
              100
          )
        )
      : 0;

  return (
    <div
      className={`
        flex
        min-w-[230px]
        max-w-[320px]
        items-center
        gap-3
        rounded-2xl
        px-3
        py-2.5
        ${
          isMine
            ? "bg-blue-600 text-white"
            : "bg-white/10 text-white"
        }
      `}
    >
      <audio
        ref={audioRef}
        src={voiceUrl}
        preload="metadata"
      />

      <button
        type="button"
        onClick={() =>
          void togglePlay()
        }
        className={`
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-full
          transition
          ${
            isMine
              ? "bg-white/20 hover:bg-white/30"
              : "bg-white/10 hover:bg-white/20"
          }
        `}
        aria-label={
          isPlaying
            ? "إيقاف الرسالة الصوتية"
            : "تشغيل الرسالة الصوتية"
        }
      >
        {isPlaying ? (
          <span className="text-sm">
            ❚❚
          </span>
        ) : (
          <span className="ml-0.5 text-sm">
            ▶
          </span>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex h-7 items-center gap-[3px]">
          {Array.from(
            { length: 28 },
            (_, index) => {
              const barPosition =
                (index / 27) *
                100;

              const active =
                barPosition <=
                progress;

              const heights = [
                8,
                14,
                20,
                11,
                17,
                24,
                13,
                19,
                9,
                22,
                15,
                25,
                12,
                18,
              ];

              const height =
                heights[
                  index %
                    heights.length
                ];

              return (
                <span
                  key={index}
                  className={`
                    w-[3px]
                    rounded-full
                    transition-all
                    ${
                      active
                        ? isMine
                          ? "bg-white"
                          : "bg-blue-400"
                        : isMine
                        ? "bg-white/30"
                        : "bg-white/20"
                    }
                  `}
                  style={{
                    height: `${height}px`,
                  }}
                />
              );
            }
          )}
        </div>

        <input
          type="range"
          min={0}
          max={
            totalDuration > 0
              ? totalDuration
              : 1
          }
          step={0.1}
          value={Math.min(
            currentTime,
            totalDuration || 0
          )}
          onChange={
            handleSeek
          }
          className="hidden"
          aria-label="تقدم الرسالة الصوتية"
        />

        <div
          className={`
            flex
            items-center
            justify-between
            text-[10px]
            ${
              isMine
                ? "text-white/70"
                : "text-white/50"
            }
          `}
        >
          <span>
            {formatTime(
              currentTime
            )}
          </span>

          <span>
            {formatTime(
              totalDuration
            )}
          </span>
        </div>
      </div>
    </div>
  );
}