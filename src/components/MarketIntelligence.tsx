import { useState } from "react";
import { Newspaper, Sparkles, ExternalLink, RefreshCw, Lightbulb, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

interface Props {
  companyName: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

async function fetchNews(companyName: string): Promise<NewsItem[]> {
  const rssUrl = encodeURIComponent(
    `https://news.google.com/rss/search?q=${encodeURIComponent(companyName)}&hl=en-US&gl=US&ceid=US:en`
  );
  // No api_key or count params — both require a paid rss2json plan; free tier returns 10 items
  const res = await fetch(`/api/news?rss_url=${rssUrl}`);
  if (!res.ok) throw new Error(`News fetch failed: ${res.status}`);
  const json = await res.json();
  if (json.status !== "ok") throw new Error("News feed error");
  return (json.items ?? []).map((item: Record<string, string>) => ({
    title:       stripHtml(item.title ?? ""),
    link:        item.link ?? "",
    pubDate:     item.pubDate ?? "",
    description: stripHtml(item.description ?? "").slice(0, 200),
    source:      item.author ?? "Google News",
  }));
}

async function generateInsights(companyName: string, news: NewsItem[]): Promise<string[]> {
  if (!ANTHROPIC_KEY || ANTHROPIC_KEY === "your-anthropic-api-key-here") {
    throw new Error("Add your VITE_ANTHROPIC_API_KEY to .env.local and restart the dev server.");
  }

  const newsText = news
    .map((n, i) => `${i + 1}. "${n.title}" (${n.source}, ${timeAgo(n.pubDate)})\n   ${n.description}`)
    .join("\n\n");

  const prompt = `You are an expert B2B sales strategist. Based on recent news about "${companyName}", identify 4-5 specific, actionable ways a software vendor (selling maritime asset management & operations software) could leverage these developments to create urgency, open conversations, or strengthen their position.

Recent news:
${newsText}

Return ONLY a JSON array of strings, each being one concrete strategic suggestion. Each suggestion should:
- Reference a specific news item or theme
- Explain the business implication for the customer
- Suggest a specific action the sales/account team should take
- Be 1-2 sentences max

Example format: ["Suggestion 1", "Suggestion 2", ...]`;

  const res = await fetch("/api/anthropic/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-allow-browser": "true",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text ?? "[]";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Could not parse suggestions");
  return JSON.parse(match[0]) as string[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export const MarketIntelligence = ({ companyName }: Props) => {
  const [news,        setNews]        = useState<NewsItem[]>([]);
  const [insights,    setInsights]    = useState<string[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingAI,   setLoadingAI]   = useState(false);
  const [newsError,   setNewsError]   = useState<string | null>(null);
  const [aiError,     setAiError]     = useState<string | null>(null);

  const handleFetchNews = async () => {
    setLoadingNews(true);
    setNewsError(null);
    setInsights([]);
    try {
      const items = await fetchNews(companyName);
      setNews(items);
    } catch (e) {
      setNewsError(e instanceof Error ? e.message : "Failed to fetch news");
    } finally {
      setLoadingNews(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (news.length === 0) return;
    setLoadingAI(true);
    setAiError(null);
    try {
      const suggestions = await generateInsights(companyName, news);
      setInsights(suggestions);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Failed to generate insights");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Market Intelligence</span>
          {news.length > 0 && (
            <Badge variant="outline" className="text-xs">{news.length} articles</Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs h-7"
          onClick={handleFetchNews}
          disabled={loadingNews}
        >
          <RefreshCw className={`w-3 h-3 ${loadingNews ? "animate-spin" : ""}`} />
          {news.length > 0 ? "Refresh" : `Fetch news for ${companyName}`}
        </Button>
      </div>

      {/* News error */}
      {newsError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-destructive/5 text-destructive text-xs border-b border-border">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {newsError}
        </div>
      )}

      {/* News items */}
      {news.length > 0 && (
        <div className="divide-y divide-border/60">
          {news.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
              <div className="flex-1 min-w-0">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:text-primary hover:underline line-clamp-2 flex items-start gap-1"
                >
                  {item.title}
                  <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5 text-muted-foreground" />
                </a>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground">{timeAgo(item.pubDate)}</p>
                <p className="text-xs text-muted-foreground/60 truncate max-w-[80px]">{item.source}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {news.length === 0 && !loadingNews && !newsError && (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>Click "Fetch news" to pull the latest articles about {companyName}</p>
        </div>
      )}

      {/* AI Insights section */}
      {news.length > 0 && (
        <div className="border-t border-border bg-primary/3">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Strategic Suggestions</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-7 border-accent/40 text-accent hover:bg-accent/10"
              onClick={handleGenerateInsights}
              disabled={loadingAI}
            >
              <Sparkles className={`w-3 h-3 ${loadingAI ? "animate-spin" : ""}`} />
              {loadingAI ? "Analysing…" : insights.length > 0 ? "Regenerate" : "Generate insights"}
            </Button>
          </div>

          {aiError && (
            <div className="flex items-center gap-2 px-4 py-3 text-destructive text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {aiError}
            </div>
          )}

          {insights.length > 0 && (
            <ul className="px-4 py-3 space-y-3">
              {insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/15 text-accent flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex items-start gap-2 flex-1">
                    <Lightbulb className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {insights.length === 0 && !loadingAI && !aiError && (
            <p className="px-4 py-3 text-xs text-muted-foreground">
              Once news is loaded, click "Generate insights" and Claude will analyse the articles and suggest how to use them to your advantage.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
