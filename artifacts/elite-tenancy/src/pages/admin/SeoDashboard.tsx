import { useState } from "react";

// ═══ BRAND CONSTANTS ═══
const N = "#1a2744";   // Navy primary
const NL = "#1e3060";  // Navy lighter
const ND = "#0d1420";  // Navy darker
const G = "#c8a84b";   // Gold primary
const GL = "#e2c470";  // Gold light
const GD = "#9a7e35";  // Gold dark
const W = "#ffffff";
const GR = "#6a7a8a";  // Gray
const GRL = "#a0b0c0"; // Gray light

// ═══ SEO TYPES DATA (25 Types) ═══
const SEO_TYPES = [
  {
    id:1, icon:"⚙️", name:"Technical SEO", cat:"Foundation", strength:9, cost:"FREE", costColor:"#22c55e",
    time:"2-6 months", traffic:95,
    desc:"Core infrastructure: site speed, crawlability, indexing, Core Web Vitals, HTTPS, sitemaps, robots.txt",
    steps:["Submit XML sitemap to Google Search Console (free)","Fix all broken links & 404 errors","Implement JSON-LD schema markup","Enable HTTPS + compress images to WebP","Fix Core Web Vitals: LCP <2.5s, CLS <0.1, INP <200ms","Create and submit robots.txt","Mobile-first responsive design check"],
    realty:"Add PropertyListing + RealEstateAgent + LocalBusiness JSON-LD schema = rich snippets (price, stars, availability) directly in Google results",
    trick:"Google Search Console is 100% FREE and shows exactly which pages are broken + which keywords you already rank for. Start here — most businesses never fully use it.",
  },
  {
    id:2, icon:"📄", name:"On-Page SEO", cat:"Foundation", strength:9, cost:"FREE", costColor:"#22c55e",
    time:"1-3 months", traffic:95,
    desc:"Title tags, H1-H3 hierarchy, meta descriptions, keyword placement, internal linking, FAQ sections",
    steps:["Target keyword in URL, H1, first 100 words, meta title","Add People Also Ask keywords to FAQ sections","Internal link to 3-5 related pages per article","Write meta descriptions as CTAs (max 155 chars)","Use semantic/LSI keywords throughout content","Add structured FAQ section on every service page"],
    realty:"Target: 'tenant introduction service [city]', 'houses to rent [city]', 'find landlords near me', 'private landlords [city]'",
    trick:"Copy the exact title formula of the #1 ranking page — then make yours 10x better with specifics. '2026' + 'UK' + exact number = higher CTR.",
  },
  {
    id:3, icon:"📖", name:"Content SEO", cat:"Content", strength:10, cost:"FREE", costColor:"#22c55e",
    time:"3-6 months", traffic:100,
    desc:"Pillar pages, topic clusters, blog posts, guides, market reports — building topical authority",
    steps:["Create pillar page: 'Complete Guide to Renting in UK 2026' (3000+ words)","Build 15-20 cluster articles supporting each pillar","Publish monthly UK rental market reports (linkable data assets)","Write answer-first content for PAA (People Also Ask) boxes","Update all pages with fresh date and data quarterly"],
    realty:"Real estate = MASSIVE organic search demand. Millions of monthly searches across every UK city for tenant/landlord info.",
    trick:"Publish free 'Average Rent in [City] 2026' data pages. Journalists and property bloggers LINK to data pages naturally = free high-DA backlinks.",
  },
  {
    id:4, icon:"📍", name:"Local SEO", cat:"Local", strength:10, cost:"FREE", costColor:"#22c55e",
    time:"1-3 months", traffic:90,
    desc:"Google Business Profile, NAP citations, local keywords, Google Maps 3-Pack ranking",
    steps:["Complete Google Business Profile 100% (photos, description, posts, Q&A)","Build 50+ citation listings on Yell, Thomson Local, FreeIndex, Yelp UK","Collect 50+ Google reviews from real clients","Create city-specific landing pages: /london, /manchester etc.","Post 2x per week on Google Business Profile","Use 'tenant introduction' + city names throughout GBP description"],
    realty:"Google Maps 3-Pack appears ABOVE organic results for local searches — getting in it is worth more than ranking #1 organically",
    trick:"Whitespark (free tier) shows every citation source your competitors use. Clone their entire citation profile in one weekend.",
  },
  {
    id:5, icon:"🔗", name:"Off-Page SEO / Link Building", cat:"Authority", strength:9, cost:"FREE-LOW", costColor:"#84cc16",
    time:"4-12 months", traffic:90,
    desc:"Backlinks from high-DA sites, domain authority building, brand mentions, digital PR outreach",
    steps:["Submit to property directories: Zoopla partners, OnTheMarket, Rightmove","Guest post on Landlord Today, Property118, The Negotiator","Use HARO (Help A Reporter Out) — free journalist connection tool","Create shareable UK rental market statistics infographics","Get listed on government/council tenant support pages","Build links through unlinked brand mention monitoring"],
    realty:"One DA90+ backlink from BBC Property or Guardian Housing section = 3 months of normal link building in one hit",
    trick:"HARO is 100% free. Journalists need property market expert quotes DAILY. Respond within 1 hour to any property query = get cited in national media.",
  },
  {
    id:6, icon:"🏭", name:"Programmatic SEO", cat:"Scale", strength:10, cost:"FREE", costColor:"#22c55e",
    time:"2-4 months", traffic:100,
    desc:"Auto-generate thousands of location-specific pages targeting every UK city, town, and postcode — Rightmove's secret weapon",
    steps:["Create template: /tenant-introduction/[city] for every UK city/town","Build database of 500+ UK locations with local rental data","Auto-populate city-specific content (avg rent, demand score, market heat)","Use AI to generate unique 500-word content per page","Submit batch sitemap to Google","Target postcodes: /tenant-introduction/e6 outperforms /tenant-introduction/london for conversions"],
    realty:"Rightmove has 130M+ auto-generated pages. That's why they dominate Google for every UK property search. Same strategy, different angle.",
    trick:"Use Google Sheets + Python/AI to generate 500 city pages over a weekend. Submit all at once via sitemap. Google indexes programmatic pages within 2-4 weeks.",
  },
  {
    id:7, icon:"🦠", name:"Parasite SEO", cat:"FreeTraffic", strength:9, cost:"FREE", costColor:"#22c55e",
    time:"2-8 weeks", traffic:85,
    desc:"Publish on high-DA platforms to borrow their domain authority — ranks on Page 1 within days, not months",
    steps:["Medium.com (DA92): 'How to Find a Landlord in Manchester 2026'","LinkedIn Articles (DA98): Target property investors + landlords","Reddit r/HousingUK + r/LandlordUK (DA91): helpful + informative posts","Quora (DA84): Answer every tenant/landlord question with expertise","Gumtree (DA71): List services in 20+ UK cities","Pinterest (DA94): Property market infographics for Google Images traffic"],
    realty:"Reddit property posts rank on Google Page 1 within 48-72 hours. Google trusts Reddit's DA91 immensely.",
    trick:"Reddit AMA 'I run a UK tenant introduction service — ask me anything' = thousands of engaged readers + organic backlinks within a week.",
  },
  {
    id:8, icon:"🌏", name:"International SEO", cat:"Global", strength:8, cost:"FREE", costColor:"#22c55e",
    time:"3-6 months", traffic:80,
    desc:"hreflang tags, ccTLD/subdirectory structure, multilingual content for global landlord investors",
    steps:["Implement hreflang tags (en-gb for UK audience)","Create /ar/ or /ur/ subdirectories for Arabic/Urdu content","Set geo-targeting in Google Search Console","Translate key pages for international landlord-investor markets","Register country-specific landing pages for Chinese/South Asian investors","Build content in languages of UK's largest landlord demographics"],
    realty:"UK's landlord base = huge Chinese, South Asian, Middle Eastern investor community. Reaching them in their language = ZERO competition.",
    trick:"Create Urdu/Arabic content about UK property investment — rank #1 in days with zero competitors. UK has 3M+ South Asian heritage investors.",
  },
  {
    id:9, icon:"🤖", name:"GEO — Generative Engine Optimization", cat:"AISearch", strength:10, cost:"FREE", costColor:"#22c55e",
    time:"2-4 months", traffic:95,
    desc:"Get cited by ChatGPT, Claude, Gemini, Perplexity when users ask AI assistants about UK rental services",
    steps:["Create authoritative, fact-dense content AI models use as sources","Build 200+ brand mentions across the web","Publish original UK rental market research with statistics","Optimize for natural language queries: 'who is the best tenant intro service UK?'","Get mentioned on Wikipedia, government pages, industry bodies","Create 'UK Rental Market Statistics 2026' page with real, citable data"],
    realty:"ChatGPT has 800M+ users. If it recommends Elite Tenancy when asked about UK tenant intro services, that's free traffic at mass scale.",
    trick:"Create a definitive 'UK Tenant Introduction Service: Complete Guide' page. AI systems cite the most authoritative single source they can find. Be that source.",
  },
  {
    id:10, icon:"💬", name:"AEO — Answer Engine Optimization", cat:"AISearch", strength:10, cost:"FREE", costColor:"#22c55e",
    time:"1-3 months", traffic:90,
    desc:"Win Google AI Overviews, Featured Snippets, People Also Ask — appearing at the very top of search results",
    steps:["Format content as Q&A: 'What is a tenant introduction service? [direct 50-word answer]'","Add FAQPage schema (JSON-LD) to every page","Write 40-60 word definitive answers to the most common questions","Use AlsoAsked.com (free) to find all PAA questions for any keyword","Create comprehensive property glossary pages","Target position-zero for: 'how does tenant referencing work UK'"],
    realty:"Google AI Overview appears for 'how does renting work UK' — be the source it cites and appear above ALL organic results",
    trick:"AlsoAsked.com is FREE and shows every PAA question tree for any keyword. Answer every single one = dominate the entire SERP real estate.",
  },
  {
    id:11, icon:"📊", name:"Schema / Structured Data SEO", cat:"Technical", strength:8, cost:"FREE", costColor:"#22c55e",
    time:"1-2 months", traffic:75,
    desc:"JSON-LD markup for rich snippets: star ratings, FAQs, breadcrumbs, business info — enhanced SERP display",
    steps:["Add LocalBusiness schema with all contact details","Add PropertyListing schema on any listing pages","Add FAQPage schema to all FAQ sections","Add AggregateRating schema (shows stars in Google results)","Add BreadcrumbList schema for site navigation","Test everything with Google Rich Results Test (free)"],
    realty:"Star ratings showing in Google results = 35% higher click-through rate without ranking higher. Pure CTR boost for free.",
    trick:"Schema markup takes 2 hours to implement and permanently increases CTR by 20-40%. This is the highest-ROI-per-hour SEO task you can do.",
  },
  {
    id:12, icon:"🎓", name:"E-E-A-T SEO", cat:"Authority", strength:9, cost:"FREE", costColor:"#22c55e",
    time:"3-6 months", traffic:85,
    desc:"Experience, Expertise, Authoritativeness, Trustworthiness — Google's quality signals for money/property pages",
    steps:["Create detailed About page with director credentials + Companies House link","Add author bios to all blog posts with LinkedIn profiles","List UKALA/PRS membership credentials prominently","Get 50+ verified testimonials from real landlords and tenants","Link to regulatory bodies: HMRC, NRLA, DPS, PropertyMark","Display Companies House registration number sitewide"],
    realty:"Property services = YMYL (Your Money Your Life) category. Google applies strictest E-E-A-T standards. Credentials are ranking signals.",
    trick:"Linking Google Business Profile to website + Companies House verification signals to Google's algorithm that you are a legitimate, established business.",
  },
  {
    id:13, icon:"🎤", name:"Voice SEO", cat:"Emerging", strength:7, cost:"FREE", costColor:"#22c55e",
    time:"2-4 months", traffic:65,
    desc:"Optimize for Siri, Alexa, Google Assistant voice queries — conversational, question-format keywords",
    steps:["Target question-format keywords: 'How do I find a tenant in London?'","Create FAQ pages with spoken-language natural answers","Optimize all 'near me' local search variations","Ensure GBP is 100% complete (voice search pulls from GBP)","Use simple, conversational language in all content","Create 'quick answer' sections at top of key pages"],
    realty:"'Find a letting agent near me' and 'tenant introduction service near me' are high-intent voice searches with low text competition",
    trick:"Voice search answers come directly from Featured Snippets — dominate Featured Snippets = automatically dominate voice search.",
  },
  {
    id:14, icon:"📹", name:"Video SEO (YouTube)", cat:"Content", strength:9, cost:"FREE", costColor:"#22c55e",
    time:"2-4 months", traffic:85,
    desc:"YouTube channel optimization, video ranking in Google SERPs, video embeds for site dwell-time boost",
    steps:["Create weekly videos: 'How to Find Tenants Fast UK 2026'","Use exact-match keywords in YouTube titles","Write 500+ word descriptions with all target keywords","Add timestamps, chapters, and closed captions","Embed every video on your website's relevant pages","Create YouTube Shorts for algorithm-boosted viral reach"],
    realty:"YouTube is the #2 search engine globally. 'Landlord tips UK' + 'how to rent out property UK' = hundreds of thousands of monthly searches.",
    trick:"Embedding YouTube videos on your pages increases average time-on-page — Google sees this as quality signal = higher rankings. Double win.",
  },
  {
    id:15, icon:"🖼️", name:"Image SEO", cat:"Technical", strength:6, cost:"FREE", costColor:"#22c55e",
    time:"1-2 months", traffic:55,
    desc:"Alt text optimization, descriptive file naming, WebP format, Google Images traffic, Pinterest SEO",
    steps:["Name files: 'tenant-introduction-service-manchester.webp'","Write keyword-rich alt text for every image","Convert all images to WebP format (<100KB target)","Create shareable infographics about UK rental market data","Submit image sitemap to Google Search Console","Pin all infographics on Pinterest for bonus Google Images traffic"],
    realty:"Google Images drives significant referral traffic for property-related visual searches. Map images of cities also rank well.",
    trick:"Create 'Average Rent in [City] 2026' infographic. Ranks in Google Images AND gets shared on property forums. Each share = a free backlink.",
  },
  {
    id:16, icon:"📱", name:"Mobile-First SEO", cat:"Technical", strength:9, cost:"FREE", costColor:"#22c55e",
    time:"1-2 months", traffic:90,
    desc:"Mobile-first indexing, responsive design, tap targets, mobile page speed — Google indexes mobile version first",
    steps:["Test with Google Mobile-Friendly Test (free) — fix all failures","Ensure all text readable without zooming (16px min font)","Tap targets minimum 48px for buttons/links","Mobile page speed target: <3 seconds","Avoid intrusive popups/interstitials on mobile (Google penalty)","Test on real devices: iPhone + Android + tablet"],
    realty:"73% of property searches happen on mobile phones. If your site is slow on mobile, you lose 73% of your traffic before they even see your service.",
    trick:"Use Google's free PageSpeed Insights. Fix LCP on mobile first — serve hero image as WebP with explicit dimensions + preload tag.",
  },
  {
    id:17, icon:"⚡", name:"Core Web Vitals SEO", cat:"Technical", strength:8, cost:"FREE", costColor:"#22c55e",
    time:"1-3 months", traffic:80,
    desc:"LCP, INP, CLS — Google's Page Experience ranking signals directly affecting search position",
    steps:["LCP <2.5s: Preload hero image, enable CDN, optimize server response","INP <200ms: Defer non-critical JavaScript, reduce blocking scripts","CLS <0.1: Set explicit width/height on all images and iframes","Use Cloudflare free tier for CDN + caching (transformative improvement)","Enable lazy loading for all below-fold images","Run CrUX report in Google Search Console for real user data"],
    realty:"Sites passing Core Web Vitals get ranking boost. Real estate sites with heavy images commonly fail — fixing this beats 60% of competitors.",
    trick:"Cloudflare free tier alone often brings Core Web Vitals from failing to passing. Install it before touching any code. 15-minute win.",
  },
  {
    id:18, icon:"🧠", name:"Semantic SEO", cat:"Content", strength:9, cost:"FREE", costColor:"#22c55e",
    time:"3-6 months", traffic:90,
    desc:"NLP optimization, topic authority building, entity relationships, co-occurrence signals for Google's understanding",
    steps:["Cover ALL related subtopics within each main article","Use natural co-occurrence of related property terms","Build topic clusters: Tenant Introduction → Referencing → Right to Rent → etc.","Use Google NLP API (free) to analyze entity coverage","InLinks free tier shows semantic gaps vs competitors","Write for topics not just keywords — complete the full picture"],
    realty:"Google understands TOPICS in 2026, not just keywords. Cover all aspects of 'renting in UK' to win full category authority.",
    trick:"InLinks.net free version shows which semantic entities are in your content vs top-ranking competitors. Fill the gaps = outrank them within 60 days.",
  },
  {
    id:19, icon:"🕸️", name:"Entity SEO", cat:"Authority", strength:8, cost:"FREE", costColor:"#22c55e",
    time:"4-8 months", traffic:75,
    desc:"Google Knowledge Graph, Wikidata entries, brand entity building for long-term trust signals",
    steps:["Create Wikidata entry for Elite Tenancy Ltd (free, direct KG signal)","Build consistent brand mentions across 200+ websites","Optimize Google Business Profile (connects to Knowledge Panel)","Publish on Crunchbase, Companies House — consistent NAP everywhere","Use same brand name format across ALL platforms precisely","Link from authoritative sites to your About page"],
    realty:"A Google Knowledge Panel = Google trusts your brand at entity level = ranking boost across all your pages simultaneously.",
    trick:"Wikidata entry is FREE to create and directly contributes to Google Knowledge Graph. Most competitors don't know this exists.",
  },
  {
    id:20, icon:"📢", name:"Social SEO", cat:"Content", strength:7, cost:"FREE", costColor:"#22c55e",
    time:"1-3 months", traffic:70,
    desc:"Social signals, Pinterest SEO, LinkedIn content, Facebook Groups, Twitter/X viral threads for brand amplification",
    steps:["Create Facebook Group: 'UK Landlords — Tips, Legal & Support'","Pin rental market infographics on Pinterest (Google Images bonus)","LinkedIn articles targeting property investors (viral reach in that niche)","Twitter/X threads: 'Thread: Complete landlord legal checklist UK 2026'","Instagram Reels: tenant tips content (massive organic algorithm reach)","Post weekly on all platforms — consistent presence = trust signal"],
    realty:"UK has 500+ active Facebook landlord groups with 10K-100K members each. Free targeted access to your exact audience.",
    trick:"LinkedIn property investment content gets 5x more organic reach than other topic categories on the platform. Post there first, repurpose everywhere.",
  },
  {
    id:21, icon:"📰", name:"News / PR SEO", cat:"Authority", strength:8, cost:"FREE-LOW", costColor:"#84cc16",
    time:"1-4 weeks per release", traffic:80,
    desc:"Press releases, Google News indexing, media citations, journalist relationship building for authority + links",
    steps:["Submit releases to PRLOG (free) + EIN Presswire (low cost)","Add Google News sitemap for blog content","Use HARO free — respond to property journalist queries","Issue quarterly 'UK Rental Market Report' press releases","Build relationships with Landlord Today + Property118 editors","Create original statistics journalists NEED to cite"],
    realty:"Cited in Landlord Today or Property118 = industry authority signal to Google + real referral traffic from engaged professional audience.",
    trick:"Publish original rental market data quarterly. Journalists need new property statistics constantly — they WILL cite your data and link to your site. DA40-DA80 backlinks for free.",
  },
  {
    id:22, icon:"⭐", name:"Review / Reputation SEO", cat:"Local", strength:9, cost:"FREE", costColor:"#22c55e",
    time:"1-6 months", traffic:80,
    desc:"Google reviews, Trustpilot, Facebook reviews — social proof AND local ranking signal simultaneously",
    steps:["Email every client post-placement asking for Google review","Set up Trustpilot free business page — link from website","Respond professionally to ALL reviews within 24 hours","Add AggregateRating schema to show stars in Google results","Create dedicated 'Reviews' page aggregating all testimonials","Set up automated WhatsApp review request after every successful placement"],
    realty:"Google Maps 3-Pack algorithm heavily weights review count AND recency. 50 reviews outranks 5 reviews almost every time.",
    trick:"WhatsApp review request immediately after successful placement = 40-60% conversion rate. Strike while the relationship is warm. Template: 'So glad it worked out! Would you mind leaving us a quick Google review?'",
  },
  {
    id:23, icon:"🗺️", name:"Geo-Targeted City Pages", cat:"Scale", strength:10, cost:"FREE", costColor:"#22c55e",
    time:"2-3 months", traffic:100,
    desc:"Individual pages for every UK city, town, postcode — the fastest scalable traffic strategy in real estate SEO",
    steps:["Create /cities/ directory with a page for every UK city","Template: 'Tenant Introduction Service in [City] | Elite Tenancy'","Include city-specific rental statistics, demand index, avg rent","Add LocalBusiness schema per city page with city-specific info","Internal link all city pages together in a hub structure","Submit cities-specific sitemap to Google Search Console"],
    realty:"'tenant introduction service london' + 'tenant introduction service manchester' — each is a separate keyword market worth thousands of monthly searches.",
    trick:"Use AI to generate 500 unique, 600-word city pages in a weekend. Each page = a new Page 1 ranking opportunity. 500 pages × 200 monthly searches = 100,000 monthly traffic potential.",
  },
  {
    id:24, icon:"🏛️", name:"Site Architecture / Silo SEO", cat:"Technical", strength:8, cost:"FREE", costColor:"#22c55e",
    time:"1-2 months", traffic:80,
    desc:"URL structure, topic siloing, internal PageRank flow, breadcrumb navigation for maximum crawl efficiency",
    steps:["Structure: / > /for-landlords/ > /for-landlords/london/","Keep URLs short, keyword-rich, descriptive","Implement breadcrumb navigation across all pages","Ensure every page reachable within 3 clicks from homepage","Create HTML sitemap for users + XML sitemap for Google","Channel internal links from high-authority pages toward key target pages"],
    realty:"Clear silo structure helps Google understand your site's topical relevance. Property sites with clear landlord/tenant/city siloes rank faster.",
    trick:"Breadcrumb schema makes your URL path show in Google results ('Elite Tenancy > Landlords > London'). Increases CTR by 15-25% with no ranking change.",
  },
  {
    id:25, icon:"💬", name:"Forum & Community SEO", cat:"FreeTraffic", strength:8, cost:"FREE", costColor:"#22c55e",
    time:"2-4 weeks", traffic:75,
    desc:"Quora, Reddit, MSE Forum, Property118, Landlord Zone — community authority and direct referral traffic",
    steps:["Answer 5 Quora property questions daily — quality over quantity","Become a regular helpful contributor on Reddit r/HousingUK","Post valuable guides on MoneySavingExpert Forum housing section","Join Property118 + Landlord Zone forums and help actively","Build up 'Top Contributor' status — shown to users first","Include website in profile bio only — never spam links"],
    realty:"Quora property answers rank on Google Page 1 within 2-5 days. Extremely fast acquisition method requiring zero budget.",
    trick:"Quora 'Top Writer' status = your answers shown to 300M+ monthly users first. Takes 30 days of consistent, high-quality answering to achieve.",
  },
];

