"use client";

import { useState } from "react";

import ImageUploader from "@/components/ImageUploader";
import LanguageSelector from "@/components/LanguageSelector";
import LoadingSpinner from "@/components/LoadingSpinner";
import MenuCard from "@/components/MenuCard";
import { scanMenu, type MenuItem, type MenuResult } from "@/lib/api";

const CATEGORY_ORDER = ["main", "side", "drink", "dessert"];
const CATEGORY_LABELS: Record<string, string> = {
  main: "Main",
  side: "Side",
  drink: "Drinks",
  dessert: "Dessert",
};

export default function HomePage() {
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MenuResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await scanMenu(file, language);
      setResult(response.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const grouped: Record<string, MenuItem[]> = {};
  if (result) {
    for (const item of result.items) {
      const cat = CATEGORY_ORDER.includes(item.category) ? item.category : "main";
      (grouped[cat] ??= []).push(item);
    }
  }

  return (
    <div className="space-y-12 nav:space-y-16">
      {/* Hero */}
      <section className="mx-auto max-w-[640px] text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-kakao-yellow shadow-sm">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#391B1B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
        </div>
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold leading-tight tracking-tight text-kakao-ink">
          Korean Menu Translator
        </h1>
        <p className="mx-auto mt-3 max-w-[480px] text-lg text-kakao-muted">
          Snap a photo of any Korean menu. Get dish names, descriptions, and
          details in your language instantly.
        </p>
      </section>

      {/* Controls */}
      <section className="mx-auto max-w-content space-y-6">
        <LanguageSelector value={language} onChange={setLanguage} />
        <ImageUploader onFileSelected={handleFile} disabled={loading} />
      </section>

      {loading && <LoadingSpinner label="Scanning menu..." />}

      {error && (
        <div
          className="mx-auto max-w-content rounded-kakao-sm border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {result && !loading && (
        <section className="mx-auto max-w-content space-y-8">
          {result.restaurant_name && (
            <div className="flex items-center gap-3">
              <div className="h-1 w-6 rounded-full bg-kakao-yellow" />
              <h2 className="text-2xl font-bold text-kakao-ink">
                {result.restaurant_name}
              </h2>
            </div>
          )}
          {result.items.length === 0 && (
            <p className="text-base text-kakao-muted">
              No menu items detected. Try a clearer photo.
            </p>
          )}
          {CATEGORY_ORDER.filter((c) => grouped[c]?.length).map((cat) => (
            <div key={cat} className="space-y-4">
              <h3 className="inline-block rounded-full bg-kakao-yellow/60 px-4 py-1 text-xs font-bold uppercase tracking-wider text-kakao-brown">
                {CATEGORY_LABELS[cat]}
              </h3>
              <div className="grid gap-4 nav:grid-cols-2">
                {grouped[cat].map((item, idx) => (
                  <MenuCard key={`${cat}-${idx}`} item={item} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
