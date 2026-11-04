# GEO / AEO baseline observation: how search tools surface O3M Directional Marketing

Run date: 2026-11-04, approx 16:15-16:25 IST (+05:30). Single run per query. Read-only; no website files changed.

## Method

| Tool | Parameters | Localisation applied? |
|---|---|---|
| Firecrawl `firecrawl_search` (primary) | `location="India"`, `limit=10`, `sources=["web"]`, `domainTools=false` | Parameter accepted. Results are India-heavy (Justdial, IndiaMART, .in domains, INR prices), which is consistent with it being applied, but this cannot be independently verified. Country only; no city-level location used. |
| Claude Code `WebSearch` (secondary) | `mode="standard"` | No. The tool has no location parameter and describes itself as US-only. Returns a link list plus its own synthesized summary. |

Not tested (no access): ChatGPT, Gemini, Perplexity, Microsoft Copilot, Google AI Overviews. No answers from these were simulated.

Raw outputs: `evidence/geo-search-raw/q01..q12-*.json` (one file per query, both tools) and `_README.txt` describing light trimming (agent hints removed; very long scraped-markdown snippets truncated and marked).

Reference facts used to judge accuracy: founded 2010; part of Boonze Media Solutions (est. 2005); offices Chennai and Coimbatore; Google Premier Partner 2026; AdFlux = O3M's marketing performance and revenue-operations platform.

## Results

"Position" = order in the list the tool returned. It is not a Google ranking.

