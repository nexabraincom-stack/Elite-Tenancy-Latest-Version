import CityPage from "./CityPage";

export default function London() {
  return (
    <CityPage
      city="London"
      region="England"
      heroTagline="Discover premium London rentals across every borough — from Mayfair penthouses to Zone 2 family homes. Elite Tenancy connects you with verified landlords and exclusive properties."
      avgRent="£2,850"
      listingCount={340}
      popularAreas={[
        "Mayfair", "Chelsea", "Canary Wharf", "Shoreditch",
        "Clapham", "Islington", "Richmond", "Greenwich",
        "Notting Hill", "Fulham", "Hackney", "Wimbledon",
      ]}
      highlights={[
        "London's largest curated selection of premium rentals above £1,500/month",
        "Exclusive off-market properties not listed anywhere else",
        "Priority viewings within 24 hours of enquiry",
        "Expert knowledge of every London borough and transport link",
        "Compliant with London's selective and additional licensing schemes",
        "Deposit protection with TDS from day one",
      ]}
      faqs={[
        {
          q: "What is the average rent for a 1-bed in London?",
          a: "The average asking rent for a one-bedroom flat in London is approximately £1,950–£2,400/month depending on zone and area. Zone 1–2 properties in desirable neighbourhoods like Chelsea or Shoreditch typically command £2,200+ while outer zones offer better value.",
        },
        {
          q: "Do I need a guarantor to rent in London?",
          a: "Guarantors are commonly requested in London if your annual income is below 2.5× the annual rent (40× monthly rent). Elite Tenancy landlords use standard referencing via a credit agency — we'll let you know if a guarantor is needed before you apply.",
        },
        {
          q: "How quickly can I move in?",
          a: "Most Elite Tenancy properties in London are available for move-in within 2–4 weeks of a successful offer. Some properties offer immediate availability. Our team will confirm the exact timeline at the point of viewing.",
        },
        {
          q: "Is council tax included in the rent?",
          a: "Council tax is almost never included in London rental agreements and is paid separately by the tenant. Rates vary by borough — for example Westminster Band D is approximately £800/year while Tower Hamlets is around £1,650/year.",
        },
      ]}
    />
  );
}