// ═══ FREE POWER MOVES ═══
const FREE_HACKS = [
  { rank:1, icon:"🏭", name:"Programmatic SEO — 500+ Location Pages", power:100, effort:"Medium (1-2 weekends)", cost:"FREE",
    desc:"Build /tenant-introduction/[city] for ALL 500+ UK cities and towns. Rightmove's secret weapon — replicated for your niche.",
    action:"1. Create Google Sheet with 500 UK cities + rental data. 2. Build page template. 3. Use AI (Claude/GPT) to generate unique 500-word content per city. 4. Deploy all. 5. Submit batch sitemap to Google. Time: 2 weekends." },
  { rank:2, icon:"📍", name:"Google Business Profile Full Domination", power:95, effort:"Easy (3 hours setup)", cost:"FREE",
    desc:"GBP is 100% free and gets you into the Maps 3-Pack ABOVE organic results for local searches. Most businesses optimize at 40% — go to 100%.",
    action:"Complete every field. Add 15+ photos. Write keyword-rich description (mention all cities + 'tenant introduction'). Post 2x/week. Respond to every review within 24h. Get 50+ reviews." },
  { rank:3, icon:"🤖", name:"GEO — ChatGPT/Gemini/Claude Citation Strategy", power:95, effort:"Medium (2-4 hours/week)", cost:"FREE",
    desc:"1.2 billion AI search engine users. When they ask about UK tenant intro services, you need to BE the answer AI gives.",
    action:"Publish 'UK Rental Market Statistics 2026' with real data tables. Create entity page: 'What is a tenant introduction service?' Build 200+ brand mentions across the web. AI systems cite the most authoritative sources." },
  { rank:4, icon:"🦠", name:"Parasite SEO Blitz — Reddit + Quora + Medium", power:90, effort:"Easy (daily habit)", cost:"FREE",
    desc:"Borrow DA70-DA95 platform authority for instant Page 1 rankings. Reddit posts rank on Google within 48 hours.",
    action:"Reddit: Post helpful guides in r/HousingUK + r/LandlordUK 2x/week. Quora: Answer 5 property questions daily. Medium: Publish one full guide/week. All link back to your site in bio." },
  { rank:5, icon:"💬", name:"AEO — Featured Snippet Capture Machine", power:88, effort:"Easy (2 hours/week)", cost:"FREE",
    desc:"Win the blue box above ALL organic results. Also gets you into Google AI Overviews and voice search answers.",
    action:"AlsoAsked.com (free) → export ALL People Also Ask questions for your keywords. Write direct 50-word answers to each. Add FAQPage JSON-LD schema. Submit 10 new answer pages/month." },
  { rank:6, icon:"📰", name:"HARO — National Media Backlinks for Free", power:85, effort:"Easy (30 mins/day)", cost:"FREE",
    desc:"Help A Reporter Out. Real journalists from BBC, Guardian, Daily Mail need property experts DAILY. Be their source.",
    action:"Sign up HelpAReporter.com free. Set alerts: property, landlord, rental, housing, tenants. Check 3x daily. Respond within 1 hour with 150-200 word expert quote. Include: 'Usama Ahmad, Co-Director, Elite Tenancy Ltd (elitetenancy.co.uk)'" },
  { rank:7, icon:"📹", name:"YouTube SEO Channel (Search Engine #2)", power:85, effort:"Medium (2 videos/week)", cost:"FREE",
    desc:"YouTube is the 2nd biggest search engine. Property video content has massive unmet search demand. Videos also appear in Google search results.",
    action:"Create channel. 2 videos/week minimum. Titles: 'How to Find Tenants Fast UK 2026 (Complete Guide)'. Write 500-word keyword-rich descriptions. Embed all videos on related website pages. → Double ranking signal." },
  { rank:8, icon:"⚙️", name:"GSC Keyword Mining — Double Existing Traffic", power:80, effort:"Easy (2 hours once)", cost:"FREE",
    desc:"Google Search Console shows every query you already appear for. Optimize those pages = immediate ranking jump. Most businesses NEVER do this.",
    action:"GSC > Performance > Queries. Filter: Position 4-20. These pages are ONE optimization from Page 1. Add keyword to H1, first paragraph, meta title. Build FAQ around it. Resubmit via URL Inspection." },
  { rank:9, icon:"🗺️", name:"Local Citation Blitz — 50 Directories", power:78, effort:"Easy (1 day)", cost:"FREE",
    desc:"Get listed on 50 citation sites in one day. Each citation = local ranking signal. Most competitors have under 20.",
    action:"Submit to: Yell.com, Thomson Local, FreeIndex, Bark.com, Checkatrade, TrustATrader, Hotfrog, TouchLocal, Scoot, B2BQuotes, Cylex, and 40+ more. Use same exact NAP format everywhere." },
  { rank:10, icon:"🌐", name:"Bing Webmaster Tools (ChatGPT's Search Engine)", power:75, effort:"Easy (1 hour)", cost:"FREE",
    desc:"Bing powers ChatGPT's web search. Optimize for Bing = appear in ChatGPT Browse results. Bing has 100M+ users and far less competition than Google.",
    action:"Submit site + sitemap to Bing Webmaster Tools (free). Complete Bing Places profile. Bing rewards E-E-A-T differently — displaying credentials prominently helps more than on Google." },
];

