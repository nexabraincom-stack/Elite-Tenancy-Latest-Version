import CityPage from "./CityPage";

export default function Sheffield() {
  return (
    <CityPage
      city="Sheffield"
      region="South Yorkshire"
      heroTagline="Sheffield — the UK's greenest city and one of its most underrated rental markets. Outstanding value, remarkable quality of life, and Elite Tenancy's growing portfolio of premium properties."
      avgRent="£850"
      listingCount={58}
      popularAreas={[
        "City Centre", "Kelham Island", "Ecclesall Road", "Crookes",
        "Nether Edge", "Hunters Bar", "Broomhill", "Hillsborough",
      ]}
      highlights={[
        "Sheffield's best value premium rentals — more space per pound than any UK city",
        "Kelham Island regeneration area: converted industrial buildings, award-winning restaurants",
        "Two world-class universities driving sustained rental demand",
        "More trees per capita than any other UK city — exceptional quality of life",
        "Direct trains to London St Pancras in 2h10m and Leeds in 55 minutes",
        "Growing Advanced Manufacturing Research Centre attracting high-income professionals",
      ]}
      faqs={[
        {
          q: "What is Kelham Island like to live in?",
          a: "Kelham Island has transformed from an industrial district to Sheffield's hippest neighbourhood. Victorian factory conversions host craft breweries, independent restaurants, and stylish apartments. It's a 10-minute walk from the city centre and highly sought after by young professionals.",
        },
        {
          q: "Is Sheffield a good city for families?",
          a: "Sheffield consistently ranks highly for family liveability — excellent state and grammar schools, extensive parkland and the Peak District on the doorstep, and significantly lower cost of living than southern cities. Areas like Nether Edge and Hunters Bar are particularly family-friendly.",
        },
        {
          q: "What is the average rent in Sheffield?",
          a: "Sheffield offers exceptional rental value. One-bedroom apartments in the city centre average £650–£850/month. Premium two-bedroom apartments in desirable neighbourhoods like Kelham Island or Ecclesall Road typically range from £900–£1,200/month.",
        },
        {
          q: "What employers are based in Sheffield?",
          a: "Major employers include Boeing, McLaren Automotive, Rolls-Royce (at the AMRC), HSBC, and the NHS. Both the University of Sheffield and Sheffield Hallam University combined employ over 15,000 staff.",
        },
      ]}
    />
  );
}
