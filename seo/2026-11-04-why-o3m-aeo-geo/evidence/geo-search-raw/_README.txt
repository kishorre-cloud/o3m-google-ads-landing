Raw search outputs, baseline run 2026-11-04 approx 16:15-16:25 IST (+05:30).
Each q##-*.json holds:
 - firecrawl: firecrawl_search response (params: location="India", limit=10, sources=["web"], domainTools=false).
   Kept: search id, url, title, description, position. Removed: agent_hints, creditsUsed.
   Descriptions longer than ~400 chars truncated and marked "[truncated]" (scraped-page markdown, e.g. repeated review-widget image markup).
 - websearch: Claude Code WebSearch tool (mode=standard; tool states "US-only", no location parameter). Link list in returned order, plus the tool's own synthesized summary lines that mention O3M (if any).
Localisation: Firecrawl accepted location="India"; results are India-heavy (justdial, .in domains, INR prices), consistent with it being applied, but this cannot be independently verified. WebSearch: no localisation (US-only per tool description).
