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
    <div className="space-y-16 nav:space-y-20">
      <section className="mx-auto max-w-[680px] text-center">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-apple-ink">
          Scan history
        </h1>
        <p className="mx-auto mt-3 max-w-[520px] text-[1.125rem] font-normal leading-snug text-apple-muted">
          Open a past scan to review items again.
        </p>
      </section>

      <section className="mx-auto max-w-content space-y-6 text-left">
        {error && (
          <div
            className="rounded-2xl border border-black/[0.06] bg-apple-surface px-4 py-3 text-[17px] text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        {!items && !error && <LoadingSpinner />}

        {items && items.length === 0 && (
          <p className="max-w-[680px] text-[17px] text-apple-muted">
            No scans yet.
          </p>
        )}

        {items && items.length > 0 && (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openDetail(item.id)}
                  className="flex w-full min-h-[44px] items-center justify-between rounded-2xl border border-black/[0.04] bg-apple-surface px-5 py-4 text-left transition-colors duration-300 ease-apple hover:border-black/[0.1]"
                >
                  <div>
                    <p className="text-[17px] font-normal text-apple-ink">
                      {item.restaurant_name ?? "Untitled menu"}
                    </p>
                    <p className="mt-1 text-[14px] text-apple-muted">
                      {new Date(item.created_at).toLocaleString()} ·{" "}
                      {item.item_count} items · {item.target_language}
                    </p>
                  </div>
                  <span className="text-apple-link" aria-hidden>
                    →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {loadingDetail && <LoadingSpinner />}

        {selected && (
          <div className="space-y-6 border-t border-black/[0.06] pt-10">
            <h2 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold leading-tight tracking-[-0.015em] text-apple-ink">
              {selected.result.restaurant_name ?? "Menu"}
            </h2>
            <div className="grid gap-5 min-[734px]:grid-cols-2 min-[734px]:gap-6">
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
