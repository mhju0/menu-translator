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
      className={`flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-black/[0.08] bg-apple-surface px-6 py-14 text-center transition-colors duration-300 ease-apple ${
        dragActive
          ? "border-apple-accent/40 bg-black/[0.02]"
          : "hover:border-black/[0.12]"
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
          className="max-h-72 w-full max-w-2xl rounded-xl object-contain"
        />
      ) : (
        <>
          <p className="text-[19px] font-normal text-apple-ink">
            Add a menu photo
          </p>
          <p className="text-[14px] text-apple-muted">
            Click or drag here · JPG, PNG, HEIC
          </p>
        </>
      )}
    </label>
  );
}
