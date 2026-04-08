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
    <div className="space-y-20 nav:space-y-28">
      <section className="mx-auto max-w-[680px] text-center">
        <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-apple-ink">
          Translate a Korean menu
        </h1>
        <p className="mx-auto mt-4 max-w-[520px] text-[clamp(1.125rem,2.5vw,1.5rem)] font-normal leading-snug text-apple-muted">
          Snap a photo. Get clear dish names and details in your language.
        </p>
      </section>

      <section className="mx-auto max-w-content space-y-8 text-left">
        <LanguageSelector value={language} onChange={setLanguage} />
        <ImageUploader onFileSelected={handleFile} disabled={loading} />
      </section>

      {loading && <LoadingSpinner label="Scanning menu..." />}

      {error && (
        <div
          className="rounded-2xl border border-black/[0.06] bg-apple-surface px-4 py-3 text-[17px] text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      {result && !loading && (
        <section className="mx-auto max-w-content space-y-10 text-left">
          {result.restaurant_name && (
            <h2 className="text-[clamp(1.5rem,3vw,1.75rem)] font-semibold leading-tight tracking-[-0.015em] text-apple-ink">
              {result.restaurant_name}
            </h2>
          )}
          {result.items.length === 0 && (
            <p className="max-w-[680px] text-[17px] text-apple-muted">
              No menu items detected. Try a clearer photo.
            </p>
          )}
          {CATEGORY_ORDER.filter((c) => grouped[c]?.length).map((cat) => (
            <div key={cat} className="space-y-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-apple-muted">
                {CATEGORY_LABELS[cat]}
              </h3>
              <div className="grid gap-5 min-[734px]:grid-cols-2 min-[734px]:gap-6">
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
