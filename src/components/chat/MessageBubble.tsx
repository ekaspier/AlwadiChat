"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type VoiceMessageProps = {
  audioUrl?: string;
  voiceUrl?: string;
  duration?: number | null;
  isMine?: boolean;
};

export default function VoiceMessage({
  audioUrl,
  voiceUrl,
  duration = 0,
  isMine = false,
}: VoiceMessageProps) {
  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [audioDuration, setAudioDuration] =
    useState(duration ?? 0);

  const actualUrl =
    voiceUrl || audioUrl || "";

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (
        Number.isFinite(audio.duration) &&
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

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
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

    audio.addEventListener(
      "pause",
      handlePause
    );

    audio.addEventListener(
      "play",
      handlePlay
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

      audio.removeEventListener(
        "pause",
        handlePause
      );

      audio.removeEventListener(
        "play",
        handlePlay
      );
    };
  }, []);

  async function togglePlay() {
    const audio = audioRef.current;

    if (!audio || !actualUrl) {
      return;
    }

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (error) {
      console.error(
        "Voice playback failed:",
        error
      );
    }
  }

  function handleSeek(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const newTime =
      Number(event.target.value);

    audio.currentTime = newTime;

    setCurrentTime(newTime);
  }

  function formatTime(
    seconds: number
  ): string {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return "0:00";
    }

    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      Math.floor(seconds % 60);

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

  if (!actualUrl) {
    return (
      <div
        className={`flex min-w-[230px] items-center gap-3 rounded-2xl px-3 py-2.5 ${
          isMine
            ? "bg-blue-600"
            : "bg-white/10"
        }`}
      >
        <span className="text-sm text-white/60">
          الرسالة الصوتية غير متاحة
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex min-w-[230px] max-w-[330px] items-center gap-3 rounded-2xl px-3 py-2.5 ${
        isMine
          ? "bg-blue-600 text-white"
          : "bg-white/10 text-white"
      }`}
    >
      {/* AUDIO */}

      <audio
        ref={audioRef}
        src={actualUrl}
        preload="metadata"
      />

      {/* PLAY BUTTON */}

      <button
        type="button"
        onClick={() =>
          void togglePlay()
        }
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
          isMine
            ? "bg-white/20 hover:bg-white/30"
            : "bg-white/10 hover:bg-white/20"
        }`}
        aria-label={
          isPlaying
            ? "إيقاف التسجيل"
            : "تشغيل التسجيل"
        }
      >
        {isPlaying ? (
          <span className="text-sm font-bold">
            ❚❚
          </span>
        ) : (
          <span className="ml-0.5 text-sm">
            ▶
          </span>
        )}
      </button>

      {/* WAVEFORM */}

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex h-8 items-center gap-[3px]">
          {Array.from(
            { length: 32 },
            (_, index) => {
              const position =
                (index / 31) * 100;

              const active =
                position <= progress;

              const heights = [
                8,
                14,
                20,
                12,
                17,
                24,
                11,
                19,
                9,
                22,
                15,
                26,
                13,
                18,
                10,
                21,
              ];

              const height =
                heights[
                  index %
                    heights.length
                ];

              return (
                <span
                  key={index}
                  className={`w-[3px] rounded-full transition-colors ${
                    active
                      ? isMine
                        ? "bg-white"
                        : "bg-blue-400"
                      : isMine
                      ? "bg-white/30"
                      : "bg-white/20"
                  }`}
                  style={{
                    height: `${height}px`,
                  }}
                />
              );
            }
          )}
        </div>

        {/* SEEK BAR */}

        <input
          type="range"
          min="0"
          max={
            totalDuration > 0
              ? totalDuration
              : 1
          }
          step="0.1"
          value={
            totalDuration > 0
              ? Math.min(
                  currentTime,
                  totalDuration
                )
              : 0
          }
          onChange={handleSeek}
          className="h-1 w-full cursor-pointer accent-white"
          aria-label="تقدم التسجيل الصوتي"
        />

        {/* TIME */}

        <div
          className={`mt-1 flex items-center justify-between text-[10px] ${
            isMine
              ? "text-white/70"
              : "text-white/50"
          }`}
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