"use client";

import { useId, useState } from "react";

type Props = {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
};

export default function ImageUploader({ onFileSelected, disabled }: Props) {
  const inputId = useId();
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelected(file);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <label
      htmlFor={inputId}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          document.getElementById(inputId)?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={onDrop}
      className={`flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-kakao border-2 border-dashed px-6 py-14 text-center transition-all duration-200 ease-kakao ${
        dragActive
          ? "border-kakao-yellow bg-kakao-yellow/10"
          : "border-kakao-border bg-kakao-surface hover:border-kakao-border-hover"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Selected menu photo"
          loading="lazy"
          className="max-h-72 w-full max-w-2xl rounded-kakao-sm object-contain"
        />
      ) : (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-kakao-yellow">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#391B1B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-kakao-ink">
            Add a menu photo
          </p>
          <p className="text-sm text-kakao-muted">
            Click or drag here &middot; JPG, PNG, WebP, HEIC
          </p>
        </>
      )}
    </label>
  );
}
