import CityPage from "./CityPage";

export default function Liverpool() {
  return (
    <CityPage
      city="Liverpool"
      region="Merseyside"
      heroTagline="Liverpool's waterfront renaissance is complete. From the iconic Pier Head to Georgian Quarter townhouses, Elite Tenancy brings you the city's finest rental properties."
      avgRent="£900"
      listingCount={71}
      popularAreas={[
        "City Centre", "Baltic Triangle", "Georgian Quarter", "Waterfront",
        "Woolton", "Childwall", "Allerton", "Aigburth",
      ]}
      highlights={[
        "Waterfront and Baltic Triangle specialist — Liverpool's most sought-after postcodes",
        "UNESCO World Heritage waterfront — unmatched views included",
        "Liverpool's tech and creative digital sector driving professional rental demand",
        "Merseyrail network connecting entire city in under 30 minutes",
        "All properties within 30 minutes of Liverpool John Lennon Airport",
        "Fully managed properties with 24/7 emergency maintenance contact",
      ]}
      faqs={[
        {
          q: "What is the Baltic Triangle and why is it popular?",
          a: "The Baltic Triangle is Liverpool's creative and tech district — a former industrial quarter packed with independent venues, start-ups, art studios, and converted warehouse apartments. It's the city's most vibrant neighbourhood and extremely popular with under-35 professionals.",
        },
        {
          q: "How affordable is Liverpool compared to other UK cities?",
          a: "Liverpool is one of the most affordable major UK cities to rent in. You can rent a high-quality one-bedroom apartment in a great location for £650–£900/month — comparable quality would cost 2–3× more in London or Bristol.",
        },
        {
          q: "Is Liverpool a good place for first-time renters?",
          a: "Absolutely. Liverpool has a large, well-established private rental market with plenty of choice across all price points. Landlord referencing and deposit protection are standard. Elite Tenancy's team is happy to guide first-time renters through the entire process.",
        },
        {
          q: "What are the transport links like in Liverpool?",
          a: "Liverpool has excellent national rail connections — direct services to London Euston in 2h10m, Manchester in 45 minutes, and Leeds in 1h30m. The Merseyrail underground network is fast, frequent, and covers the entire city.",
        },
      ]}
    />
  );
}
