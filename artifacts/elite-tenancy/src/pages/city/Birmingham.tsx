import CityPage from "./CityPage";

export default function Birmingham() {
  return (
    <CityPage
      city="Birmingham"
      region="West Midlands"
      heroTagline="The UK's second city is having a renaissance — and so is its rental market. Elite Tenancy brings Birmingham's best properties to tenants who expect more."
      avgRent="£1,050"
      listingCount={94}
      popularAreas={[
        "Brindleyplace", "Jewellery Quarter", "Harborne", "Edgbaston",
        "Moseley", "Digbeth", "Sutton Coldfield", "Solihull",
      ]}
      highlights={[
        "Premium properties across Birmingham's most desirable regeneration zones",
        "2 minutes from Birmingham New Street — perfect for London commuters",
        "Growing tech and FinTech corridor driving demand for quality rentals",
        "HS2 future-proofed locations available now",
        "Largest selection of HMO-free, single-household premium rentals in the Midlands",
        "All properties professionally inventoried with neutral third-party reports",
      ]}
      faqs={[
        {
          q: "Is Birmingham a good city to rent in?",
          a: "Birmingham offers exceptional value for money compared to London, with rents typically 55–65% lower for equivalent properties. The city has excellent transport links, a vibrant cultural scene, and major employers including HSBC, Goldman Sachs, and KPMG who have relocated their operations here.",
        },
        {
          q: "What is the Jewellery Quarter like to live in?",
          a: "The Jewellery Quarter is Birmingham's most characterful neighbourhood — a conservation area of Victorian workshops converted into stylish apartments and townhouses. It's walkable to the city centre, has an independent restaurant scene, and is highly popular with creative professionals.",
        },
        {
          q: "How does HS2 affect property values in Birmingham?",
          a: "Properties within 15 minutes of Curzon Street (the planned HS2 terminus) have seen strong rental demand. Once operational, HS2 will put Birmingham within 45 minutes of London — making commuting feasible and driving further rental price growth.",
        },
        {
          q: "What is the process for renting through Elite Tenancy?",
          a: "Simply browse our listings, request a viewing, and submit an application online. Our referencing partner contacts your employer and previous landlord. Once approved, you sign your tenancy agreement digitally and pay your deposit and first month's rent. We aim to complete the process in under 5 working days.",
        },
      ]}
    />
  );
}
