"use client";

import React, {
  DragEvent,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";

// =========================================================
// TYPES
// =========================================================

export type DropZoneProps = {
  children?: ReactNode;

  onFilesSelected?: (
    files: File[]
  ) => void;

  accept?: string;

  multiple?: boolean;

  disabled?: boolean;

  className?: string;

  showOverlay?: boolean;
};

// =========================================================
// HELPERS
// =========================================================

function getAcceptedFiles(
  files: File[],
  accept?: string
): File[] {
  if (!accept) {
    return files;
  }

  const acceptedTypes =
    accept
      .split(",")
      .map((item) =>
        item.trim().toLowerCase()
      )
      .filter(Boolean);

  if (
    acceptedTypes.length === 0
  ) {
    return files;
  }

  return files.filter(
    (file) => {
      const fileType =
        file.type.toLowerCase();

      const fileName =
        file.name.toLowerCase();

      return acceptedTypes.some(
        (type) => {
          // image/*
          if (
            type.endsWith("/*")
          ) {
            const baseType =
              type.slice(
                0,
                -2
              );

            return fileType.startsWith(
              `${baseType}/`
            );
          }

          // .jpg / .png / etc.
          if (
            type.startsWith(".")
          ) {
            return fileName.endsWith(
              type
            );
          }

          // exact MIME type
          return (
            fileType === type
          );
        }
      );
    }
  );
}

// =========================================================
// COMPONENT
// =========================================================

export default function DropZone({
  children,
  onFilesSelected,
  accept = "image/*",
  multiple = true,
  disabled = false,
  className = "",
  showOverlay = true,
}: DropZoneProps) {
  const [
    isDragging,
    setIsDragging,
  ] = useState(false);

  const [
    isInvalidDrag,
    setIsInvalidDrag,
  ] = useState(false);

  const dragCounter =
    useRef(0);

  const inputRef =
    useRef<HTMLInputElement>(
      null
    );

  // =======================================================
  // OPEN FILE PICKER
  // =======================================================

  const openFilePicker =
    useCallback(() => {
      if (disabled) {
        return;
      }

      inputRef.current?.click();
    }, [disabled]);

  // =======================================================
  // PROCESS FILES
  // =======================================================

  const processFiles =
    useCallback(
      (fileList: FileList | null) => {
        if (
          disabled ||
          !fileList
        ) {
          return;
        }

        let files =
          Array.from(
            fileList
          );

        if (!multiple) {
          files =
            files.slice(0, 1);
        }

        files =
          getAcceptedFiles(
            files,
            accept
          );

        if (
          files.length === 0
        ) {
          return;
        }

        onFilesSelected?.(
          files
        );
      },
      [
        accept,
        disabled,
        multiple,
        onFilesSelected,
      ]
    );

  // =======================================================
  // INPUT CHANGE
  // =======================================================

  const handleInputChange =
    (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      processFiles(
        event.target.files
      );

      // حتى يقدر المستخدم
      // يختار نفس الملف مرة ثانية
      event.target.value = "";
    };

  // =======================================================
  // DRAG ENTER
  // =======================================================

  const handleDragEnter =
    (
      event: DragEvent<HTMLDivElement>
    ) => {
      if (disabled) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      dragCounter.current +=
        1;

      if (
        event.dataTransfer
          .items &&
        event.dataTransfer
          .items.length > 0
      ) {
        setIsDragging(true);

        const hasFiles =
          Array.from(
            event.dataTransfer
              .items
          ).some(
            (item) =>
              item.kind ===
              "file"
          );

        setIsInvalidDrag(
          !hasFiles
        );
      }
    };

  // =======================================================
  // DRAG OVER
  // =======================================================

  const handleDragOver =
    (
      event: DragEvent<HTMLDivElement>
    ) => {
      if (disabled) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      event.dataTransfer.dropEffect =
        "copy";
    };

  // =======================================================
  // DRAG LEAVE
  // =======================================================

  const handleDragLeave =
    (
      event: DragEvent<HTMLDivElement>
    ) => {
      if (disabled) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      dragCounter.current -=
        1;

      if (
        dragCounter.current <=
        0
      ) {
        dragCounter.current = 0;

        setIsDragging(false);
        setIsInvalidDrag(false);
      }
    };

  // =======================================================
  // DROP
  // =======================================================

  const handleDrop =
    (
      event: DragEvent<HTMLDivElement>
    ) => {
      if (disabled) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      dragCounter.current = 0;

      setIsDragging(false);
      setIsInvalidDrag(false);

      processFiles(
        event.dataTransfer
          .files
      );
    };

  // =======================================================
  // CLICK
  // =======================================================

  const handleClick =
    (
      event: React.MouseEvent<HTMLDivElement>
    ) => {
      if (disabled) {
        return;
      }

      // إذا الضغط كان على button
      // أو input أو رابط، لا نفتعل
      // فتح file picker.

      const target =
        event.target as HTMLElement;

      if (
        target.closest(
          "button, input, textarea, a, audio, video"
        )
      ) {
        return;
      }

      openFilePicker();
    };

  // =======================================================
  // KEYBOARD
  // =======================================================

  const handleKeyDown =
    (
      event: React.KeyboardEvent<HTMLDivElement>
    ) => {
      if (disabled) {
        return;
      }

      if (
        event.key ===
          "Enter" ||
        event.key ===
          " "
      ) {
        event.preventDefault();

        openFilePicker();
      }
    };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div
      className={[
        "relative",
        "min-h-0",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer",
        className,
      ].join(" ")}
      onDragEnter={
        handleDragEnter
      }
      onDragOver={
        handleDragOver
      }
      onDragLeave={
        handleDragLeave
      }
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={
        handleKeyDown
      }
      role="button"
      tabIndex={
        disabled ? -1 : 0
      }
      aria-disabled={
        disabled
      }
    >
      {/* ================================================= */}
      {/* HIDDEN INPUT */}
      {/* ================================================= */}

      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={
          handleInputChange
        }
      />

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      {children}

      {/* ================================================= */}
      {/* DRAG OVERLAY */}
      {/* ================================================= */}

      {showOverlay &&
        isDragging && (
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-50
              flex
              items-center
              justify-center
              rounded-2xl
              bg-black/70
              backdrop-blur-sm
            "
          >
            <div
              className={[
                "mx-6 flex w-full max-w-md flex-col items-center justify-center rounded-3xl border p-10 text-center shadow-2xl",
                isInvalidDrag
                  ? "border-red-400/30 bg-red-500/[0.08]"
                  : "border-white/20 bg-white/[0.08]",
              ].join(" ")}
            >
              <div
                className="
                  mb-4
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/[0.08]
                  text-3xl
                "
              >
                {isInvalidDrag
                  ? "⚠️"
                  : "📎"}
              </div>

              <h3 className="text-base font-semibold text-white">
                {isInvalidDrag
                  ? "الملف غير مدعوم"
                  : "أفلت الملفات هنا"}
              </h3>

              <p className="mt-2 text-sm text-white/45">
                {isInvalidDrag
                  ? "هذا النوع من الملفات غير مدعوم"
                  : "سيتم رفع الملفات وإرسالها إلى المحادثة"}
              </p>
            </div>
          </div>
        )}
    </div>
  );
}