import type { MenuItem } from "@/lib/api";

const SPICY_LABELS = ["", "🌶️", "🌶️🌶️", "🌶️🌶️🌶️"];

export default function MenuCard({ item }: { item: MenuItem }) {
  return (
    <article className="rounded-2xl border border-black/[0.04] bg-apple-surface p-5 transition-transform duration-300 ease-apple hover:scale-[1.02]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-[19px] font-semibold leading-snug tracking-[-0.015em] text-apple-ink">
            {item.original}
          </h3>
          <p className="mt-1 text-[17px] font-normal leading-[1.47] text-apple-muted">
            {item.translated}
          </p>
        </div>
        {item.price != null && (
          <span className="shrink-0 whitespace-nowrap rounded-full bg-black/[0.04] px-3 py-1.5 text-[14px] font-normal tabular-nums text-apple-ink">
            ₩{item.price.toLocaleString()}
          </span>
        )}
      </div>
      {item.description && (
        <p className="mt-3 max-w-[680px] text-[17px] font-normal leading-[1.47] text-apple-muted">
          {item.description}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {item.spicy_level > 0 && (
          <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-xs font-normal text-apple-ink">
            {SPICY_LABELS[item.spicy_level] ?? "🌶️"}
          </span>
        )}
        {item.allergens.map((a) => (
          <span
            key={a}
            className="rounded-full bg-black/[0.04] px-2.5 py-1 text-xs font-normal text-apple-muted"
          >
            {a}
          </span>
        ))}
      </div>
    </article>
  );
}
