import type { CityPageProps } from "./CityPage";

/**
 * Programmatic city expansion.
 *
 * Each entry is rendered through the shared <CityPage> template (which emits
 * RealEstateAgent + FAQPage + BreadcrumbList schema and a city-specific
 * <title>/canonical). Routes are generated from this array in App.tsx, and the
 * slugs are mirrored in public/sitemap.xml.
 *
 * Quality over quantity: data is realistic and FAQs are differentiated per city
 * to avoid thin/duplicate "doorway" pages, which Google can penalise.
 */
export interface CityEntry extends CityPageProps {
  slug: string;
}

export const EXTRA_CITIES: CityEntry[] = [
  {
    slug: "nottingham",
    city: "Nottingham",
    region: "England",
    heroTagline:
      "From the Lace Market to leafy West Bridgford, find premium Nottingham rentals with verified landlords and one of the UK's strongest student and professional rental markets.",
    avgRent: "£1,050",
    listingCount: 120,
    popularAreas: ["West Bridgford", "The Park", "Lace Market", "Beeston", "Mapperley", "Sherwood", "Lenton", "Hockley"],
    highlights: [
      "Strong demand from two major universities and a growing tech/finance sector",
      "Excellent value versus London with fast East Midlands rail links",
      "Selective licensing knowledge across Nottingham City Council wards",
      "Curated professional lets in West Bridgford and The Park Estate",
    ],
    faqs: [
      { q: "What are the best areas to rent in Nottingham?", a: "West Bridgford and The Park Estate are the most sought-after for professionals, while Lenton and Beeston are popular with students near the University of Nottingham. Mapperley and Sherwood offer good value for families." },
      { q: "Does Nottingham have selective licensing?", a: "Yes — large parts of Nottingham City fall under selective licensing, meaning most private rented homes need a landlord licence. Every Elite Tenancy landlord is verified as compliant before listing." },
      { q: "How much is rent for a 2-bed in Nottingham?", a: "A typical two-bedroom flat in Nottingham rents for around £900–£1,200/month, with West Bridgford and city-centre apartments at the higher end." },
    ],
  },
  {
    slug: "leicester",
    city: "Leicester",
    region: "England",
    heroTagline:
      "Discover premium Leicester rentals across the Golden Mile, Clarendon Park and the regenerated Waterside — verified landlords and transparent, completion-only fees.",
    avgRent: "£1,050",
    listingCount: 95,
    popularAreas: ["Clarendon Park", "Stoneygate", "Waterside", "Knighton", "Oadby", "Highfields", "Aylestone", "Evington"],
    highlights: [
      "One of the most affordable major English cities for renters",
      "Strong professional demand around the city centre and Clarendon Park",
      "Family-friendly suburbs in Oadby, Knighton and Stoneygate",
      "Central location with fast links to London St Pancras in ~70 minutes",
    ],
    faqs: [
      { q: "Where do professionals rent in Leicester?", a: "Clarendon Park and Stoneygate are favourites for young professionals thanks to period homes, cafés and a short commute. The Waterside regeneration zone offers modern city-centre apartments." },
      { q: "Is Leicester a good place to rent affordably?", a: "Yes — Leicester is one of the better-value large cities in England, with average rents well below the national city average while offering excellent transport and amenities." },
      { q: "How quickly can I move into a Leicester rental?", a: "Most Elite Tenancy properties in Leicester are available within 2–4 weeks of a successful offer, with some offering immediate move-in." },
    ],
  },
  {
    slug: "newcastle",
    city: "Newcastle upon Tyne",
    region: "England",
    heroTagline:
      "Premium Newcastle rentals from Jesmond's Victorian terraces to Quayside apartments — verified North East landlords and AI-powered matching.",
    avgRent: "£950",
    listingCount: 110,
    popularAreas: ["Jesmond", "Quayside", "Gosforth", "Heaton", "Sandyford", "Ouseburn", "Fenham", "Tynemouth"],
    highlights: [
      "Outstanding value with one of the lowest big-city rents in England",
      "Vibrant Quayside and Ouseburn for city-living professionals",
      "Jesmond and Gosforth prized for period homes and amenities",
      "Strong demand from Newcastle and Northumbria universities",
    ],
    faqs: [
      { q: "What's the most popular area to rent in Newcastle?", a: "Jesmond is the standout choice for professionals and postgraduates, with elegant terraces, bars and a quick Metro ride into the city. Gosforth suits families, while the Quayside offers modern riverside apartments." },
      { q: "How affordable is renting in Newcastle?", a: "Newcastle is one of the most affordable major UK cities to rent in, with average rents far below southern cities and excellent value for spacious period properties." },
      { q: "Is parking included with Newcastle rentals?", a: "It varies — many Jesmond and city-centre flats rely on permit or on-street parking, while Gosforth and suburban homes more often include off-street parking. Each listing states what's available." },
    ],
  },
  {
    slug: "coventry",
    city: "Coventry",
    region: "England",
    heroTagline:
      "Find premium Coventry rentals near the universities, city centre and Warwickshire commuter belt — verified landlords and a transparent letting process.",
    avgRent: "£1,050",
    listingCount: 85,
    popularAreas: ["Earlsdon", "Cheylesmore", "Canley", "Stoke", "Tile Hill", "Coundon", "City Centre", "Allesley"],
    highlights: [
      "Central UK location with fast rail to Birmingham and London",
      "High demand from Coventry and Warwick university communities",
      "Characterful professional lets in Earlsdon and Coundon",
      "Strong yields and value across the West Midlands",
    ],
    faqs: [
      { q: "Where are the best places to rent in Coventry?", a: "Earlsdon is the most desirable area for professionals and families, with independent shops and period homes. Cheylesmore and Coundon offer good value, while Canley and Tile Hill are popular with students." },
      { q: "Is Coventry good for commuters?", a: "Yes — Coventry sits on the West Coast Main Line with London Euston in around an hour and Birmingham in 20 minutes, making it a strong base for commuters." },
      { q: "What does the average Coventry rent cover?", a: "Average asking rents of around £1,050/month typically reflect a modern two-bed flat or a smaller terraced house; bills are usually paid separately unless a listing states otherwise." },
    ],
  },
  {
    slug: "reading",
    city: "Reading",
    region: "England",
    heroTagline:
      "Premium Reading rentals along the Thames and Kennet — a Thames Valley tech hub with fast Elizabeth line and GWR links to London. Verified landlords, no monthly fees.",
    avgRent: "£1,500",
    listingCount: 100,
    popularAreas: ["Caversham", "Tilehurst", "Lower Earley", "Whitley", "Earley", "Coley", "Newtown", "Town Centre"],
    highlights: [
      "Elizabeth line and GWR put London Paddington ~25 minutes away",
      "Major Thames Valley employment hub — strong professional demand",
      "Riverside living in Caversham and modern town-centre apartments",
      "Family suburbs in Earley, Lower Earley and Tilehurst",
    ],
    faqs: [
      { q: "Why is Reading popular with renters?", a: "Reading combines a major tech and corporate employment base with fast trains to London via the Elizabeth line and GWR, so it attracts professionals wanting space and good value within commuting distance of the capital." },
      { q: "Which Reading areas are best for families?", a: "Caversham, Earley and Lower Earley are favourites for families thanks to good schools, parks and quieter streets, while still being close to the town centre and stations." },
      { q: "Are Reading rents cheaper than London?", a: "Yes — while higher than the national average, Reading rents are typically well below comparable London properties, which is a key reason commuters choose it." },
    ],
  },
  {
    slug: "brighton",
    city: "Brighton",
    region: "England",
    heroTagline:
      "Find premium Brighton & Hove rentals from seafront apartments to North Laine townhouses — verified landlords in one of the UK's most in-demand coastal cities.",
    avgRent: "£1,750",
    listingCount: 105,
    popularAreas: ["Hove", "North Laine", "Kemptown", "Brunswick", "Seven Dials", "Preston Park", "Hanover", "The Lanes"],
    highlights: [
      "Vibrant seaside city with fast trains to London Victoria (~1 hour)",
      "Premium seafront and Regency-square apartments in Hove and Brunswick",
      "Creative, café-rich neighbourhoods in North Laine and Hanover",
      "High year-round demand from professionals, creatives and two universities",
    ],
    faqs: [
      { q: "Where are the nicest places to rent in Brighton?", a: "Hove and the Brunswick area are prized for elegant Regency squares near the sea, while North Laine and the Lanes offer bohemian city-centre living. Preston Park and Seven Dials suit families and commuters." },
      { q: "Is Brighton an expensive place to rent?", a: "Brighton is one of the more expensive UK cities outside London, driven by its seaside location and strong demand, so securing a referenced introduction quickly matters here." },
      { q: "How long is the commute from Brighton to London?", a: "Direct trains reach London Victoria and London Bridge in around an hour, making Brighton a viable — if premium — base for London commuters." },
    ],
  },
  {
    slug: "southampton",
    city: "Southampton",
    region: "England",
    heroTagline:
      "Premium Southampton rentals from the waterfront and Ocean Village to Portswood and Bassett — verified South Coast landlords and AI matching.",
    avgRent: "£1,250",
    listingCount: 90,
    popularAreas: ["Ocean Village", "Portswood", "Bassett", "Bitterne", "Shirley", "Bedford Place", "Highfield", "Woolston"],
    highlights: [
      "Major South Coast port city with strong professional and student demand",
      "Modern marina living in Ocean Village and the waterfront",
      "Leafy family areas in Bassett and Highfield near the university",
      "Fast trains to London Waterloo in around 75 minutes",
    ],
    faqs: [
      { q: "What are the best areas to rent in Southampton?", a: "Ocean Village and Bedford Place suit professionals wanting waterfront and city living, Portswood and Highfield are popular near the University of Southampton, and Bassett offers green, family-friendly streets." },
      { q: "Is Southampton good for students renting?", a: "Yes — Portswood and Highfield form the heart of the student rental scene, close to the university campus, while professionals tend to favour Ocean Village and the city centre." },
      { q: "Does Southampton have good transport links?", a: "Southampton has direct trains to London Waterloo, an international airport and major ferry routes, making it well connected for commuters and travellers alike." },
    ],
  },
  {
    slug: "portsmouth",
    city: "Portsmouth",
    region: "England",
    heroTagline:
      "Find premium Portsmouth rentals from Gunwharf Quays and Southsea seafront to Old Portsmouth — verified landlords on the UK's only island city.",
    avgRent: "£1,150",
    listingCount: 80,
    popularAreas: ["Southsea", "Gunwharf Quays", "Old Portsmouth", "North End", "Fratton", "Cosham", "Milton", "Eastney"],
    highlights: [
      "Waterfront and seafront living in Gunwharf Quays and Southsea",
      "Strong naval, marine and university employment base",
      "Excellent value compared with nearby Brighton and the South East",
      "Direct trains to London Waterloo in around 90 minutes",
    ],
    faqs: [
      { q: "Where should professionals rent in Portsmouth?", a: "Southsea and Gunwharf Quays are the top choices for professionals, offering seafront flats, bars and marina apartments. Old Portsmouth provides historic charm by the harbour." },
      { q: "Is Portsmouth cheaper than other South Coast cities?", a: "Generally yes — Portsmouth offers notably better value than Brighton while still providing coastal living, which makes it attractive to renters priced out of pricier seaside cities." },
      { q: "Is Southsea a good area to rent in?", a: "Southsea is one of Portsmouth's most popular rental areas, with a lively seafront, independent shops and a strong mix of professionals and students." },
    ],
  },
  {
    slug: "oxford",
    city: "Oxford",
    region: "England",
    heroTagline:
      "Premium Oxford rentals from Jericho's Victorian terraces to Summertown — verified landlords in one of the UK's most competitive and prestigious rental markets.",
    avgRent: "£1,650",
    listingCount: 70,
    popularAreas: ["Jericho", "Summertown", "Headington", "Cowley", "Iffley", "Marston", "Botley", "St Clements"],
    highlights: [
      "World-renowned university city with intense, year-round rental demand",
      "Premium professional lets in Jericho, Summertown and North Oxford",
      "Strong demand from academia, science parks and the John Radcliffe Hospital",
      "Fast rail to London Paddington and Marylebone in around an hour",
    ],
    faqs: [
      { q: "Why is renting in Oxford so competitive?", a: "Oxford has limited housing supply, strict conservation rules and constant demand from students, academics and hospital and science-park staff, so good properties let extremely quickly — moving fast with a referenced introduction is essential." },
      { q: "What are the best areas to rent in Oxford?", a: "Jericho and North Oxford are the most desirable for professionals, Summertown suits families with excellent schools, and Headington is popular with hospital and university staff." },
      { q: "Are Oxford rents high?", a: "Yes — Oxford is among the most expensive cities to rent in outside London, reflecting its limited supply and exceptional demand." },
    ],
  },
  {
    slug: "cambridge",
    city: "Cambridge",
    region: "England",
    heroTagline:
      "Find premium Cambridge rentals from riverside Newnham to the booming science parks — verified landlords in the UK's leading tech and life-sciences hub.",
    avgRent: "£1,650",
    listingCount: 75,
    popularAreas: ["Newnham", "Petersfield", "Chesterton", "Trumpington", "Cherry Hinton", "Romsey", "Castle", "Eddington"],
    highlights: [
      "Global tech and biotech hub — exceptional demand from professionals",
      "Modern developments at Eddington, Trumpington and the science parks",
      "Characterful central living in Newnham, Petersfield and Romsey",
      "Fast trains to London King's Cross and Liverpool Street",
    ],
    faqs: [
      { q: "Who rents in Cambridge?", a: "Cambridge attracts a high concentration of scientists, engineers, academics and biotech professionals working at the university, Addenbrooke's Hospital and the surrounding science and business parks, alongside students." },
      { q: "Which Cambridge areas are most in demand?", a: "Newnham and Petersfield are prized central areas, Trumpington and Eddington offer modern new-build homes near the biomedical campus, and Chesterton is popular for value near the city centre." },
      { q: "Is Cambridge expensive for renters?", a: "Yes — strong demand and constrained supply make Cambridge one of the priciest rental markets outside London, so quick, well-referenced applications are important." },
    ],
  },
  {
    slug: "bournemouth",
    city: "Bournemouth",
    region: "England",
    heroTagline:
      "Premium Bournemouth rentals from beachfront apartments to leafy Talbot Woods — verified Dorset landlords on the UK's award-winning south coast.",
    avgRent: "£1,250",
    listingCount: 85,
    popularAreas: ["Westbourne", "Talbot Woods", "Town Centre", "Boscombe", "Southbourne", "Charminster", "Winton", "Pokesdown"],
    highlights: [
      "Seven miles of sandy beaches and a thriving digital/finance sector",
      "Premium living in Westbourne and Talbot Woods",
      "Vibrant, improving coastal neighbourhoods in Boscombe and Southbourne",
      "Strong professional and student demand year-round",
    ],
    faqs: [
      { q: "What are the best places to rent in Bournemouth?", a: "Westbourne and Talbot Woods are the most sought-after for professionals and families, while Southbourne and Boscombe offer popular, improving beachside living at better value." },
      { q: "Is Bournemouth a good place for professionals?", a: "Yes — Bournemouth has a strong financial-services and digital economy, so it attracts professionals who want coastal living alongside career opportunities." },
      { q: "How much does it cost to rent near Bournemouth beach?", a: "Seafront and Westbourne apartments command a premium over the town average, while Boscombe and Southbourne offer more affordable options within easy reach of the coast." },
    ],
  },
  {
    slug: "milton-keynes",
    city: "Milton Keynes",
    region: "England",
    heroTagline:
      "Find premium Milton Keynes rentals across CMK, Caldecotte and Newport Pagnell — verified landlords in one of the UK's fastest-growing commuter cities.",
    avgRent: "£1,300",
    listingCount: 95,
    popularAreas: ["Central Milton Keynes", "Caldecotte", "Newport Pagnell", "Wolverton", "Bletchley", "Walnut Tree", "Stony Stratford", "Furzton"],
    highlights: [
      "Fast trains to London Euston in around 35 minutes",
      "Modern, spacious new-build homes with parking and green space",
      "Major employment and logistics hub with strong professional demand",
      "Excellent value per square foot versus London and the South East",
    ],
    faqs: [
      { q: "Why do commuters choose Milton Keynes?", a: "Milton Keynes offers fast 35-minute trains to London Euston, modern spacious homes, abundant parking and green space, so it appeals to commuters who want more room for their money." },
      { q: "Which areas of Milton Keynes are best to rent in?", a: "Central Milton Keynes suits professionals wanting apartments near the station and shopping, Caldecotte and Furzton are popular with families, and Stony Stratford and Newport Pagnell offer characterful town living." },
      { q: "Are Milton Keynes rentals good value?", a: "Yes — renters typically get newer, larger homes with parking for less than equivalent London or Home Counties properties, which is a key part of the city's appeal." },
    ],
  },
  {
    slug: "norwich",
    city: "Norwich",
    region: "England",
    heroTagline:
      "Premium Norwich rentals from the historic Golden Triangle to riverside apartments — verified East Anglia landlords and a transparent letting process.",
    avgRent: "£1,050",
    listingCount: 80,
    popularAreas: ["Golden Triangle", "Thorpe Hamlet", "City Centre", "Eaton", "Mousehold", "Norwich Over the Water", "Cringleford", "Unthank Road"],
    highlights: [
      "Historic, walkable city with a strong independent culture",
      "The Golden Triangle prized by professionals and postgraduates",
      "Demand from UEA, the Norfolk & Norwich Hospital and Norwich Research Park",
      "Excellent value with a high quality of life in East Anglia",
    ],
    faqs: [
      { q: "What is Norwich's Golden Triangle?", a: "The Golden Triangle is the area roughly between Unthank Road, Newmarket Road and Earlham Road — Norwich's most popular rental district, full of Victorian terraces, cafés and a short walk to the city centre." },
      { q: "Is Norwich a good city to rent in?", a: "Yes — Norwich combines an attractive historic centre, strong employment from the hospital, UEA and research park, and good value rents, making it popular with professionals and families." },
      { q: "How well connected is Norwich?", a: "Norwich has direct trains to London Liverpool Street in under two hours and its own international airport, though it remains a more self-contained East Anglian city than a London commuter town." },
    ],
  },
  {
    slug: "derby",
    city: "Derby",
    region: "England",
    heroTagline:
      "Find premium Derby rentals from Darley Abbey to the Cathedral Quarter — verified East Midlands landlords in a leading UK engineering city.",
    avgRent: "£950",
    listingCount: 80,
    popularAreas: ["Darley Abbey", "Littleover", "Mickleover", "Allestree", "Cathedral Quarter", "Chaddesden", "Spondon", "Oakwood"],
    highlights: [
      "Major engineering and aerospace employment base",
      "Highly affordable rents with quick access to the Peak District",
      "Sought-after family suburbs in Allestree, Littleover and Mickleover",
      "Central location with fast rail to Birmingham, Nottingham and London",
    ],
    faqs: [
      { q: "Where are the best areas to rent in Derby?", a: "Darley Abbey and Allestree are among the most desirable for professionals and families, Littleover and Mickleover are popular leafy suburbs, and the Cathedral Quarter offers central city-living apartments." },
      { q: "Is Derby affordable for renters?", a: "Very — Derby is one of the more affordable cities in England, offering spacious homes well below the national city average while hosting major employers in engineering and aerospace." },
      { q: "Is Derby close to the Peak District?", a: "Yes — Derby sits right on the southern edge of the Peak District National Park, making it popular with renters who want city employment alongside quick access to the countryside." },
    ],
  },
];
