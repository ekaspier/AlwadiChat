"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type VoiceRecorderProps = {
  onRecorded: (
    audioBlob: Blob,
    duration: number
  ) => void;

  onCancel?: () => void;

  disabled?: boolean;
};

export default function VoiceRecorder({
  onRecorded,
  onCancel,
  disabled = false,
}: VoiceRecorderProps) {
  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const chunksRef =
    useRef<Blob[]>([]);

  const timerRef =
    useRef<number | null>(null);

  const startedAtRef =
    useRef<number>(0);

  const [recording, setRecording] =
    useState(false);

  const [duration, setDuration] =
    useState(0);

  const [error, setError] =
    useState("");

  // =========================================================
  // CLEANUP
  // =========================================================

  useEffect(() => {
    return () => {
      stopStream();

      if (timerRef.current !== null) {
        window.clearInterval(
          timerRef.current
        );
      }
    };
  }, []);

  // =========================================================
  // STOP STREAM
  // =========================================================

  function stopStream() {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }
  }

  // =========================================================
  // START RECORDING
  // =========================================================

  async function startRecording() {
    if (
      recording ||
      disabled
    ) {
      return;
    }

    setError("");

    try {
      if (
        typeof navigator ===
        "undefined" ||
        !navigator.mediaDevices
          ?.getUserMedia
      ) {
        throw new Error(
          "المتصفح لا يدعم تسجيل الصوت"
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          }
        );

      streamRef.current =
        stream;

      let mimeType = "";

      const supportedTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ];

      for (
        const type of supportedTypes
      ) {
        if (
          typeof MediaRecorder !==
            "undefined" &&
          MediaRecorder.isTypeSupported(
            type
          )
        ) {
          mimeType = type;
          break;
        }
      }

      const recorder =
        mimeType
          ? new MediaRecorder(
              stream,
              { mimeType }
            )
          : new MediaRecorder(
              stream
            );

      mediaRecorderRef.current =
        recorder;

      chunksRef.current = [];

      recorder.ondataavailable =
        (event) => {
          if (
            event.data &&
            event.data.size > 0
          ) {
            chunksRef.current.push(
              event.data
            );
          }
        };

      recorder.onstop = () => {
        const finalDuration =
          Math.max(
            1,
            Math.round(
              (Date.now() -
                startedAtRef.current) /
                1000
            )
          );

        const blob =
          new Blob(
            chunksRef.current,
            {
              type:
                recorder.mimeType ||
                mimeType ||
                "audio/webm",
            }
          );

        stopStream();

        if (
          timerRef.current !== null
        ) {
          window.clearInterval(
            timerRef.current
          );

          timerRef.current = null;
        }

        setRecording(false);

        setDuration(
          finalDuration
        );

        if (blob.size > 0) {
          onRecorded(
            blob,
            finalDuration
          );
        }
      };

      recorder.onerror = () => {
        setError(
          "حدث خطأ أثناء تسجيل الصوت"
        );

        setRecording(false);

        stopStream();
      };

      startedAtRef.current =
        Date.now();

      setDuration(0);

      setRecording(true);

      recorder.start();

      timerRef.current =
        window.setInterval(() => {
          const elapsed =
            Math.floor(
              (Date.now() -
                startedAtRef.current) /
                1000
            );

          setDuration(
            elapsed
          );

          // حماية من تسجيلات طويلة جداً
          if (elapsed >= 300) {
            stopRecording();
          }
        }, 250);
    } catch (err) {
      console.error(
        "Voice recording failed:",
        err
      );

      stopStream();

      setRecording(false);

      if (
        err instanceof
        DOMException
      ) {
        if (
          err.name ===
          "NotAllowedError"
        ) {
          setError(
            "يجب السماح للموقع باستخدام الميكروفون"
          );
        } else if (
          err.name ===
          "NotFoundError"
        ) {
          setError(
            "لم يتم العثور على ميكروفون"
          );
        } else {
          setError(
            "تعذر تشغيل الميكروفون"
          );
        }
      } else if (
        err instanceof Error
      ) {
        setError(err.message);
      } else {
        setError(
          "تعذر تسجيل الصوت"
        );
      }
    }
  }

  // =========================================================
  // STOP RECORDING
  // =========================================================

  function stopRecording() {
    const recorder =
      mediaRecorderRef.current;

    if (
      !recorder ||
      recorder.state ===
        "inactive"
    ) {
      return;
    }

    recorder.stop();
  }

  // =========================================================
  // CANCEL
  // =========================================================

  function cancelRecording() {
    const recorder =
      mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !==
        "inactive"
    ) {
      recorder.onstop = null;
      recorder.stop();
    }

    if (
      timerRef.current !== null
    ) {
      window.clearInterval(
        timerRef.current
      );

      timerRef.current = null;
    }

    chunksRef.current = [];

    mediaRecorderRef.current =
      null;

    stopStream();

    setRecording(false);

    setDuration(0);

    setError("");

    onCancel?.();
  }

  // =========================================================
  // FORMAT TIME
  // =========================================================

  function formatDuration(
    seconds: number
  ) {
    const minutes =
      Math.floor(
        seconds / 60
      );

    const remainingSeconds =
      seconds % 60;

    return `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(
      2,
      "0"
    )}`;
  }

  // =========================================================
  // UI
  // =========================================================

  if (!recording) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={
            startRecording
          }
          disabled={disabled}
          title="تسجيل صوتي"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-white/10
            text-white
            transition
            hover:bg-white/20
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          🎙️
        </button>

        {error && (
          <span className="max-w-[220px] text-xs text-red-400">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="
        flex
        items-center
        gap-2
        rounded-full
        border
        border-red-500/30
        bg-red-500/10
        px-3
        py-1.5
      "
    >
      {/* CANCEL */}
      <button
        type="button"
        onClick={
          cancelRecording
        }
        className="
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          text-white/70
          transition
          hover:bg-white/10
          hover:text-white
        "
        title="إلغاء"
      >
        ✕
      </button>

      {/* RECORDING INDICATOR */}
      <div className="flex items-center gap-2">
        <span
          className="
            h-2.5
            w-2.5
            animate-pulse
            rounded-full
            bg-red-500
          "
        />

        <span className="min-w-[48px] text-sm font-medium text-white">
          {formatDuration(
            duration
          )}
        </span>
      </div>

      {/* STOP / SEND */}
      <button
        type="button"
        onClick={
          stopRecording
        }
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          bg-red-500
          text-white
          shadow-lg
          transition
          hover:bg-red-600
          active:scale-95
        "
        title="إرسال التسجيل"
      >
        <span className="text-sm">
          ➤
        </span>
      </button>
    </div>
  );
}