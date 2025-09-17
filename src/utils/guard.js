const allowed = [
  "buy",
  "sell",
  "signal",
  "signals",
  "price",
  "insight",
  "insights",
  "sentiment",
  "market",
  "bullish",
  "bearish",
  "rsi",
  "trend",
  "support",
  "resistance",
];

export function isCryptoQuery(text) {
  if (!text || typeof text !== "string") return false;
  const t = text.toLowerCase();
  return allowed.some((k) => t.includes(k));
}