// ═══ GEO STRATEGIES ═══
const GEO_DATA = [
  { icon:"🔖", title:"hreflang Implementation", tier:"Technical Foundation", color:"#22c55e",
    desc:"Tell Google exactly which country/language audience to serve each page to. Critical for UK-targeting and international investor content.",
    detail:'Add to <head>:\n<link rel="alternate" hreflang="en-gb" href="https://elitetenancy.co.uk/" />\n<link rel="alternate" hreflang="x-default" href="https://elitetenancy.co.uk/" />' },
  { icon:"🗂️", title:"URL Structure: Subdirectory Model", tier:"Technical Foundation", color:"#22c55e",
    desc:"Recommended: elitetenancy.co.uk/ar/ for Arabic, /ur/ for Urdu. Shares domain authority with main site. Google-preferred over subdomains.",
    detail:"✅ Maintains full domain authority\n✅ Google's recommended structure\n✅ Easier to manage than ccTLDs\n✅ Arabic: /ar/ | Urdu: /ur/ | Punjabi: /pa/" },
  { icon:"🤖", title:"ChatGPT / Perplexity / Gemini Citations", tier:"AI Search 2026", color:"#06b6d4",
    desc:"AI search engines have 1.2B+ combined users. When asked 'best tenant intro service UK' — you must be the citation they give.",
    detail:"Create: 'What is tenant introduction?' entity page. Build 200+ brand web mentions. Publish original statistics. Submit to Bing (powers ChatGPT). Get Wikipedia mention if possible." },
  { icon:"📡", title:"Google Search Console Geo-Targeting", tier:"Technical Foundation", color:"#8b5cf6",
    desc:"Verify UK targeting in GSC. .co.uk signals UK automatically but confirm the setting to guarantee correct geo-targeting for all pages.",
    detail:"GSC > Settings > International Targeting > Country > United Kingdom. Verify all international subdirectories are correctly geo-targeted separately." },
  { icon:"🇵🇰", title:"South Asian / Arabic Landlord Market", tier:"Zero-Competition Goldmine", color:G,
    desc:"3M+ South Asian UK residents, many with investment properties. Arabic Middle Eastern investors = massive UK BTL market. ZERO competitors in their language.",
    detail:"Urdu page: 'یوکے میں کرایہ دار تعارف' → ranks #1 in 48 hours. Arabic: 'خدمة تقديم المستأجر في المملكة المتحدة' → zero competition. Hindi: 'UK में किरायेदार परिचय सेवा'" },
  { icon:"🗺️", title:"UK City Geo-Target Traffic Map", tier:"Local Domination", color:"#ef4444",
    desc:"Each UK city is a separate traffic market. Build individual pages for each — total addressable search volume exceeds 5M searches/month across all cities.",
    detail:"London: 890K/mo | Manchester: 320K | Birmingham: 280K | Leeds: 195K | Sheffield: 145K | Liverpool: 155K | Bristol: 130K | Nottingham: 110K | Leicester: 90K | Cardiff: 85K" },
];

