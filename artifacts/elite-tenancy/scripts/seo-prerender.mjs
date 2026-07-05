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
    desc: "Find rooms, flats, and houses to rent across London, Manchester, Birmingham, Leeds, Bristol and more. AI-powered matching, verified landlords.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Listings", path: "/listings" }],
  },
  {
    path: "/for-landlords",
    title: "Let Your Property with Elite Tenancy | For Landlords",
    desc: "Let your UK property with Elite Tenancy. Completion-only fees, 12-day average turnaround, and six-stage tenant screening. Zero upfront cost.",
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
    path: "/features",
    title: "Platform Features | Elite Tenancy",
    desc: "AI tenant matching, automated review management, RRA 2025 compliance, rent collection, and a £20–£100 referral programme with 14-day free trials. All in one platform.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Features", path: "/features" }],
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
    title: "Renters' Rights Act 2025 Checker | Free Compliance Tool",
    desc: "Free RRA 2025 compliance checker for UK landlords. Verify tenancy agreements, deposits, pets policy, and Right to Rent obligations in 2 minutes.",
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
    path: "/faq",
    title: "UK Lettings FAQ 2026 — Elite Tenancy | Landlords & Tenants",
    desc: "Answers to 25+ common questions about UK lettings, the Renters' Rights Act 2025, Right to Rent, tenant fees, deposits, HMO licences, and how Elite Tenancy works.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }],
    schema: {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
                {
                      "@type": "Question",
                      "name": "What is Elite Tenancy?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Elite Tenancy is a premium UK lettings platform and tenant introduction service. We connect high-quality, referenced tenants with verified landlords, using AI-powered matching. Landlords pay a transparent completion-only fee of two weeks' rent — no upfront costs, no monthly management commission."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Is Elite Tenancy a registered company?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes. Elite Tenancy Ltd is registered at Companies House under number 17135665, incorporated on 2 April 2026. Our registered office is: Office 18077, 182-184 High Street North, East Ham, London, E6 2JA."
                      }
                },
                {
                      "@type": "Question",
                      "name": "What areas does Elite Tenancy operate in?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Elite Tenancy operates UK-wide, with a concentration in London (particularly East London — East Ham, Stratford, Newham, Ilford, Barking, Forest Gate, Beckton) and all major UK cities including Manchester, Birmingham, Leeds, Liverpool, Sheffield, Bristol, Edinburgh, Glasgow, Cardiff, Nottingham, Leicester, and Newcastle."
                      }
                },
                {
                      "@type": "Question",
                      "name": "What makes Elite Tenancy different from a traditional letting agent?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Traditional letting agents charge landlords 8–15% of monthly rent as an ongoing management fee. Elite Tenancy charges a single completion fee of two weeks' rent, payable only when a tenant moves in — saving landlords thousands over the tenancy. We also offer AI-powered tenant matching, built-in Right to Rent checks, and digital-first processes."
                      }
                },
                {
                      "@type": "Question",
                      "name": "How much does Elite Tenancy cost landlords?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Landlords pay two weeks' rent as a one-off completion fee when a tenant successfully moves in. There are no upfront fees, no monthly management charges, and no renewal fees. If we don't find a tenant, you pay nothing."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Is there a fee for tenants to use Elite Tenancy?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No. Tenants use Elite Tenancy free of charge. Under the Tenant Fees Act 2019, landlords and agents cannot charge tenants any fees except for holding deposits, damage deposits, and rent. We comply fully with this legislation."
                      }
                },
                {
                      "@type": "Question",
                      "name": "What is a completion-only fee?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "A completion-only fee means you pay only when the tenancy actually starts — when a tenant moves into the property. If the process falls through at any stage, you owe nothing. This aligns our incentives with yours: we only get paid when you get a tenant."
                      }
                },
                {
                      "@type": "Question",
                      "name": "How does the Renter Passport work?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "The Renter Passport is a digital tenant profile powered by AI. Tenants complete their profile (employment, income, references, move-in date, preferred area), and our AI writes a landlord-facing summary and calculates a readiness score. Landlords can view Renter Passports directly, making the introduction faster and more transparent for both sides."
                      }
                },
                {
                      "@type": "Question",
                      "name": "How does AI tenant matching work?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Our matching algorithm cross-references your Renter Passport (income, lifestyle, preferences, move-in timeline) against every active property. It scores each match and returns your top properties ranked by compatibility. Unlike basic filter-and-search, it considers factors like tenant–landlord fit, commute, and reference strength."
                      }
                },
                {
                      "@type": "Question",
                      "name": "What references does Elite Tenancy require?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "We conduct credit checks, employer references (or self-employment accountant letters), and previous landlord references. For international tenants or those with non-standard employment, we offer alternative referencing options, including larger deposits or guarantors, in line with the Renters' Rights Act 2025."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Can I rent through Elite Tenancy if I have a poor credit history?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "We consider applications on a case-by-case basis. Tenants with adverse credit may qualify with a larger deposit (capped under the Tenant Fees Act), a UK-based guarantor, or six months' rent in advance. Contact us to discuss your specific situation."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Can international students or workers rent through Elite Tenancy?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes. We regularly place international students, NHS workers, and overseas employees. We have a dedicated International Students page with guidance on visa requirements, Right to Rent documentation, and referencing options for non-UK nationals."
                      }
                },
                {
                      "@type": "Question",
                      "name": "How do I list my property with Elite Tenancy?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Click 'List Your Property' on our website and complete the property details form. A member of our team will contact you within one business day to confirm the listing and arrange photos if needed. Your property goes live on our platform and is matched to suitable tenants in our database."
                      }
                },
                {
                      "@type": "Question",
                      "name": "How quickly can Elite Tenancy find me a tenant?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "For well-priced properties in high-demand areas (London, Manchester, Birmingham), we typically produce shortlisted, referenced applicants within 5–14 days of listing. More specialist properties or rural locations may take longer. We maintain an active database of pre-referenced tenants looking now."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Does Elite Tenancy manage my property after the tenant moves in?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No — Elite Tenancy is an introduction service, not a full management service. Once we have introduced the tenant and the tenancy agreement is signed, you manage the property yourself (or appoint your own managing agent). This is how we keep costs low for landlords."
                      }
                },
                {
                      "@type": "Question",
                      "name": "What is the Verify a Landlord tool?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Verify a Landlord lets prospective tenants check a landlord's identity against Companies House records — useful for limited company landlords. It also allows landlords to register their verified status publicly, which helps build trust with quality tenants."
                      }
                },
                {
                      "@type": "Question",
                      "name": "What does the Renters' Rights Act 2025 mean for landlords?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "The Renters' Rights Act 2025 (effective from 2026) abolishes Section 21 'no-fault' evictions, converts all assured shorthold tenancies to assured periodic tenancies, introduces a private rented sector database, and strengthens tenants' rights on rent increases and property standards. Landlords can still end tenancies on valid grounds under Section 8."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Is a 6-month fixed-term tenancy still possible after the Renters' Rights Act?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "New tenancies created after the Renters' Rights Act commencement date are assured periodic tenancies by default. Fixed-term tenancies are no longer possible for new lets. Existing fixed-term tenancies continue until their end date and then convert to periodic. Tenants gain the right to leave with two months' notice at any time."
                      }
                },
                {
                      "@type": "Question",
                      "name": "What is Right to Rent and who needs to check it?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Right to Rent is the legal requirement for landlords in England to verify that all adult occupants have the right to live in the UK before a tenancy begins. Failure to conduct a compliant check can result in a civil penalty of up to £20,000 per occupant. Elite Tenancy provides a built-in Right to Rent check tool using the UK Home Office share code system."
                      }
                },
                {
                      "@type": "Question",
                      "name": "What is the maximum deposit a landlord can charge in the UK?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Under the Tenant Fees Act 2019, the security deposit is capped at five weeks' rent where the annual rent is under £50,000, or six weeks' rent where it is £50,000 or above. Holding deposits are capped at one week's rent."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Can a landlord refuse pets in 2026?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "The Renters' Rights Act 2025 gives tenants the right to request a pet and requires landlords to consider the request and only decline on reasonable grounds. Landlords can require a tenant to take out pet damage insurance. A blanket 'no pets' clause in a tenancy agreement is no longer enforceable."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Can a landlord refuse benefits tenants (DSS) in 2026?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Blanket 'No DSS' policies are unlawful indirect discrimination. Multiple court rulings and the Equality Act 2010 confirm that refusing all housing benefit or Universal Credit claimants without individual assessment is discriminatory. Landlords must assess each applicant on their own merits."
                      }
                },
                {
                      "@type": "Question",
                      "name": "What is average rent in East Ham, London in 2026?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Based on ONS and market data, average rent in East Ham (E6) in 2026 is approximately £1,910 per month for a whole property, up around 8.5% year-on-year. Room rents in HMOs average around £780–£850 per month including bills. East Ham remains significantly cheaper than Central London while benefiting from fast District and Hammersmith & City Line connections."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Do I need a landlord licence in Newham (East Ham) in 2026?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Newham Council operates a borough-wide selective licensing scheme requiring most private rented properties to hold a licence. Mandatory HMO licences apply for properties with 5+ occupants forming 2+ households. Additional HMO licences apply for smaller HMOs in designated areas. Fees start at approximately £750 for a 5-year selective licence. Elite Tenancy verifies licence compliance for all listed Newham properties."
                      }
                },
                {
                      "@type": "Question",
                      "name": "What transport links does East Ham have?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "East Ham station is served by the District Line and Hammersmith & City Line, giving direct access to the City (Aldgate: ~15 min), West End (Victoria: ~35 min), and Canary Wharf via change. Crossrail (Elizabeth Line) at Canning Town is 5 minutes away. The A13 and North Circular (A406) provide road access."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Does Elite Tenancy use AI? How?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes. Our 'Ellie' AI assistant answers tenancy questions 24/7. Our matching algorithm analyses Renter Passport data to score tenant–property compatibility. Our Renter Passport uses AI to write a landlord-ready tenant summary from structured profile data. We also use AI to automate tenant follow-ups and property recommendations."
                      }
                }
          ]
    },
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
    path: "/rooms-to-let",
    title: "Rooms & Homes to Rent Across the UK | Elite Tenancy",
    desc: "A verified, zero-fee alternative to SpareRoom. AI-matched rooms, flats and houses to rent across 20+ UK cities, from landlords we've already checked.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }],
  },
  {
    path: "/dss-accepted-housing",
    title: "DSS Accepted Properties UK 2026 — Rooms & Homes for Benefits Tenants | Elite Tenancy",
    desc: "Find DSS accepted rooms, flats and houses to rent across the UK. Landlords who welcome Universal Credit and Housing Benefit tenants, plus your legal rights under the Renters' Rights Act 2026.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "DSS Accepted Housing", path: "/dss-accepted-housing" }],
  },
  {
    path: "/find-a-lodger",
    title: "Find a Lodger UK 2026 — Consent, Agreement & Rent a Room Scheme | Elite Tenancy",
    desc: "Taking in a lodger in the UK? Get your landlord's written consent recorded properly, generate a lodger licence agreement, and see how the £7,500 tax-free Rent a Room Scheme works.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Find a Lodger", path: "/find-a-lodger" }],
  },
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
  {
    path: "/rooms-to-let/sheffield",
    title: "Rooms to Let in Sheffield 2026 | Elite Tenancy",
    desc: "Find rooms to let in Sheffield. City centre, Endcliffe, Crookes, and Ecclesall Road. Student and professional rooms. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Sheffield", path: "/rooms-to-let/sheffield" }],
  },
  {
    path: "/rooms-to-let/liverpool",
    title: "Rooms to Let in Liverpool 2026 | Elite Tenancy",
    desc: "Find rooms to let in Liverpool. City centre, Baltic Triangle, Aigburth, and Woolton. Bills included options. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Liverpool", path: "/rooms-to-let/liverpool" }],
  },
  {
    path: "/rooms-to-let/edinburgh",
    title: "Rooms to Let in Edinburgh 2026 | Elite Tenancy",
    desc: "Find rooms to let in Edinburgh. Old Town, New Town, Leith, and Marchmont. Verified landlords. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Edinburgh", path: "/rooms-to-let/edinburgh" }],
  },
  {
    path: "/rooms-to-let/cardiff",
    title: "Rooms to Let in Cardiff 2026 | Elite Tenancy",
    desc: "Find rooms to let in Cardiff. Bay, Pontcanna, Roath, and city centre. Verified landlords and zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Cardiff", path: "/rooms-to-let/cardiff" }],
  },
  {
    path: "/rooms-to-let/glasgow",
    title: "Rooms to Let in Glasgow 2026 | Elite Tenancy",
    desc: "Find rooms to let in Glasgow. West End, Merchant City, Southside, and city centre. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Glasgow", path: "/rooms-to-let/glasgow" }],
  },
  {
    path: "/rooms-to-let/nottingham",
    title: "Rooms to Let in Nottingham 2026 | Elite Tenancy",
    desc: "Find rooms to let in Nottingham. Lace Market, West Bridgford, and city centre. Student and professional rooms. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Nottingham", path: "/rooms-to-let/nottingham" }],
  },
  {
    path: "/rooms-to-let/newcastle",
    title: "Rooms to Let in Newcastle 2026 | Elite Tenancy",
    desc: "Find rooms to let in Newcastle. Quayside, Jesmond, and city centre. Bills included options available. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Newcastle", path: "/rooms-to-let/newcastle" }],
  },
  {
    path: "/rooms-to-let/leicester",
    title: "Rooms to Let in Leicester 2026 | Elite Tenancy",
    desc: "Find rooms to let in Leicester. City centre, Clarendon Park, and Stoneygate. Verified landlords. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Leicester", path: "/rooms-to-let/leicester" }],
  },
  {
    path: "/rooms-to-let/coventry",
    title: "Rooms to Let in Coventry 2026 | Elite Tenancy",
    desc: "Find rooms to let in Coventry. City centre, Earlsdon, and Chapelfields. Student and professional rooms. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Coventry", path: "/rooms-to-let/coventry" }],
  },
  {
    path: "/rooms-to-let/brighton",
    title: "Rooms to Let in Brighton 2026 | Elite Tenancy",
    desc: "Find rooms to let in Brighton. Kemptown, North Laine, and Hove. Verified landlords. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Brighton", path: "/rooms-to-let/brighton" }],
  },
  {
    path: "/rooms-to-let/reading",
    title: "Rooms to Let in Reading 2026 | Elite Tenancy",
    desc: "Find rooms to let in Reading. Town centre and Caversham, with fast links to London. Professional rooms. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Reading", path: "/rooms-to-let/reading" }],
  },
  {
    path: "/rooms-to-let/cambridge",
    title: "Rooms to Let in Cambridge 2026 | Elite Tenancy",
    desc: "Find rooms to let in Cambridge. City centre and Mill Road, close to the university and biotech hubs. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Cambridge", path: "/rooms-to-let/cambridge" }],
  },
  {
    path: "/rooms-to-let/oxford",
    title: "Rooms to Let in Oxford 2026 | Elite Tenancy",
    desc: "Find rooms to let in Oxford. City centre, Cowley, and Jericho. Verified landlords, strong demand year-round. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Oxford", path: "/rooms-to-let/oxford" }],
  },
  {
    path: "/rooms-to-let/southampton",
    title: "Rooms to Let in Southampton 2026 | Elite Tenancy",
    desc: "Find rooms to let in Southampton. City centre and Portswood, near both universities. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Southampton", path: "/rooms-to-let/southampton" }],
  },
  {
    path: "/rooms-to-let/york",
    title: "Rooms to Let in York 2026 | Elite Tenancy",
    desc: "Find rooms to let in York. City centre and Fulford, in one of the UK's most characterful cities. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "York", path: "/rooms-to-let/york" }],
  },
  {
    path: "/rooms-to-let/bath",
    title: "Rooms to Let in Bath 2026 | Elite Tenancy",
    desc: "Find rooms to let in Bath. City centre and Widcombe, in a UNESCO Georgian city. Verified landlords. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Bath", path: "/rooms-to-let/bath" }],
  },
  {
    path: "/rooms-to-let/aberdeen",
    title: "Rooms to Let in Aberdeen 2026 | Elite Tenancy",
    desc: "Find rooms to let in Aberdeen. City centre and the West End, Scotland's energy-sector hub. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Aberdeen", path: "/rooms-to-let/aberdeen" }],
  },
  {
    path: "/rooms-to-let/belfast",
    title: "Rooms to Let in Belfast 2026 | Elite Tenancy",
    desc: "Find rooms to let in Belfast. City centre, Stranmillis, and Titanic Quarter. Verified landlords. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Belfast", path: "/rooms-to-let/belfast" }],
  },
  {
    path: "/rooms-to-let/harrogate",
    title: "Rooms to Let in Harrogate 2026 | Elite Tenancy",
    desc: "Find rooms to let in Harrogate. Town centre and Bilton, an elegant North Yorkshire spa town. Zero agency fees.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Rooms to Let", path: "/rooms-to-let" }, { name: "Harrogate", path: "/rooms-to-let/harrogate" }],
  },
];