| # | Query | Firecrawl: O3M present? (position, URL) | WebSearch: O3M present? | Competitor / agency domains in top results (Firecrawl) | Directory / listicle domains present |
|---|---|---|---|---|---|
| 1 | google ads agency chennai | No (0/10) | No | kay.org.in, indiafloats.in, noirandblanco.com, justsee.co.in, webtechmedia.in, besttech.in, vriddhidigital.com, vyaparinfotech.com | justdial.com, facebook.com/fb-answers; WebSearch: brewmyidea.com Top 20, expertbeacon.com, sortlist, owlclaw.com city pages |
| 2 | best google ads agency in chennai | No (0/10) | No | kay.org.in, budindia.com, indiafloats.in, besttech.in, vyaparinfotech.com, vriddhidigital.com, noirandblanco.com, webbitech.com | justdial.com, varnix.in "Top 7" (self-published); WebSearch: brewmyidea.com, soravjain.com, upgrowth.in, megadigital.ai, webguruz.in, producthunt |
| 3 | google ads agency coimbatore | No (0/10) | No | webnox.in, vyaparinfotech.com, dhigrowth.com, xtrodinry.com, kay.org.in, webbitech.com, gsdigitalmarketing.in | academy.infozub.com "Top 10", justdial.com, instagram.com; WebSearch: goodfirms.co, owlclaw.com, webwonderworks.pages.dev |
| 4 | google ads management services india | No (0/10) | No | rankontechnologies.com, hemant.co.in, dimakhconsultants.com, techeasify.com, thriveagency.com, tisdigitech.com, softtrix.com | artattackk.com "Top 10", indiamart.com, business.google.com; WebSearch: clutch.co, megadigital.ai, webguruz.in |
| 5 | google ads agency for manufacturers india | No (0/10) | No | digitaldc.in, hemant.co.in, techeasify.com, theinstaserv.com, digitalops.in, upgrowth.in, icecubedigital.in | improtics.com "10 Picks", superbcompanies.com "Top 30", artattackk.com; WebSearch: almost entirely clutch.co manufacturing lists + owlclaw.com |
| 6 | b2b lead generation google ads agency india | No (0/10) | No | digitaldc.in, doneforyou.in, idigitalise.net, theinstaserv.com, salesdesign.co.in | webguruz.in, aimarketinglab.in, agencies.semrush.com, wacto.in, manyreach.com; WebSearch: fiverr, upwork, goodfirms, aajneeti.social |
| 7 | ecommerce google ads management agency india | No (0/10) | No | hemant.co.in, digitaldc.in, theinstaserv.com, tisdigitech.com, dimakhconsultants.com, digitalops.in | improtics.com, webhopers.com "Top 10 Premium Partner", upgrowth.in, artattackk.com; WebSearch: clutch.co, megadigital.ai, agrowth.io, designrush, g2 |
| 8 | O3M Directional Marketing | Yes: #1 https://o3mdm.com/ (also #6 o3m.in; O3M profiles fill all 10) | O3M profiles yes (Shopify partner directory #1, devdiscourse, starterstory); o3mdm.com itself not in list | n/a (branded) | linkedin, instagram, ambitionbox, collegedunia, justdial (Coimbatore), Amazon Ads partner directory, crunchbase, indeed; WebSearch also mixes in unrelated near-names (TMP Directional Marketing, O2, O&M) |
| 9 | what does O3M Directional Marketing do | Yes: #1 https://o3mdm.com/ (also #3 /careers, #5 /contact, #7 /terms) | O3M profiles yes (Shopify #1, themediaant.com #2); o3mdm.com not in list | n/a | linkedin, instagram, ambitionbox, collegedunia, Amazon Ads directory, facebook; WebSearch: themediaant, plus many unrelated near-names |
| 10 | AdFlux O3M | Yes: #1 https://o3mdm.com/technology/adflux (also #2, #3, #6, #7 o3mdm.com; #10 justdial) | No (no O3M result at all) | Name collisions: phenomenonstudio.com AdFlux case study, Adflux Agency (LinkedIn/Instagram), adflux.digital (retail media CMS) | justdial.com |
| 11 | how to evaluate a google ads management agency | No (0/10) | No | thriveagency.com, tisdigitech.com, nicodigital.com, embertribe.com, measuremindsgroup.com | business.google.com guide, improvado.io, cleandigital.co.uk, virtualemployee.com; WebSearch: clicksgeek.com (6 URLs), upgrowth.in, redefineweb.com |
| 12 | google premier partner agency chennai | No (0/10) | No | kay.org.in (#1 and #3), budindia.com, wizi.digital, ideastoreach.com, theinstaserv.com | partnersdirectory.withgoogle.com (#2), business.google.com, webhopers.com "Top 10", instagram.com/popular; WebSearch: producthunt, builtin.com, techmagnate.com |

Summary: O3M appears in 3 of 12 queries on Firecrawl, and only on the 3 branded queries (8, 9, 10), at #1 each time. On all 9 non-branded category, location and informational queries O3M is absent from the top 10 on both tools.

## Snippet accuracy (branded queries)

| Fact | What returned snippets / summaries said | Verdict |
|---|---|---|
| Founded 2010 | Firecrawl o3mdm.com snippet: "Helping businesses grow since ..." (year cut off). WebSearch summary citing starterstory.com: business "started in April 2010". WebSearch summary citing themediaant.com: "founded in 2017". | Correct via starterstory; INCORRECT via The Media Ant directory (2017). Own-site snippet does not surface the year. |
| Part of Boonze Media Solutions (est. 2005) | Not mentioned in any result on either tool. | Missing |
| Offices Chennai & Coimbatore | o3mdm.com/contact title "Contact O3M — Chennai & Coimbatore"; Justdial Coimbatore listing; Collegedunia / Facebook / Media Ant say Chennai (Media Ant: T. Nagar). | Correct |
| Google Premier Partner 2026 | o3mdm.com snippet: "Google Premier Partner, Amazon Advanced Partner". Shopify profile (via WebSearch): Google Premier Partner. Facebook page: "Google AdWords Premier SME Partner" (old programme name). | Premier Partner correct; the year 2026 is not stated anywhere; Facebook wording outdated. |
| AdFlux = marketing performance and revenue-ops platform | o3mdm.com/technology/adflux and /technology snippets: "AdFlux is O3M's marketing performance and revenue operations intelligence platform". | Correct, on Firecrawl only. WebSearch found nothing for "AdFlux O3M". |

Other O3M descriptions seen (not wrong, but dated or inconsistent with the current "Digital Growth & Marketing Technology Company" positioning): "75-plus man-years of experience" (Amazon Ads directory, Collegedunia); "full-service Google authorized company ... search marketing with local focus" (Crunchbase); "India's Leading Online Advertising Agency" (Instagram); "ethical and transparent partner ... full-service digital agency" (LinkedIn). WebSearch summaries also cited "about 45 people", "over 100,000 paid ad accounts", 2023 Amazon Ads Partner Award (Challenger) and a "Google Ads India Highest Customer Satisfaction Award four years in a row"; these were not checked against O3M records.

## Observations

1. Non-branded visibility is zero in this sample. For Chennai, Coimbatore, India-wide, industry (manufacturers, B2B, ecommerce), Premier Partner and how-to queries, O3M did not appear in either tool's top 10.
2. Where O3M is absent, results are dominated by (a) local agency service pages with exact-match URLs such as `/google-ads-agency-chennai` (kay.org.in, vyaparinfotech.com, vriddhidigital.com, besttech.in, justsee.co.in), and (b) directories and self-published listicles: Justdial (Chennai and Coimbatore), Clutch (India PPC and manufacturing lists, dominant in WebSearch), IndiaMART, Semrush Agencies, GoodFirms, SuperbCompanies, and agency-written "Top N" posts (artattackk.com, improtics.com, webhopers.com, upgrowth.in, webguruz.in, megadigital.ai, brewmyidea.com, varnix.in, academy.infozub.com). These listicles are the likely source material for AI answers on these queries, and O3M is not named in any of their returned snippets.
3. KAY Multimedia (kay.org.in) holds #1 for queries 1, 2 and 12 and also ranks for Coimbatore, explicitly claiming "Google Premier Partner" in Chennai and Coimbatore, the same positioning O3M could claim.
4. Branded queries resolve well on Firecrawl: o3mdm.com is #1 and O3M-controlled or O3M-specific profiles fill the top 10. The current positioning ("Digital Growth & Marketing Technology Company", Premier Partner, Chennai & Coimbatore, AdFlux definition) is surfaced accurately from the site itself.
5. Branded queries are weaker on WebSearch (US index): o3mdm.com did not appear; answers were built from third-party profiles (Shopify partner directory, starterstory, devdiscourse, The Media Ant), one of which gives a wrong founding year (2017), and results were polluted by similar names (TMP Directional Marketing, O2, O&M, O3M SAF).
6. Facts missing everywhere: Boonze Media Solutions parent and the 2026 Premier Partner year. The founding year is present only via a third-party interview.
7. "AdFlux" has name collisions (an AdFlux marketing-automation case study by phenomenonstudio.com, an "Adflux Agency", and adflux.digital retail-media CMS). Disambiguation currently depends on the query including "O3M".

## Limitations

- Not an AI-answer test. These are search-index results. ChatGPT, Gemini, Perplexity, Copilot and Google AI Overviews were not tested (no access). The WebSearch summaries are one tool's synthesis, not a consumer AI assistant.
- Positions are list order in each tool's response, not Google rankings. They are not comparable to Search Console or rank-tracker positions.
- Single run per query, at one time. Results vary by run, time, index freshness and personalisation.
- Localisation: Firecrawl used country "India" only (no Chennai or Coimbatore city setting; application not independently verifiable). WebSearch was not localised (US-only). A real Chennai or Coimbatore user would likely see different, more local results, including a Maps or local pack that neither tool shows.
- Top 10 only. O3M may appear below position 10; that was not checked.
- Snippets are short excerpts. A page can contain O3M without the snippet showing it; listicle pages were not opened to check whether O3M is named in the body.
- Third-party claims in snippets (awards, counts, team size) were recorded, not verified.
