"use client";

export const LANGUAGES = [
  { value: "English", label: "English" },
  { value: "中文", label: "中文" },
  { value: "日本語", label: "日本語" },
  { value: "Español", label: "Español" },
  { value: "Français", label: "Français" },
];

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function LanguageSelector({ value, onChange }: Props) {
  return (
    <div className="flex min-h-[44px] flex-wrap items-center gap-3">
      <label
        htmlFor="translate-to"
        className="text-base font-medium text-kakao-muted"
      >
        Translate to
      </label>
      <select
        id="translate-to"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[44px] min-w-[160px] rounded-kakao-sm border border-kakao-border bg-kakao-surface px-4 py-2 text-base text-kakao-ink transition-colors duration-200 ease-kakao focus:border-kakao-yellow focus:outline-none focus:ring-2 focus:ring-kakao-yellow/40"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