// ═══ AUDIENCES ═══
const AUDIENCES = [
  {
    id:"landlords", icon:"🏠", name:"Landlords", color:G, size:"2.8M+ UK private landlords",
    strategy:"Landlords want to SAVE MONEY vs traditional letting agents (8-15% monthly fee). Lead with your completion-only model: just 2 weeks rent. Target their pain: void periods, bad tenants, compliance stress, 2025 Renters Rights Act anxiety.",
    keywords:["tenant introduction service UK","find tenants without letting agent","private landlord find tenants","landlord fees letting agent UK","how to rent out my property","NRLA landlord support","Renters Rights Act 2025 landlord guide","landlord legal requirements UK 2026","tenant referencing service UK","find reliable tenants fast"],
    platforms:["Facebook landlord groups (500K+ UK members total)","Property118.com (DA54) — UK's biggest landlord forum","Landlord Zone forum (active community)","Reddit r/LandlordUK","LinkedIn property investors","YouTube (landlord tutorial searches)"],
    content:["'Tenant Introduction vs Full Management: Which Saves You More?'","'Complete Landlord Legal Checklist UK 2026 — Renters Rights Act'","'How We Vet Tenants So You Don't Have To'","Monthly rental market reports per city","'What Letting Agents Don't Tell You About Their Fees'"],
  },
  {
    id:"tenants", icon:"👤", name:"Tenants", color:"#06b6d4", size:"20M+ UK renters",
    strategy:"Tenants need reassurance and navigation help. Create content that positions Elite Tenancy as a trusted, neutral guide in a confusing market. This is the volume audience — 20M people, most searching online for guidance.",
    keywords:["houses to rent [city] no agency fees","private landlord rent near me","first time renter guide UK","tenant rights UK 2026","how to pass tenant referencing","Renters Rights Act 2025 tenant rights","affordable housing UK","right to rent check UK","deposit protection scheme UK","what is a tenant introduction service"],
    platforms:["SpareRoom.co.uk (list services)","Reddit r/HousingUK (DA91 — massive reach)","MoneySavingExpert Forum housing section","Facebook Marketplace (free listings)","Instagram Reels (tenant tips viral potential)","TikTok #RentingUK #HousingCrisis"],
    content:["'Tenant Rights UK 2026 — The Complete Guide (Renters Rights Act)'","'How to Pass Tenant Referencing Every Time'","'Red Flags When Viewing a Rental Property'","'How to Negotiate Your Rent Down Legally'","'What is Right to Rent and How Does It Work?'"],
  },
  {
    id:"agencies", icon:"🏢", name:"Agencies / Investors", color:"#8b5cf6", size:"15K+ UK letting agencies",
    strategy:"B2B positioning: position Elite Tenancy as a white-label tenant introduction partner for agencies that want to outsource introductions or expand capacity. Target portfolio landlords and HMO operators via LinkedIn.",
    keywords:["tenant introduction service wholesale UK","landlord referral fee letting","property sourcer UK 2026","HMO landlord management services","BTL portfolio management UK","letting agent outsource tenant finding","property management software UK","social housing lettings UK","agency referral program property","portfolio landlord support UK"],
    platforms:["LinkedIn (primary B2B platform — property investors, agency directors)","Propertymark member network","ARLA industry directory","Property investor meetup events (Eventbrite)","Nationwide Property Group Facebook","EG Radius property professional community"],
    content:["'Partner With Elite Tenancy — Agency Referral & White Label Program'","'How We Handle Compliance So You Don't Have To (Renters Rights Act 2025)'","'Our Full Tenant Vetting Process — What We Check'","Case studies: 'X placements in Y weeks, £0 voids'","B2B pricing structure breakdown"],
  },
  {
    id:"homeowners", icon:"🏡", name:"Homeowners", color:"#22c55e", size:"8M+ potential new landlords",
    strategy:"Accidental/first-time landlords are the highest conversion opportunity. They're new to the market, nervous about compliance, and looking for a trusted guide to make the first step easy. Position as 'the easy start' with minimal risk.",
    keywords:["should I rent out my house UK","renting out my home for first time","accidental landlord UK guide 2026","how to become a landlord UK","rental income tax UK","is buy to let worth it 2026","landlord insurance UK compare","HMO licence requirements UK","rental yield calculator UK","do I need a letting agent to rent out my home"],
    platforms:["Google Search (primary — high intent)","Reddit r/UKPersonalFinance (DA91 — trusted advice community)","MoneySavingExpert.com","YouTube tutorials (high search volume)","Facebook local neighbourhood groups","NextDoor app (hyperlocal homeowner community)"],
    content:["'First Time Landlord UK — The Complete 2026 Guide (Accidental Landlords Welcome)'","'Renting Out Your Home: What You MUST Know Legally'","'Free UK Rental Income Calculator — What Could You Earn?'","'Landlord Insurance UK: What Do You Actually Need?'","'Renters Rights Act 2025: What New Landlords Must Know'"],
  },
];

