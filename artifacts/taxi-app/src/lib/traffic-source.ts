export type TrafficSource = "direct" | "search" | "social" | "referral" | "ai" | "business_profile";
const matches = (host: string, domain: string) => host === domain || host.endsWith("." + domain);
export function classifySource(host: string | null, utmSource: string | null): TrafficSource {
  const utm = (utmSource ?? "").toLowerCase();
  const h = (host ?? "").toLowerCase();
  if (["chatgpt.com", "chatgpt", "perplexity", "perplexity.ai", "gemini", "claude"].includes(utm) || ["chatgpt.com", "chat.openai.com", "perplexity.ai", "gemini.google.com", "claude.ai"].some(d => matches(h, d))) return "ai";
  if (["google_business", "google_business_profile", "gbp"].includes(utm)) return "business_profile";
  if (["google", "bing", "duckduckgo"].includes(utm) || /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|ecosia\.org|search\.yahoo\.com)$/.test(h)) return "search";
  if (["facebook.com", "instagram.com", "x.com", "t.co", "tiktok.com", "linkedin.com", "pinterest.com", "youtube.com", "whatsapp.com"].some(d => matches(h, d))) return "social";
  return h ? "referral" : "direct";
}
export function safeEntryPath(path: string): string {
  return /^\/[a-zA-Z0-9/_-]{0,199}$/.test(path) && !/^\/(admin|fahrtstatus|confirmation)(\/|$)/.test(path) ? path : "/";
}
