import CityPage from "./CityPage";

export default function Glasgow() {
  return (
    <CityPage
      city="Glasgow"
      region="Scotland"
      heroTagline="Scotland's largest city packs cultural firepower, architectural grandeur, and a rental market offering unbeatable value. The West End, Merchant City, and beyond — curated by Elite Tenancy."
      avgRent="£1,100"
      listingCount={55}
      popularAreas={[
        "West End", "Merchant City", "Finnieston", "City Centre",
        "Dennistoun", "Shawlands", "Mount Florida", "Pollokshields",
      ]}
      highlights={[
        "Glasgow West End — Victorian tenements and leafy terraces near Glasgow University",
        "Finnieston: Glasgow's hippest neighbourhood, fastest-growing rental market in Scotland",
        "Major employers: NHS, BAE Systems, JP Morgan, Amazon — strong professional rental demand",
        "Glasgow Subway (the 'Clockwork Orange') — fastest inner-city transport in UK",
        "Scottish PRT-compliant tenancy agreements — tenant rights protected",
        "Average rent 25% below Edinburgh for comparable quality property",
      ]}
      faqs={[
        {
          q: "What is the difference between Glasgow and Edinburgh for renters?",
          a: "Glasgow typically offers rents 20–30% lower than Edinburgh for comparable properties. Glasgow is Scotland's commercial and industrial capital with a larger job market, particularly in engineering, finance, and health. Edinburgh is the legal and governmental capital. Both are excellent choices with direct rail links between them in 50 minutes.",
        },
        {
          q: "What is Finnieston like?",
          a: "Finnieston has become Glasgow's most talked-about neighbourhood — the Argyle Street strip is packed with independent restaurants, bars, and coffee shops. It's a 10-minute walk from the city centre and SSE Hydro, and extremely popular with young professionals and creatives.",
        },
        {
          q: "Is Glasgow safe to live in?",
          a: "Yes — Glasgow has changed enormously over the past 20 years and the areas popular with renters (West End, Merchant City, Finnieston, Shawlands) are safe, well-policed, and family-friendly. Glasgow consistently ranks well for quality of life in Scottish surveys.",
        },
        {
          q: "What documents do I need to rent in Scotland?",
          a: "Under the Private Residential Tenancy (PRT), landlords must provide a tenancy information pack. As a tenant you'll need proof of identity and right to rent in Scotland. Referencing typically requires payslips, a bank reference, and a previous landlord reference.",
        },
      ]}
    />
  );
}