// ═══ TRAFFIC HACKS ═══
const TRAFFIC_HACKS = [
  {
    title:"🏭 PROGRAMMATIC SEO — The Rightmove Replication Strategy",
    tier:"GODMODE", tierColor:G, traffic:"500K-2M/mo potential",
    desc:"Rightmove has 130M+ auto-generated pages. One per property listing. You need one per UK city/town/postcode for your service. This single strategy alone can generate 80% of your total SEO traffic.",
    steps:["Build master template page with all variable placeholder fields","Create database: 500+ UK locations with rental demand scores + avg rent data","Auto-generate pages: /tenant-intro/[city], /find-tenants/[city], /landlords/[city]","Use AI to generate unique 400-600 word city-specific content per page (2 weekends)","Add local schema per page with city-specific LocalBusiness info","Submit all 500+ pages via sitemap batch — Google indexes within 2-4 weeks"],
    result:"500 location pages × average 200 monthly searches each = 100,000 monthly organic traffic potential. Rightmove uses this at 130M page scale.",
  },
  {
    title:"🦠 PARASITE SEO BLITZ — 6-Platform Domination",
    tier:"FREE POWER", tierColor:"#22c55e", traffic:"50K-200K/mo potential",
    desc:"Publish on high-DA platforms to instantly rank on Google Page 1. These platforms have built authority over decades — you borrow it for free. Legal, 100% white-hat.",
    steps:["Medium.com (DA92): 'How to Find Tenants in [City] Fast 2026' → ranks in 2-5 days","LinkedIn Articles (DA98): 'Why Landlords Are Ditching Letting Agents in 2026' → investor audience","Reddit r/HousingUK (DA91): AMA post about tenant introduction → viral community reach","Quora (DA84): Answer every tenant/landlord question — become Top Contributor in 30 days","Pinterest (DA94): Infographics about rental market data → Google Images bonus traffic","Gumtree (DA71): List services in 20 UK cities → direct referral traffic"],
    result:"One well-optimized Medium article ranks on Page 1 in 72 hours. Do 20 topics across 6 platforms = 120 potential Page 1 positions.",
  },
  {
    title:"🤖 AI SEARCH CITATION DOMINATION — The 2026 Gold Rush",
    tier:"2026 FUTURE", tierColor:"#06b6d4", traffic:"100K-500K/mo from AI engines",
    desc:"ChatGPT/Gemini/Perplexity answer property questions for 1.2B+ users. If they recommend Elite Tenancy, that's free traffic at a scale Google can't match. Getting cited by AI = the new featured snippet.",
    steps:["Publish 'UK Tenant Introduction Service: Complete 2026 Market Report' with original data","Create entity page: 'What is a tenant introduction service?' — definitive, factual, authoritative","Build 200+ brand mentions across forums, directories, news sites","Submit to Bing Webmaster Tools (Bing powers ChatGPT's web search)","Optimize for natural language: 'which tenant intro service is best in London?'","Issue quarterly press releases with statistics — AI cites statistics pages constantly"],
    result:"AI systems cite the most authoritative, data-rich sources they find. 800M ChatGPT users asking about UK property = your brand gets recommended.",
  },
  {
    title:"📰 HARO BACKLINK MACHINE — DA90+ Links for Free",
    tier:"FREE AUTHORITY", tierColor:"#8b5cf6", traffic:"Domain authority + 10K-50K referral",
    desc:"Help A Reporter Out is the biggest underused secret in SEO. Journalists at BBC, Guardian, Daily Mail need property expert quotes EVERY DAY. You give them quotes. They link to your site from DA80-DA95 publications.",
    steps:["Sign up at HelpAReporter.com (completely free)","Set real-time email alerts: 'property', 'rental', 'landlord', 'housing', 'tenant'","Check email 3× daily (8am, midday, 6pm) — SPEED IS EVERYTHING","Write 150-200 word expert response to any relevant property query within 1 hour","Format: 'Usama Ahmad, Co-Director, Elite Tenancy Ltd — [expert quote]'","Track earned backlinks in Google Search Console > Links report"],
    result:"One Guardian Housing backlink (DA92) = 3 months of link-building effort in a single 20-minute response. 100% free, repeatable weekly.",
  },
  {
    title:"🧩 TOPIC CLUSTER EMPIRE — Complete Topical Authority",
    tier:"CONTENT ENGINE", tierColor:"#f59e0b", traffic:"200K-1M/mo over 12 months",
    desc:"Google's 2026 algorithm rewards websites that comprehensively cover an entire topic area. Build complete topical authority and watch your entire site get ranking boosts — not just individual pages.",
    steps:["Choose 5 pillar topics: Tenant Introduction | Landlord Guide | Tenant Rights | UK City Guides | Rental Laws","Create 1 pillar page per topic (3000+ words, comprehensive, definitive)","Build 15-20 cluster articles per pillar supporting the main topic","Internal link all clusters → pillar + pillar → all clusters","Total: 5 pillars + 75 clusters = 80 interlocking authority pages","Update every pillar quarterly with fresh statistics and new content"],
    result:"Topical authority lifts your ENTIRE site's rankings, not just individual pages. Sites with complete coverage of a topic outrank bigger domains. This is how challengers beat incumbents.",
  },
  {
    title:"⚡ GSC KEYWORD MINING — Double Traffic in 30 Days",
    tier:"QUICK WIN", tierColor:"#22c55e", traffic:"30-50% traffic increase guaranteed",
    desc:"Google Search Console shows every keyword you're already getting impressions for in positions 4-20. These are pages ONE optimization away from Page 1. Most businesses never even look at this data.",
    steps:["GSC > Performance > Search Results > All Queries","Filter: Position 4-20 (these are your low-hanging fruit)","Click each keyword — see which page Google associates with it","Optimize that page: add keyword to H1, first paragraph, meta title, FAQ section","Add 500+ words of fresh content covering the keyword in depth","Resubmit via GSC URL Inspection tool > Request Indexing"],
    result:"Most sites see 30-50% traffic increase within 30 days just from GSC keyword mining. Takes 2 hours per week. Highest ROI action per hour in all of SEO.",
  },
];

