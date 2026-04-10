import type { MenuItem } from "@/lib/api";

const SPICY_LABELS = ["", "Mild", "Medium", "Hot"];
const SPICY_COLORS = [
  "",
  "bg-orange-100 text-orange-700",
  "bg-red-100 text-red-600",
  "bg-red-200 text-red-800",
];

export default function MenuCard({ item }: { item: MenuItem }) {
  return (
    <article className="rounded-kakao border border-kakao-border bg-kakao-surface p-5 shadow-sm transition-all duration-200 ease-kakao hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-snug text-kakao-ink">
            {item.original}
          </h3>
          <p className="mt-1 text-base text-kakao-muted">
            {item.translated}
          </p>
        </div>
        {item.price != null && (
          <span className="shrink-0 whitespace-nowrap rounded-kakao-sm bg-kakao-yellow px-3 py-1.5 text-sm font-bold tabular-nums text-kakao-brown">
            {item.price.toLocaleString()}won
          </span>
        )}
      </div>
      {item.description && (
        <p className="mt-3 rounded-kakao-sm bg-kakao-bg p-3 text-sm leading-relaxed text-kakao-muted">
          {item.description}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {item.spicy_level > 0 && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${SPICY_COLORS[item.spicy_level] ?? "bg-red-100 text-red-700"}`}
          >
            {SPICY_LABELS[item.spicy_level] ?? "Hot"}
          </span>
        )}
        {item.allergens.map((a) => (
          <span
            key={a}
            className="rounded-full border border-kakao-border px-2.5 py-1 text-xs text-kakao-muted"
          >
            {a}
          </span>
        ))}
      </div>
    </article>
  );
}