// ─── Blog Articles ─────────────────────────────────────────────────────────────

const BLOG_ARTICLES = [
  {
    slug: "renters-rights-act-2026-landlord-guide",
    title: "Renters' Rights Act 2026: Complete Landlord Guide | Elite Tenancy",
    desc: "The Renters' Rights Act 2026 abolished Section 21, ended fixed-term tenancies, and gave pets new rights. Complete guide for UK landlords.",
    image: `${BASE_URL}/blog-images/renters-rights-act-2026-landlord-guide.svg`,
  },
  {
    slug: "section-21-abolished-2026-landlord-guide",
    title: "Section 21 Abolished 2026: What Landlords Must Do Now | Elite Tenancy",
    desc: "Section 21 no-fault evictions were abolished on 1 May 2026. Here's what UK landlords need to know about possession under Section 8.",
    image: `${BASE_URL}/blog-images/section-21-abolished-2026-landlord-guide.svg`,
  },
  {
    slug: "section-21-abolished-what-it-means-for-tenants",
    title: "Section 21 Abolished: What It Means for Tenants 2026 | Elite Tenancy",
    desc: "Section 21 'no-fault' evictions are gone. UK tenants now have much stronger security of tenure. Here's what changed and what it means for you.",
    image: `${BASE_URL}/blog-images/section-21-abolished-what-it-means-for-tenants.svg`,
  },
  {
    slug: "no-dss-illegal-2026-benefits-tenants-landlord-guide",
    title: "No DSS is Illegal in 2026: Benefits Tenants Landlord Guide | Elite Tenancy",
    desc: "Refusing tenants on housing benefits ('No DSS') is now illegal in the UK. What landlords must do and how benefits tenants can assert their rights.",
    image: `${BASE_URL}/blog-images/no-dss-illegal-2026-benefits-tenants-landlord-guide.svg`,
  },
  {
    slug: "can-landlord-refuse-pets-2026-uk",
    title: "Can a Landlord Refuse Pets in 2026? UK Law Explained | Elite Tenancy",
    desc: "UK landlords can no longer unreasonably refuse pets since the Renters' Rights Act 2025. Here's how the new pet rules work for landlords and tenants.",
    image: `${BASE_URL}/blog-images/can-landlord-refuse-pets-2026-uk.svg`,
  },
  {
    slug: "assured-periodic-tenancy-explained",
    title: "Assured Periodic Tenancy Explained 2026 | Elite Tenancy",
    desc: "All UK tenancies are now rolling periodic. What this means for landlords and tenants — rent increases, notice periods, and possession.",
    image: `${BASE_URL}/blog-images/assured-periodic-tenancy-explained.svg`,
  },
  {
    slug: "rent-in-advance-legal-2026-uk",
    title: "Is Rent in Advance Legal? UK Landlord Guide 2026 | Elite Tenancy",
    desc: "Can UK landlords charge more than one month's rent in advance? The Renters' Rights Act 2025 restricts rent in advance. Full legal guide.",
    image: `${BASE_URL}/blog-images/rent-in-advance-legal-2026-uk.svg`,
  },
  {
    slug: "hmo-licence-uk-2026-complete-guide",
    title: "HMO Licence UK 2026: Complete Guide for Landlords | Elite Tenancy",
    desc: "Do you need an HMO licence? Complete guide to Houses in Multiple Occupation licences for UK landlords in 2026.",
    image: `${BASE_URL}/blog-images/hmo-licence-uk-2026-complete-guide.svg`,
  },
  {
    slug: "letting-agent-fees-uk-2026-landlord-guide",
    title: "Letting Agent Fees UK 2026: Landlord Cost Guide | Elite Tenancy",
    desc: "How much do letting agents charge in 2026? Full breakdown of landlord letting agent fees vs Elite Tenancy's completion-only model.",
    image: `${BASE_URL}/blog-images/letting-agent-fees-uk-2026-landlord-guide.svg`,
  },
  {
    slug: "landlord-guide-letting-2026",
    title: "Complete Landlord Guide to Letting a Property in 2026 | Elite Tenancy",
    desc: "The definitive 2026 guide for UK landlords. Valuation, marketing, tenant screening, AST, deposit protection, Right to Rent, and more.",
    image: `${BASE_URL}/blog-images/landlord-guide-letting-2026.svg`,
  },
  {
    slug: "buy-to-let-2026-worth-it",
    title: "Is Buy to Let Worth It in 2026? UK Investment Guide | Elite Tenancy",
    desc: "Is buy-to-let still a worthwhile investment in 2026? Analysis of yields, mortgage rates, tax changes, and the Renters' Rights Act impact.",
    image: `${BASE_URL}/blog-images/buy-to-let-2026-worth-it.svg`,
  },
  {
    slug: "average-rent-uk-2026-city-price-guide",
    title: "Average Rent UK 2026: City-by-City Price Guide | Elite Tenancy",
    desc: "What is the average rent in UK cities in 2026? London, Manchester, Birmingham, Leeds, Bristol, Edinburgh — full breakdown by area and property type.",
    image: `${BASE_URL}/blog-images/average-rent-uk-2026-city-price-guide.svg`,
  },
  {
    slug: "average-rent-birmingham-2026",
    title: "Average Rent in Birmingham 2026: Area Guide | Elite Tenancy",
    desc: "Average rent in Birmingham in 2026 by area. Jewellery Quarter, Edgbaston, Moseley, Harborne — what renters and investors need to know.",
    image: `${BASE_URL}/blog-images/average-rent-birmingham-2026.svg`,
  },
  {
    slug: "average-rent-manchester-2026-area-guide",
    title: "Average Rent in Manchester 2026: Area Guide | Elite Tenancy",
    desc: "Average rent in Manchester in 2026 by area. City centre, Salford, Didsbury, Ancoats, Chorlton — complete rental market breakdown.",
    image: `${BASE_URL}/blog-images/average-rent-manchester-2026-area-guide.svg`,
  },
  {
    slug: "manchester-vs-london-rent-2026",
    title: "Manchester vs London Rent 2026: Cost Comparison | Elite Tenancy",
    desc: "Manchester vs London rental costs in 2026. Comparing average rents, quality of life, job markets, and what your money gets you in both cities.",
    image: `${BASE_URL}/blog-images/manchester-vs-london-rent-2026.svg`,
  },
  {
    slug: "find-premium-rentals-london-2026",
    title: "How to Find Premium Rentals in London 2026 | Elite Tenancy",
    desc: "How to find premium rental properties in London in 2026. Best areas, platforms, and how Elite Tenancy's AI matching gives you an edge.",
    image: `${BASE_URL}/blog-images/find-premium-rentals-london-2026.svg`,
  },
  {
    slug: "tenancy-agreement-clauses-guide",
    title: "Tenancy Agreement Clauses: Complete UK Guide 2026 | Elite Tenancy",
    desc: "What to look for in a UK tenancy agreement. Key clauses, unfair terms, and what the Renters' Rights Act 2025 changed about ASTs.",
    image: `${BASE_URL}/blog-images/tenancy-agreement-clauses-guide.svg`,
  },
  {
    slug: "ai-tenant-matching-how-it-works",
    title: "AI Tenant Matching: How Elite Tenancy Works | Elite Tenancy",
    desc: "How Elite Tenancy's AI-powered tenant matching works. Six-stage screening, Renter Passport scoring, and why landlords get better tenants faster.",
    image: `${BASE_URL}/blog-images/ai-tenant-matching-how-it-works.svg`,
  },
  {
    slug: "cheapest-rooms-to-rent-london-2026",
    title: "Cheapest Rooms to Rent in London 2026: 5 Postcodes Under £800 | Elite Tenancy",
    desc: "Only 5 London postcodes still have room rents under £800/month in 2026. See which areas — led by East Ham E6 — still offer affordable London living.",
    image: `${BASE_URL}/blog-images/cheapest-rooms-to-rent-london-2026.svg`,
  },
  {
    slug: "properties-to-rent-east-ham-2026",
    title: "Properties to Rent in East Ham 2026: Complete Area Guide | Elite Tenancy",
    desc: "Renting in East Ham E6? Average rents, best streets, transport links, and local amenities — the complete 2026 guide to one of London's best-value areas.",
    image: `${BASE_URL}/blog-images/properties-to-rent-east-ham-2026.svg`,
  },
  {
    slug: "renter-passport-uk-2026-guide",
    title: "What Is a Renter Passport? UK 2026 Guide | Elite Tenancy",
    desc: "A Renter Passport proves your tenancy history and identity to landlords before you apply. How it works, who benefits, and how to get yours free.",
    image: `${BASE_URL}/blog-images/renter-passport-uk-2026-guide.svg`,
  },
  {
    slug: "hmo-licence-newham-east-ham-2026",
    title: "HMO Licence in Newham & East Ham 2026: Costs & Rules | Elite Tenancy",
    desc: "Everything landlords need on HMO licensing in Newham — East Ham, Forest Gate, Stratford. Selective licensing, mandatory HMO, costs, and how to apply.",
    image: `${BASE_URL}/blog-images/hmo-licence-newham-east-ham-2026.svg`,
  },
  {
    slug: "renting-london-international-tenant-2026",
    title: "Renting in London as an International Tenant 2026 | Elite Tenancy",
    desc: "Moving to London from abroad? Right to Rent checks, documents, referencing without UK credit history, guarantors, and the best areas to live.",
    image: `${BASE_URL}/blog-images/renting-london-international-tenant-2026.svg`,
  },
  {
    slug: "renters-rights-act-2026-tenant-guide",
    title: "Renters' Rights Act 2026: Your Complete Tenant Guide | Elite Tenancy",
    desc: "What the Renters' Rights Act 2026 means for tenants — Section 21 abolished, stronger eviction protection, pet rights, and rent increase limits.",
    image: `${BASE_URL}/blog-images/renters-rights-act-2026-tenant-guide.svg`,
  },
  {
    slug: "right-to-rent-uk-2026-guide",
    title: "Right to Rent UK 2026: Guide for Tenants & Landlords | Elite Tenancy",
    desc: "How Right to Rent works in 2026 — who checks, accepted documents, EU share codes, landlord penalties, and your rights against discrimination.",
    image: `${BASE_URL}/blog-images/right-to-rent-uk-2026-guide.svg`,
  },
  {
    slug: "rent-calculator-uk-2026-guide",
    title: "How to Use a UK Rent Calculator in 2026 | Elite Tenancy",
    desc: "How much rent can you afford in the UK? The 30x income rule explained, rental yield formulas for landlords, deposit caps, and free tools.",
    image: `${BASE_URL}/blog-images/rent-calculator-uk-2026-guide.svg`,
  },
  {
    slug: "renters-rights-act-information-sheet-2026",
    title: "RRA Information Sheet 2026: The 31 May Deadline | Elite Tenancy",
    desc: "Every landlord with an existing tenancy had to serve the official RRA Information Sheet by 31 May 2026 or face a £7,000 fine. What it must contain and what to do if you missed it.",
    image: `${BASE_URL}/blog-images/renters-rights-act-2026-landlord-guide.svg`,
  },
  {
    slug: "section-13-rent-increase-notice-2026",
    title: "Section 13 Rent Increase Notice 2026: Form 4A Guide | Elite Tenancy",
    desc: "Section 13 is now the only lawful way to increase rent in England. The exact process, notice periods, and how tenants can challenge an increase at Tribunal.",
    image: `${BASE_URL}/blog-images/section-21-abolished-2026-landlord-guide.svg`,
  },
];