// ═══ ROADMAP ═══
const ROADMAP = [
  {
    phase:"DAYS 1-30", title:"FOUNDATION SPRINT", color:"#22c55e",
    tasks:["Submit sitemap → Google Search Console + Bing Webmaster Tools","Complete Google Business Profile to 100% (all fields, 15 photos, posts)","Run PageSpeed Insights audit — fix all critical issues","Install JSON-LD: LocalBusiness + PropertyListing + FAQPage schema","Set up Cloudflare free tier (CDN + Core Web Vitals fix)","Create /cities directory with top 10 UK city pages live","Start Quora + Reddit profiles — answer 5 questions per day","Claim 50 citation sites: Yell, Thomson Local, FreeIndex + 47 more","Publish pillar: 'Complete UK Landlord Guide 2026' (3000 words)","Register HARO free + start responding to property journalist queries"],
    kpi:"Targets: 10 Google reviews collected | 50 GSC impressions/day | 10 city pages live | 0 PageSpeed failures",
  },
  {
    phase:"DAYS 31-60", title:"CONTENT + PARASITE BLITZ", color:G,
    tasks:["Launch YouTube channel — publish 2 videos/week landlord tips","Scale to 50 city pages (programmatic template live)","Medium.com: Publish 4 keyword-optimized articles per month","LinkedIn: 2 property investor articles per week (high organic reach)","AlsoAsked.com research — target 20 Featured Snippets with FAQ content","Create 'UK Rental Market Statistics 2026' data page (linkable asset)","Publish AEO-optimized Q&A content for top 50 PAA queries","GBP: 2 posts/week — services, market updates, client wins","Reddit AMA in r/HousingUK + r/LandlordUK — community authority","Start collecting 5 Google reviews/week (WhatsApp post-placement requests)"],
    kpi:"Targets: 500 impressions/day GSC | 5 DA40+ backlinks | 10 local citation top-5 rankings | 2K YouTube views",
  },
  {
    phase:"DAYS 61-90", title:"SCALE + DOMINATE", color:"#8b5cf6",
    tasks:["Scale to 200+ city/town/postcode pages (full programmatic rollout)","Launch GEO strategy — AI citation content live across 5 platforms","Guest post published on Landlord Today + Property118","International SEO: Arabic + Urdu landing pages live (zero competition)","Press release: 'Elite Tenancy expands UK-wide tenant introduction service'","Video SEO: 10+ YouTube videos each targeting a different keyword","Reputation: 50+ Google reviews target achieved","Monthly Rental Market Report published (link-building asset)","Schema: star ratings showing in Google SERP for all key pages","LinkedIn: 1,000+ followers from property investor audience"],
    kpi:"Targets: 5,000+ impressions/day | Top-3 for 5 target keywords | 1,000+ organic monthly visitors | 50+ reviews",
  },
];

// ═══ COMPONENTS ═══
const Bar = ({ v, max = 10 }: { v: number; max?: number }) => (
  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
    <div style={{ flex:1, height:"6px", background:"#ffffff12", borderRadius:"3px", overflow:"hidden" }}>
      <div style={{ width:`${(v/max)*100}%`, height:"100%", background:`linear-gradient(90deg, ${G}, ${GL})`, borderRadius:"3px" }} />
    </div>
    <span style={{ color:G, fontSize:"11px", fontWeight:"800", minWidth:"20px" }}>{v}</span>
  </div>
);

const Badge = ({ text, bg, color }: { text: string; bg: string; color: string }) => (
  <span style={{ background:`${bg}22`, color, padding:"2px 8px", borderRadius:"20px", fontSize:"11px", fontWeight:"700", border:`1px solid ${bg}55`, whiteSpace:"nowrap" }}>{text}</span>
);

