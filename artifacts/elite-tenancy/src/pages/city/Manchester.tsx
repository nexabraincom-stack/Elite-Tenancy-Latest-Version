import CityPage from "./CityPage";

export default function Manchester() {
  return (
    <CityPage
      city="Manchester"
      region="Greater Manchester"
      heroTagline="Manchester's fastest-growing rental market — from Spinningfields penthouses to Didsbury period homes. Premium properties, transparent pricing, and a landlord who actually picks up the phone."
      avgRent="£1,250"
      listingCount={127}
      popularAreas={[
        "City Centre", "Spinningfields", "Didsbury", "Chorlton",
        "Ancoats", "Northern Quarter", "Salford Quays", "Deansgate",
      ]}
      highlights={[
        "Manchester's strongest selection of professionally managed premium rentals",
        "Specialist knowledge of MediaCityUK and tech corridor demand",
        "Properties within walking distance of Piccadilly and Victoria stations",
        "Pet-friendly options available across 60% of our Manchester portfolio",
        "EPC-compliant properties meeting 2025 minimum energy standards",
        "Landlord and tenant rated 4.9★ for service in Greater Manchester",
      ]}
      faqs={[
        {
          q: "What are the best areas to rent in Manchester city centre?",
          a: "Ancoats, the Northern Quarter, and Deansgate are among the most sought-after city-centre neighbourhoods, offering converted mills, modern apartments, and excellent connectivity. Spinningfields suits professionals needing proximity to financial services.",
        },
        {
          q: "How does Manchester rental pricing compare to London?",
          a: "Manchester typically offers 40–55% lower rents than equivalent London properties. A two-bedroom apartment in a prime Manchester location averages £1,400–£1,800/month versus £2,800–£3,500/month in comparable London zones.",
        },
        {
          q: "Is Manchester good for young professionals?",
          a: "Absolutely — Manchester is the UK's fastest-growing city for graduate employment. The BBC, ITV, and dozens of tech companies are headquartered here, and the Metrolink tram network makes the entire city highly commutable.",
        },
        {
          q: "What documents do I need to rent in Manchester?",
          a: "You'll typically need proof of identity (passport or driving licence), proof of address (utility bill or bank statement), 3 months of payslips or a letter of employment, and a bank reference. International tenants may need additional documentation.",
        },
      ]}
    />
  );
}
