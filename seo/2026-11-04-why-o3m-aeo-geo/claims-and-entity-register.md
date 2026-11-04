# O3M claims and entity register: Google Ads Management page, Why O3M section

**Update 2026-11-04 (O3M decision):** O3M confirmed Boonze Media Solutions is O3M's **parent company**. Card 6 now reads "part of Boonze Media Solutions, its parent company", and `parentOrganization` was restored in the JSON-LD. The MCA registry (Tofler) lists no corporate parent, and boonze.com calls O3M a "sister company"; O3M may want to align boonze.com wording.


Date checked: 2026-11-04 (all fetches between about 11:00 and 11:30 UTC). Read-only research. No website file was edited.

Page under review: `C:\Claude\o3m-google-ads-project\website\google-ads-management\index.html` (hero line 136, `.cred-list` lines 322-327, `#why-o3m` lines 557-590, FAQ q4/q5 lines 641-646, footer lines 685-731, JSON-LD lines 29-34).

Prior evidence read first: `C:\Claude\o3m-google-ads-project\seo\2026-11-04\content-implementation\evidence\o3m-official-evidence.md`. That file used curl for o3mdm.com and Firecrawl for the Google profile (German render). Every o3mdm.com fact below was re-fetched with Firecrawl today. Where the earlier file and today's fetch agree, this is noted as "re-verified".

## Fetch log

| # | URL | Tool | Result |
|---|---|---|---|
| F1 | https://www.google.com/partners/agency?id=5398339560 | firecrawl_scrape (location IN, language en, maxAge 0) | 200, English render |
| F2 | https://o3mdm.com/trust-partnerships-recognition | firecrawl_scrape (maxAge 0) | 200 |
| F3 | https://o3mdm.com/about | firecrawl_scrape (maxAge 0, full page incl. footer) | 200 |
| F4 | https://o3mdm.com/contact | firecrawl_scrape (maxAge 0) | 200 |
| F5 | https://o3mdm.com/solutions/google-ads-management | firecrawl_scrape (maxAge 0) | 200 |
| F6 | https://o3mdm.com/technology/adflux | firecrawl_scrape (maxAge 0) | 200 |
| F7 | https://o3mdm.com/technology | firecrawl_scrape (maxAge 0) | 200 |
| F8 | https://boonze.com/ | firecrawl_scrape (maxAge 0) | 200 |
| F9 | https://boonze.com/about-us | firecrawl_scrape (maxAge 0) | 200 |
| F10 | https://o3m.in/ | firecrawl_scrape | 200 |
| F11 | https://www.tofler.in/o3m-directional-marketing-private-limited/company/U72200TN2010PTC075372 | firecrawl_scrape | 200 |
| F12 | https://advertising.amazon.com/partners/directory/details/amzn1.ads1.ma1.berv0n66sppbusu0vgd1rfbpc/O3M-Directional-Marketing | firecrawl_scrape | 200 |
| F13 | https://www.business-standard.com/content/press-releases-ani/o3m-directional-marketing-wins-2023-amazon-ads-partner-award-challenger-category-123110100593_1.html | firecrawl_scrape | 200 (paid press release, PNN advertorial) |
| F14 | https://in.linkedin.com/company/o3m-directional-marketing | firecrawl_scrape FAILED ("Enrichment is not enabled for company profiles on this team"). **Fallback: curl** (public logged-out HTML, 200). No login used. | 200 via curl |
| F15 | https://www.justdial.com/Coimbatore/O3M-Directional-Marketing-Coimbatore-Rajamanis-Ramana-Layout/0422PX422-X422-220929202408-E5P7_BZDET | firecrawl_scrape FAILED (all engines). **Fallback: curl** returned a 14-byte body (blocked). Only the search snippet is used. | Blocked |
| F16 | Google Maps listings, query "O3M Directional Marketing Chennai" and "... Coimbatore" | firecrawl_scrape, Alexandria provider `firecrawl-maps` capability `businesses/search` (20 credits) | 1 result each |
| S1 | Search "O3M Directional Marketing" | firecrawl_search (15 results) | |
| S2 | Search "O3M Directional Marketing" Chennai | firecrawl_search (15) | |
| S3 | Search "O3M Directional Marketing" Google Partner | firecrawl_search (15) | |
| S4 | Search o3mdm | firecrawl_search (15) | |
| S5 | Search O3M Directional Marketing clutch OR goodfirms OR justdial OR sulekha | firecrawl_search (10) | |