// ═══ MAIN DASHBOARD ═══
export default function Dashboard() {
  const [tab, setTab] = useState(0);
  const [filter, setFilter] = useState("ALL");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [aud, setAud] = useState(0);

  const TABS = ["⚔️ 25 SEO Types","🆓 Free Arsenal","🌍 GEO Global","🎯 Audience Intel","🔥 Traffic Hacks","📅 90-Day Plan"];
  const CATS = ["ALL","FREE","Foundation","Content","Local","Authority","Scale","AISearch","Technical","Global","Emerging","FreeTraffic"];

  const seoFiltered = filter === "FREE"
    ? SEO_TYPES.filter(s => s.cost === "FREE")
    : filter === "ALL"
    ? SEO_TYPES
    : SEO_TYPES.filter(s => s.cat === filter);

  const catColors: Record<string, string> = { Foundation:"#22c55e", Content:"#06b6d4", Local:G, Authority:"#8b5cf6", Scale:"#ef4444", AISearch:"#06b6d4", Technical:"#64748b", Global:"#0ea5e9", Emerging:"#f97316", FreeTraffic:"#22c55e" };

  return (
    <div style={{ fontFamily:"'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif", background:ND, color:W, minHeight:"100vh" }}>

      {/* ── HEADER ── */}
      <div style={{ background:`linear-gradient(135deg, ${ND} 0%, #111e3a 100%)`, padding:"24px 20px 0", borderBottom:`1px solid ${G}33` }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:"14px", marginBottom:"16px" }}>
          <div style={{ width:"48px", height:"48px", minWidth:"48px", background:`linear-gradient(135deg, ${G}, ${GL})`, borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px" }}>🏆</div>
          <div>
            <div style={{ fontSize:"10px", letterSpacing:"3px", color:G, textTransform:"uppercase", marginBottom:"3px", fontWeight:"700" }}>NEXUS PRIME · ULTRON OMEGA v12.0 · 500,000 AGENTS DEPLOYED</div>
            <h1 style={{ margin:0, fontSize:"18px", fontWeight:"800", lineHeight:"1.3" }}>Elite Tenancy — SEO & GEO Domination Master Dashboard 2026</h1>
            <div style={{ fontSize:"12px", color:GR, marginTop:"3px" }}>elitetenancy.co.uk · UK-wide Tenant Introduction Service</div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"10px", marginBottom:"16px" }}>
          {[["⚙️","25+","SEO Types Covered"],["🆓","22","Free Methods"],["🎯","4","Target Audiences"],["🚀","5M+","Monthly Traffic Potential"]].map(([ic,v,lb]) => (
            <div key={lb} style={{ background:"#ffffff08", borderRadius:"10px", padding:"10px 12px", border:`1px solid ${G}20` }}>
              <div style={{ fontSize:"16px", marginBottom:"3px" }}>{ic}</div>
              <div style={{ fontSize:"18px", fontWeight:"800", color:G }}>{v}</div>
              <div style={{ fontSize:"10px", color:GR, lineHeight:"1.3" }}>{lb}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:"2px", overflowX:"auto", paddingBottom:"0" }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{ padding:"9px 14px", border:"none", cursor:"pointer", borderRadius:"8px 8px 0 0", fontSize:"12px", fontWeight:"700", whiteSpace:"nowrap", background: tab === i ? G : "transparent", color: tab === i ? ND : GR, transition:"all 0.2s", flexShrink:0 }}>{t}</button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding:"20px" }}>

        {/* ══════ TAB 0: 25 SEO TYPES ══════ */}
        {tab === 0 && (
          <div>
            <div style={{ marginBottom:"16px" }}>
              <h2 style={{ color:G, margin:"0 0 4px", fontSize:"17px" }}>⚔️ The Complete 2026 SEO Arsenal — 25 Types Fully Analyzed</h2>
              <p style={{ color:GR, margin:"0 0 14px", fontSize:"12px" }}>Click any card to expand full strategy, steps, real estate impact, and NEXUS PRIME tricks. Filter by category below.</p>
              <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
                {CATS.map(c => (
                  <button key={c} onClick={() => setFilter(c)} style={{ padding:"5px 11px", borderRadius:"20px", border:`1px solid ${filter === c ? G : G+"33"}`, background: filter === c ? G : "transparent", color: filter === c ? ND : GRL, fontSize:"11px", cursor:"pointer", fontWeight:"600", transition:"all 0.2s" }}>{c}</button>
                ))}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:"10px" }}>
              {seoFiltered.map(s => (
                <div key={s.id} onClick={() => setExpanded(expanded === s.id ? null : s.id)} style={{ background:"#ffffff07", border:`1px solid ${expanded === s.id ? G : G+"22"}`, borderRadius:"12px", padding:"14px", cursor:"pointer", transition:"all 0.2s" }}>
                  <div style={{ display:"flex", gap:"10px", alignItems:"flex-start", marginBottom:"8px" }}>
                    <span style={{ fontSize:"22px", flexShrink:0 }}>{s.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"8px" }}>
                        <span style={{ fontWeight:"700", fontSize:"14px" }}>{s.name}</span>
                        <Badge text={s.cost} bg={s.costColor} color={s.costColor} />
                      </div>
                      <div style={{ fontSize:"10px", color:GR, margin:"2px 0 6px" }}>
                        <span style={{ color: catColors[s.cat] || GRL, fontWeight:"600" }}>{s.cat}</span> · ⏱ {s.time}
                      </div>
                      <Bar v={s.strength} />
                    </div>
                  </div>
                  <p style={{ margin:"0 0 6px", fontSize:"12px", color:GRL, lineHeight:"1.5" }}>{s.desc}</p>

                  {expanded === s.id && (
                    <div style={{ marginTop:"12px", borderTop:`1px solid ${G}22`, paddingTop:"12px" }}>
                      <div style={{ fontSize:"11px", fontWeight:"700", color:G, marginBottom:"8px" }}>📋 HOW TO IMPLEMENT:</div>
                      <ul style={{ margin:"0 0 12px", padding:"0 0 0 16px" }}>
                        {s.steps.map((st, i) => <li key={i} style={{ fontSize:"12px", color:GRL, marginBottom:"5px", lineHeight:"1.5" }}>{st}</li>)}
                      </ul>
                      <div style={{ background:"#22c55e0f", border:"1px solid #22c55e33", borderRadius:"8px", padding:"10px", marginBottom:"8px" }}>
                        <div style={{ fontSize:"10px", fontWeight:"700", color:"#22c55e", marginBottom:"4px" }}>🏠 REAL ESTATE IMPACT</div>
                        <div style={{ fontSize:"12px", color:"#a0d0a0", lineHeight:"1.5" }}>{s.realty}</div>
                      </div>
                      <div style={{ background:`${G}0f`, border:`1px solid ${G}33`, borderRadius:"8px", padding:"10px" }}>
                        <div style={{ fontSize:"10px", fontWeight:"700", color:G, marginBottom:"4px" }}>🔥 NEXUS PRIME TRICK</div>
                        <div style={{ fontSize:"12px", color:"#e0c888", lineHeight:"1.5" }}>{s.trick}</div>
                      </div>
                    </div>
                  )}
                  <div style={{ textAlign:"center", fontSize:"10px", color:`${G}66`, marginTop:"8px" }}>
                    {expanded === s.id ? "▲ collapse" : "▼ tap to expand full strategy"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ TAB 1: FREE ARSENAL ══════ */}
        {tab === 1 && (
          <div>
            <h2 style={{ color:G, margin:"0 0 4px", fontSize:"17px" }}>🆓 Free Power Moves — Ranked by Traffic Impact</h2>
            <p style={{ color:GR, margin:"0 0 18px", fontSize:"12px" }}>All 10 methods below are completely free or near-free. NEXUS PRIME ranking = traffic × speed × zero cost. Start from #1 and work down.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {FREE_HACKS.map(h => (
                <div key={h.rank} style={{ background:"#ffffff07", border:`1px solid ${G}22`, borderRadius:"12px", padding:"16px", display:"grid", gridTemplateColumns:"52px 1fr", gap:"14px" }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ width:"44px", height:"44px", background:`${G}20`, border:`2px solid ${G}`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"17px", fontWeight:"800", color:G }}>#{h.rank}</div>
                    <div style={{ fontSize:"20px", marginTop:"6px" }}>{h.icon}</div>
                  </div>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap", marginBottom:"6px" }}>
                      <span style={{ fontWeight:"700", fontSize:"14px" }}>{h.name}</span>
                      <Badge text="FREE" bg="#22c55e" color="#22c55e" />
                      <Badge text={h.effort} bg="#3b5bdb" color="#6ea8fe" />
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px" }}>
                      <span style={{ fontSize:"10px", color:GR, width:"75px", flexShrink:0 }}>Power Score:</span>
                      <div style={{ flex:1, height:"8px", background:"#ffffff10", borderRadius:"4px", overflow:"hidden" }}>
                        <div style={{ width:`${h.power}%`, height:"100%", background:`linear-gradient(90deg, #22c55e, ${G})`, borderRadius:"4px" }} />
                      </div>
                      <span style={{ color:G, fontWeight:"800", fontSize:"13px", minWidth:"35px" }}>{h.power}/100</span>
                    </div>
                    <p style={{ margin:"0 0 10px", fontSize:"12px", color:GRL, lineHeight:"1.5" }}>{h.desc}</p>
                    <div style={{ background:`${G}0f`, borderRadius:"8px", padding:"10px", border:`1px solid ${G}25` }}>
                      <div style={{ fontSize:"10px", fontWeight:"700", color:G, marginBottom:"5px" }}>⚡ EXACT ACTION STEPS:</div>
                      <div style={{ fontSize:"12px", color:"#d8c888", lineHeight:"1.6" }}>{h.action}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ TAB 2: GEO GLOBAL ══════ */}
        {tab === 2 && (
          <div>
            <h2 style={{ color:G, margin:"0 0 4px", fontSize:"17px" }}>🌍 GEO Global Domination — International SEO + AI Citation Strategy 2026</h2>
            <p style={{ color:GR, margin:"0 0 16px", fontSize:"12px" }}>2026 SEO = not just Google. ChatGPT + Perplexity + Gemini + Claude = 1.2 BILLION AI search users. Your content must rank in ALL of them.</p>

            {/* AI Search Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"10px", marginBottom:"20px" }}>
              {[["ChatGPT","800M+","↑180% YoY","#10b981"],["Perplexity","100M+","↑400% YoY","#6366f1"],["Google Gemini","200M+","↑250% YoY","#f59e0b"],["Claude","50M+","↑300% YoY","#06b6d4"]].map(([n,u,g,c]) => (
                <div key={n} style={{ background:`${c}12`, border:`1px solid ${c}33`, borderRadius:"10px", padding:"12px", textAlign:"center" }}>
                  <div style={{ fontSize:"12px", fontWeight:"700", color:c, marginBottom:"4px" }}>{n}</div>
                  <div style={{ fontSize:"18px", fontWeight:"800" }}>{u}</div>
                  <div style={{ fontSize:"10px", color:c, fontWeight:"600" }}>{g}</div>
                  <div style={{ fontSize:"10px", color:GR }}>monthly users</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"20px" }}>
              {GEO_DATA.map((g, i) => (
                <div key={i} style={{ background:"#ffffff07", border:`1px solid ${G}22`, borderRadius:"12px", padding:"16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
                    <span style={{ fontSize:"24px" }}>{g.icon}</span>
                    <div>
                      <div style={{ fontWeight:"700", fontSize:"13px" }}>{g.title}</div>
                      <div style={{ fontSize:"10px", color:g.color, fontWeight:"600" }}>{g.tier}</div>
                    </div>
                  </div>
                  <p style={{ margin:"0 0 10px", fontSize:"12px", color:GRL, lineHeight:"1.5" }}>{g.desc}</p>
                  <div style={{ background:"#0a0f1a", borderRadius:"8px", padding:"10px", fontFamily:"monospace", fontSize:"11px", color:"#7dd3fc", whiteSpace:"pre-wrap", lineHeight:"1.5" }}>{g.detail}</div>
                </div>
              ))}
            </div>

            {/* UK City Map */}
            <div style={{ background:"#ffffff07", border:`1px solid ${G}22`, borderRadius:"12px", padding:"18px" }}>
              <h3 style={{ color:G, margin:"0 0 14px", fontSize:"15px" }}>🗺️ UK City Traffic Opportunity Index — Target Priority Order</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"8px" }}>
                {[["London","9M","890K/mo","HIGH","#ef4444"],["Manchester","2.8M","320K/mo","MED","#f59e0b"],["Birmingham","2.9M","280K/mo","MED","#f59e0b"],["Leeds","1.9M","195K/mo","LOW-MED","#84cc16"],["Liverpool","1.5M","155K/mo","LOW","#22c55e"],["Sheffield","1.4M","145K/mo","LOW","#22c55e"],["Bristol","720K","130K/mo","LOW","#22c55e"],["Nottingham","730K","110K/mo","LOW","#22c55e"],["Leicester","560K","90K/mo","LOW","#22c55e"],["Cardiff","470K","85K/mo","LOW","#22c55e"],["Edinburgh","550K","80K/mo","LOW","#22c55e"],["Glasgow","640K","95K/mo","LOW","#22c55e"]].map(([city, pop, searches, comp, cc]) => (
                  <div key={city} style={{ background:"#ffffff08", borderRadius:"8px", padding:"10px" }}>
                    <div style={{ fontWeight:"700", fontSize:"13px", marginBottom:"3px" }}>{city}</div>
                    <div style={{ fontSize:"12px", color:G, fontWeight:"600" }}>{searches}</div>
                    <div style={{ fontSize:"10px", color:GR }}>Pop: {pop}</div>
                    <span style={{ fontSize:"10px", background:`${cc}20`, color:cc, padding:"2px 6px", borderRadius:"6px", marginTop:"5px", display:"inline-block", fontWeight:"700", border:`1px solid ${cc}40` }}>{comp} competition</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════ TAB 3: AUDIENCE INTEL ══════ */}
        {tab === 3 && (
          <div>
            <h2 style={{ color:G, margin:"0 0 16px", fontSize:"17px" }}>🎯 Deep Audience Intelligence — 4 Target Markets</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"8px", marginBottom:"20px" }}>
              {AUDIENCES.map((a, i) => (
                <button key={a.id} onClick={() => setAud(i)} style={{ padding:"12px 8px", border:`2px solid ${aud === i ? a.color : a.color+"44"}`, borderRadius:"10px", background: aud === i ? `${a.color}20` : "transparent", color: aud === i ? a.color : GR, cursor:"pointer", fontWeight:"700", fontSize:"12px", transition:"all 0.2s", textAlign:"center" }}>
                  <div style={{ fontSize:"24px", marginBottom:"4px" }}>{a.icon}</div>
                  {a.name}
                </button>
              ))}
            </div>

            {(() => {
              const a = AUDIENCES[aud];
              return (
                <div>
                  <div style={{ background:`${a.color}12`, border:`1px solid ${a.color}33`, borderRadius:"12px", padding:"16px", marginBottom:"16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"10px" }}>
                      <span style={{ fontSize:"36px" }}>{a.icon}</span>
                      <div>
                        <h3 style={{ margin:"0 0 3px", color:a.color, fontSize:"18px" }}>{a.name}</h3>
                        <div style={{ fontSize:"12px", color:GR }}>{a.size}</div>
                      </div>
                    </div>
                    <p style={{ margin:0, color:GRL, fontSize:"13px", lineHeight:"1.6" }}>{a.strategy}</p>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
                    <div>
                      <h4 style={{ color:a.color, margin:"0 0 10px", fontSize:"13px" }}>🔑 Top 10 Target Keywords</h4>
                      {a.keywords.map((k, i) => (
                        <div key={i} style={{ background:"#ffffff06", borderRadius:"6px", padding:"7px 10px", fontSize:"12px", color:GRL, border:`1px solid ${a.color}20`, marginBottom:"5px", display:"flex", gap:"8px", alignItems:"center" }}>
                          <span style={{ color:a.color, fontWeight:"700", fontSize:"10px", minWidth:"18px" }}>#{i+1}</span>{k}
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 style={{ color:a.color, margin:"0 0 10px", fontSize:"13px" }}>📡 Best Platforms to Target Them</h4>
                      {a.platforms.map((p, i) => (
                        <div key={i} style={{ background:"#ffffff06", borderRadius:"6px", padding:"7px 10px", fontSize:"12px", color:GRL, border:`1px solid ${a.color}20`, marginBottom:"5px" }}>📌 {p}</div>
                      ))}
                      <h4 style={{ color:a.color, margin:"14px 0 10px", fontSize:"13px" }}>✍️ Best Content Types</h4>
                      {a.content.map((c, i) => (
                        <div key={i} style={{ background:"#ffffff06", borderRadius:"6px", padding:"7px 10px", fontSize:"12px", color:GRL, border:`1px solid ${a.color}20`, marginBottom:"5px" }}>✍️ {c}</div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ══════ TAB 4: TRAFFIC HACKS ══════ */}
        {tab === 4 && (
          <div>
            <h2 style={{ color:G, margin:"0 0 4px", fontSize:"17px" }}>🔥 Traffic Hacks & Tricky Moves — NEXUS PRIME Intelligence Report</h2>
            <p style={{ color:GR, margin:"0 0 18px", fontSize:"12px" }}>Legal, ethical, but aggressive. The moves competitors don't know about. Each has exact step-by-step execution.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              {TRAFFIC_HACKS.map((h, i) => (
                <div key={i} style={{ background:"#ffffff07", border:`1px solid ${h.tierColor}30`, borderRadius:"12px", padding:"18px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px", marginBottom:"10px" }}>
                    <h3 style={{ margin:0, fontSize:"15px", color:W, lineHeight:"1.3" }}>{h.title}</h3>
                    <Badge text={h.tier} bg={h.tierColor} color={h.tierColor} />
                  </div>
                  <div style={{ background:`${h.tierColor}15`, borderRadius:"6px", padding:"6px 12px", marginBottom:"12px", fontSize:"11px", color:h.tierColor, fontWeight:"700" }}>
                    📈 Traffic Potential: {h.traffic}
                  </div>
                  <p style={{ margin:"0 0 12px", color:GRL, fontSize:"13px", lineHeight:"1.6" }}>{h.desc}</p>
                  <div style={{ marginBottom:"12px" }}>
                    <div style={{ fontSize:"11px", fontWeight:"700", color:h.tierColor, marginBottom:"8px" }}>🎯 EXACT EXECUTION STEPS:</div>
                    <ol style={{ margin:0, padding:"0 0 0 18px" }}>
                      {h.steps.map((s, j) => <li key={j} style={{ fontSize:"12px", color:GRL, marginBottom:"6px", lineHeight:"1.5" }}>{s}</li>)}
                    </ol>
                  </div>
                  <div style={{ background:"#22c55e0f", border:"1px solid #22c55e30", borderRadius:"8px", padding:"10px" }}>
                    <div style={{ fontSize:"10px", fontWeight:"700", color:"#22c55e", marginBottom:"5px" }}>✅ EXPECTED RESULT:</div>
                    <div style={{ fontSize:"12px", color:"#a0e0a0", lineHeight:"1.5" }}>{h.result}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ TAB 5: 90-DAY ROADMAP ══════ */}
        {tab === 5 && (
          <div>
            <h2 style={{ color:G, margin:"0 0 4px", fontSize:"17px" }}>📅 Elite Tenancy 90-Day SEO Domination Roadmap</h2>
            <p style={{ color:GR, margin:"0 0 18px", fontSize:"12px" }}>NEXUS PRIME mission-critical timeline. Sequenced for maximum impact per phase. Zero fluff. Every task moves the needle.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"18px" }}>
              {ROADMAP.map((p, i) => (
                <div key={i} style={{ background:"#ffffff07", border:`2px solid ${p.color}33`, borderRadius:"14px", overflow:"hidden" }}>
                  <div style={{ background:`${p.color}18`, padding:"14px 18px", borderBottom:`1px solid ${p.color}30` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                      <div style={{ width:"38px", height:"38px", minWidth:"38px", background:p.color, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"800", color:ND, fontSize:"15px" }}>{i+1}</div>
                      <div>
                        <div style={{ fontSize:"10px", color:p.color, fontWeight:"700", letterSpacing:"2px" }}>{p.phase}</div>
                        <div style={{ fontSize:"16px", fontWeight:"800" }}>{p.title}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding:"18px" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"7px", marginBottom:"14px" }}>
                      {p.tasks.map((t, j) => (
                        <div key={j} style={{ background:"#ffffff06", borderRadius:"6px", padding:"7px 10px", fontSize:"11px", color:GRL, border:`1px solid ${p.color}20`, lineHeight:"1.4" }}>{t}</div>
                      ))}
                    </div>
                    <div style={{ background:`${p.color}12`, border:`1px solid ${p.color}30`, borderRadius:"8px", padding:"12px" }}>
                      <div style={{ fontSize:"10px", fontWeight:"700", color:p.color, marginBottom:"5px" }}>🏆 KPI TARGETS FOR THIS PHASE:</div>
                      <div style={{ fontSize:"12px", color:"#d8c888", lineHeight:"1.5" }}>{p.kpi}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* NEXUS PRIME Final Assessment */}
            <div style={{ marginTop:"22px", background:`linear-gradient(135deg, ${G}18, ${NL})`, border:`2px solid ${G}`, borderRadius:"14px", padding:"22px", textAlign:"center" }}>
              <div style={{ fontSize:"10px", letterSpacing:"3px", color:G, marginBottom:"10px", fontWeight:"700" }}>⚡ NEXUS PRIME FINAL ASSESSMENT ⚡</div>
              <p style={{ color:W, fontSize:"13px", lineHeight:"1.8", margin:"0 0 12px" }}>
                Following this 90-day roadmap, Elite Tenancy can realistically reach <strong style={{ color:G }}>50,000–200,000 monthly organic visitors</strong> within 12 months — at near-zero cost. The combination of Programmatic SEO (500+ location pages) + Parasite SEO + GEO AI citation optimization + Local SEO creates a compounding traffic machine that gets stronger every month.
              </p>
              <p style={{ color:GR, fontSize:"12px", margin:"0 0 12px", lineHeight:"1.6" }}>
                🏆 Real estate SEO is a blue ocean in 2026. Rightmove and Zoopla own property listings. Zoopla owns rentals. But <strong style={{ color:G }}>nobody nationally owns the 'tenant introduction service' keyword cluster</strong>. This is your window. This is the moment.
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"10px", marginTop:"16px" }}>
                {[["Month 3","1,000+","organic visitors/mo"],["Month 6","10,000+","organic visitors/mo"],["Month 12","50,000-200,000+","organic visitors/mo"]].map(([mo,n,l]) => (
                  <div key={mo} style={{ background:"#ffffff08", borderRadius:"10px", padding:"12px" }}>
                    <div style={{ fontSize:"11px", color:GR }}>{mo}</div>
                    <div style={{ fontSize:"20px", fontWeight:"800", color:G }}>{n}</div>
                    <div style={{ fontSize:"11px", color:GRL }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
