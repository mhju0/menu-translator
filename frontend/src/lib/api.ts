export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export type MenuItem = {
  original: string;
  translated: string;
  description?: string | null;
  price?: number | null;
  spicy_level: number;
  allergens: string[];
  category: string;
};

export type MenuResult = {
  restaurant_name?: string | null;
  items: MenuItem[];
};

export type ScanResponse = {
  id: number;
  target_language: string;
  raw_text: string;
  result: MenuResult;
  created_at: string;
};

export type HistoryItem = {
  id: number;
  target_language: string;
  created_at: string;
  restaurant_name?: string | null;
  item_count: number;
};

export type HistoryDetail = {
  id: number;
  target_language: string;
  created_at: string;
  result: MenuResult;
};

export async function scanMenu(
  file: File,
  targetLanguage: string,
): Promise<ScanResponse> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("target_language", targetLanguage);

  const res = await fetch(`${API_BASE}/api/scan`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Scan failed (${res.status}): ${detail}`);
  }
  return res.json();
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${API_BASE}/api/history`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}

export async function fetchHistoryDetail(id: number): Promise<HistoryDetail> {
  const res = await fetch(`${API_BASE}/api/history/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load history detail");
  return res.json();
}
