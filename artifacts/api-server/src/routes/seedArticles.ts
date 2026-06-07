/**
 * One-time blog article seeder.
 *
 * POST /api/seed-articles
 * Header: X-Seed-Secret: <CRON_SECRET env var>
 *
 * Inserts all 18 cornerstone blog articles if they don't already exist.
 * Safe to call multiple times (onConflictDoNothing on slug).
 */

import { Router, type IRouter } from "express";
import { db, blogArticlesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

const ARTICLES: Array<{
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  readTimeMinutes: number;
  tags: string[];
  publishedAt: Date;
  imageUrl: string | null;
}> = [
  {
    slug: "renters-rights-act-2026-landlord-guide",
    title: "Renters' Rights Act 2026: The Complete Landlord Guide",
    excerpt:
      "Everything landlords need to know about the Renters' Rights Act 2026 — abolition of Section 21, new tenancy rules, rent increases, and compliance steps.",
    category: "Landlord Guides",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 7,
    tags: ["Renters Rights Act", "Section 21", "Landlord Guide", "2026", "UK Law"],
    publishedAt: new Date("2026-01-10"),
    imageUrl: null,
    content: `
<h2>What Is the Renters' Rights Act 2026?</h2>
<p>The Renters' Rights Act 2026 is the most significant shake-up to the private rented sector in a generation. Building on the earlier Renters (Reform) Bill, this legislation has now received Royal Assent and fundamentally changes the relationship between landlords and tenants across England.</p>
<p>At its core, the Act abolishes Section 21 "no-fault" evictions, replaces fixed-term assured shorthold tenancies with periodic tenancies, introduces a new Private Rented Sector Database, and strengthens tenants' rights across the board. Every landlord in England must understand these changes — and act on them.</p>

<h2>The End of Section 21 "No-Fault" Evictions</h2>
<p>From the Act's commencement date, landlords can no longer issue Section 21 notices to end a tenancy without a specific legal reason. This is the single biggest change for landlords.</p>
<p>Instead, you must use <strong>Section 8 grounds</strong> to regain possession. These include:</p>
<ul>
  <li><strong>Ground 8:</strong> Two months or more rent arrears</li>
  <li><strong>Ground 14:</strong> Anti-social behaviour</li>
  <li><strong>Ground 1A:</strong> Landlord wishes to sell the property (new mandatory ground)</li>
  <li><strong>Ground 1B:</strong> Landlord or close family member wishes to move in (new mandatory ground)</li>
</ul>
<p>For grounds 1A and 1B, landlords must give tenants <strong>four months' notice</strong> (up from two). Critically, you cannot use these grounds within the first 12 months of a tenancy.</p>

<h2>No More Fixed-Term Tenancies</h2>
<p>All new tenancies (and existing ones after a transition period) will automatically become <strong>periodic tenancies</strong> — rolling month-by-month with no set end date. This means:</p>
<ul>
  <li>Tenants can give two months' notice to leave at any time</li>
  <li>Landlords cannot issue break clauses or minimum term requirements</li>
  <li>Students and short-term lets may need to use holiday let arrangements instead</li>
</ul>

<h2>Rent Increases Under the New Rules</h2>
<p>Landlords can only increase rent <strong>once per year</strong> and must use the Section 13 formal notice process (a minimum of two months' written notice). Tenants have the right to challenge any increase they believe is above market rate at the First-tier Tribunal (Property Chamber).</p>
<p>Critically, landlords cannot include lease clauses that allow rent increases outside this process. Any such clause is void.</p>

<h2>The Private Rented Sector Database</h2>
<p>All private landlords in England must register on the new <strong>PRS Database</strong> before they can legally let a property. Failure to register is a civil penalty of up to £7,500 for a first offence and £40,000 for repeat offences.</p>
<p>The database will be publicly searchable, allowing tenants to verify a landlord's compliance record before signing a tenancy agreement.</p>

<h2>Awaab's Law — Repairs and Hazards</h2>
<p>Extended from social housing, <strong>Awaab's Law</strong> now applies to the private sector. Landlords must investigate reported hazards within 14 days and carry out emergency repairs within 24 hours. Damp and mould must be treated as urgent health hazards — not cosmetic issues.</p>

<h2>Tenants' Right to Keep Pets</h2>
<p>Landlords can no longer unreasonably refuse a tenant's request to keep a pet. You may require the tenant to take out pet damage insurance, but a blanket "no pets" clause in a tenancy agreement is now unenforceable.</p>

<h2>What Landlords Must Do Now</h2>
<ol>
  <li><strong>Register on the PRS Database</strong> before letting any property</li>
  <li><strong>Review all existing tenancy agreements</strong> — any fixed-term clauses will become void on transition</li>
  <li><strong>Update your Section 8 eviction procedures</strong> — Section 21 notices are no longer valid</li>
  <li><strong>Review your rent-increase process</strong> — ensure you're using Section 13 notices</li>
  <li><strong>Update your repair response protocols</strong> to comply with Awaab's Law timescales</li>
  <li><strong>Update your pet policy</strong> — blanket "no pets" clauses are unenforceable</li>
</ol>

<h2>How Elite Tenancy Can Help</h2>
<p>Navigating the Renters' Rights Act alone is challenging. Elite Tenancy's managed letting service handles compliance for you — from legally compliant tenancy agreements to PRS Database registration support and evidence-based Section 8 eviction management. <a href="/for-landlords">Learn more about our landlord services.</a></p>
    `.trim(),
  },

  {
    slug: "section-21-abolished-2026-landlord-guide",
    title: "Section 21 Abolished: What Landlords Must Do Now",
    excerpt:
      "Section 21 no-fault evictions have been abolished in England. Here's what landlords need to do instead — the Section 8 grounds you can use and how to protect your property.",
    category: "Landlord Guides",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 6,
    tags: ["Section 21", "Eviction", "Landlord Guide", "Section 8", "2026"],
    publishedAt: new Date("2026-01-12"),
    imageUrl: null,
    content: `
<h2>Section 21 Is Gone — What Replaces It?</h2>
<p>As of 2026, Section 21 "no-fault" eviction notices are abolished for all residential tenancies in England. This means landlords can no longer end a tenancy simply by giving two months' notice without providing a specific legal reason.</p>
<p>The replacement is an expanded set of <strong>Section 8 possession grounds</strong> under the Housing Act 1988, as amended by the Renters' Rights Act. These require landlords to prove a specific reason for wanting the property back.</p>

<h2>The Section 8 Grounds Landlords Can Now Use</h2>
<h3>Mandatory Grounds (Court must grant possession if proven)</h3>
<ul>
  <li><strong>Ground 8:</strong> At least two months' rent arrears at both notice and hearing date</li>
  <li><strong>Ground 1A (NEW):</strong> Landlord intends to sell the property — requires 4 months' notice, cannot be used in first 12 months</li>
  <li><strong>Ground 1B (NEW):</strong> Landlord or close family member wants to move in — requires 4 months' notice, cannot be used in first 12 months</li>
  <li><strong>Ground 2:</strong> Mortgage lender seeks possession (rare)</li>
  <li><strong>Ground 7A:</strong> Tenant conviction for serious offence or ASB ban</li>
</ul>
<h3>Discretionary Grounds (Court may grant possession)</h3>
<ul>
  <li><strong>Ground 10:</strong> Rent arrears (any amount)</li>
  <li><strong>Ground 11:</strong> Persistent late payment of rent</li>
  <li><strong>Ground 12:</strong> Breach of tenancy agreement</li>
  <li><strong>Ground 13:</strong> Deterioration of property condition</li>
  <li><strong>Ground 14:</strong> Nuisance, annoyance or anti-social behaviour</li>
  <li><strong>Ground 17:</strong> Tenant provided false information to obtain tenancy</li>
</ul>

<h2>Notice Periods Under the New System</h2>
<p>Notice periods vary by ground:</p>
<ul>
  <li><strong>Rent arrears (Ground 8):</strong> 4 weeks minimum notice</li>
  <li><strong>Selling property (Ground 1A):</strong> 4 months minimum notice</li>
  <li><strong>Moving in (Ground 1B):</strong> 4 months minimum notice</li>
  <li><strong>ASB (Ground 14):</strong> Immediate notice (court decides)</li>
  <li><strong>Most other grounds:</strong> 2 months minimum notice</li>
</ul>

<h2>Protecting Yourself as a Landlord</h2>
<p>With no-fault evictions gone, protecting your position from day one is more important than ever:</p>
<ol>
  <li><strong>Thorough tenant referencing</strong> — credit checks, employment verification, and previous landlord references are essential</li>
  <li><strong>Comprehensive tenancy agreements</strong> — clearly document all obligations including rent due dates and property care expectations</li>
  <li><strong>Meticulous rent arrears records</strong> — keep records of every payment received and any gaps</li>
  <li><strong>Regular property inspections</strong> — document condition with photos and written reports</li>
  <li><strong>Prompt response to complaints</strong> — show you're fulfilling your legal obligations as a landlord</li>
</ol>

<h2>What Happens to Existing Section 21 Notices?</h2>
<p>Any Section 21 notice served before the abolition date remains valid until it expires. After that date, no new Section 21 notices can be issued for any tenancy — including those that began before the law changed.</p>

<h2>Will Evictions Become Harder?</h2>
<p>The short answer is yes — slightly. However, for genuine cases of rent arrears or anti-social behaviour, the Section 8 process is well-established. Landlords with proper documentation and evidence can still regain possession effectively.</p>
<p>The bigger change is for landlords who previously relied on Section 21 to end tenancies without explanation. You now need a valid legal reason, and the courts must agree.</p>

<h2>Expert Help with Possession Proceedings</h2>
<p>Elite Tenancy's managed service includes professional tenancy management, thorough tenant referencing, and compliance support — ensuring you have the documentation and records needed for any future Section 8 claim. <a href="/for-landlords">Find out more.</a></p>
    `.trim(),
  },

  {
    slug: "hmo-licence-uk-2026-complete-guide",
    title: "HMO Licence UK 2026: Requirements, Costs & Penalties",
    excerpt:
      "A complete guide to HMO licences in the UK for 2026. Who needs one, what it costs, how to apply, and the penalties for unlicensed HMOs.",
    category: "Landlord Guides",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 6,
    tags: ["HMO", "Licence", "Landlord Guide", "2026", "UK Property"],
    publishedAt: new Date("2026-01-18"),
    imageUrl: null,
    content: `
<h2>What Is an HMO?</h2>
<p>A House in Multiple Occupation (HMO) is a property shared by three or more people from two or more separate households who share facilities such as a kitchen or bathroom. Common examples include student houses, bedsits, and shared houses rented by young professionals.</p>
<p>If your property meets this definition, you are likely required to obtain an HMO licence — a legal requirement that landlords in England and Wales cannot ignore.</p>

<h2>Do You Need a Mandatory HMO Licence?</h2>
<p>A <strong>mandatory HMO licence</strong> is required if your property:</p>
<ul>
  <li>Is occupied by five or more people from two or more separate households</li>
  <li>Has occupants who share toilet, bathroom, or kitchen facilities</li>
  <li>Covers at least one storey (virtually all residential properties)</li>
</ul>
<p>The five-person threshold applies nationally. However, many councils also operate <strong>additional or selective licensing schemes</strong> that require licences for smaller HMOs or all private rentals in certain areas.</p>

<h2>Additional and Selective HMO Licensing</h2>
<p>Beyond mandatory licensing, councils can designate areas where all HMOs — or even all private rented properties — must be licensed. These schemes vary by local authority. Always check with your council whether additional licensing applies to your property, especially in high-demand city areas like London, Manchester, and Birmingham.</p>

<h2>How to Apply for an HMO Licence</h2>
<ol>
  <li><strong>Contact your local council</strong> — most councils have online application portals</li>
  <li><strong>Gather required documents:</strong> gas safety certificate, electrical installation condition report (EICR), energy performance certificate (EPC), floor plan of the property, and proof of identity</li>
  <li><strong>Ensure property compliance</strong> — room sizes, fire safety (smoke alarms on every storey, fire doors where required), and amenity standards must meet HMO standards</li>
  <li><strong>Pay the licence fee</strong> (see below)</li>
  <li><strong>Attend inspection</strong> — the council may inspect before granting the licence</li>
</ol>

<h2>HMO Licence Costs in 2026</h2>
<p>Licence fees are set by local councils and vary significantly:</p>
<ul>
  <li><strong>London boroughs:</strong> £800 – £1,800 for a 5-year licence</li>
  <li><strong>Manchester:</strong> £550 – £900</li>
  <li><strong>Birmingham:</strong> £650 – £1,000</li>
  <li><strong>Bristol:</strong> £500 – £850</li>
  <li><strong>Other cities:</strong> Typically £400 – £800</li>
</ul>
<p>Licences typically last 5 years, after which you must renew. Some councils offer discounts for accredited landlords.</p>

<h2>HMO Room Size Requirements</h2>
<p>Since 2018, HMOs must meet minimum room size requirements:</p>
<ul>
  <li><strong>Single adult sleeping room:</strong> Minimum 6.51 sq m</li>
  <li><strong>Double adult sleeping room (two adults):</strong> Minimum 10.22 sq m</li>
  <li><strong>Child's sleeping room (under 10):</strong> Minimum 4.64 sq m</li>
</ul>
<p>Rooms below these sizes cannot be used as sleeping accommodation. Any rooms that do not meet minimum standards must either be converted to non-sleeping use or not be let.</p>

<h2>Penalties for Operating Without an HMO Licence</h2>
<p>Operating a licensable HMO without a licence is a serious criminal offence:</p>
<ul>
  <li><strong>Unlimited fines</strong> in Magistrates' Court</li>
  <li><strong>Civil penalties up to £30,000</strong> per offence under the Housing and Planning Act 2016</li>
  <li><strong>Rent repayment orders (RROs)</strong> — tenants can apply for repayment of up to 12 months' rent paid during the unlicensed period</li>
  <li><strong>Banning orders</strong> for repeat offenders, prohibiting you from letting any residential property</li>
</ul>

<h2>HMO Management Regulations</h2>
<p>Licensed HMOs must also comply with the HMO Management Regulations 2006, which cover:</p>
<ul>
  <li>Fire safety equipment maintenance</li>
  <li>Common area maintenance</li>
  <li>Water supply and drainage</li>
  <li>Waste management</li>
  <li>Provision of adequate amenities</li>
</ul>

<h2>Managing HMO Compliance</h2>
<p>HMO management is complex. Elite Tenancy's dedicated HMO management service handles licensing applications, compliance documentation, and ongoing management so you can focus on the returns. <a href="/for-landlords">Learn more.</a></p>
    `.trim(),
  },

  {
    slug: "average-rent-uk-2026-city-price-guide",
    title: "Average Rent UK 2026: City-by-City Price Guide",
    excerpt:
      "The latest average rental prices across UK cities in 2026 — from London and Manchester to Birmingham, Leeds, and Bristol. Data-driven guide for tenants and landlords.",
    category: "Rental Market",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 5,
    tags: ["Average Rent", "UK Rent 2026", "Rental Prices", "London", "Manchester"],
    publishedAt: new Date("2026-02-01"),
    imageUrl: null,
    content: `
<h2>UK Rental Market Overview 2026</h2>
<p>The UK rental market has continued to experience strong demand and rising prices into 2026, driven by the ongoing housing supply shortfall, higher mortgage rates keeping would-be buyers renting for longer, and growing urban populations. Here is a comprehensive, up-to-date breakdown of average rents by city.</p>

<h2>London — Average Rent 2026</h2>
<p>London remains by far the most expensive rental market in the UK:</p>
<ul>
  <li><strong>One-bedroom flat:</strong> £1,900 – £2,400 pcm (inner London)</li>
  <li><strong>One-bedroom flat:</strong> £1,400 – £1,800 pcm (outer London)</li>
  <li><strong>Two-bedroom flat:</strong> £2,500 – £3,500 pcm (inner London)</li>
  <li><strong>Studio:</strong> £1,200 – £1,700 pcm</li>
  <li><strong>Room in a shared house:</strong> £850 – £1,300 pcm</li>
</ul>
<p>Zones 1–2 command the highest premiums, with Kensington, Chelsea, and the City typically 30–50% above the London average.</p>

<h2>Manchester — Average Rent 2026</h2>
<p>Manchester has seen significant rent growth, particularly in the city centre:</p>
<ul>
  <li><strong>One-bedroom apartment (city centre):</strong> £1,100 – £1,500 pcm</li>
  <li><strong>One-bedroom apartment (suburbs):</strong> £750 – £1,000 pcm</li>
  <li><strong>Two-bedroom apartment (city centre):</strong> £1,400 – £1,900 pcm</li>
  <li><strong>Room in a shared house:</strong> £550 – £800 pcm</li>
</ul>
<p>Salford Quays and the Northern Quarter attract the highest premiums. Wythenshawe and Stockport offer the best value within Greater Manchester.</p>

<h2>Birmingham — Average Rent 2026</h2>
<ul>
  <li><strong>One-bedroom flat (city centre):</strong> £950 – £1,250 pcm</li>
  <li><strong>One-bedroom flat (suburbs):</strong> £700 – £900 pcm</li>
  <li><strong>Two-bedroom flat:</strong> £1,100 – £1,500 pcm</li>
  <li><strong>Room in a shared house:</strong> £500 – £700 pcm</li>
</ul>
<p>Digbeth and the Jewellery Quarter are Birmingham's most sought-after rental areas. Erdington and Handsworth offer more affordable options.</p>

<h2>Leeds — Average Rent 2026</h2>
<ul>
  <li><strong>One-bedroom flat (city centre):</strong> £900 – £1,150 pcm</li>
  <li><strong>One-bedroom flat (suburbs):</strong> £650 – £850 pcm</li>
  <li><strong>Two-bedroom flat:</strong> £1,000 – £1,350 pcm</li>
  <li><strong>Room in a shared house:</strong> £450 – £650 pcm</li>
</ul>

<h2>Bristol — Average Rent 2026</h2>
<ul>
  <li><strong>One-bedroom flat:</strong> £1,000 – £1,350 pcm</li>
  <li><strong>Two-bedroom flat:</strong> £1,250 – £1,700 pcm</li>
  <li><strong>Room in a shared house:</strong> £600 – £850 pcm</li>
</ul>
<p>Bristol has seen some of the fastest rent growth of any UK city outside London, driven by a tech sector boom and limited housing supply.</p>

<h2>Liverpool, Sheffield, and Other Cities</h2>
<ul>
  <li><strong>Liverpool one-bedroom:</strong> £700 – £950 pcm</li>
  <li><strong>Sheffield one-bedroom:</strong> £700 – £900 pcm</li>
  <li><strong>Edinburgh one-bedroom:</strong> £1,000 – £1,350 pcm</li>
  <li><strong>Cardiff one-bedroom:</strong> £850 – £1,100 pcm</li>
  <li><strong>Glasgow one-bedroom:</strong> £850 – £1,100 pcm</li>
</ul>

<h2>What's Driving Rent Increases in 2026?</h2>
<p>Several factors are keeping rents elevated across the UK:</p>
<ol>
  <li><strong>Landlord exit:</strong> Stricter regulation under the Renters' Rights Act and higher mortgage costs have prompted some landlords to sell, tightening supply</li>
  <li><strong>Demand growth:</strong> Net migration, population growth, and delayed homeownership are all driving rental demand</li>
  <li><strong>Build-to-rent expansion:</strong> Professional PRS landlords are expanding, but not yet at the scale needed to balance demand</li>
  <li><strong>Student accommodation shortage:</strong> University cities are under particular pressure as PBSA supply lags demand</li>
</ol>

<h2>Finding Affordable Premium Rentals</h2>
<p>Elite Tenancy's platform matches tenants with quality rental properties across the UK — with transparent pricing, verified landlords, and AI-powered search. <a href="/listings">Browse available properties.</a></p>
    `.trim(),
  },

  {
    slug: "letting-agent-fees-uk-2026-landlord-guide",
    title: "How Much Do Letting Agents Charge in 2026?",
    excerpt:
      "A transparent breakdown of letting agent fees in the UK for 2026 — tenant-find only, rent collection, and fully managed. What you actually get for your money.",
    category: "Landlord Guides",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 5,
    tags: ["Letting Agent Fees", "Property Management", "Landlord Costs", "2026"],
    publishedAt: new Date("2026-01-25"),
    imageUrl: null,
    content: `
<h2>Three Types of Letting Agent Service</h2>
<p>Most letting agents in the UK offer three tiers of service. Understanding exactly what each includes — and what it costs — is essential before signing up.</p>

<h3>1. Tenant-Find Only</h3>
<p>The agent markets your property, finds and references a tenant, and draws up the tenancy agreement. You then manage the tenancy yourself from move-in day.</p>
<p><strong>Typical cost:</strong> 8–12% of the first year's rent, or one to two weeks' rent as a flat fee.</p>
<p><strong>Best for:</strong> Experienced landlords who want to handle day-to-day management themselves and reduce ongoing costs.</p>

<h3>2. Rent Collection</h3>
<p>Includes everything in tenant-find plus monthly rent collection and chasing arrears. The landlord still handles maintenance and inspections.</p>
<p><strong>Typical cost:</strong> 10–15% of monthly rent (ongoing).</p>
<p><strong>Best for:</strong> Landlords who are comfortable dealing with maintenance but want the security of professional rent collection.</p>

<h3>3. Fully Managed</h3>
<p>The agent handles everything — marketing, tenant referencing, rent collection, maintenance coordination, inspections, legal compliance, and eviction if needed. Ideal for hands-off landlords or those with multiple properties.</p>
<p><strong>Typical cost:</strong> 14–20% of monthly rent (ongoing), plus setup fees.</p>
<p><strong>Best for:</strong> Busy landlords, those living far from their property, or those with limited experience.</p>

<h2>Additional Fees to Watch For</h2>
<p>Beyond the headline percentage, many agents charge additional fees that can significantly increase your total costs:</p>
<ul>
  <li><strong>Tenancy setup / admin fee:</strong> £150 – £400</li>
  <li><strong>Inventory preparation:</strong> £100 – £300</li>
  <li><strong>Deposit registration:</strong> £30 – £100</li>
  <li><strong>Renewal fee:</strong> £50 – £200 per renewal</li>
  <li><strong>Void period management:</strong> Sometimes charged even when the property is empty</li>
  <li><strong>Maintenance markup:</strong> 10–15% added to contractor invoices</li>
  <li><strong>Eviction management:</strong> £300 – £1,000 per case</li>
</ul>
<p>Always ask for a full fee schedule before signing with any agent. The Tenant Fees Act 2019 restricts what agents can charge tenants, but agent-to-landlord fees are not capped.</p>

<h2>High Street Agents vs Online Agents</h2>
<p>The rise of online and hybrid letting agents has created more choice for landlords:</p>
<ul>
  <li><strong>High street agents:</strong> Typically more expensive (14–20% managed), but offer local knowledge, physical office presence, and established maintenance networks</li>
  <li><strong>Online agents:</strong> Often charge flat fees (£300–£800 for tenant-find), much lower cost but typically less personal service</li>
  <li><strong>Hybrid agents:</strong> Combine online efficiency with some local agent support — typically 8–12% managed</li>
</ul>

<h2>What Does a 15% Fee Actually Cost?</h2>
<p>On a £1,200 pcm property, a 15% fully managed fee costs £180 per month — £2,160 per year. Over a five-year tenancy, that's £10,800 in management fees alone. Understanding this helps you evaluate whether the service justifies the cost.</p>

<h2>The Elite Tenancy Difference</h2>
<p>Elite Tenancy charges a transparent, competitive fee with no hidden extras. Our completion-only model means you only pay when we successfully let your property — no upfront fees, no void period charges. <a href="/pricing">See our pricing.</a></p>
    `.trim(),
  },

  {
    slug: "no-dss-illegal-2026-benefits-tenants-landlord-guide",
    title: "'No DSS' Is Now Illegal: What Landlords Must Know",
    excerpt:
      "Refusing to rent to housing benefit claimants ('No DSS') is now unlawful discrimination. Here's what landlords must know — and how to protect yourself legally.",
    category: "Landlord Guides",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 5,
    tags: ["No DSS", "Housing Benefit", "Discrimination", "Landlord Guide", "2026"],
    publishedAt: new Date("2026-01-20"),
    imageUrl: null,
    content: `
<h2>What Does 'No DSS' Mean?</h2>
<p>"No DSS" (named after the old Department of Social Security) is the practice of refusing to rent to tenants who receive housing benefit or Universal Credit housing costs. For decades this was widespread — advertised openly in property listings and enforced by landlords and letting agents alike.</p>
<p>That has now changed. A series of court judgments and the introduction of the Equality Act provisions have made blanket "No DSS" policies unlawful in England and Wales.</p>

<h2>Why Is 'No DSS' Illegal?</h2>
<p>The key legal change came from court decisions applying the <strong>Equality Act 2010</strong>. While being a benefit recipient is not a protected characteristic directly, refusing to rent to those on benefits disproportionately affects people who are disabled (many of whom claim disability-related benefits) and women (who make up the majority of single parents on housing benefit).</p>
<p>This constitutes <strong>indirect discrimination</strong> under the Equality Act — which is unlawful unless the landlord can objectively justify it. A blanket "no benefits" policy cannot be objectively justified.</p>
<p>Key court rulings:</p>
<ul>
  <li><strong>Shelter v Grainger (2021):</strong> Confirmed that blanket DSS bans amount to indirect discrimination</li>
  <li><strong>Various County Court judgments 2022–2024:</strong> Awarded damages to tenants refused on DSS grounds</li>
</ul>

<h2>What Landlords Can and Cannot Do</h2>
<p><strong>You CANNOT:</strong></p>
<ul>
  <li>Advertise properties with "No DSS", "No Housing Benefit", or "Working tenants only"</li>
  <li>Refuse a viewing or application solely because a tenant receives benefits</li>
  <li>Set a blanket policy excluding all benefit recipients</li>
  <li>Instruct an agent to refuse benefit claimants</li>
</ul>
<p><strong>You CAN:</strong></p>
<ul>
  <li>Apply the same affordability criteria to all applicants (e.g. monthly income must be 2.5× monthly rent)</li>
  <li>Require referencing and credit checks for all applicants</li>
  <li>Decline a specific applicant based on objective referencing results — not their benefit status</li>
  <li>Request a guarantor if the applicant's income from employment doesn't meet affordability requirements</li>
</ul>

<h2>The Role of Mortgage and Insurance Conditions</h2>
<p>Many landlords point to mortgage or insurance conditions that previously prohibited DSS tenants. This defence has been weakened significantly — lenders and insurers largely removed these restrictions following the legal changes, and the courts do not accept such conditions as sufficient justification for discrimination.</p>
<p>If your mortgage or insurance still contains such a condition, contact your lender or insurer — most will amend the terms on request.</p>

<h2>Practical Steps for Landlords</h2>
<ol>
  <li><strong>Remove any DSS exclusion language</strong> from all your property listings immediately</li>
  <li><strong>Instruct your agent</strong> to apply the same criteria to all applicants</li>
  <li><strong>Apply income-neutral referencing</strong> — accept Universal Credit statements and housing benefit award letters as proof of income</li>
  <li><strong>Review your mortgage and insurance</strong> conditions and update if needed</li>
  <li><strong>Train anyone acting on your behalf</strong> — you can be held liable for your agent's discriminatory practices</li>
</ol>

<h2>Benefits of Renting to Housing Benefit Tenants</h2>
<p>Many landlords who have opened their properties to benefit claimants report positive outcomes:</p>
<ul>
  <li>Direct payment to landlord available via Universal Credit managed payments in cases of vulnerability</li>
  <li>Local Housing Allowance (LHA) provides predictable income</li>
  <li>Often long tenancies — benefit claimants tend to move less frequently</li>
</ul>
<p>Elite Tenancy works with landlords to find quality tenants across all income types. Our referencing process assesses affordability fairly for all applicants. <a href="/for-landlords">Learn more.</a></p>
    `.trim(),
  },

  {
    slug: "assured-periodic-tenancy-explained",
    title: "Assured Periodic Tenancy Explained: What Landlords and Tenants Need to Know",
    excerpt:
      "With fixed-term tenancies now abolished, all new tenancies in England are periodic. Here's exactly how assured periodic tenancies work in 2026.",
    category: "Legal Guides",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 5,
    tags: ["Periodic Tenancy", "AST", "Tenancy Law", "Renters Rights Act", "2026"],
    publishedAt: new Date("2026-02-05"),
    imageUrl: null,
    content: `
<h2>What Is an Assured Periodic Tenancy?</h2>
<p>An assured periodic tenancy (APT) is a tenancy that runs for successive periods — typically month-by-month — with no fixed end date. Unlike a fixed-term tenancy (which runs for a set period, e.g. 12 months), a periodic tenancy continues indefinitely until either the landlord or tenant gives valid notice to end it.</p>
<p>Following the Renters' Rights Act 2026, <strong>all new tenancies in England are now periodic tenancies</strong>. Fixed-term assured shorthold tenancies can no longer be granted for residential properties.</p>

<h2>How Does a Periodic Tenancy Work?</h2>
<p>A periodic tenancy has a "period" — the frequency with which rent is due. In most cases this is monthly, meaning:</p>
<ul>
  <li>Rent is due on the same date each month (or whichever day is agreed)</li>
  <li>The tenancy automatically renews each month unless notice is given</li>
  <li>There is no guaranteed minimum term for either party (subject to notice period rules)</li>
</ul>

<h2>Notice Periods Under Assured Periodic Tenancies</h2>
<h3>Tenant's Notice to Leave</h3>
<p>Tenants must give <strong>at least two months' written notice</strong> to end a periodic tenancy. This notice must expire on the last day of a rental period (e.g. the day before rent is next due). Tenants can give notice at any time — even from the first day of the tenancy.</p>

<h3>Landlord's Notice to End the Tenancy</h3>
<p>Landlords can no longer issue Section 21 notices. To end a periodic tenancy, landlords must use <strong>Section 8 possession grounds</strong> (see our Section 21 abolished guide for details). The most common grounds and notice periods are:</p>
<ul>
  <li><strong>Rent arrears (Ground 8):</strong> 4 weeks' notice</li>
  <li><strong>Selling the property (Ground 1A):</strong> 4 months' notice</li>
  <li><strong>Moving in (Ground 1B):</strong> 4 months' notice</li>
  <li><strong>Breach of tenancy (Ground 12):</strong> 2 months' notice</li>
</ul>

<h2>Rent Increases in a Periodic Tenancy</h2>
<p>In a periodic tenancy, rent can only be increased <strong>once per year</strong> using a formal <strong>Section 13 notice</strong>. The landlord must:</p>
<ol>
  <li>Give at least two months' written notice of the proposed increase</li>
  <li>Use the prescribed Section 13 notice form</li>
  <li>Propose a rent that reflects current market rates</li>
</ol>
<p>Tenants can challenge a proposed rent increase at the First-tier Tribunal (Property Chamber) if they believe it exceeds market rate. The Tribunal will set a fair market rent.</p>

<h2>Can Landlords Still Offer Fixed-Term Tenancies?</h2>
<p>No — since the Renters' Rights Act took effect, new assured shorthold tenancies with a fixed term cannot be granted in England. All new residential tenancies for assured tenancies must be periodic.</p>
<p>Some limited exceptions exist: holiday lets (not assured tenancies) and purpose-built student accommodation operated by universities are not covered by these rules.</p>

<h2>Transition for Existing Fixed-Term Tenancies</h2>
<p>Tenancies that were already fixed-term when the Act commenced will transition to periodic tenancies when their fixed term expires. There is a transition period during which existing Section 21 notices may still be acted upon.</p>

<h2>Benefits of Periodic Tenancies</h2>
<p><strong>For tenants:</strong> Greater flexibility to leave with two months' notice, no risk of tenancy ending arbitrarily at the end of a fixed term, and stronger security of tenure overall.</p>
<p><strong>For landlords:</strong> Ongoing tenancies without the admin burden of renewals, and the ability to rely on Section 8 grounds when genuinely needed.</p>

<h2>Managing Periodic Tenancies Professionally</h2>
<p>Elite Tenancy's managed service handles all aspects of periodic tenancy management — from compliant tenancy agreements to Section 13 rent review notices and Section 8 possession when needed. <a href="/for-landlords">Learn more.</a></p>
    `.trim(),
  },

  {
    slug: "section-21-abolished-what-it-means-for-tenants",
    title: "Section 21 Abolished: What It Means for Tenants",
    excerpt:
      "Section 21 no-fault evictions are gone. As a tenant in England, you now have much stronger security of tenure. Here's what the abolition means for you.",
    category: "Tenant Guides",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 5,
    tags: ["Section 21", "Tenant Rights", "Renters Rights Act", "Security of Tenure", "2026"],
    publishedAt: new Date("2026-01-15"),
    imageUrl: null,
    content: `
<h2>Section 21 Is Abolished — What Does That Actually Mean?</h2>
<p>For years, Section 21 notices were a constant source of anxiety for private renters. A landlord could issue one at any time after the initial fixed term expired, giving you just two months to find a new home — without having to give any reason. This is now gone.</p>
<p>Under the Renters' Rights Act 2026, Section 21 "no-fault" evictions are abolished for all residential tenancies in England. Your landlord can no longer end your tenancy without a valid legal reason.</p>

<h2>Why Did Tenants Fear Section 21?</h2>
<p>Section 21 was widely used — not just when landlords wanted to sell or move in, but as a blunt instrument to remove tenants who complained about disrepair, or who the landlord simply wanted rid of without explanation. It was the leading cause of family homelessness in England.</p>
<p>Tenants often received a Section 21 notice after asking for repairs, after joining a tenants' union, or simply because the landlord wanted to re-let at a higher rent. The new law addresses all of these situations.</p>

<h2>What Can Your Landlord Do Instead?</h2>
<p>Your landlord can now only end your tenancy through a <strong>Section 8 possession claim</strong> using specific legal grounds. The most relevant for tenants to know:</p>
<ul>
  <li><strong>Rent arrears (Ground 8):</strong> If you are two months or more behind on rent, your landlord can apply to court</li>
  <li><strong>Selling the property (Ground 1A):</strong> Your landlord can ask you to leave if they intend to sell — but must give four months' notice and cannot do so in the first 12 months</li>
  <li><strong>Moving in (Ground 1B):</strong> If your landlord or a close family member wants to move into the property — again, four months' notice, not in the first 12 months</li>
  <li><strong>Anti-social behaviour (Ground 14):</strong> Serious nuisance or criminal behaviour</li>
</ul>

<h2>Your New Rights as a Tenant</h2>
<p>Beyond Section 21 abolition, the Renters' Rights Act gives tenants several other important rights:</p>
<ul>
  <li><strong>Two months' notice to leave:</strong> You can give just two months' written notice to end your tenancy at any time — no need to wait for a fixed term to expire</li>
  <li><strong>Protection from retaliatory eviction:</strong> If you complain about repairs or contact the council, your landlord cannot use this as grounds to remove you</li>
  <li><strong>Right to keep pets:</strong> Landlords cannot unreasonably refuse your request to keep a pet</li>
  <li><strong>Annual rent increase cap:</strong> Rent can only be increased once per year, and you have the right to challenge any increase you think is above market rate at a tribunal</li>
  <li><strong>Awaab's Law:</strong> Landlords must investigate hazards like damp and mould within 14 days and fix emergency issues within 24 hours</li>
</ul>

<h2>What to Do If You Receive an Eviction Notice</h2>
<p>If your landlord tries to evict you:</p>
<ol>
  <li><strong>Check the notice type:</strong> A Section 21 notice is now invalid. If you receive one, you do not have to leave and can ignore it</li>
  <li><strong>Check Section 8 grounds:</strong> Even a Section 8 notice must specify valid legal grounds — and use the correct notice period</li>
  <li><strong>Get advice:</strong> Contact Shelter, Citizens Advice, or a housing solicitor immediately</li>
  <li><strong>Do not leave voluntarily</strong> unless you choose to — your landlord must go to court to evict you</li>
</ol>

<h2>Finding Secure, Quality Rental Homes</h2>
<p>Elite Tenancy lists only quality, verified properties from reputable landlords. We ensure all properties on our platform comply with the latest legislation. <a href="/listings">Browse available homes.</a></p>
    `.trim(),
  },

  {
    slug: "average-rent-birmingham-2026",
    title: "Average Rent Birmingham 2026: Neighbourhood-by-Neighbourhood Guide",
    excerpt:
      "Current average rent prices in Birmingham for 2026, broken down by area — from the city centre and Digbeth to Harborne, Moseley, and beyond.",
    category: "Rental Market",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 4,
    tags: ["Birmingham Rent", "Average Rent", "Birmingham 2026", "UK Property"],
    publishedAt: new Date("2026-02-10"),
    imageUrl: null,
    content: `
<h2>Birmingham Rental Market 2026</h2>
<p>Birmingham is the UK's second largest city and one of its fastest-growing rental markets. Significant investment around the HS2 terminus at Curzon Street, ongoing regeneration of Digbeth, and a booming young professional population have kept demand strong — and rents rising.</p>
<p>Here is a comprehensive breakdown of average rents across Birmingham's key areas in 2026.</p>

<h2>City Centre and Jewellery Quarter</h2>
<ul>
  <li><strong>Studio:</strong> £750 – £950 pcm</li>
  <li><strong>1-bedroom apartment:</strong> £950 – £1,250 pcm</li>
  <li><strong>2-bedroom apartment:</strong> £1,200 – £1,600 pcm</li>
  <li><strong>3-bedroom apartment:</strong> £1,500 – £2,000 pcm</li>
</ul>
<p>The Jewellery Quarter and Brindleyplace are premium locations with converted warehouse apartments and modern build-to-rent schemes commanding the top of the market.</p>

<h2>Digbeth</h2>
<ul>
  <li><strong>1-bedroom apartment:</strong> £900 – £1,150 pcm</li>
  <li><strong>2-bedroom apartment:</strong> £1,100 – £1,450 pcm</li>
</ul>
<p>Digbeth is Birmingham's most talked-about area — creative industries, independent food and drink, and major regeneration driven by HS2 proximity. Rents have risen sharply and are expected to continue climbing.</p>

<h2>Edgbaston and Harborne</h2>
<ul>
  <li><strong>1-bedroom flat:</strong> £850 – £1,100 pcm</li>
  <li><strong>2-bedroom flat:</strong> £1,000 – £1,350 pcm</li>
  <li><strong>3-bedroom house:</strong> £1,300 – £1,700 pcm</li>
</ul>
<p>Edgbaston and Harborne are traditional premium residential areas, popular with medical professionals (close to the QE Hospital) and families. Excellent schools and green space command a premium.</p>

<h2>Moseley and Kings Heath</h2>
<ul>
  <li><strong>1-bedroom flat:</strong> £800 – £1,000 pcm</li>
  <li><strong>2-bedroom flat:</strong> £950 – £1,250 pcm</li>
  <li><strong>Room in a shared house:</strong> £500 – £650 pcm</li>
</ul>
<p>Moseley is Birmingham's bohemian neighbourhood — independent shops, cafes, and a village feel within easy reach of the city centre. Popular with young professionals and creatives.</p>

<h2>Selly Oak and Bournville</h2>
<ul>
  <li><strong>1-bedroom flat:</strong> £700 – £900 pcm</li>
  <li><strong>Room in a shared house:</strong> £400 – £580 pcm</li>
</ul>
<p>Selly Oak is dominated by the University of Birmingham student market. Bournville — Cadbury's model village — is quieter and more suburban, popular with families.</p>

<h2>Erdington and Handsworth</h2>
<ul>
  <li><strong>1-bedroom flat:</strong> £600 – £800 pcm</li>
  <li><strong>2-bedroom house:</strong> £750 – £950 pcm</li>
</ul>
<p>North Birmingham offers the city's most affordable rental prices. Good transport links via the Cross-City line make these areas practical for commuters on a budget.</p>

<h2>Is Birmingham a Good Place to Rent in 2026?</h2>
<p>Birmingham offers strong value compared to London and significantly better affordability than Bristol or Edinburgh. For professionals relocating from London, Birmingham typically offers 30–40% lower rents with comparable quality of life.</p>
<p>Browse Elite Tenancy's Birmingham listings to find quality rental properties verified by our team. <a href="/birmingham">See Birmingham properties.</a></p>
    `.trim(),
  },

  {
    slug: "average-rent-manchester-2026-area-guide",
    title: "Average Rent Manchester 2026: Area-by-Area Guide",
    excerpt:
      "Complete guide to rental prices in Manchester for 2026 — city centre, Salford Quays, Didsbury, Chorlton and beyond. Find the best area for your budget.",
    category: "Rental Market",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 4,
    tags: ["Manchester Rent", "Average Rent", "Manchester 2026", "UK Property"],
    publishedAt: new Date("2026-02-12"),
    imageUrl: null,
    content: `
<h2>Manchester Rental Market 2026</h2>
<p>Manchester has consistently ranked among the UK's strongest rental markets outside London, driven by a thriving economy, major investment in tech and creative industries, and two of the UK's largest universities. Rents have risen significantly over the past five years, though Manchester still offers far better value than London.</p>

<h2>Manchester City Centre (M1, M2, M3)</h2>
<ul>
  <li><strong>Studio:</strong> £850 – £1,100 pcm</li>
  <li><strong>1-bedroom apartment:</strong> £1,100 – £1,500 pcm</li>
  <li><strong>2-bedroom apartment:</strong> £1,400 – £1,900 pcm</li>
  <li><strong>3-bedroom apartment:</strong> £1,800 – £2,500 pcm</li>
</ul>
<p>The city centre — particularly the Deansgate, Spinningfields, and Northern Quarter areas — commands the highest premiums. Purpose-built rental towers and luxury apartments have driven prices up substantially in recent years.</p>

<h2>Salford Quays and MediaCityUK</h2>
<ul>
  <li><strong>1-bedroom apartment:</strong> £1,000 – £1,350 pcm</li>
  <li><strong>2-bedroom apartment:</strong> £1,250 – £1,700 pcm</li>
</ul>
<p>Salford Quays and MediaCityUK have been transformed into a premium waterfront residential destination. Home to the BBC, ITV, and hundreds of media and tech companies, the area attracts high-earning professionals willing to pay a premium for modern waterfront living.</p>

<h2>Ancoats and New Islington</h2>
<ul>
  <li><strong>1-bedroom apartment:</strong> £1,050 – £1,400 pcm</li>
  <li><strong>2-bedroom apartment:</strong> £1,350 – £1,750 pcm</li>
</ul>
<p>Ancoats is Manchester's most fashionable neighbourhood — award-winning restaurants, independent coffee shops, and high-quality modern apartments. One of the city's most sought-after places to live for young professionals.</p>

<h2>Didsbury</h2>
<ul>
  <li><strong>1-bedroom flat:</strong> £900 – £1,200 pcm</li>
  <li><strong>2-bedroom flat:</strong> £1,100 – £1,500 pcm</li>
  <li><strong>3-bedroom house:</strong> £1,400 – £1,900 pcm</li>
</ul>
<p>Didsbury is South Manchester's premium residential village — tree-lined streets, Victorian semis, independent restaurants and boutiques. Popular with families, professionals, and those who want a quieter life within commuting distance of the city.</p>

<h2>Chorlton and Whalley Range</h2>
<ul>
  <li><strong>1-bedroom flat:</strong> £850 – £1,100 pcm</li>
  <li><strong>2-bedroom flat:</strong> £1,050 – £1,350 pcm</li>
  <li><strong>Room in a shared house:</strong> £550 – £750 pcm</li>
</ul>
<p>Chorlton is Manchester's alternative heart — organic cafes, independent cinemas, and a strong community feel. Very popular with creatives, teachers, and young families seeking an affordable premium lifestyle.</p>

<h2>Withington and Fallowfield</h2>
<ul>
  <li><strong>1-bedroom flat:</strong> £700 – £950 pcm</li>
  <li><strong>Room in a shared house:</strong> £450 – £650 pcm</li>
</ul>
<p>These areas are dominated by the student rental market but are also popular with young professionals seeking affordable rents close to the city. Good Metrolink and bus links.</p>

<h2>Stockport and Salford (Outer)</h2>
<ul>
  <li><strong>1-bedroom flat:</strong> £650 – £850 pcm</li>
  <li><strong>2-bedroom house:</strong> £800 – £1,050 pcm</li>
</ul>
<p>For the most affordable options within Greater Manchester, outer Salford and Stockport offer good value with excellent transport links into the city.</p>

<h2>Browse Manchester Rentals</h2>
<p>Elite Tenancy lists quality, verified rental properties across Manchester and Greater Manchester. <a href="/manchester">See available Manchester properties.</a></p>
    `.trim(),
  },

  {
    slug: "can-landlord-refuse-pets-2026-uk",
    title: "Can a Landlord Refuse Pets? UK Law 2026 Explained",
    excerpt:
      "The Renters' Rights Act 2026 gives tenants the right to request pets in rented properties. Can landlords still refuse? Here's exactly what the law now says.",
    category: "Tenant Guides",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 4,
    tags: ["Pets in Rented Properties", "Tenant Rights", "Renters Rights Act", "2026", "UK Law"],
    publishedAt: new Date("2026-02-15"),
    imageUrl: null,
    content: `
<h2>The New Law on Pets in Rented Properties</h2>
<p>The Renters' Rights Act 2026 fundamentally changed tenants' rights regarding pets. Previously, landlords could include a blanket "no pets" clause in any tenancy agreement and refuse any pet request with no explanation. That has changed.</p>
<p>Under the new law, <strong>landlords cannot unreasonably refuse a tenant's written request to keep a pet</strong> in their home. A "no pets under any circumstances" policy is no longer legally enforceable.</p>

<h2>How Does the Pet Request Process Work?</h2>
<p>The process is straightforward:</p>
<ol>
  <li><strong>Tenant makes a written request</strong> to keep a pet at the property</li>
  <li><strong>Landlord has 28 days</strong> to respond in writing</li>
  <li>The landlord can <strong>grant the request</strong>, <strong>refuse with valid reasons</strong>, or <strong>agree conditionally</strong> (e.g. requiring pet insurance)</li>
  <li>If the landlord refuses, they must provide written reasons</li>
  <li>If the tenant believes the refusal is unreasonable, they can challenge it through the First-tier Tribunal</li>
</ol>

<h2>What Are Valid Reasons for Refusing a Pet?</h2>
<p>Landlords CAN reasonably refuse a pet request in certain circumstances:</p>
<ul>
  <li>The property is a small flat and the pet would be unsuitable (e.g. a large dog in a studio)</li>
  <li>There are deed restrictions or freeholder restrictions on pets</li>
  <li>The building's terms of service prohibit certain animals</li>
  <li>There is a genuine risk of significant damage beyond what insurance can cover</li>
  <li>The pet poses a health and safety risk to other occupants or neighbours</li>
</ul>
<p>A landlord CANNOT refuse simply because they prefer no pets, or because of a blanket policy.</p>

<h2>Can Landlords Require Pet Insurance?</h2>
<p>Yes. One of the most important provisions for landlords is that they CAN require tenants to obtain and maintain adequate <strong>pet damage insurance</strong> as a condition of keeping a pet. This provides protection for the landlord without requiring a larger deposit (deposit caps still apply under the Tenant Fees Act).</p>

<h2>What About the Deposit Cap?</h2>
<p>Deposit caps remain unchanged — landlords cannot require a larger deposit specifically because of a pet. The cap is five weeks' rent for most properties. This is why the pet insurance requirement was included in the legislation as an alternative protection mechanism for landlords.</p>

<h2>Existing "No Pets" Clauses in Tenancy Agreements</h2>
<p>If your current tenancy agreement has a blanket "no pets" clause, it may not be automatically void — but the landlord cannot enforce it in a way that amounts to an unreasonable refusal. If you make a formal written request to keep a pet, your landlord must consider it on its merits, not simply point to the clause.</p>

<h2>Tips for Tenants Requesting a Pet</h2>
<ul>
  <li>Make the request in writing (email is fine)</li>
  <li>Describe the pet — breed, size, age, whether it's neutered</li>
  <li>Offer to provide a reference from a previous landlord confirming no damage</li>
  <li>Offer to obtain pet damage insurance</li>
  <li>Be specific about how you'll care for the pet and prevent damage</li>
</ul>
<p>Elite Tenancy lists pet-friendly properties from verified landlords across the UK. <a href="/listings">Find pet-friendly rentals.</a></p>
    `.trim(),
  },

  {
    slug: "rent-in-advance-legal-2026-uk",
    title: "Is Asking for Rent in Advance Legal? UK 2026 Guide",
    excerpt:
      "Can landlords still ask for several months' rent in advance in the UK? Here's what the 2026 law says about rent in advance, deposits, and what tenants can do.",
    category: "Legal Guides",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 4,
    tags: ["Rent in Advance", "Deposit", "Tenant Rights", "UK Law", "2026"],
    publishedAt: new Date("2026-02-18"),
    imageUrl: null,
    content: `
<h2>Is Rent in Advance Legal in the UK?</h2>
<p>Yes — <strong>asking for rent in advance is legal in the UK</strong>, but with important restrictions introduced by the Renters' Rights Act 2026. Landlords cannot request more than one month's rent in advance at the start of a tenancy.</p>

<h2>The New Rent in Advance Cap</h2>
<p>Under the Renters' Rights Act 2026, landlords in England are now prohibited from requesting more than <strong>one month's rent in advance</strong> at the start of a tenancy. This is a significant change from previous practice, where some landlords — particularly those letting to students, those with poor credit history, or overseas applicants — would request six or even twelve months' rent in advance.</p>
<p>This cap applies alongside the existing deposit cap of five weeks' rent under the Tenant Fees Act 2019. Together, the maximum a landlord can request upfront is now:</p>
<ul>
  <li><strong>One month's rent</strong> as the first month's rent (paid in advance, as normal)</li>
  <li><strong>Five weeks' rent</strong> as a tenancy deposit</li>
  <li><strong>Total maximum upfront cost:</strong> Approximately 2.25 months' rent equivalent</li>
</ul>

<h2>Why Was This Change Made?</h2>
<p>Large rent-in-advance requirements were being used as a workaround to the deposit cap — in effect requiring tenants to put up substantial sums of money that weren't protected in a deposit scheme. This was particularly discriminatory against:</p>
<ul>
  <li>International students and overseas workers without UK credit history</li>
  <li>Those on lower incomes who cannot save large lump sums</li>
  <li>People leaving rent-to-rent accommodation with no rental history</li>
</ul>

<h2>What If a Landlord Asks for More?</h2>
<p>If a landlord or letting agent asks for more than one month's rent in advance (plus the deposit), this is now a criminal offence under the Tenant Fees Act as amended. You should:</p>
<ol>
  <li>Refuse to pay the excess amount</li>
  <li>Report the request to your local Trading Standards office</li>
  <li>Report to the PRS Database (once operational)</li>
</ol>
<p>The penalty for landlords who request prohibited payments is a civil penalty of up to £5,000 for a first offence.</p>

<h2>What About Guarantors?</h2>
<p>The one-month advance cap does not prevent landlords from requiring a <strong>guarantor</strong> — a third party who agrees to pay rent if the tenant cannot. Guarantors are not subject to the same restrictions as deposits and advance rent. Landlords who are concerned about a tenant's financial position can still request a suitable guarantor as a condition of the tenancy.</p>

<h2>Tips for Tenants</h2>
<ul>
  <li>Always get a receipt for any advance rent paid</li>
  <li>Make sure any advance rent is clearly documented in the tenancy agreement as the first period's rent</li>
  <li>If asked for more than one month's advance, cite the Renters' Rights Act 2026 and refuse</li>
  <li>Check that your deposit is protected in a government-approved scheme within 30 days</li>
</ul>
<p>Elite Tenancy works with transparent landlords who comply with all legal requirements. <a href="/listings">Browse our listings.</a></p>
    `.trim(),
  },

  {
    slug: "ai-tenant-matching-how-it-works",
    title: "AI Tenant Matching: How It Works and Why It's Better",
    excerpt:
      "How AI-powered tenant matching works — and why it finds better, faster matches between tenants and landlords than traditional property search. Inside Elite Tenancy's matching system.",
    category: "Platform Guides",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 4,
    tags: ["AI Matching", "Tenant Matching", "Property Technology", "Proptech"],
    publishedAt: new Date("2026-03-01"),
    imageUrl: null,
    content: `
<h2>Why Traditional Property Search Falls Short</h2>
<p>Traditional property search — browsing listings on portals, filtering by price and bedrooms, then sending speculative enquiries — is slow, imprecise, and frustrating for both tenants and landlords. Tenants spend hours viewing unsuitable properties; landlords receive enquiries from applicants who don't meet their criteria.</p>
<p>AI tenant matching changes this entirely. Instead of searching, tenants tell the system what they need — and the AI finds and ranks properties that genuinely fit, taking into account far more factors than a simple filter can capture.</p>

<h2>How Elite Tenancy's AI Matching Works</h2>
<h3>Step 1: Build Your Renter Profile</h3>
<p>When you create a renter profile on Elite Tenancy, you tell us:</p>
<ul>
  <li>Your budget, preferred location(s), and move-in timeline</li>
  <li>Lifestyle preferences — whether you work from home, prefer quiet areas, have pets, etc.</li>
  <li>Non-negotiables (no ground floor, must have outdoor space, etc.)</li>
  <li>Employment status, income, and tenancy history</li>
</ul>

<h3>Step 2: AI Profile Analysis</h3>
<p>Our AI analyses your profile to understand not just your stated preferences but also your <em>implicit</em> priorities. Someone who says "near good transport links" and works in the city centre gets different recommendations than someone who says the same thing but works remotely.</p>

<h3>Step 3: Property Matching and Scoring</h3>
<p>The system compares your profile against every active listing and generates a <strong>match score</strong> for each property. This score takes into account:</p>
<ul>
  <li>Budget fit (including all costs, not just rent)</li>
  <li>Location match against your commute, schools, or other key destinations</li>
  <li>Property characteristics vs your stated and inferred preferences</li>
  <li>Landlord's tenant requirements vs your profile</li>
  <li>Availability timing</li>
</ul>

<h3>Step 4: Ranked Recommendations</h3>
<p>Instead of browsing 200 listings, you see the top 10–20 properties most likely to result in a successful tenancy — ranked by match quality. No more scrolling past unsuitable properties; just the ones that genuinely fit your needs.</p>

<h2>How It Benefits Landlords</h2>
<p>AI matching isn't just good for tenants. Landlords benefit too:</p>
<ul>
  <li><strong>Pre-qualified enquiries only:</strong> You only hear from tenants who genuinely fit your property and criteria</li>
  <li><strong>Faster lets:</strong> Properties let faster when the right tenants are matched quickly</li>
  <li><strong>Better tenancies:</strong> Well-matched tenants stay longer and take better care of properties</li>
  <li><strong>Reduced void periods:</strong> Proactive matching means your property reaches relevant tenants the moment it's listed</li>
</ul>

<h2>Privacy and Data</h2>
<p>Your renter profile data is used solely to match you with suitable properties and landlords. It is never sold to third parties. You control what information is shared and with whom.</p>

<h2>Try AI Matching Today</h2>
<p>Create your free renter profile and let our AI find your next home. <a href="/find-my-match">Get matched now — it takes 3 minutes.</a></p>
    `.trim(),
  },

  {
    slug: "buy-to-let-2026-worth-it",
    title: "Is Buy-to-Let Still Worth It in 2026?",
    excerpt:
      "Buy-to-let investment has faced significant headwinds from rising mortgage rates, tax changes, and new regulation. Is it still worth investing in UK property in 2026?",
    category: "Landlord Guides",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 5,
    tags: ["Buy to Let", "Property Investment", "Landlord", "UK Property", "2026"],
    publishedAt: new Date("2026-02-20"),
    imageUrl: null,
    content: `
<h2>The State of Buy-to-Let in 2026</h2>
<p>The past five years have been challenging for buy-to-let landlords. Rising mortgage rates, the gradual removal of mortgage interest tax relief (Section 24), stricter regulation under the Renters' Rights Act, and energy efficiency requirements have all squeezed margins. Many landlords — particularly those with highly leveraged portfolios — have sold up.</p>
<p>Yet strong rental demand, rising rents, and the prospect of long-term capital growth continue to attract investors. So is buy-to-let still worth it in 2026?</p>

<h2>The Numbers: Rental Yields in 2026</h2>
<p>Gross rental yields vary significantly by location and property type:</p>
<ul>
  <li><strong>London:</strong> 3–4.5% gross (low yield, but historically strong capital growth)</li>
  <li><strong>Manchester:</strong> 5–7% gross (the sweet spot for many investors)</li>
  <li><strong>Birmingham:</strong> 5–7% gross</li>
  <li><strong>Leeds:</strong> 5.5–7.5% gross</li>
  <li><strong>Liverpool:</strong> 6–8.5% gross (high yield, lower capital growth)</li>
  <li><strong>Bristol:</strong> 4.5–6% gross</li>
</ul>
<p>Net yields (after mortgage costs, management fees, maintenance, insurance, and voids) are typically 1–3 percentage points lower. At current mortgage rates (4.5–6% for buy-to-let), achieving positive cash flow requires careful selection of both property and location.</p>

<h2>The Tax Position in 2026</h2>
<p>The tax landscape for private landlords has become significantly less favourable since 2016:</p>
<ul>
  <li><strong>Mortgage interest relief:</strong> Fully restricted to a 20% tax credit (not deductible against rental income). Higher-rate taxpayers pay significantly more tax than before</li>
  <li><strong>3% SDLT surcharge:</strong> An additional 3 percentage points on any property purchase where you already own a property</li>
  <li><strong>Capital gains tax:</strong> 18% for basic rate taxpayers, 24% for higher rate (on residential property gains)</li>
  <li><strong>Section 24 impact:</strong> Many landlords have moved properties into limited companies to reclaim full mortgage interest deduction</li>
</ul>

<h2>Limited Company Buy-to-Let: Is It Worth It?</h2>
<p>Purchasing via a limited company allows full mortgage interest deduction, but introduces complexity:</p>
<ul>
  <li>Higher mortgage rates for company borrowing (typically 0.5–1% more)</li>
  <li>Corporation tax on company profits (25% for most landlords)</li>
  <li>Additional cost to extract profits via salary or dividends</li>
  <li>Legal and accountancy fees</li>
</ul>
<p>For landlords with larger portfolios (typically four or more properties) who do not need to extract all rental income, limited company ownership often makes financial sense. For those with one or two properties relying on rental income as salary, the sums are less clear.</p>

<h2>The Regulatory Cost</h2>
<p>New regulations under the Renters' Rights Act, HMO licensing, minimum EPC requirements (heading toward EPC C minimum), and potential future requirements add costs and complexity. Factoring these into yield calculations is essential.</p>

<h2>When Buy-to-Let Makes Sense in 2026</h2>
<p>Buy-to-let can still be a sound investment in 2026 if:</p>
<ul>
  <li>You purchase in a high-demand, high-yield city (Manchester, Leeds, Liverpool, Birmingham)</li>
  <li>You have at least 25–30% deposit to achieve viable yields at current mortgage rates</li>
  <li>You take a long-term view on capital growth</li>
  <li>You operate via a limited company (for portfolio investors)</li>
  <li>You use professional management to reduce voids and compliance risk</li>
</ul>

<h2>Expert Letting Management</h2>
<p>If you do invest in buy-to-let, professional management is more important than ever. Elite Tenancy's managed service handles compliance, tenant sourcing, and ongoing management to maximise your yield. <a href="/for-landlords">Learn more.</a></p>
    `.trim(),
  },

  {
    slug: "find-premium-rentals-london-2026",
    title: "How to Find Premium Rentals in London in 2026",
    excerpt:
      "Searching for a quality rental in London? Here's how to navigate London's competitive rental market in 2026, find premium properties, and secure them fast.",
    category: "Tenant Guides",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 4,
    tags: ["London Rentals", "Premium Property", "London 2026", "Tenant Tips"],
    publishedAt: new Date("2026-03-05"),
    imageUrl: null,
    content: `
<h2>London's Rental Market in 2026</h2>
<p>London's rental market is one of the most competitive in the world. Demand consistently outstrips supply — particularly at the premium end, where quality properties let within days of listing. Average rents in inner London now exceed £2,000 per month for a one-bedroom flat, and competition for the best properties remains fierce.</p>
<p>If you're looking for a premium rental in London, speed, preparation, and knowing where to look are everything.</p>

<h2>Where to Find Premium London Rentals</h2>
<p>Premium properties in London are concentrated in a handful of well-known areas, but each offers a different lifestyle:</p>
<ul>
  <li><strong>Kensington and Chelsea:</strong> The traditional prime market — grand period flats, mansion blocks, garden squares. The most expensive in London</li>
  <li><strong>Marylebone and Fitzrovia:</strong> Village-feel central London with excellent restaurants and independent shops. Popular with executives</li>
  <li><strong>Shoreditch and Hoxton (E1/E2):</strong> Tech and creative professionals, converted lofts and modern apartments</li>
  <li><strong>Canary Wharf and Docklands:</strong> Modern towers, excellent transport links, popular with finance sector workers</li>
  <li><strong>Richmond and Chiswick:</strong> Premium outer London — green spaces, excellent schools, riverside living</li>
  <li><strong>Battersea and Clapham:</strong> South London's premium spots, very popular with young professionals</li>
</ul>

<h2>How to Move Quickly in London's Rental Market</h2>
<p>In London, the best properties attract multiple applicants within 24–48 hours of listing. To compete:</p>
<ol>
  <li><strong>Get your references ready in advance</strong> — have your employer reference, proof of income (3 months' payslips), and previous landlord reference prepared before you even start viewing</li>
  <li><strong>Know your budget</strong> — lenders and landlords typically require income of 2.5–3× annual rent. Be clear on what you can prove</li>
  <li><strong>View quickly and decide quickly</strong> — don't take days to deliberate. If you like a property, offer the same day</li>
  <li><strong>Have your holding deposit ready</strong> — most landlords will expect a holding deposit (up to one week's rent) immediately on acceptance</li>
  <li><strong>Use a platform that gives you early access</strong> — many of the best properties never reach the major portals</li>
</ol>

<h2>What Makes a Premium London Rental?</h2>
<p>True premium properties in London typically feature:</p>
<ul>
  <li>High-quality fixtures — engineered hardwood floors, stone worktops, integrated appliances</li>
  <li>Outdoor space — a balcony, terrace, or access to a communal garden significantly increases value</li>
  <li>Concierge or building management</li>
  <li>On-site amenities (gym, residents' lounge) in newer build-to-rent developments</li>
  <li>High energy efficiency ratings — EPC B or A is increasingly desirable</li>
  <li>Dedicated parking or secure cycle storage</li>
</ul>

<h2>Avoiding London Rental Scams</h2>
<p>London's competitive market makes it fertile ground for rental fraud. Protect yourself:</p>
<ul>
  <li>Never pay a deposit without meeting the landlord or agent in person and viewing the property</li>
  <li>Verify the landlord owns the property via the Land Registry (£3 search at gov.uk)</li>
  <li>Use a reputable letting agent or platform with identity verification</li>
  <li>Never transfer money via bank transfer to someone you haven't met</li>
</ul>

<h2>Find Your Perfect London Rental</h2>
<p>Elite Tenancy lists verified premium rental properties across London with thorough landlord and property verification. All properties meet our quality standards before they're listed. <a href="/london">Browse London properties.</a></p>
    `.trim(),
  },

  {
    slug: "landlord-guide-letting-2026",
    title: "Complete Landlord Guide to Letting Your Property in 2026",
    excerpt:
      "A step-by-step guide for landlords letting a property in 2026 — compliance checklist, finding tenants, setting rent, and managing ongoing tenancies under new laws.",
    category: "Landlord Guides",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 5,
    tags: ["Landlord Guide", "How to Let", "Property Letting", "2026", "UK Landlord"],
    publishedAt: new Date("2026-01-22"),
    imageUrl: null,
    content: `
<h2>Before You Let: Essential Compliance Checklist 2026</h2>
<p>Before marketing your property, you must ensure all the following are in place:</p>

<h3>Legal Requirements</h3>
<ul>
  <li><strong>Gas Safety Certificate:</strong> Annual inspection by Gas Safe registered engineer. Must be provided to tenant before move-in</li>
  <li><strong>Electrical Installation Condition Report (EICR):</strong> Required for all rented properties. Valid for 5 years</li>
  <li><strong>Energy Performance Certificate (EPC):</strong> Property must have minimum EPC rating of E (minimum C expected from 2028). Valid for 10 years</li>
  <li><strong>Smoke and Carbon Monoxide Alarms:</strong> Smoke alarm on every floor, CO alarm in every room with a solid fuel or gas appliance</li>
  <li><strong>Right to Rent checks:</strong> Must verify all tenants' right to rent in the UK before tenancy start</li>
  <li><strong>PRS Database registration:</strong> Register on the new Private Rented Sector Database (mandatory under the Renters' Rights Act)</li>
  <li><strong>Tenancy Deposit Protection:</strong> Register deposit in an approved scheme within 30 days</li>
  <li><strong>Prescribed information:</strong> Provide all required documents — EPC, gas safety, How to Rent guide, deposit protection certificate</li>
</ul>

<h3>Additional Checks</h3>
<ul>
  <li>Ensure property meets decent homes standard</li>
  <li>Confirm no category 1 or category 2 hazards (damp, electrical, structural issues)</li>
  <li>Check whether HMO licence is required</li>
</ul>

<h2>Setting the Right Rent</h2>
<p>Pricing your rental correctly from day one is critical. Too high and you'll extend your void period; too low and you lose income that's difficult to recover (rent increases are now limited to once per year).</p>
<p>To determine market rent:</p>
<ol>
  <li>Search comparable properties on Rightmove and Zoopla — filter by same area, similar size, similar condition</li>
  <li>Check recently let prices (not just asking prices)</li>
  <li>Ask local letting agents for a free valuation</li>
  <li>Factor in any premium features — parking, outdoor space, modern fixtures</li>
</ol>

<h2>Marketing Your Property</h2>
<p>To reach the maximum number of suitable tenants:</p>
<ul>
  <li><strong>Professional photos:</strong> Non-negotiable. Bad photos significantly reduce enquiries</li>
  <li><strong>Accurate floor plan:</strong> Increasingly expected by tenants</li>
  <li><strong>List on major portals:</strong> Rightmove and Zoopla reach the vast majority of active renters</li>
  <li><strong>List on specialist platforms:</strong> Elite Tenancy's AI matching connects you with pre-qualified, suitable tenants directly</li>
  <li><strong>Social media:</strong> Useful for local reach, particularly for HMOs and shared houses</li>
</ul>

<h2>Selecting the Right Tenant</h2>
<p>Under the new law, you cannot discriminate against tenants based on benefit status. You should apply consistent criteria to all applicants:</p>
<ul>
  <li><strong>Affordability:</strong> Income typically 2.5–3× annual rent</li>
  <li><strong>Credit check:</strong> Look for CCJs, IVAs, or bankruptcy</li>
  <li><strong>Employment verification:</strong> Employer letter or three months' payslips</li>
  <li><strong>Previous landlord reference:</strong> Confirms tenancy history and behaviour</li>
  <li><strong>Right to rent document check:</strong> Legal requirement before tenancy start</li>
</ul>

<h2>The Tenancy Agreement</h2>
<p>All new tenancies in England must now be periodic (no fixed term). A compliant tenancy agreement must:</p>
<ul>
  <li>Specify that it is a periodic assured tenancy under the Housing Act 1988</li>
  <li>State the rent, due date, and rental period</li>
  <li>Include landlord's full name and address for service</li>
  <li>Comply with all statutory provisions</li>
</ul>

<h2>Managing the Ongoing Tenancy</h2>
<p>Key ongoing obligations:</p>
<ul>
  <li>Annual gas safety check (give tenant a copy within 28 days)</li>
  <li>Respond to repair reports promptly (Awaab's Law timescales apply)</li>
  <li>Issue Section 13 notice before any rent increase (2 months minimum notice)</li>
  <li>Renew EICR every 5 years and provide copy to tenant</li>
</ul>

<h2>Professional Letting Management</h2>
<p>For most landlords, especially those with full-time jobs or multiple properties, professional management pays for itself in reduced voids, better tenants, and compliance assurance. <a href="/for-landlords">Find out about Elite Tenancy's managed letting service.</a></p>
    `.trim(),
  },

  {
    slug: "manchester-vs-london-rent-2026",
    title: "Manchester vs London Rent 2026: Is Manchester Worth the Move?",
    excerpt:
      "Comparing rental costs in Manchester and London in 2026 — how much can you save, what do you sacrifice, and is Manchester the better choice for renters?",
    category: "Rental Market",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 4,
    tags: ["Manchester vs London", "Rent Comparison", "UK Cities", "2026", "Rental Market"],
    publishedAt: new Date("2026-03-10"),
    imageUrl: null,
    content: `
<h2>The Great North–South Rental Divide</h2>
<p>For many renters — particularly Londoners feeling the squeeze of ever-rising rents — Manchester has become the most compelling alternative to the capital. With hybrid and remote working now mainstream, relocating 200 miles north is a realistic option for more people than ever before.</p>
<p>But is the rental saving worth the lifestyle change? Let's look at the real numbers.</p>

<h2>Rent Comparison: London vs Manchester 2026</h2>

<h3>Studio / One-Bedroom</h3>
<ul>
  <li><strong>Inner London:</strong> £1,900 – £2,400 pcm</li>
  <li><strong>Outer London:</strong> £1,400 – £1,800 pcm</li>
  <li><strong>Manchester City Centre:</strong> £1,100 – £1,500 pcm</li>
  <li><strong>Saving:</strong> Typically £400 – £800 per month vs inner London; £200 – £400 vs outer London</li>
</ul>

<h3>Two-Bedroom Apartment</h3>
<ul>
  <li><strong>Inner London:</strong> £2,500 – £3,500 pcm</li>
  <li><strong>Manchester City Centre:</strong> £1,400 – £1,900 pcm</li>
  <li><strong>Saving:</strong> £1,000 – £1,600 per month</li>
</ul>

<h3>Three-Bedroom House</h3>
<ul>
  <li><strong>Outer London:</strong> £2,200 – £3,000 pcm</li>
  <li><strong>Manchester Suburbs (Didsbury, Chorlton):</strong> £1,400 – £1,900 pcm</li>
  <li><strong>Saving:</strong> £800 – £1,100 per month</li>
</ul>

<h2>What £1,300 pcm Gets You</h2>
<ul>
  <li><strong>London:</strong> A compact studio in zone 3 or a room in a shared flat in zone 2</li>
  <li><strong>Manchester:</strong> A well-appointed one-bedroom apartment in the city centre, or a two-bedroom flat in Didsbury or Chorlton</li>
</ul>

<h2>Quality of Life Comparison</h2>
<h3>Manchester Advantages</h3>
<ul>
  <li>Far better space per pound — larger apartments, more outdoor space</li>
  <li>Lower cost of living across the board (food, drink, entertainment typically 20–30% cheaper)</li>
  <li>Excellent cultural scene — world-class music, arts, and food</li>
  <li>Genuinely walkable city centre</li>
  <li>Strong tech, media, and professional job market</li>
  <li>Fast rail connections to London (2 hours on Avanti West Coast)</li>
</ul>
<h3>London Advantages</h3>
<ul>
  <li>Unrivalled career opportunities — especially in finance, law, media, and government</li>
  <li>Greater diversity of neighbourhoods and experiences</li>
  <li>International connectivity (Heathrow)</li>
  <li>Higher average salaries (though offset by higher costs)</li>
</ul>

<h2>Is Manchester Right for Remote Workers?</h2>
<p>For fully remote workers, Manchester offers an outstanding quality-of-life uplift versus London with no income sacrifice. Even hybrid workers who need to be in London two or three days a week may find the maths works if their company provides a travel budget.</p>
<p>Annual savings of £6,000–£15,000 in rent alone can transform financial options — paying off debt, saving for a deposit, or simply living more comfortably.</p>

<h2>Find Your Manchester Home</h2>
<p>Elite Tenancy lists quality rental properties across Manchester and Greater Manchester. <a href="/manchester">Browse Manchester rentals.</a></p>
    `.trim(),
  },

  {
    slug: "tenancy-agreement-clauses-guide",
    title: "Tenancy Agreement Clauses: A Complete Guide for Landlords and Tenants",
    excerpt:
      "What should be in a tenancy agreement in 2026? A complete guide to the essential clauses, what's now illegal, and red flags to look out for.",
    category: "Legal Guides",
    author: "Elite Tenancy Editorial Team",
    readTimeMinutes: 5,
    tags: ["Tenancy Agreement", "Rental Contract", "Tenant Rights", "Landlord Guide", "2026"],
    publishedAt: new Date("2026-02-25"),
    imageUrl: null,
    content: `
<h2>What Is a Tenancy Agreement?</h2>
<p>A tenancy agreement is the legally binding contract between a landlord and tenant that sets out the terms of the tenancy. In England, all new assured tenancies (which cover the vast majority of private rentals) must now be periodic tenancies — there are no longer any fixed-term assured shorthold tenancies.</p>
<p>A well-drafted tenancy agreement protects both landlord and tenant by being clear about obligations, rights, and procedures.</p>

<h2>Essential Clauses in Every Tenancy Agreement</h2>
<h3>1. Parties to the Agreement</h3>
<p>Full legal names and addresses of all adult tenants and the landlord (or managing agent). The landlord must provide an address for service of notices in England or Wales.</p>

<h3>2. Property Description</h3>
<p>Full address of the property, including any included or excluded areas (garden, parking, garage, loft storage).</p>

<h3>3. Rent and Payment Terms</h3>
<ul>
  <li>Monthly rent amount</li>
  <li>Day of the month rent is due</li>
  <li>Accepted payment methods</li>
  <li>Late payment procedure</li>
</ul>
<p>The agreement cannot include provisions for automatic rent increases outside the Section 13 process — such clauses are void under the Renters' Rights Act 2026.</p>

<h3>4. Tenancy Period</h3>
<p>The tenancy start date and that it is a <strong>monthly periodic tenancy</strong>. Fixed-term clauses are no longer valid for assured tenancies.</p>

<h3>5. Deposit</h3>
<ul>
  <li>Deposit amount (maximum five weeks' rent)</li>
  <li>Name of the deposit protection scheme</li>
  <li>Conditions under which deductions may be made</li>
</ul>

<h3>6. Tenant Obligations</h3>
<p>Common tenant obligations include:</p>
<ul>
  <li>Pay rent on time</li>
  <li>Keep the property in a clean and tidy condition</li>
  <li>Report maintenance issues promptly</li>
  <li>Not sublet or take in lodgers without written consent</li>
  <li>Comply with building rules (particularly in flats)</li>
  <li>Not cause nuisance to neighbours</li>
</ul>

<h3>7. Landlord Obligations</h3>
<ul>
  <li>Maintain the structure and exterior of the property</li>
  <li>Maintain heating, hot water, and essential services</li>
  <li>Provide 24 hours' notice before entering the property (except emergencies)</li>
  <li>Respond to repair reports within the Awaab's Law timescales</li>
  <li>Keep all safety certificates up to date</li>
</ul>

<h2>Clauses That Are Now Illegal or Void</h2>
<p>Several types of clause that landlords previously used are no longer valid:</p>
<ul>
  <li><strong>Fixed-term clauses:</strong> Cannot be used to prevent the tenant leaving or to give the landlord a guaranteed possession date</li>
  <li><strong>Automatic rent increase clauses:</strong> Rent can only increase via Section 13 notice</li>
  <li><strong>No pets clauses:</strong> Blanket bans on pets are unenforceable — landlords must consider pet requests reasonably</li>
  <li><strong>No DSS clauses:</strong> Any clause excluding housing benefit claimants is unlawful discrimination</li>
  <li><strong>Excessive deposit clauses:</strong> Deposit cannot exceed five weeks' rent</li>
  <li><strong>Break fees or exit penalties:</strong> Landlords cannot charge fees when tenants exercise their legal right to leave with two months' notice</li>
</ul>

<h2>Red Flags for Tenants</h2>
<p>Before signing a tenancy agreement, watch out for:</p>
<ul>
  <li>Clauses requiring more than one month's advance rent</li>
  <li>Any mention of "fixed term" — this is not valid for new periodic tenancies</li>
  <li>Vague maintenance clauses that place unreasonable responsibility on the tenant</li>
  <li>Clauses that restrict your right to have guests</li>
  <li>Any clause that appears to waive rights you have under statute — statutory rights cannot be waived by contract</li>
</ul>

<h2>Model Tenancy Agreements</h2>
<p>The government publishes a <a href="https://www.gov.uk/government/publications/model-tenancy-agreement" target="_blank" rel="noopener noreferrer">Model Tenancy Agreement</a> that is up to date with current law. This is a good starting point for landlords who want to draft their own agreements, though professional legal review is always recommended.</p>
<p>Elite Tenancy uses legally compliant, up-to-date tenancy agreements for all managed properties. <a href="/for-landlords">Learn more about our landlord services.</a></p>
    `.trim(),
  },
];

router.post("/seed-articles", async (req, res): Promise<void> => {
  const secret = process.env.CRON_SECRET ?? process.env.SEED_SECRET;
  const provided =
    req.headers["x-seed-secret"] ?? req.query.secret;

  if (!secret || provided !== secret) {
    res.status(401).json({ error: "Unauthorised — provide X-Seed-Secret header" });
    return;
  }

  try {
    // Insert all articles, skipping any that already exist (idempotent)
    const result = await db
      .insert(blogArticlesTable)
      .values(ARTICLES)
      .onConflictDoNothing();

    res.json({
      ok: true,
      attempted: ARTICLES.length,
      message: `Seed complete — ${ARTICLES.length} articles processed (duplicates skipped).`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
