import CityPage from "./CityPage";

export default function Cardiff() {
  return (
    <CityPage
      city="Cardiff"
      region="Wales"
      heroTagline="Cardiff is Wales's beating heart — a capital city with big-city ambition and genuinely affordable rents. Waterfront living, Victorian suburb charm, and a booming tech scene."
      avgRent="£950"
      listingCount={49}
      popularAreas={[
        "Cardiff Bay", "Pontcanna", "Roath", "Canton",
        "Cathays", "Llandaff", "Heath", "Whitchurch",
      ]}
      highlights={[
        "Cardiff Bay regeneration: waterfront apartments at fraction of comparable UK city prices",
        "Pontcanna — Wales's most desirable residential street, now on our platform",
        "Growing BBC Wales and S4C media sector driving premium rental demand",
        "Bristol only 50 minutes by train — Cardiff suits Bristol professionals priced out",
        "Welsh Government 20mph zones make Cardiff an exceptionally walkable city",
        "All properties compliant with Welsh Government Renting Homes (Wales) Act 2022",
      ]}
      faqs={[
        {
          q: "How does the Renting Homes (Wales) Act 2022 affect tenants?",
          a: "The Renting Homes (Wales) Act 2022 replaced the traditional assured shorthold tenancy with an 'occupation contract'. It gives tenants stronger rights, including a minimum 6-month notice period for landlords to end a contract and mandatory carbon monoxide detector requirements. All Elite Tenancy Welsh properties use compliant occupation contracts.",
        },
        {
          q: "Is Cardiff Bay a good place to live?",
          a: "Cardiff Bay has transformed completely over the past 20 years. The Barrage created a freshwater bay, surrounded by modern apartments, the Wales Millennium Centre, Senedd, and Michelin-starred restaurants. It's particularly popular with professionals working in media and public sector.",
        },
        {
          q: "How affordable is Cardiff compared to English cities?",
          a: "Cardiff is significantly more affordable than most English cities — rents are typically 20–30% below Bristol, 40% below London, and comparable to Sheffield and Leeds. A two-bedroom apartment in Cardiff Bay averages £950–£1,200/month.",
        },
        {
          q: "What are the best transport links from Cardiff?",
          a: "Cardiff Central station offers direct trains to London Paddington in just under 2 hours, Bristol Temple Meads in 50 minutes, and Swansea in 50 minutes. Cardiff Airport serves 30+ European destinations with regular flights to Amsterdam, Barcelona, and Dublin.",
        },
      ]}
    />
  );
}
