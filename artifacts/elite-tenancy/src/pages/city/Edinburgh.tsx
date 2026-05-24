import CityPage from "./CityPage";

export default function Edinburgh() {
  return (
    <CityPage
      city="Edinburgh"
      region="Scotland"
      heroTagline="Scotland's capital is one of Europe's most beautiful cities — and its rental market is among the UK's strongest. New Town flats, Leith penthouses, and everything in between."
      avgRent="£1,450"
      listingCount={62}
      popularAreas={[
        "New Town", "Old Town", "Leith", "Stockbridge",
        "Bruntsfield", "Marchmont", "Morningside", "Portobello",
      ]}
      highlights={[
        "Edinburgh New Town and Old Town specialist — Category A listed properties available",
        "Festival city premium: year-round demand from finance, law, and tech sectors",
        "Scotland's rent control legislation — we ensure full compliance for landlords",
        "Edinburgh Airport 25 minutes from city centre with 40+ direct route destinations",
        "Properties meeting Scottish EPC band C standards (2025 minimum)",
        "Dedicated Scottish tenancy law expertise — fully PRT-compliant agreements",
      ]}
      faqs={[
        {
          q: "How does the Private Residential Tenancy (PRT) work in Scotland?",
          a: "Scotland uses the Private Residential Tenancy (PRT) for all residential lets. Unlike England, there is no fixed-term option — tenancies are open-ended with a minimum 28-day notice period for tenants. Landlords have specific grounds for ending a tenancy. Elite Tenancy uses PRT-compliant agreements for all Scottish properties.",
        },
        {
          q: "What is the New Town like to rent in?",
          a: "Edinburgh's New Town is a Georgian masterpiece and UNESCO World Heritage site. Renting here puts you among stunning period architecture, top restaurants, and boutique shopping — all walking distance from the main financial district and Waverley station.",
        },
        {
          q: "Is Edinburgh expensive to rent?",
          a: "Edinburgh is the most expensive rental market outside London in the UK, with strong demand from the financial services, tech, and public sectors. One-bedroom flats in prime areas average £1,100–£1,600/month. However, quality of life, safety, and cultural richness offer outstanding value.",
        },
        {
          q: "What is the short-term rental situation in Edinburgh?",
          a: "Edinburgh has introduced short-term let licensing, which means fewer Airbnb-style properties and more properties returning to the long-term rental market — good news for tenants looking for quality rentals. All Elite Tenancy properties are long-term lets.",
        },
      ]}
    />
  );
}