// Publish dates from the blog_articles table (published_at), used for
// BlogPosting datePublished/dateModified below.
const PUBLISHED_DATES = {
  "ai-tenant-matching-how-it-works": "2026-03-27",
  "assured-periodic-tenancy-explained": "2026-05-27",
  "average-rent-birmingham-2026": "2026-05-23",
  "average-rent-manchester-2026-area-guide": "2026-06-02",
  "average-rent-uk-2026-city-price-guide": "2026-05-22",
  "buy-to-let-2026-worth-it": "2026-04-11",
  "can-landlord-refuse-pets-2026-uk": "2026-05-31",
  "cheapest-rooms-to-rent-london-2026": "2026-03-15",
  "find-premium-rentals-london-2026": "2026-05-19",
  "hmo-licence-newham-east-ham-2026": "2026-04-05",
  "hmo-licence-uk-2026-complete-guide": "2026-05-20",
  "landlord-guide-letting-2026": "2026-05-12",
  "letting-agent-fees-uk-2026-landlord-guide": "2026-05-26",
  "manchester-vs-london-rent-2026": "2026-05-05",
  "no-dss-illegal-2026-benefits-tenants-landlord-guide": "2026-05-24",
  "properties-to-rent-east-ham-2026": "2026-03-20",
  "rent-calculator-uk-2026-guide": "2026-04-25",
  "rent-in-advance-legal-2026-uk": "2026-05-29",
  "renter-passport-uk-2026-guide": "2026-04-01",
  "renters-rights-act-2026-landlord-guide": "2026-05-15",
  "renters-rights-act-2026-tenant-guide": "2026-05-01",
  "renters-rights-act-information-sheet-2026": "2026-07-04",
  "section-13-rent-increase-notice-2026": "2026-07-04",
  "renting-london-international-tenant-2026": "2026-03-20",
  "right-to-rent-uk-2026-guide": "2026-02-15",
  "section-21-abolished-2026-landlord-guide": "2026-05-18",
  "section-21-abolished-what-it-means-for-tenants": "2026-05-25",
  "tenancy-agreement-clauses-guide": "2026-04-26",
};

