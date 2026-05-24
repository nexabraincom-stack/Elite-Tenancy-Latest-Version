import CityPage from "./CityPage";

export default function Leeds() {
  return (
    <CityPage
      city="Leeds"
      region="West Yorkshire"
      heroTagline="Leeds is the UK's fastest-growing financial centre outside London. Premium apartments in the waterfront, city centre, and leafy suburbs — all managed by Elite Tenancy."
      avgRent="£980"
      listingCount={76}
      popularAreas={[
        "City Centre", "Waterfront", "Headingley", "Chapel Allerton",
        "Roundhay", "Alwoodley", "Horsforth", "Meanwood",
      ]}
      highlights={[
        "Leeds city centre apartments with waterfront views from £800/month",
        "Specialist knowledge of student and professional demand in LS1–LS6",
        "Strong rental yields attracting quality buy-to-let landlords to our platform",
        "Excellent transport — Leeds Bradford Airport and direct trains to London in 2h15m",
        "All listings include EPC rating and energy cost estimates",
        "Dedicated Leeds property manager available 9am–6pm Mon–Sat",
      ]}
      faqs={[
        {
          q: "What are the most popular areas to rent in Leeds?",
          a: "City centre apartments near the Waterfront and Granary Wharf are popular with professionals. Headingley and Hyde Park attract younger renters and postgraduates. Chapel Allerton and Roundhay suit families wanting green space with easy city access.",
        },
        {
          q: "Is Leeds cheaper to rent than Manchester?",
          a: "Generally yes — Leeds rents are approximately 10–20% lower than equivalent Manchester properties. A city-centre one-bed in Leeds averages £850–£1,100/month versus £1,000–£1,350 in Manchester.",
        },
        {
          q: "Are there good transport links from Leeds?",
          a: "Leeds has excellent national rail connections with direct services to London King's Cross, Manchester, Edinburgh, and Newcastle. The city bus network is extensive, and Leeds Bradford Airport serves over 70 destinations.",
        },
        {
          q: "What is the rental market like for professionals in Leeds?",
          a: "Leeds has a strong demand for professional rentals driven by large employers including HMRC, DWP, PwC, and the growing financial services sector. Quality apartments with a gym, concierge, and secure parking are particularly sought after and let quickly.",
        },
      ]}
    />
  );
}