Search-snippet-only sources (not scraped) are marked "snippet" below. Snippets are Google-indexed excerpts and may be stale.

---

## 1. Claims register

Status key: verified / partially verified / approved by O3M / needs O3M approval / unsupported.

| # | Claim | Current page wording | Evidence + quote | Tool | Date checked | Status | Recommended action |
|---|---|---|---|---|---|---|---|
| 1 | Google Premier Partner for 2026 | Card: "O3M is listed as a 2026 Premier Partner in Google's Partners directory." Cred strip: "Google Premier Partner". Footer link to profile. | F1: "2026 Premier Partner" with 2026 Premier badge image (gstatic .../2026/PremierBadge.png). "...is a 2026 Premier Partner. ... is among one of the top companies within its country and has met all of the Partner requirements." Listed name: **"O3M Directional Marketing Premier SME Partner"**. Performance: "optimization score of at least 70%". Spend: "at least $10,000 USD in ad spend in the past 90 days". No specialisation or product badges shown. No partner-since year shown. Footnote: "Some aspects of this company may be self-reported, including name and number of account strategists." | firecrawl_scrape | 2026-11-04 | **Verified** (re-verified; earlier German render matched) | Keep card wording as is. It is accurate and links to the profile. Do not add "since 2010" (not on Google's profile). Ask O3M to correct the self-reported Partners name field (see Open questions). |
| 2 | Team certification | Card title "A certified team". Body: "Our team members are required to keep their Google Ads certifications up to date, so campaigns are run with current platform knowledge." FAQ q5: "people who work on Google Ads every day and keep their certifications current." | O3M F2 (Trust page): "Our team members are required to maintain up-to-date certifications across Google, Meta, and Amazon platforms." Google F1: "has specified that they have at least 10 account strategist(s), and at least 50% of them have demonstrated proficiency in Google Ads by earning Google Ads certifications." | firecrawl_scrape | 2026-11-04 | **Partially verified.** The policy is O3M's own statement (no third-party proof). Google's figure is a minimum (at least 50% of at least 10 strategists), self-reported. The title "A certified team" implies everyone is certified, which Google's figure does not support. | Retitle and scope to strategists. Safer wording below (card 5). O3M to confirm the policy covers Google Ads strategists specifically. |
| 3a | O3M founded 2010 | Cred strip: "Founded 2010". Card 6: "O3M was founded in 2010". Footer: "O3M founded 2010". JSON-LD foundingDate 2010. | F3: "O3M Directional Marketing Pvt Ltd ... Founded in 2010". F11 (Tofler, from MCA data): "incorporated on 16 April, 2010", CIN U72200TN2010PTC075372. LinkedIn F14: "Founded 2010". Justdial Chennai (S5 snippet): "Established in the year 2010". | firecrawl_scrape; curl (LinkedIn) | 2026-11-04 | **Verified** (independent registry data) | Keep. |
| 3b | Boonze established 2005 | Cred strip: "Part of Boonze Media Solutions, est. 2005". Card 6 title "Search marketing since 2005"; body "a search engine marketing company established in 2005". | F8: "Founded In 2005, We Are One Of The 1st Digital Marketing Agencies In India". F9: "Since 2005, Boonze has developed..." and "One of the first SEM agencies in India, Boonze was founded in 2005." F11 Tofler: linked company "BOONZE MEDIA SOLUTIONS PRIVATE LIMITED", CIN U72200TN**2005**PTC056004 (2005 in CIN). | firecrawl_scrape | 2026-11-04 | **Verified** | Keep the year. Fix the card title: "since 2005" reads as O3M's own start (see card 6). |
| 3c | O3M is "part of" Boonze (parent/group) | Cred strip: "Part of Boonze Media Solutions". Card 6: "founded in 2010 as part of Boonze Media Solutions". JSON-LD `parentOrganization` Boonze. | O3M F3: "O3M is part of the Boonze Media Solutions group." Boonze F8: "Discover Our **Sister Company** - O3M Directional Marketing" and "In 2010, O3M was **spun-out of Boonze** to address the unique needs of businesses in the Indian market." Tofler F11: Boonze listed under "Companies connected through Directors" (2 common directors: Renjith Pallath Rajan, Sumitha Renjith). Tofler does not show Boonze as shareholder or holding company. | firecrawl_scrape | 2026-11-04 | **Partially verified.** Common directors and a group relationship are supported. A legal parent (holding company) relationship is NOT shown by any public source. Boonze itself says "sister company". | Needs O3M approval of the exact relationship. Until confirmed, use "part of the Boonze Media Solutions group" (O3M's own words) or "sister company of Boonze". If Boonze is not the legal owner, change JSON-LD from `parentOrganization` to a softer link (e.g. `sameAs`-free mention, or `memberOf`/`subOrganization` only if accurate). |
| 4 | Offices Chennai + Coimbatore | Hero: "Our teams in Chennai and Coimbatore". Cred strip: "Offices in Chennai & Coimbatore". Footer addresses. JSON-LD two PostalAddress. | F4: "Chennai / Primary Operations / Palani Towers, Venkatanarayana Rd, Parthasarathi Puram, T. Nagar, Chennai, Tamil Nadu 600017" and "Coimbatore / Regional Operations / 54, Bharathi Park 7th Cross Rd, Saibaba Colony Coimbatore, Tamil Nadu 641043". F16 Google Maps: Chennai listing address identical; Coimbatore listing "54, Bharathi Park 7th Corss Rd, Saibaba Colony, Coimbatore, Tamil Nadu 641043" (typo "Corss"). | firecrawl_scrape; firecrawl-maps | 2026-11-04 | **Verified** (addresses match page). Contradictions exist elsewhere (third OMR office on o3m.in; door number A4/No. 31 missing; phone differs on Chennai GBP). | Keep. Consider adding "A4, No. 31" to the Chennai street line for NAP match with registry and o3m.in, if O3M confirms. Confirm whether the OMR office (o3m.in) still exists. |
| 5 | AdFlux is O3M's own and connects campaign, lead and sales data | Card 3: "AdFlux, built by O3M, connects campaign data with lead management and sales activity, which ordinary ad reporting can't show." AdFlux section line 545/551. | F6: "AdFlux is O3M's marketing performance and revenue operations intelligence platform." Badge "O3M Proprietary Platform". Quick answer: "It connects campaign data, lead management, CRM activity, sales execution, and revenue visibility...". FAQ: "CRM systems manage contacts and pipelines. Reporting dashboards display data. AdFlux is built to provide intelligence..." F7: "O3M's technology platforms are proprietary tools developed from practical marketing execution experience." F5: "AdFlux helps connect Google Ads performance with sales execution, lead management, CRM visibility, and business outcomes." Not found: named integrations, Google Ads API, screenshots, client access. About page (F3) still describes AdFlux differently: "Digital growth operations platform supporting workflow management, reporting, governance, quality control, and campaign accountability." | firecrawl_scrape | 2026-11-04 | **Verified** for ownership and the connect statement. **Partially verified** for "which ordinary ad reporting can't show" (O3M's own comparison; not a product fact). | Soften the comparison clause (card 3 below). Fix About-page AdFlux description mismatch separately (outside this page). |
| 6 | GA4, enhanced conversions, CRM integration, call tracking, sales follow-up offered | Card 2: "We set up conversion tracking, enhanced conversions, GA4, CRM integration and call tracking first, so the account learns from the enquiries you actually want." Card 1: "Campaign structure, conversion tracking, landing pages, CRM visibility, lead quality and sales follow-up are reviewed together". | F5 step 02: "Accurate measurement is essential. We implement conversion tracking, enhanced conversions, GA4 integration, CRM integration, call tracking, and reporting frameworks." Step 01 is "Business Understanding First". Quick answer: "Campaign structure, conversion tracking, landing pages, CRM visibility, lead quality, sales follow-up, and reporting are reviewed together". FAQ: "reviewing campaign targeting, keywords, conversion tracking, landing pages, forms, CRM processes, and sales follow-up." | firecrawl_scrape | 2026-11-04 | **Verified** for the service list and card 1 (near-verbatim). **Partially verified** for card 2's "first" (O3M puts business understanding first, tracking second) and "so the account learns" (outcome wording not on O3M site). Sales follow-up is reviewed, not performed, by O3M. | Card 1: keep. Card 2: reword (below). Keep "reviewed" for sales follow-up; never "we handle your sales follow-up". CRM integration depends on the client's CRM; add "where your CRM allows" only if O3M wants. |
| 7 | Reporting / measurement workflow | Problem 06 "Reporting that stops at clicks and impressions"; chips "Reporting frameworks"; line 430 "Lead quality, sales follow-up and reporting are reviewed together". | F5: "reporting frameworks" (step 02); Why O3M: "Transparency. Clear communication, visibility, and accountability throughout." F3: "Transparent Marketing. Clients should understand what is being done, why it is being done, and how it contributes to business goals." F6: "Improve transparency and reporting consistency across marketing, sales, and operations." **No reporting cadence (weekly/monthly), no client dashboard, no named reporting tool** on any o3mdm.com page. o3m.in (F10, Amazon context only): "Real-time dashboard tracking". | firecrawl_scrape | 2026-11-04 | **Verified** for "reporting frameworks" and transparency as a stated principle. **Unsupported** for any cadence or dashboard claim. | Current page makes no cadence/dashboard claim: keep it that way. If O3M wants a cadence (e.g. monthly report + call), it needs O3M approval before adding. |
| 8 | 10,000+ Google Ads accounts | Cred strip: "10,000+ Google Ads accounts". | F3: "10,000+ / Google Ads Accounts Managed" (with 6,000+ Amazon, 500+ Meta, 20+ years). F5: "Experience managing more than 10,000 Google Ads accounts across multiple industries." No timeframe, no definition of "managed", no O3M-vs-group scope. Conflicting public figure: F13 (2023 paid press release): "The company has also managed over 100,000 paid ad accounts." | firecrawl_scrape | 2026-11-04 | **Approved by O3M (2026-11-04).** Public evidence: O3M self-statement only; no third-party verification. | Keep as approved. Optional safer form for AI answers: "10,000+ Google Ads accounts managed since 2010" only if O3M confirms the period and that the count is O3M's (not Boonze's). Ask O3M about the 100,000 press figure. |
| 9 | Works across India and selected international markets | FAQ q4: "No. O3M has offices in Chennai and Coimbatore and works with businesses across India and selected international markets." Meta/hero: "serving clients across India". | F4 FAQ, verbatim: "Yes. O3M has offices in Chennai and Coimbatore and works with businesses across India and selected international markets." F12 Amazon directory (partner-supplied): 11 countries offered (CA, US, DE, FR, IT, NL, UK, AU, IN, SG, AE), "Office locations: India". F3: O3M bullet "Serves businesses ... in India"; Boonze bullet "Serves clients across the US, UK, and international markets". | firecrawl_scrape | 2026-11-04 | **Verified** (matches O3M's own wording verbatim). International scope is self-reported. | Keep. Do not name specific countries without O3M approval. |

---

## 2. Entity facts

| Fact | Value | Source |
|---|---|---|
| Brand name | O3M Directional Marketing (short: O3M; handle o3mdm) | F3, F4, LinkedIn F14 |
| Legal name | O3M DIRECTIONAL MARKETING PRIVATE LIMITED (site uses "O3M Directional Marketing Pvt Ltd"; o3m.in uses "(P) Ltd") | F11 Tofler (MCA data), F3 footer, F10 |
| CIN | U72200TN2010PTC075372 | F11 |
| Incorporated | 16 April 2010 | F11 |
| Registered office | A-4, First Floor, Palani Towers, 65/31, Venkitanarayana Road, T. Nagar, Chennai 600017 | F11 |
| Directors | Renjith Pallath Rajan (MD), Sumitha Renjith | F11 (same people listed as Boonze Founder / Co-Founder on F9) |
| Group / parent | O3M: "part of the Boonze Media Solutions group". Boonze: "Sister Company", "spun-out of Boonze" in 2010. Registry: connected through 2 common directors; no holding-company link shown. | F3, F8, F11 |
| Boonze legal name / founding | Boonze Media Solutions Private Limited (footer "Boonze Media Solutions P Ltd."), CIN U72200TN2005PTC056004, founded 2005 | F8, F9, F11 |
| Boonze address | A4, Palani Towers, No.31, Venkatnarayana Road, T.Nagar, Chennai 600017 (same building as O3M) | F8 |
| Office 1 | Chennai, Primary Operations: Palani Towers, Venkatanarayana Rd, Parthasarathi Puram, T. Nagar, Chennai, Tamil Nadu 600017 | F4, F16 |
| Office 2 | Coimbatore, Regional Operations: 54, Bharathi Park 7th Cross Rd, Saibaba Colony, Coimbatore, Tamil Nadu 641043 | F4, F16 |
| Phone | +91 9500 123 131 | F4, F3 footer; also Boonze F8, o3m.in F10, Coimbatore GBP F16 |
| Email | info@o3mdm.com (general), jobs@o3mdm.com (careers) | F4 |
| Website | https://o3mdm.com/ (second O3M site: https://o3m.in/, Amazon Ads focus) | F4, F10 |
| Google Partners | https://www.google.com/partners/agency?id=5398339560, 2026 Premier Partner, name field "O3M Directional Marketing Premier SME Partner" | F1 |
| Amazon Ads Partner | Advanced partner, 6 certifications, "Winner: Challenger Award - APAC" | F12 |
| Shopify Partner | Linked from footer: https://www.shopify.com/partners/directory/partner/o3mdm | F3 footer (directory not fetched) |
| LinkedIn | https://www.linkedin.com/company/1157128/ (footer) = in.linkedin.com/company/o3m-directional-marketing: Founded 2010, HQ Chennai, 11-50 employees (77 associated members), A-4, Palani Towers, 600017 | F3, F14 |
| Other social | facebook.com/IndianMarketingFirm, instagram.com/o3m_directional_marketing (also instagram.com/o3mdm), youtube.com/channel/UC85RV8fvtPyhcKur6xaAC5w, x.com/o3mdm | F3 footer, S4 |
| Languages | English, Tamil (page JSON-LD) | earlier evidence file |

---

## 3. External footprint

| URL | What it says (name / address / founding / services / partner status) | Tool | Contradiction with o3mdm.com |
|---|---|---|---|
| https://www.google.com/partners/agency?id=5398339560 | Name "O3M Directional Marketing Premier SME Partner"; 2026 Premier Partner; >=10 account strategists, >=50% certified | firecrawl_scrape | Name field contains a tier label and the retired "SME" wording. |
| Google Maps, Chennai (place_id ChIJK6oyjqxnUjoR8yO41OCaoRE) | "O3M Directional Marketing", same street address as site, rating 4.3 (121), phone **044 2432 3161**, website o3mdm.com with GMB UTM | firecrawl-maps | **Phone differs** (site: +91 9500 123 131). |
| Google Maps, Coimbatore (place_id ChIJL3yYaN1YqDsR8Q3SwpnyHes) | "O3M Directional Marketing Pvt Ltd", "54, Bharathi Park 7th **Corss** Rd", rating 4.7 (59), phone 095001 23131 | firecrawl-maps | Address typo "Corss"; name adds "Pvt Ltd" (Chennai listing does not). |
| https://in.linkedin.com/company/o3m-directional-marketing | Founded 2010; HQ Chennai; A-4, Palani Towers 600017; 11-50 employees (77 members); specialties SEM, PPC, SEO, YouTube Ads, Amazon Ads. Snippet: "100-plus man-years of experience". Post snippet: "named a 2022 Google International Growth Partner". | curl fallback (Firecrawl refused) + snippets | "100-plus man-years" vs Amazon profile "75-plus man-years". 2022 Google International Growth Partner not listed on Trust page. |
| https://advertising.amazon.com/partners/directory/details/amzn1.ads1.ma1.berv0n66sppbusu0vgd1rfbpc/O3M-Directional-Marketing | Advanced; "75-plus man-years of experience"; services PPC, SEO, SMO; 11 countries; office India; Challenger Award APAC | firecrawl_scrape | Old description (PPC/SEO/SMO, man-years) does not match current positioning. "75-plus" vs LinkedIn "100-plus". |
| https://boonze.com/ and /about-us | Founded 2005; O3M is "Sister Company", "spun-out of Boonze" in 2010; associations: "Google India Premier SMB Partner - Search, and Display Specialisations"; accolade "Winner of Google India's Highest Customer Satisfaction Award for **3 years**"; phone +91 9500123131 | firecrawl_scrape | (a) "Sister/spun-out" vs O3M "part of the group" and JSON-LD `parentOrganization`. (b) "3 years" vs O3M Trust page "four consecutive years" (2014-2017). (c) "Search and Display Specialisations": Google profile shows no specialisations today. |
| https://o3m.in/ | "O3M Directional Marketing (P) Ltd"; corporate office "A4, Palani Towers, No. 31, Venkatanarayana Road"; **third office "Chennai (OMR) IndiQube Vantage 1, ... Perungudi, Chennai-600096"**; email sales@o3mdm.com; "**20+ Years Experience**"; "3000+ Amazon Sellers Managed"; "Rs. 100Cr+ Ad Spend Optimized"; Google badge alt "Google Ads Certified Partner Logo" | firecrawl_scrape | (a) OMR office not on o3mdm.com. (b) "20+ years" attributed to O3M (founded 2010 = 16 years; 20+ is group heritage). (c) "Certified Partner" label vs Premier. (d) 3000+ sellers vs o3mdm.com 6,000+ Amazon Ads accounts (different metric, but confusing). |
| https://www.tofler.in/o3m-directional-marketing-private-limited/company/U72200TN2010PTC075372 | Legal name, CIN, incorporated 16 Apr 2010, registered office A-4, First Floor, Palani Towers, 65/31 Venkitanarayana Road; Boonze linked via common directors | firecrawl_scrape | No conflict on year. Shows no parent company. |
| https://www.business-standard.com/... (PNN press release, 1 Nov 2023) | "helping businesses grow online since 2010"; "one of the first Google Ads Premier Partners in India"; "Amazon SPN Partner since 2014"; "managed over **100,000** paid ad accounts"; "team of over 50" | firecrawl_scrape | 100,000 paid ad accounts vs 10,000+ Google Ads (+6,000 Amazon, +500 Meta) on site. Paid advertorial, not editorial. |
| https://www.justdial.com/Chennai/O3m-Directional-Marketing-Pvt-Ltd-Next-to-Vijaya-Bank-T-Nagar/044PXX44-XX44-131224120758-G7I9_BZDET | Snippet: "Established in the year 2010", "Next to Vijaya Bank, T Nagar", rating 4.2 (132) | snippet only | None found in snippet. |
| https://www.justdial.com/Coimbatore/O3M-Directional-Marketing-Coimbatore-Rajamanis-Ramana-Layout/... | Snippet: locality "**Rajamanis Ramana Layout**", rating 4.7 (59) | Firecrawl failed; curl blocked; snippet only | Locality differs from "Saibaba Colony". Not confirmed (page blocked). |
| https://www.crunchbase.com/organization/o3m-directional-marketing-pvt-ltd | Snippet: "a full-service **Google authorized** company... search marketing with local focus"; email sales@o3mdm.com | snippet only | Outdated description and partner wording. |
| https://www.facebook.com/IndianMarketingFirm/ | Snippet: "a Google AdWords Premier SME Partner"; phone +91 95001 23131 | snippet only | Retired "AdWords" / "SME" wording. |
| https://www.youtube.com/channel/UC85RV8fvtPyhcKur6xaAC5w | Snippet: "A Google Premier SME Partner, O3M is proud to have won the 2014 Google India PSP Award" | snippet only | Retired wording. |
| https://x.com/o3mdm, https://in.pinterest.com/o3mdm/ | Snippet: "specializing in search marketing with local focus" | snippet only | Outdated positioning only. |
| https://www.instagram.com/o3m_directional_marketing/ | Snippet: "recognized as the Brand Storytelling Winner - India at the Amazon..." (LinkedIn post slug "brand-storytelling-award-winner-2026") | snippet only | 2026 award not on Trust page. |
| https://rocketreach.co/o3m-directional-marketing-profile_b5d7b1daf42e3df7 | Snippet: Founded 2010; 77 employees; phone **+91 44 4501 1414** | snippet only | Phone differs. |
| https://www.indiamart.com/o3m-directional-marketing-pvt-ltd/ | Snippet: Chennai, "11 yrs", call +918047809197 | snippet only | IndiaMART proxy number (normal for IndiaMART); "11 yrs" is time on IndiaMART. |
| https://in.indeed.com/cmp/O3m-Directional-Marketing | Snippet: 11 to 50, HQ Chennai | snippet only | None. |
| https://theorg.com/org/o3m-directional-marketing | Snippet: "23 people" | snippet only | Team size varies by source (23 / 11-50 / 50+ / 77). |
| https://www.mouthshut.com/product-reviews/o3m-directional-marketing-reviews-925856547 | Snippet: "A-4/31, Palani Towers, Inner Side, 1st Floor, V N Road" | snippet only | None (fuller door number). |
| https://chennai.cataloxy.in/firms/o3mdm.com.htm, freelistingindia, ambitionbox, glassdoor, collegedunia, trustburn, glood.ai (Shopify expert) | Directory / review / employer pages. Collegedunia snippet repeats "75-plus man-years". | snippet only | Outdated boilerplate only. |
| https://www.semrush.com/blog/user/154602321/ | Snippet: Rob Peck, "Director of Client Services of Google Partner, O3M Directional Marketing" | snippet only | Boonze about page lists Rob Peck as Boonze "Director of Client Service". Shared staff between entities. |
| Clutch, GoodFirms | Not found in S5 or other searches | firecrawl_search | No profile found (absence in search is not proof none exists). |

### Contradictions list

1. **Boonze relationship.** o3mdm.com and page JSON-LD say O3M is "part of" Boonze / `parentOrganization`. Boonze.com says "Sister Company" and "spun-out of Boonze" in 2010. Registry shows only common directors.
2. **Google award count.** O3M Trust/About: Highest Customer Satisfaction Award "four consecutive years" (2014-2017). Boonze.com: "3 years. The only 1st place winner ever." Press release 2023: "four years in a row".
3. **Account volume.** Site: 10,000+ Google Ads accounts (approved). 2023 press release: "over 100,000 paid ad accounts".
4. **Years.** o3m.in: "20+ Years Experience" for O3M (O3M is 16 years old; 20+ is Boonze/group). o3mdm.com mixes "15+ years" (Trust, Contact) and "20+ years of search marketing heritage" (About, Home).
5. **Offices.** o3m.in lists a third office, Chennai OMR (IndiQube Vantage 1, Perungudi 600096). o3mdm.com lists two. Justdial Coimbatore uses locality "Rajamanis Ramana Layout" (page blocked; unconfirmed).
6. **Phone.** Chennai Google Business Profile: 044 2432 3161. RocketReach: +91 44 4501 1414. Site: +91 9500 123 131.
7. **Email.** Site: info@o3mdm.com. o3m.in and Crunchbase: sales@o3mdm.com.
8. **Address detail.** Site omits the door number. Registry, Boonze, o3m.in, LinkedIn, MouthShut include "A-4" / "No. 31" (registry "65/31"). Coimbatore GBP has typo "Corss Rd".
9. **Partner naming.** Google Partners name field "Premier SME Partner"; Facebook/YouTube "AdWords Premier SME Partner"; Boonze "Premier SMB Partner - Search, and Display Specialisations" (no specialisations on today's profile); o3m.in "Google Ads Certified Partner"; Crunchbase "Google authorized". Site: "Google Premier Partner".
10. **Experience boilerplate.** Amazon directory "75-plus man-years"; LinkedIn "100-plus man-years".
11. **Team size.** 23 (The Org), 11-50 (LinkedIn, Indeed), "over 50" (2023 press), 77 (LinkedIn members, RocketReach). Google: at least 10 account strategists.
12. **AdFlux description.** About page "Digital growth operations platform supporting workflow management, reporting, governance, quality control, and campaign accountability" vs AdFlux/Technology pages "marketing performance and revenue operations intelligence platform".
13. **Awards not on Trust page.** 2022 Google International Growth Partner (LinkedIn post snippet); 2026 Amazon Brand Storytelling Winner - India (Instagram/LinkedIn snippet); Home page finalist entries 2018/2023 (earlier evidence file).

---

## 4. Recommended wording for the six Why O3M cards

| Card | Current | Status | Recommendation |
|---|---|---|---|
| 1 Judged on enquiries and sales | "Campaign structure, conversion tracking, landing pages, CRM visibility, lead quality and sales follow-up are reviewed together, so advertising decisions are tied to business results rather than clicks." | Verified | Keep. |
| 2 Measurement comes before optimisation | "We set up conversion tracking, enhanced conversions, GA4, CRM integration and call tracking first, so the account learns from the enquiries you actually want." | Partially verified | "Once we understand your business and sales process, we set up conversion tracking, enhanced conversions, GA4, CRM integration and call tracking, so optimisation is based on the enquiries you actually want." |
| 3 Our own technology | "AdFlux, built by O3M, connects campaign data with lead management and sales activity, which ordinary ad reporting can't show." | Verified / comparison partially | "AdFlux, O3M's own platform, connects campaign data with lead management, CRM activity and sales execution, so we can see which campaigns lead to real opportunities, not just clicks." |
| 4 Google Premier Partner | "O3M is listed as a 2026 Premier Partner in Google's Partners directory." + link | Verified | Keep. Optionally add Google's own criteria: "...which requires an optimisation score of at least 70% and meeting Google's spend and certification requirements." |
| 5 A certified team | Title implies everyone is certified. | Partially verified | Title: "Google Ads-certified strategists". Body: "Google's Partners profile lists at least 10 O3M account strategists, at least half of them Google Ads certified. Our team members are required to keep their platform certifications up to date." (needs O3M approval) |
| 6 Search marketing since 2005 | Title attributes 2005 to O3M. Body "founded in 2010 as part of Boonze Media Solutions". | Partially verified | Title: "Search marketing heritage since 2005". Body: "O3M was founded in 2010 and is part of the Boonze Media Solutions group, a search engine marketing company established in 2005. We work from offices in Chennai and Coimbatore." (Use "sister company of Boonze" instead if O3M confirms Boonze is not the legal parent.) |

Cred strip: change "Part of Boonze Media Solutions, est. 2005" to "Part of the Boonze Media Solutions group (est. 2005)" pending item 1 below. Other strip items OK.

---

## 5. Open questions for O3M

1. Is Boonze Media Solutions Pvt Ltd the legal parent (shareholder) of O3M, or a sister company under common directors? This decides `parentOrganization` in JSON-LD and the "part of" wording. Boonze.com currently says "sister company" and "spun-out".
2. Does the 10,000+ Google Ads accounts figure (approved 2026-11-04) cover O3M only, or Boonze as well, and over what period? How should the 2023 press figure "over 100,000 paid ad accounts" be reconciled?
3. Can O3M confirm the certification policy covers all Google Ads account strategists, and approve the Google-profile-based wording for card 5?
4. Is the Chennai OMR office (IndiQube Vantage 1, Perungudi 600096, on o3m.in) still active? If yes, should it appear on o3mdm.com; if no, remove from o3m.in.
5. Which phone should be canonical? Chennai Google Business Profile shows 044 2432 3161; site uses +91 9500 123 131. Align GBP or the site.
6. Should the Chennai address include "A4, No. 31" (as on registry, Boonze, o3m.in, LinkedIn) for NAP consistency?
7. Fix requests for external profiles: Google Partners name field ("...Premier SME Partner"), Coimbatore GBP typo "Corss Rd", Amazon directory and LinkedIn "man-years" boilerplate, Crunchbase "Google authorized", Facebook/YouTube "AdWords Premier SME Partner", o3m.in "20+ Years Experience" and "Google Ads Certified Partner" label.
8. Google Customer Satisfaction Award: three years (Boonze.com) or four consecutive years 2014-2017 (o3mdm.com)? Which entity received it?
9. Should the 2022 Google International Growth Partner and the 2026 Amazon Brand Storytelling award be added to the Trust page, or are they not to be claimed?
10. Is there a reporting cadence or client dashboard O3M wants to state (e.g. monthly report)? Nothing public supports one today.
11. Is the Coimbatore Justdial locality "Rajamanis Ramana Layout" an old address? (Page blocked to automated fetch.)

## Not checked

- Shopify Partner directory page and Amazon Seller Central SPN page (linked, not fetched).
- Justdial pages (blocked), Crunchbase, Facebook, Instagram, RocketReach (snippets only; may need login or block bots). No login attempted.
- Award claims against Google/Amazon announcements (except Amazon directory badge and the 2023 press release).
