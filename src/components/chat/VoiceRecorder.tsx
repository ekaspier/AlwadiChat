"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type VoiceRecorderProps = {
  onRecorded: (
    audioUrl: string,
    duration: number
  ) => void;

  onCancel: () => void;
};

export default function VoiceRecorder({
  onRecorded,
  onCancel,
}: VoiceRecorderProps) {
  const mediaRecorderRef =
    useRef<MediaRecorder | null>(
      null
    );

  const streamRef =
    useRef<MediaStream | null>(
      null
    );

  const chunksRef =
    useRef<Blob[]>([]);

  const startedAtRef =
    useRef<number>(0);

  const timerRef =
    useRef<ReturnType<
      typeof setInterval
    > | null>(null);

  const [recording, setRecording] =
    useState(false);

  const [duration, setDuration] =
    useState(0);

  const [error, setError] =
    useState("");

  // =====================================================
  // CLEANUP
  // =====================================================

  useEffect(() => {
    return () => {
      stopStream();

      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );
      }
    };
  }, []);

  // =====================================================
  // STOP MICROPHONE
  // =====================================================

  function stopStream() {
    if (!streamRef.current) {
      return;
    }

    streamRef.current
      .getTracks()
      .forEach((track) =>
        track.stop()
      );

    streamRef.current = null;
  }

  // =====================================================
  // FORMAT TIME
  // =====================================================

  function formatDuration(
    seconds: number
  ) {
    const minutes =
      Math.floor(seconds / 60);

    const remaining =
      seconds % 60;

    return `${minutes
      .toString()
      .padStart(2, "0")}:${remaining
      .toString()
      .padStart(2, "0")}`;
  }

  // =====================================================
  // START RECORDING
  // =====================================================

  async function startRecording() {
    setError("");

    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices
        .getUserMedia
    ) {
      setError(
        "المتصفح لا يدعم تسجيل الصوت"
      );

      return;
    }

    if (
      typeof MediaRecorder ===
      "undefined"
    ) {
      setError(
        "المتصفح لا يدعم تسجيل الصوت"
      );

      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          }
        );

      streamRef.current =
        stream;

      chunksRef.current = [];

      let mimeType = "";

      const supportedTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];

      for (
        const type of supportedTypes
      ) {
        if (
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
              {
                mimeType,
              }
            )
          : new MediaRecorder(
              stream
            );

      mediaRecorderRef.current =
        recorder;

      recorder.ondataavailable = (
        event
      ) => {
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
        const blob =
          new Blob(
            chunksRef.current,
            {
              type:
                recorder.mimeType ||
                "audio/webm",
            }
          );

        const audioUrl =
          URL.createObjectURL(
            blob
          );

        const finalDuration =
          Math.max(
            1,
            Math.round(
              (Date.now() -
                startedAtRef.current) /
                1000
            )
          );

        stopStream();

        setRecording(false);

        if (timerRef.current) {
          clearInterval(
            timerRef.current
          );

          timerRef.current =
            null;
        }

        setDuration(
          finalDuration
        );

        onRecorded(
          audioUrl,
          finalDuration
        );
      };

      recorder.onerror = () => {
        setError(
          "حدث خطأ أثناء تسجيل الصوت"
        );

        setRecording(false);

        stopStream();
      };

      recorder.start();

      startedAtRef.current =
        Date.now();

      setDuration(0);

      setRecording(true);

      timerRef.current =
        setInterval(() => {
          const elapsed =
            Math.floor(
              (Date.now() -
                startedAtRef.current) /
                1000
            );

          setDuration(
            elapsed
          );
        }, 500);
    } catch (error) {
      console.error(
        "Microphone error:",
        error
      );

      setError(
        "لم يتم السماح باستخدام الميكروفون"
      );

      stopStream();
    }
  }

  // =====================================================
  // STOP RECORDING
  // =====================================================

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

  // =====================================================
  // CANCEL
  // =====================================================

  function handleCancel() {
    const recorder =
      mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !==
        "inactive"
    ) {
      recorder.onstop =
        null;

      recorder.stop();
    }

    stopStream();

    chunksRef.current = [];

    setRecording(false);

    setDuration(0);

    if (timerRef.current) {
      clearInterval(
        timerRef.current
      );

      timerRef.current =
        null;
    }

    onCancel();
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      dir="rtl"
      className="flex w-full items-center gap-3"
    >
      {/* MICROPHONE */}

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xl">
        🎤
      </div>

      {/* INFO */}

      <div className="min-w-0 flex-1">
        {error ? (
          <div className="text-sm text-red-400">
            {error}
          </div>
        ) : recording ? (
          <>
            <div className="text-sm font-medium text-white">
              جاري تسجيل الرسالة...
            </div>

            <div className="mt-1 font-mono text-xs text-white/50">
              {formatDuration(
                duration
              )}
            </div>
          </>
        ) : (
          <div className="text-sm text-white/60">
            اضغط على تسجيل لبدء الرسالة الصوتية
          </div>
        )}
      </div>

      {/* RECORD / STOP */}

      {!recording ? (
        <button
          type="button"
          onClick={() =>
            void startRecording()
          }
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
        >
          تسجيل
        </button>
      ) : (
        <button
          type="button"
          onClick={
            stopRecording
          }
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
        >
          إيقاف
        </button>
      )}

      {/* CANCEL */}

      <button
        type="button"
        onClick={
          handleCancel
        }
        className="rounded-xl bg-white/5 px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
      >
        إلغاء
      </button>
    </div>
  );
}