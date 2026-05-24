import CityPage from "./CityPage";

export default function Bristol() {
  return (
    <CityPage
      city="Bristol"
      region="South West England"
      heroTagline="Bristol blends creative energy with extraordinary liveability. From Clifton's Georgian terraces to Harbourside penthouse apartments — Elite Tenancy has Bristol's best."
      avgRent="£1,350"
      listingCount={83}
      popularAreas={[
        "Clifton", "Harbourside", "Stokes Croft", "Redland",
        "Montpelier", "Bedminster", "Kingsdown", "Cotham",
      ]}
      highlights={[
        "Clifton and Harbourside specialist — Bristol's most prestigious rental addresses",
        "Cycle-friendly properties within 2 miles of the city centre",
        "Strong demand from Airbus, Rolls-Royce, and tech sector professionals",
        "Properties within the Bristol Clean Air Zone properly certified and compliant",
        "Pet-friendly portfolio available — 40% of our Bristol properties welcome pets",
        "Average tenancy length of 23 months — stable, professional landlords",
      ]}
      faqs={[
        {
          q: "What is the best area to rent in Bristol?",
          a: "Clifton is Bristol's most prestigious residential area with beautiful Georgian architecture, independent boutiques, and Clifton Down. The Harbourside offers modern waterfront apartments. Stokes Croft and Montpelier suit creative professionals wanting vibrant communities.",
        },
        {
          q: "How competitive is the Bristol rental market?",
          a: "Bristol has consistently ranked as one of the UK's most competitive rental markets outside London, with demand regularly exceeding supply by 30–40%. Premium properties let extremely quickly — our average time to let is 9 days.",
        },
        {
          q: "What are typical move-in costs in Bristol?",
          a: "Under the Tenant Fees Act, your upfront costs are limited to: five weeks' rent as a deposit, first month's rent in advance, and a holding deposit of one week's rent. We do not charge admin or referencing fees.",
        },
        {
          q: "Is Bristol easy to get around without a car?",
          a: "Bristol is one of the UK's most cyclable cities and has excellent bus networks. The Temple Meads station serves London Paddington in 1h40m. However, the geography is hilly so many residents choose to own a car for longer journeys.",
        },
      ]}
    />
  );
}