// Add blog articles to routes
for (const article of BLOG_ARTICLES) {
  const headline = article.title.split("|")[0].trim();
  const canonical = `${BASE_URL}/blog/${article.slug}`;
  const publishedDate = PUBLISHED_DATES[article.slug];

  ROUTES.push({
    path: `/blog/${article.slug}`,
    title: article.title,
    desc: article.desc,
    image: article.image,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: headline, path: `/blog/${article.slug}` },
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline,
      description: article.desc,
      image: article.image,
      author: { "@type": "Organization", name: "Elite Tenancy" },
      publisher: {
        "@type": "Organization",
        name: "Elite Tenancy Ltd",
        logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.svg` },
      },
      datePublished: publishedDate,
      dateModified: publishedDate,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      url: canonical,
    },
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

  // hreflang — index.html's static block hardcodes every locale to the
  // homepage URL. That's correct only for "/" itself; on every other route
  // (all 26 blog articles, all 24 city pages, all 24 rooms-to-let pages, and
  // even the dedicated international-targeting pages) it was shipping as
  // literal HTML, uncorrected, meaning every single page on the site declared
  // itself to Google as the en/en-GB/en-US/etc. alternate of the homepage —
  // confirmed via direct curl against the live site as Googlebot, not assumed.
  // Fix: self-reference each page's own canonical across every listed locale,
  // which is the correct pattern for one English-language page serving
  // multiple English-speaking regions (there are no real translated variants).
  html = html.replace(
    /(<link rel="alternate" hreflang="[^"]*"\s+href=")[^"]*(")/g,
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

  // OG image / Twitter image — per-article image overrides the default og-image.jpg
  if (route.image) {
    html = html.replace(
      /(<meta property="og:image"\s+content=")[^"]*(")/,
      `$1${safe(route.image)}$2`
    );
    html = html.replace(
      /(<meta property="og:image:alt"\s+content=")[^"]*(")/,
      `$1${safe(route.title.split("|")[0].trim())}$2`
    );
    html = html.replace(
      /(<meta name="twitter:image"\s+content=")[^"]*(")/,
      `$1${safe(route.image)}$2`
    );
    html = html.replace(
      /(<meta name="twitter:image:alt"\s+content=")[^"]*(")/,
      `$1${safe(route.title.split("|")[0].trim())}$2`
    );
  }

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
