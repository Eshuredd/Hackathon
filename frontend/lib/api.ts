export type ComparisonRow = {
  id: string;
  product: string;
  platform: string;
  price: number;
  originalPrice?: number;
  delivery: string;
  discount?: string;
  rating: number;
  image: string;
  isBestDeal: boolean;
  inStock: boolean;
  deliveryFee?: number;
};

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function fetchComparisonRows(
  query: string
): Promise<ComparisonRow[]> {
  const items = query
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ name, category: "general" }));

  if (items.length === 0) return [];

  const res = await fetch(`${API_BASE}/grocery/prices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  const data = await res.json();

  // Map backend PriceResult to flat rows used by UI
  const rows: ComparisonRow[] = [];
  for (const item of data.items ?? []) {
    for (const p of item.platforms ?? []) {
      rows.push({
        id: `${item.name}-${p.platform}`,
        product: item.name,
        platform: p.platform,
        price: p.price,
        originalPrice: p.discount
          ? Math.round(p.price / (1 - p.discount / 100))
          : undefined,
        delivery: p.delivery_time ? `${Math.round(p.delivery_time)} mins` : "",
        discount: p.discount ? `${Math.round(p.discount)}% OFF` : undefined,
        rating: 4.3,
        image: "/placeholder.svg",
        isBestDeal: false,
        inStock: p.stock_available ?? true,
        deliveryFee: p.delivery_fee ?? 0,
      });
    }
  }

  return rows;
}

// ----------------- Cart API -----------------
function getJsonHeaders() {
  let authHeader: string | undefined;
  try {
    if (typeof window !== "undefined") {
      const ds =
        localStorage.getItem("DS") || localStorage.getItem("auth-token");
      if (ds) authHeader = `Bearer ${ds}`;
    }
  } catch {}
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authHeader) headers["Authorization"] = authHeader;
  return headers;
}

export async function cartGet() {
  const r = await fetch(`${API_BASE}/grocery/cart`, {
    headers: getJsonHeaders(),
  });
  if (!r.ok) throw new Error("cartGet failed");
  return r.json();
}

export async function cartAddOrUpdate(params: {
  provider: string;
  item_name: string;
  unit_price: number;
  delivery_fee: number;
  qty: number;
  metadata?: any;
}) {
  const r = await fetch(`${API_BASE}/grocery/cart/items`, {
    method: "POST",
    headers: getJsonHeaders(),
    body: JSON.stringify(params),
  });
  if (!r.ok) throw new Error("cartAddOrUpdate failed");
  return r.json();
}

export async function cartRemove(lineId: string) {
  const r = await fetch(
    `${API_BASE}/grocery/cart/items/${encodeURIComponent(lineId)}`,
    {
      method: "DELETE",
      headers: getJsonHeaders(),
    }
  );
  if (!r.ok) throw new Error("cartRemove failed");
  return r.json();
}

export async function cartClear() {
  const r = await fetch(`${API_BASE}/grocery/cart`, {
    method: "DELETE",
    headers: getJsonHeaders(),
  });
  if (!r.ok) throw new Error("cartClear failed");
  return r.json();
}

export async function cartParseAdd(text: string) {
  const r = await fetch(`${API_BASE}/grocery/cart/parse-add`, {
    method: "POST",
    headers: getJsonHeaders(),
    body: JSON.stringify({ text }),
  });
  if (!r.ok) throw new Error("cartParseAdd failed");
  return r.json();
}
