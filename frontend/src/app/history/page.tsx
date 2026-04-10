"use client";

import { useEffect, useState } from "react";

import LoadingSpinner from "@/components/LoadingSpinner";
import MenuCard from "@/components/MenuCard";
import {
  fetchHistory,
  fetchHistoryDetail,
  type HistoryDetail,
  type HistoryItem,
} from "@/lib/api";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [selected, setSelected] = useState<HistoryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchHistory()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  const openDetail = async (id: number) => {
    setLoadingDetail(true);
    setSelected(null);
    try {
      const detail = await fetchHistoryDetail(id);
      setSelected(detail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-12 nav:space-y-16">
      <section className="mx-auto max-w-[640px] text-center">
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight tracking-tight text-kakao-ink">
          Scan History
        </h1>
        <p className="mx-auto mt-3 max-w-[480px] text-base text-kakao-muted">
          Open a past scan to review items again.
        </p>
      </section>

      <section className="mx-auto max-w-content space-y-6">
        {error && (
          <div
            className="rounded-kakao-sm border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {!items && !error && <LoadingSpinner />}

        {items && items.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-kakao-yellow/50">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="text-base text-kakao-muted">No scans yet.</p>
          </div>
        )}

        {items && items.length > 0 && (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openDetail(item.id)}
                  className="flex w-full min-h-[56px] items-center justify-between rounded-kakao border border-kakao-border bg-kakao-surface px-5 py-4 text-left shadow-sm transition-all duration-200 ease-kakao hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div>
                    <p className="text-base font-semibold text-kakao-ink">
                      {item.restaurant_name ?? "Untitled menu"}
                    </p>
                    <p className="mt-1 text-sm text-kakao-muted">
                      {new Date(item.created_at).toLocaleString()} &middot;{" "}
                      {item.item_count} items &middot; {item.target_language}
                    </p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-kakao-yellow text-kakao-brown">
                    &rarr;
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {loadingDetail && <LoadingSpinner />}

        {selected && (
          <div className="space-y-6 border-t border-kakao-border pt-8">
            <div className="flex items-center gap-3">
              <div className="h-1 w-6 rounded-full bg-kakao-yellow" />
              <h2 className="text-xl font-bold text-kakao-ink">
                {selected.result.restaurant_name ?? "Menu"}
              </h2>
            </div>
            <div className="grid gap-4 nav:grid-cols-2">
              {selected.result.items.map((item, idx) => (
                <MenuCard key={idx} item={item} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
