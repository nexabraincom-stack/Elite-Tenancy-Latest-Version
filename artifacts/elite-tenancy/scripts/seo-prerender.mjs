/**
 * seo-prerender.mjs
 *
 * Post-build script: runs after `pnpm build` (Vite).
 * For each public route it creates dist/public/<route>/index.html with
 * route-specific <title>, <meta description>, <link rel="canonical">,
 * og:* tags, twitter:* tags, noscript content, and optional JSON-LD.
 *
 * Vercel serves a directory's index.html before applying catch-all rewrites,
 * so Googlebot gets the correct HTML shell without a JavaScript round-trip.
 *
 * Usage:
 *   node scripts/seo-prerender.mjs          # writes all files
 *   node scripts/seo-prerender.mjs --dry-run # logs actions, writes nothing
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST      = join(__dirname, "..", "dist", "public");
const BASE_URL  = "https://www.elitetenancy.co.uk";
const DRY_RUN   = process.argv.includes("--dry-run");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function esc(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function breadcrumb(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.path}`,
    })),
  };
}

// ─── Route Definitions ────────────────────────────────────────────────────────

const ROUTES = [
  // ── Core public pages ──────────────────────────────────────────────────
  {
    path: "/listings",
    title: "Premium UK Properties to Rent 2026 | Elite Tenancy",
    desc: "Browse premium UK rental properties. AI-powered matching connects verified landlords with quality tenants. Zero agency fees for tenants.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Listings", path: "/listings" }],
  },
  {
    path: "/for-landlords",
    title: "Let Your Property with Elite Tenancy | For Landlords",
    desc: "Let your UK property with Elite Tenancy. Completion-only fees, 12-day average turnaround, six-stage tenant screening. Zero upfront cost.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "For Landlords", path: "/for-landlords" }],
    schema: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Elite Tenancy Landlord Lettings Service",
      "provider": { "@type": "RealEstateAgent", "name": "Elite Tenancy", "url": BASE_URL },
      "serviceType": "Residential Lettings",
      "areaServed": { "@type": "Country", "name": "United Kingdom" },
      "description": "Completion-only tenant introduction service for UK landlords. Six-stage screening, 12-day average turnaround, zero upfront fees.",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP", "description": "No fee until tenant moves in" },
    },
  },
  {
    path: "/for-agents",
    title: "Elite Tenancy for Letting Agents | Partner With Us",
    desc: "Letting agents: partner with Elite Tenancy to access premium tenants and co-list properties. Expand your portfolio with zero-fee lettings.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "For Agents", path: "/for-agents" }],
  },
  {
    path: "/pricing",
    title: "Transparent Lettings Pricing | Elite Tenancy",
    desc: "Honest, transparent lettings pricing. Elite Tenancy charges landlords only on successful completion. No hidden fees, no upfront costs.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }],
  },
  {
    path: "/how-it-works",
    title: "How Elite Tenancy Works | UK Lettings Made Simple",
    desc: "See exactly how Elite Tenancy works for landlords and tenants. From valuation to move-in in as little as 12 days.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "How It Works", path: "/how-it-works" }],
  },
  {
    path: "/find-a-room",
    title: "Find a Room to Rent in the UK | Elite Tenancy",
    desc: "Find your perfect room or flat to rent across the UK. Verified listings, AI-powered matching, and zero agency fees for tenants.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Find a Room", path: "/find-a-room" }],
  },
  {
    path: "/list-your-property",
    title: "List Your Property | Elite Tenancy for Landlords",
    desc: "List your UK rental property with Elite Tenancy for free. Reach thousands of pre-qualified tenants. Only pay on successful let.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "List Your Property", path: "/list-your-property" }],
  },
  {
    path: "/renter-passport",
    title: "Renter Passport — Verified Tenant Profile | Elite Tenancy",
    desc: "Get your free Renter Passport. A verified tenant profile that proves your identity, income, and rental history to landlords in seconds.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Renter Passport", path: "/renter-passport" }],
  },
  {
    path: "/right-to-rent-check",
    title: "Right to Rent Check UK 2026 | Free Checker | Elite Tenancy",
    desc: "Free Right to Rent check for UK landlords and tenants. Understand who has the right to rent in England and how to verify it legally.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Right to Rent Check", path: "/right-to-rent-check" }],
    schema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the Right to Rent check in the UK?",
          acceptedAnswer: { "@type": "Answer", text: "Right to Rent is a legal requirement for landlords in England to check that all adult occupiers aged 18 and over have the legal right to live in the UK before granting a tenancy. Landlords can face civil penalties of up to £20,000 per occupier for failing to conduct the check correctly." },
        },
        {
          "@type": "Question",
          name: "Who needs a Right to Rent check?",
          acceptedAnswer: { "@type": "Answer", text: "All landlords in England renting to adult tenants must conduct a Right to Rent check. This includes British citizens, EU/EEA nationals, and all other nationalities. The check applies to all adult occupiers, not just the named tenant." },
        },
        {
          "@type": "Question",
          name: "What documents are acceptable for a Right to Rent check?",
          acceptedAnswer: { "@type": "Answer", text: "Acceptable documents include a UK passport, biometric residence permit (BRP), EU Settlement Scheme share code, or other Home Office share codes. For time-limited right to rent, a follow-up check must be conducted when the document expires." },
        },
        {
          "@type": "Question",
          name: "Can EU citizens pass a Right to Rent check after Brexit?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. EU, EEA, and Swiss citizens with Settled or Pre-Settled Status under the EU Settlement Scheme (EUSS) have the right to rent in England. They provide a share code via the UK Visas and Immigration online service for landlords to verify their status." },
        },
        {
          "@type": "Question",
          name: "What happens if a landlord fails to conduct a Right to Rent check?",
          acceptedAnswer: { "@type": "Answer", text: "Landlords who fail to conduct a correct Right to Rent check can face a civil penalty of up to £20,000 per illegal occupier, or criminal prosecution and an unlimited fine or up to 5 years imprisonment if they knew or had reasonable cause to believe the tenant had no right to rent." },
        },
      ],
    },
  },
  {
    path: "/spareroom-alternative",
    title: "Best SpareRoom Alternative 2026 | Elite Tenancy",
    desc: "Looking for a SpareRoom alternative? Elite Tenancy offers AI-powered matching, verified landlords, and zero fees for tenants. Find your room today.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "SpareRoom Alternative", path: "/spareroom-alternative" }],
  },
  {
    path: "/rra-2025-checker",
    title: "Renters' Rights Act 2025 Compliance Checker | Elite Tenancy",
    desc: "Check your compliance with the Renters' Rights Act 2025. Free tool for UK landlords to verify tenancy agreements, deposits, and legal obligations.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "RRA 2025 Checker", path: "/rra-2025-checker" }],
    schema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the Renters' Rights Act 2025?",
          acceptedAnswer: { "@type": "Answer", text: "The Renters' Rights Act 2025 became law on 27 October 2025, with its key provisions activating on 1 May 2026. It abolished Section 21 'no-fault' evictions, converted all existing ASTs to rolling periodic tenancies, gave tenants the right to keep pets (subject to insurance), made 'No DSS' discrimination illegal, and capped deposits at 5 weeks' rent." },
        },
        {
          "@type": "Question",
          name: "Is Section 21 really abolished?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. Section 21 of the Housing Act 1988 was abolished by the Renters' Rights Act 2025 with effect from 1 May 2026. Landlords can no longer evict tenants without a valid legal reason. Possession proceedings must now use Section 8 grounds, which have been expanded to include cases where landlords genuinely want to sell or move into the property." },
        },
        {
          "@type": "Question",
          name: "What happened to existing fixed-term tenancies?",
          acceptedAnswer: { "@type": "Answer", text: "From 1 May 2026, all existing Assured Shorthold Tenancies (ASTs) automatically converted to rolling monthly periodic tenancies. New tenancies are only permitted on a rolling periodic basis — new fixed-term tenancies are no longer allowed for residential lettings." },
        },
        {
          "@type": "Question",
          name: "Can landlords still refuse pets under the new law?",
          acceptedAnswer: { "@type": "Answer", text: "Landlords can no longer unreasonably refuse a tenant's request to keep a pet. Tenants must make the request in writing and the landlord has 28 days to respond. Landlords can require pet insurance or a higher deposit (up to one week extra) to cover pet damage." },
        },
        {
          "@type": "Question",
          name: "How does rent increase work under the Renters' Rights Act?",
          acceptedAnswer: { "@type": "Answer", text: "Landlords can only increase rent once per year using a Section 13 notice, giving at least 2 months' written notice. Tenants can challenge the increase at the First-tier Tribunal if they believe it exceeds the market rate. Backdating rent increases or using lease clauses to increase rent more frequently is no longer permitted." },
        },
      ],
    },
  },
  {
    path: "/verify-landlord",
    title: "Verify a UK Landlord | Free Landlord Checker | Elite Tenancy",
    desc: "Free landlord verification tool. Check if a UK landlord is legitimate before you pay a deposit. Protect yourself from rental fraud.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Verify Landlord", path: "/verify-landlord" }],
  },
  {
    path: "/valuation",
    title: "Free Rental Valuation | Elite Tenancy",
    desc: "Get a free, data-driven rental valuation for your UK property. Elite Tenancy's experts advise on achievable rent and presentation.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Free Valuation", path: "/valuation" }],
  },
  {
    path: "/blog",
    title: "UK Lettings Blog — Landlord & Tenant Guides 2026 | Elite Tenancy",
    desc: "Expert UK lettings guides for landlords and tenants. Renters' Rights Act, Section 21, HMO licences, deposit rules, and rental market insights.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }],
  },
  {
    path: "/contact",
    title: "Contact Elite Tenancy | UK Lettings Help & Support",
    desc: "Contact Elite Tenancy for landlord or tenant support. Call, email, or submit a form — our team responds within one business day.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }],
  },
  {
    path: "/find-my-match",
    title: "Find My Perfect Room Match | AI-Powered Search | Elite Tenancy",
    desc: "Use Elite Tenancy's AI-powered matching to find your ideal room or property. Answer a few questions and we'll surface the best options for you.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Find My Match", path: "/find-my-match" }],
  },
  {
    path: "/room-wanted",
    title: "Room Wanted — Post Your Search | Elite Tenancy",
    desc: "Post a room-wanted listing and let landlords come to you. Tell us what you need and we'll match you with the right property across the UK.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Room Wanted", path: "/room-wanted" }],
  },
  {
    path: "/privacy",
    title: "Privacy Policy | Elite Tenancy",
    desc: "Elite Tenancy's privacy policy. How we collect, use, and protect your personal data in accordance with UK GDPR.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy" }],
  },
  {
    path: "/terms",
    title: "Terms of Service | Elite Tenancy",
    desc: "Elite Tenancy's terms of service. The rules that govern your use of our platform as a landlord, tenant, or agent.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Terms of Service", path: "/terms" }],
  },
  {
    path: "/cookies",
    title: "Cookie Policy | Elite Tenancy",
    desc: "Elite Tenancy's cookie policy. What cookies we use, why we use them, and how to manage your preferences.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Cookie Policy", path: "/cookies" }],
  },

  // ── International pages ────────────────────────────────────────────────
  {
    path: "/international-students",
    title: "UK Student Accommodation for International Students 2026 | Elite Tenancy",
    desc: "Find UK student accommodation as an international student. Right to Rent for students, guarantor options, university city guides, and average rents.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "International Students", path: "/international-students" }],
  },
  {
    path: "/move-to-uk",
    title: "Moving to the UK? Find Rental Property Before You Arrive | Elite Tenancy",
    desc: "Relocating to the UK? Find your home before you arrive. Guides for skilled workers, expats, and families moving to the UK from overseas.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Move to UK", path: "/move-to-uk" }],
  },
  {
    path: "/eu-citizens-uk-rental-guide",
    title: "EU Citizens Renting in the UK 2026 — Complete Guide | Elite Tenancy",
    desc: "EU citizens can rent in the UK using EU Settlement Scheme status. Guide covers EUSS, share codes, Pre-Settled Status, and finding a property.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "EU Citizens Guide", path: "/eu-citizens-uk-rental-guide" }],
  },
  {
    path: "/london-rentals-for-europeans",
    title: "London Rentals for Europeans 2026 | Elite Tenancy",
    desc: "Find London rentals as a European national. Area guides for Germans, French, Spanish, Italian, Polish, and Dutch professionals moving to London.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "London Rentals for Europeans", path: "/london-rentals-for-europeans" }],
  },
  {
    path: "/uk-visa-rental-guide",
    title: "UK Visa Rental Guide 2026 — Right to Rent for Skilled Workers | Elite Tenancy",
    desc: "Renting in the UK on a visa. Complete guide for Skilled Worker, Graduate, Student, EU Settlement, and Family visa holders.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "UK Visa Rental Guide", path: "/uk-visa-rental-guide" }],
    schema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Can I rent in the UK on a Skilled Worker visa?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. Skilled Worker visa holders have the right to rent in the UK for the duration of their visa. Landlords will verify your right to rent by checking your biometric residence permit (BRP) or by using the Home Office online share code service." },
        },
        {
          "@type": "Question",
          name: "What is a Right to Rent check for visa holders?",
          acceptedAnswer: { "@type": "Answer", text: "A Right to Rent check is a legal requirement for all landlords in England. For visa holders, this usually involves showing your Biometric Residence Permit (BRP) or providing a Home Office share code. The landlord must verify your immigration status before granting a tenancy." },
        },
        {
          "@type": "Question",
          name: "Can I rent if my visa expires in less than 6 months?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, you can rent even if your visa expires soon. Landlords will grant a time-limited right to rent for the duration of your current visa. They must then conduct a follow-up check when your visa expires. You will need to provide evidence of your visa extension or new visa to continue renting." },
        },
        {
          "@type": "Question",
          name: "Do I need a guarantor as a visa holder?",
          acceptedAnswer: { "@type": "Answer", text: "Some landlords may request a UK-based guarantor if you are new to the UK or do not have a UK credit history. Alternatives include offering 3-6 months' rent in advance, using a professional guarantor service (such as Homeppl or Housing Hand), or using Elite Tenancy's Renter Passport to showcase your verified profile." },
        },
        {
          "@type": "Question",
          name: "What documents do I need to rent in the UK on a visa?",
          acceptedAnswer: { "@type": "Answer", text: "Typically: your passport, your Biometric Residence Permit (BRP) or a Home Office eVisa share code, 3 months' bank statements, proof of income (payslips or employment letter), and a reference from a previous landlord. Elite Tenancy's Renter Passport can consolidate these into a verified digital profile." },
        },
      ],
    },
  },

  // ── City landing pages ─────────────────────────────────────────────────
  {
    path: "/london",
    title: "Properties to Rent in London 2026 | Elite Tenancy",
    desc: "Find premium properties to rent in London. Browse all areas from Zone 1 to Zone 6. Expert landlord matching and zero tenant fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "London", path: "/london" }],
  },
  {
    path: "/manchester",
    title: "Properties to Rent in Manchester 2026 | Elite Tenancy",
    desc: "Find premium properties to rent in Manchester. City centre, Salford, Didsbury, and beyond. Verified landlords and AI-powered matching.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Manchester", path: "/manchester" }],
  },
  {
    path: "/birmingham",
    title: "Properties to Rent in Birmingham 2026 | Elite Tenancy",
    desc: "Find premium properties to rent in Birmingham. Jewellery Quarter, Edgbaston, Moseley, and city centre. Zero tenant fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Birmingham", path: "/birmingham" }],
  },
  {
    path: "/leeds",
    title: "Properties to Rent in Leeds 2026 | Elite Tenancy",
    desc: "Find premium properties to rent in Leeds. City centre, Headingley, Roundhay, and Chapel Allerton. Verified landlords.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Leeds", path: "/leeds" }],
  },
  {
    path: "/bristol",
    title: "Properties to Rent in Bristol 2026 | Elite Tenancy",
    desc: "Find premium properties to rent in Bristol. Clifton, Harbourside, Redland, and Stokes Croft. Zero agency fees for tenants.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Bristol", path: "/bristol" }],
  },
  {
    path: "/sheffield",
    title: "Properties to Rent in Sheffield 2026 | Elite Tenancy",
    desc: "Find premium properties to rent in Sheffield. City centre, Endcliffe, Crookes, and Ecclesall Road. Verified landlords.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Sheffield", path: "/sheffield" }],
  },
  {
    path: "/liverpool",
    title: "Properties to Rent in Liverpool 2026 | Elite Tenancy",
    desc: "Find premium properties to rent in Liverpool. City centre, Baltic Triangle, Aigburth, and Woolton. Zero tenant fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Liverpool", path: "/liverpool" }],
  },
  {
    path: "/edinburgh",
    title: "Properties to Rent in Edinburgh 2026 | Elite Tenancy",
    desc: "Find premium properties to rent in Edinburgh. Old Town, New Town, Leith, and Marchmont. AI-powered matching.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Edinburgh", path: "/edinburgh" }],
  },
  {
    path: "/cardiff",
    title: "Properties to Rent in Cardiff 2026 | Elite Tenancy",
    desc: "Find premium properties to rent in Cardiff. Bay, Pontcanna, Roath, and city centre. Verified landlords and zero fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Cardiff", path: "/cardiff" }],
  },
  {
    path: "/glasgow",
    title: "Properties to Rent in Glasgow 2026 | Elite Tenancy",
    desc: "Find premium properties to rent in Glasgow. West End, Merchant City, Southside, and city centre. Zero tenant fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Glasgow", path: "/glasgow" }],
  },

  // ── Rooms-to-let pages ─────────────────────────────────────────────────
  {
    path: "/rooms-to-let/london",
    title: "Rooms to Let in London 2026 | Elite Tenancy",
    desc: "Find rooms to let in London. Verified landlords, all areas covered. Bills included and furnished options. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "London", path: "/rooms-to-let/london" }],
  },
  {
    path: "/rooms-to-let/manchester",
    title: "Rooms to Let in Manchester 2026 | Elite Tenancy",
    desc: "Find rooms to let in Manchester. City centre, Salford, and surrounding areas. Bills included options available. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Manchester", path: "/rooms-to-let/manchester" }],
  },
  {
    path: "/rooms-to-let/birmingham",
    title: "Rooms to Let in Birmingham 2026 | Elite Tenancy",
    desc: "Find rooms to let in Birmingham. City centre, Edgbaston, and surrounding areas. Verified landlords. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Birmingham", path: "/rooms-to-let/birmingham" }],
  },
  {
    path: "/rooms-to-let/leeds",
    title: "Rooms to Let in Leeds 2026 | Elite Tenancy",
    desc: "Find rooms to let in Leeds. Headingley, city centre, and Chapel Allerton. Student and professional rooms. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Leeds", path: "/rooms-to-let/leeds" }],
  },
  {
    path: "/rooms-to-let/bristol",
    title: "Rooms to Let in Bristol 2026 | Elite Tenancy",
    desc: "Find rooms to let in Bristol. Clifton, Redland, Stokes Croft. Professional and student rooms. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Bristol", path: "/rooms-to-let/bristol" }],
  },
];

// ─── Blog Articles ─────────────────────────────────────────────────────────────

const BLOG_ARTICLES = [
  {
    slug: "renters-rights-act-2026-landlord-guide",
    title: "Renters' Rights Act 2026: Complete Landlord Guide | Elite Tenancy",
    desc: "The Renters' Rights Act 2026 abolished Section 21, ended fixed-term tenancies, and gave pets new rights. Complete guide for UK landlords.",
  },
  {
    slug: "section-21-abolished-2026-landlord-guide",
    title: "Section 21 Abolished 2026: What Landlords Must Do Now | Elite Tenancy",
    desc: "Section 21 no-fault evictions were abolished on 1 May 2026. Here's what UK landlords need to know about possession under Section 8.",
  },
  {
    slug: "section-21-abolished-what-it-means-for-tenants",
    title: "Section 21 Abolished: What It Means for Tenants 2026 | Elite Tenancy",
    desc: "Section 21 'no-fault' evictions are gone. UK tenants now have much stronger security of tenure. Here's what changed and what it means for you.",
  },
  {
    slug: "no-dss-illegal-2026-benefits-tenants-landlord-guide",
    title: "No DSS is Illegal in 2026: Benefits Tenants Landlord Guide | Elite Tenancy",
    desc: "Refusing tenants on housing benefits ('No DSS') is now illegal in the UK. What landlords must do and how benefits tenants can assert their rights.",
  },
  {
    slug: "can-landlord-refuse-pets-2026-uk",
    title: "Can a Landlord Refuse Pets in 2026? UK Law Explained | Elite Tenancy",
    desc: "UK landlords can no longer unreasonably refuse pets since the Renters' Rights Act 2025. Here's how the new pet rules work for landlords and tenants.",
  },
  {
    slug: "assured-periodic-tenancy-explained",
    title: "Assured Periodic Tenancy Explained 2026 | Elite Tenancy",
    desc: "All UK tenancies are now rolling assured periodic tenancies. What this means for landlords and tenants — rent increases, notice periods, and possession.",
  },
  {
    slug: "rent-in-advance-legal-2026-uk",
    title: "Is Rent in Advance Legal? UK Landlord Guide 2026 | Elite Tenancy",
    desc: "Can UK landlords charge more than one month's rent in advance? The Renters' Rights Act 2025 restricts rent in advance. Full legal guide.",
  },
  {
    slug: "hmo-licence-uk-2026-complete-guide",
    title: "HMO Licence UK 2026: Complete Guide for Landlords | Elite Tenancy",
    desc: "Do you need an HMO licence? Complete guide to Houses in Multiple Occupation licences for UK landlords in 2026, including mandatory and additional licensing.",
  },
  {
    slug: "letting-agent-fees-uk-2026-landlord-guide",
    title: "Letting Agent Fees UK 2026: Landlord Cost Guide | Elite Tenancy",
    desc: "How much do letting agents charge in 2026? Full breakdown of landlord letting agent fees vs Elite Tenancy's completion-only model.",
  },
  {
    slug: "landlord-guide-letting-2026",
    title: "Complete Landlord Guide to Letting a Property in 2026 | Elite Tenancy",
    desc: "The definitive 2026 guide for UK landlords. Valuation, marketing, tenant screening, AST, deposit protection, Right to Rent, and more.",
  },
  {
    slug: "buy-to-let-2026-worth-it",
    title: "Is Buy to Let Worth It in 2026? UK Investment Guide | Elite Tenancy",
    desc: "Is buy-to-let still a worthwhile investment in 2026? Analysis of yields, mortgage rates, tax changes, and the Renters' Rights Act impact.",
  },
  {
    slug: "average-rent-uk-2026-city-price-guide",
    title: "Average Rent UK 2026: City-by-City Price Guide | Elite Tenancy",
    desc: "What is the average rent in UK cities in 2026? London, Manchester, Birmingham, Leeds, Bristol, Edinburgh — full breakdown by area and property type.",
  },
  {
    slug: "average-rent-birmingham-2026",
    title: "Average Rent in Birmingham 2026: Area Guide | Elite Tenancy",
    desc: "Average rent in Birmingham in 2026 by area. Jewellery Quarter, Edgbaston, Moseley, Harborne — what renters and investors need to know.",
  },
  {
    slug: "average-rent-manchester-2026-area-guide",
    title: "Average Rent in Manchester 2026: Area Guide | Elite Tenancy",
    desc: "Average rent in Manchester in 2026 by area. City centre, Salford, Didsbury, Ancoats, Chorlton — complete rental market breakdown.",
  },
  {
    slug: "manchester-vs-london-rent-2026",
    title: "Manchester vs London Rent 2026: Cost Comparison | Elite Tenancy",
    desc: "Manchester vs London rental costs in 2026. Comparing average rents, quality of life, job markets, and what your money gets you in both cities.",
  },
  {
    slug: "find-premium-rentals-london-2026",
    title: "How to Find Premium Rentals in London 2026 | Elite Tenancy",
    desc: "How to find premium rental properties in London in 2026. Best areas, platforms, and how Elite Tenancy's AI matching gives you an edge.",
  },
  {
    slug: "tenancy-agreement-clauses-guide",
    title: "Tenancy Agreement Clauses: Complete UK Guide 2026 | Elite Tenancy",
    desc: "What to look for in a UK tenancy agreement. Key clauses, unfair terms, and what the Renters' Rights Act 2025 changed about ASTs.",
  },
  {
    slug: "ai-tenant-matching-how-it-works",
    title: "AI Tenant Matching: How Elite Tenancy Works | Elite Tenancy",
    desc: "How Elite Tenancy's AI-powered tenant matching works. Six-stage screening, Renter Passport scoring, and why landlords get better tenants faster.",
  },
];

// Add blog articles to routes
for (const article of BLOG_ARTICLES) {
  ROUTES.push({
    path: `/blog/${article.slug}`,
    title: article.title,
    desc: article.desc,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: article.title.split("|")[0].trim(), path: `/blog/${article.slug}` },
    ],
  });
}

// ─── Injection ─────────────────────────────────────────────────────────────────

function injectSeo(template, route) {
  const canonical = `${BASE_URL}${route.path}`;
  let html = template;

  const safe = (s) => esc(String(s));

  // Title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safe(route.title)}</title>`);

  // Meta description
  html = html.replace(
    /(<meta name="description" content=")[^"]*(")/,
    `$1${safe(route.desc)}$2`
  );

  // Canonical
  html = html.replace(
    /(<link rel="canonical" href=")[^"]*(")/,
    `$1${safe(canonical)}$2`
  );

  // OG title  — use \s+ to tolerate alignment whitespace in index.html
  html = html.replace(
    /(<meta property="og:title"\s+content=")[^"]*(")/,
    `$1${safe(route.title)}$2`
  );
  // OG description
  html = html.replace(
    /(<meta property="og:description"\s+content=")[^"]*(")/,
    `$1${safe(route.desc)}$2`
  );
  // OG url
  html = html.replace(
    /(<meta property="og:url"\s+content=")[^"]*(")/,
    `$1${safe(canonical)}$2`
  );

  // Twitter title  — same whitespace fix
  html = html.replace(
    /(<meta name="twitter:title"\s+content=")[^"]*(")/,
    `$1${safe(route.title)}$2`
  );
  // Twitter description
  html = html.replace(
    /(<meta name="twitter:description"\s+content=")[^"]*(")/,
    `$1${safe(route.desc)}$2`
  );

  // Noscript block — replace h1 + p
  const noscriptH1 = route.title.split("|")[0].trim();
  html = html.replace(
    /(<noscript>[\s\S]*?<h1>)[^<]*(< \/h1>|<\/h1>)/,
    `$1${safe(noscriptH1)}</h1>`
  );
  html = html.replace(
    /(<noscript>[\s\S]*?<p>)[^<]*(< \/p>|<\/p>)/,
    `$1${safe(route.desc)}</p>`
  );

  // BreadcrumbList JSON-LD — inject before </head>
  const crumbSchema = breadcrumb(route.breadcrumbs);
  const crumbScript = `<script type="application/ld+json">\n${JSON.stringify(crumbSchema, null, 2)}\n</script>`;

  // Route-specific schema (FAQPage, Service, etc.)
  const extraScript = route.schema
    ? `<script type="application/ld+json">\n${JSON.stringify(route.schema, null, 2)}\n</script>`
    : "";

  html = html.replace(
    "</head>",
    `${crumbScript}\n${extraScript}\n</head>`
  );

  return html;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

if (!existsSync(DIST)) {
  console.error(`❌  dist/public not found at ${DIST}`);
  console.error("    Run pnpm build first, then re-run this script.");
  process.exit(1);
}

const template = readFileSync(join(DIST, "index.html"), "utf-8");
let written = 0;
let skipped = 0;

for (const route of ROUTES) {
  const segments = route.path.split("/").filter(Boolean);
  const dir  = join(DIST, ...segments);
  const file = join(dir, "index.html");

  if (DRY_RUN) {
    console.log(`[DRY-RUN] Would write: ${file.replace(DIST, "dist/public")}`);
    written++;
    continue;
  }

  try {
    mkdirSync(dir, { recursive: true });
    const html = injectSeo(template, route);
    writeFileSync(file, html, "utf-8");
    console.log(`✅  ${route.path}`);
    written++;
  } catch (err) {
    console.error(`❌  ${route.path} — ${err.message}`);
    skipped++;
  }
}

console.log(`\n📊  ${written} file${written !== 1 ? "s" : ""} written, ${skipped} skipped.`);
if (DRY_RUN) console.log("    (Dry run — no files were actually written)");
