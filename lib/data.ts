export type ArticleArt =
    | "procurement"
    | "logistics"
    | "policy"
    | "awards"
    | "technology"
    | "leadership"
    | "featured";

export interface Article {
    id: string;
    category: string;
    art: ArticleArt;
    title: string;
    excerpt: string;
    author: string;
    role: string;
    date: string; // ISO
    readTime: string;
    dateline: string;
    featured?: boolean;
    tags: string[];
    body: string[];
}

export interface Category {
    name: string;
    slug: string;
    art: ArticleArt;
    desc: string;
}

export const CATEGORIES: Category[] = [
    {
        name: "Procurement & Governance",
        slug: "procurement-and-governance",
        art: "procurement",
        desc: "Sourcing strategy, supplier management and category best practice.",
    },
    {
        name: "Logistics & Supply Chain",
        slug: "logistics-and-supply-chain",
        art: "logistics",
        desc: "Ports, freight forwarding, warehousing and last-mile distribution.",
    },
    {
        name: "Trade Policy",
        slug: "trade-policy",
        art: "policy",
        desc: "AfCFTA, customs reform and the regulation shaping cross-border trade.",
    },
    {
        name: "Events",
        slug: "events",
        art: "awards",
        desc: "Conferences, awards and networking opportunities for procurement and supply chain professionals.",
    },
    {
        name: "Features & Interviews",
        slug: "features-and-interviews",
        art: "leadership",
        desc: "In-depth interviews and feature stories with procurement and supply chain leaders across Africa.",
    },
];

export const ARTICLES: Article[] = [
    {
        id: "customs-single-window-2026",
        category: "Trade Policy",
        art: "policy",
        title:
            "Inside the Single Window Push: What 2026 Customs Reform Means for Cross-Border Traders",
        excerpt:
            "A continent-wide drive to digitise customs clearance promises to cut border wait times from days to hours — but implementation gaps remain wide between member states.",
        author: "Ngozi Adeyemi",
        role: "Trade Policy Editor",
        date: "2026-06-28",
        readTime: "7 min read",
        dateline: "ABUJA",
        featured: true,
        tags: ["Customs", "AfCFTA", "Digitisation", "Border Trade"],
        body: [
            "For years, clearing a container at some of the continent's busiest land borders has meant queuing behind a stack of paper forms, three separate agency stamps, and a customs officer working from a system that doesn't talk to the one next door. That is, on paper, about to change.",
            "A wave of Single Window reforms rolling out through 2026 aims to let traders submit one electronic declaration that reaches customs, port health, standards agencies and revenue authorities simultaneously. Pilot corridors in West and East Africa have already reported clearance times falling from an average of four days to under eighteen hours.",
            "\u201cThe technology was never really the hard part,\u201d says one customs modernisation adviser who has worked on rollouts in three countries. \u201cThe hard part is getting five agencies that don't report to each other to agree on a shared data standard, and then to actually use it instead of asking for the paper copy anyway.\u201d",
            "That institutional friction is exactly what's slowing rollout in several member states, even as the technical infrastructure sits ready. Traders in landlocked economies, who absorb the compounding cost of delays at multiple borders on a single shipment, have been the loudest advocates for faster implementation.",
            "For procurement and logistics teams sourcing across the continent, the practical guidance for now is to build buffer time into cross-border lead times corridor by corridor, rather than assuming uniform reform. Where Single Window systems are live, early adopters report meaningful savings in demurrage and storage costs that justify the investment in updating internal customs documentation workflows.",
            "The bigger prize, trade officials argue, is interoperability between national Single Window platforms — allowing a declaration filed in one country to be recognised at the next border rather than re-filed from scratch. That level of integration remains at least two to three years out, but the direction of travel is no longer in question.",
        ],
    },
    {
        id: "port-congestion-lagos-mombasa",
        category: "Logistics & Freight",
        art: "logistics",
        title:
            "Lagos, Mombasa and the Cost of Congestion: Can Port Automation Catch Up to Cargo Growth?",
        excerpt:
            "Container volumes at Africa's busiest ports have grown faster than terminal capacity. Operators are betting on automation to close the gap.",
        author: "Kwame Boateng",
        role: "Logistics Correspondent",
        date: "2026-06-24",
        readTime: "6 min read",
        dateline: "MOMBASA",
        featured: true,
        tags: ["Ports", "Automation", "Freight"],
        body: [
            "Container throughput at the continent's top five ports has grown by double digits for three consecutive years, and terminal operators are the first to admit that berth capacity has not kept pace. The result, visible from the anchorage at both Lagos and Mombasa on any given week, is a queue of vessels waiting their turn.",
            "Automated stacking cranes and terminal operating systems that sequence truck arrivals by appointment are being pitched as the fix. Early deployments have cut average truck turnaround time inside the gate by close to 40%, according to terminal operators who have gone live with appointment-based gate systems this year.",
            "But automation alone doesn't solve a queue that starts well before the ship reaches the breakwater. Dredging constraints, limited yard space, and inland transport bottlenecks — particularly rail links that are underused relative to their capacity — all compound the delay that shippers ultimately absorb as demurrage.",
            "\u201cWe've automated the parts of the terminal we could automate quickly,\u201d one port operations director told this publication. \u201cThe next phase is harder because it means coordinating with rail operators and customs on a shared release schedule, not just moving boxes faster inside our own fence line.\u201d",
            "For shippers, the near-term takeaway is that port selection is increasingly a lead-time decision, not just a cost decision. Diverting volume to secondary ports with more available berth capacity is now a standard mitigation in freight forwarders' contingency planning, even where inland haulage costs run higher.",
            "Industry analysts expect the gap between cargo growth and terminal capacity to narrow gradually as automation investments mature, but caution that the next two to three years will likely see continued congestion at peak season unless inland logistics keep pace with what's happening dockside.",
        ],
    },
    {
        id: "apsca-2026-shortlist",
        category: "Awards & Events",
        art: "awards",
        title:
            "APSCA 2026 Shortlist Announced: 40 Procurement Leaders Redefining Africa's Supply Chains",
        excerpt:
            "From Casablanca to Cape Town, this year's Africa Procurement & Supply Chain Awards shortlist spans mining, FMCG, health logistics and public sector reform.",
        author: "Editorial Desk",
        role: "APSC Mag",
        date: "2026-06-30",
        readTime: "4 min read",
        dateline: "ACCRA",
        featured: true,
        tags: ["APSCA 2026", "Awards", "Recognition"],
        body: [
            "The judging panel for the 2026 Africa Procurement & Supply Chain Awards has released its shortlist, narrowing a field of more than 400 nominations down to 40 finalists across twelve categories, ranging from Public Sector Procurement Leader of the Year to Rising Star in Supply Chain.",
            "This year's shortlist skews notably younger than in previous editions, with a third of finalists under 40, and reflects a broader shift in the profession toward practitioners who combine traditional sourcing expertise with data and sustainability credentials.",
            "Mining and extractives remain well represented, alongside a growing cohort from health logistics — a category the judging panel expanded this year in recognition of the sector's outsized role in cold chain and last-mile distribution innovation across the continent.",
            "\u201cWhat stood out this cycle wasn't any single sector,\u201d said the panel's lead judge, \u201cit was how many finalists could point to a measurable cost or resilience outcome, not just a process improvement. That's the bar we wanted to raise.\u201d",
            "Winners will be announced at the awards gala later this year, with categories judged on a combination of quantitative submission data and a live panel interview for the top three in each category.",
            "The full shortlist, judging criteria and ticket information for the gala are available through the Awards & Events section of this site.",
        ],
    },
    {
        id: "esg-supplier-scorecards",
        category: "Procurement",
        art: "procurement",
        title:
            "Why More African Enterprises Are Building ESG Clauses Into Supplier Scorecards",
        excerpt:
            "Buyers are moving beyond price and lead time, weighting supplier scorecards toward carbon disclosure, labour practice and local content.",
        author: "Aisha Bello",
        role: "Senior Reporter, Procurement",
        date: "2026-06-20",
        readTime: "5 min read",
        dateline: "NAIROBI",
        tags: ["ESG", "Sourcing", "Compliance"],
        body: [
            "Procurement scorecards that once weighted almost entirely on price and delivery reliability are being rewritten. A growing number of large African enterprises, particularly those exporting into the EU and increasingly the UK, are adding formal ESG criteria that can account for up to a quarter of a supplier's total score.",
            "The shift is being driven from two directions at once: multinational buyers passing disclosure requirements down their African supply base, and domestic regulators beginning to signal interest in mandatory sustainability reporting for large enterprises.",
            "For suppliers, particularly SMEs, the requirements can be daunting without support. Several anchor buyers have responded by offering supplier development programmes that pair financing access with basic ESG data collection training, rather than simply excluding suppliers who can't yet report.",
            "\u201cWe didn't want a scorecard that just filtered out our existing supply base overnight,\u201d said one group head of procurement at a Nairobi-based manufacturer. \u201cThe goal is to bring suppliers along, not just tick a compliance box.\u201d",
            "Labour practice and local content weighting have proven the least controversial additions, aligning with existing local content policy in several jurisdictions. Carbon disclosure remains the hardest for smaller suppliers to satisfy, given the cost of measurement and verification.",
            "Procurement leaders interviewed for this piece were broadly aligned that ESG-weighted scorecards are now a permanent fixture rather than a passing compliance trend, with several predicting the weighting will increase further over the next two award cycles.",
        ],
    },
    {
        id: "digital-twin-warehousing",
        category: "Technology & Digital Supply Chain",
        art: "technology",
        title:
            "Digital Twins Move From Pilot to Production in East African Warehousing",
        excerpt:
            "Three regional 3PLs have gone live with digital twin platforms this quarter, citing double-digit gains in pick accuracy and space utilisation.",
        author: "Daniel Mwangi",
        role: "Technology Correspondent",
        date: "2026-06-18",
        readTime: "6 min read",
        dateline: "NAIROBI",
        tags: ["Digital Twin", "Warehousing", "IoT"],
        body: [
            "Digital twin technology — a live virtual model of a physical warehouse, fed by sensor and inventory data — has moved from vendor demo to production floor at three third-party logistics providers operating across East Africa this quarter.",
            "Early results are encouraging operators to expand the rollout: one Nairobi-based 3PL reports a 22% improvement in pick accuracy and a 15% gain in usable storage density after re-slotting its layout based on twin-simulated flow data, rather than static rules of thumb.",
            "The barrier to entry has historically been sensor cost and connectivity reliability in warehouse environments with inconsistent power. Falling hardware costs and more resilient edge-computing setups have narrowed that gap considerably over the past eighteen months.",
            "\u201cThe simulation lets us test a re-layout in software before we touch a single rack,\u201d said one operations manager. \u201cWe used to learn what didn't work by living with it for six months.\u201d",
            "Vendors serving the region say demand is now coming as much from mid-sized regional distributors as from multinational-backed operators, a signal that the technology is moving down-market faster than initially expected.",
            "Whether the trend holds through a full peak season, when warehouse throughput is under the most strain, will be the real test — and one that operators interviewed for this piece say they're watching closely.",
        ],
    },
    {
        id: "women-in-procurement-leadership",
        category: "Leadership & People",
        art: "leadership",
        title:
            "The Quiet Rise of Women in Procurement Leadership Across West Africa",
        excerpt:
            "A new survey of 300 procurement heads shows steady gains in female representation at director level — though the C-suite gap persists.",
        author: "Funmilayo Okafor",
        role: "People & Leadership Editor",
        date: "2026-06-15",
        readTime: "8 min read",
        dateline: "LAGOS",
        tags: ["Leadership", "Diversity", "Careers"],
        body: [
            "A survey of 300 procurement heads across West Africa, conducted this year by a regional professional body, found that women now hold 34% of director-level procurement roles — up from 22% five years ago. At C-suite level, the figure remains closer to 12%.",
            "The gains are most pronounced in FMCG and telecoms, sectors that several respondents credited with formal sponsorship programmes rather than general diversity statements. Mining and heavy industry lagged furthest behind, a pattern consistent with broader workforce composition in those sectors.",
            "\u201cSponsorship, not mentorship, made the difference for me,\u201d said one director-level respondent who asked not to be named. \u201cA mentor gives you advice. A sponsor puts your name forward for the role before you've asked for it.\u201d",
            "Several women interviewed pointed to procurement's increasingly cross-functional nature — spanning finance, sustainability and data analytics — as an opening that favours candidates who can operate across disciplines, a shift some believe has quietly worked in women's favour as the function's profile has risen.",
            "The persistent C-suite gap, respondents agreed, has less to do with a pipeline problem at this point and more to do with succession planning that still defaults to informal networks when boards fill chief procurement officer roles.",
            "Professional bodies surveyed for this piece are now pushing for standardised succession planning disclosure as a next step, arguing that visibility into how CPO roles are actually filled would do more than another decade of pipeline programmes alone.",
        ],
    },
    {
        id: "afcfta-local-content-rules",
        category: "Trade Policy",
        art: "policy",
        title: "AfCFTA Local Content Rules: A Practical Guide for Sourcing Teams",
        excerpt:
            "New rules of origin thresholds are reshaping how sourcing teams qualify suppliers for preferential tariff treatment across the bloc.",
        author: "Ngozi Adeyemi",
        role: "Trade Policy Editor",
        date: "2026-06-10",
        readTime: "9 min read",
        dateline: "ABUJA",
        tags: ["AfCFTA", "Rules of Origin", "Sourcing"],
        body: [
            "Sourcing teams qualifying suppliers for preferential tariff treatment under the African Continental Free Trade Area now face a more detailed set of rules of origin thresholds, phased in by product category over the course of this year.",
            "In practice, this means a supplier that previously qualified as a local content source under a blanket regional-value-content rule may now need to demonstrate compliance against a product-specific threshold — a change that has caught several sourcing teams off guard mid-contract.",
            "Sectors with the most complex phase-in include automotive components and processed agricultural goods, where cumulative sourcing across multiple member states is common and origin documentation has historically been inconsistent.",
            "\u201cThe rules themselves aren't unreasonable,\u201d said one trade compliance consultant advising manufacturers on the transition. \u201cThe problem is that a lot of supplier-side documentation simply wasn't built to this level of granularity, and catching up takes time.\u201d",
            "Practical guidance emerging from early compliance reviews: sourcing teams should audit existing supplier origin certificates against the updated product-specific schedules now, rather than waiting for a customs challenge to surface a gap.",
            "Trade bodies expect further clarifying guidance before the end of the year, but advise against waiting for full clarity before beginning supplier documentation reviews, given the lead time required to remediate gaps across a multi-tier supply base.",
        ],
    },
    {
        id: "cold-chain-vaccine-logistics",
        category: "Logistics & Freight",
        art: "logistics",
        title:
            "Cold Chain Under Pressure: Lessons From the Last Vaccine Rollout for Food Logistics Now",
        excerpt:
            "Cold chain infrastructure built for health emergencies is finding a second life moving perishable exports — if funding gaps can be closed.",
        author: "Kwame Boateng",
        role: "Logistics Correspondent",
        date: "2026-06-06",
        readTime: "6 min read",
        dateline: "ACCRA",
        tags: ["Cold Chain", "Agri-Export", "Infrastructure"],
        body: [
            "Cold storage and last-mile refrigerated transport capacity built out during recent public health emergencies is increasingly being repurposed for commercial use, particularly in perishable agricultural export corridors.",
            "Operators who invested in temperature-controlled infrastructure for vaccine distribution say the underlying assets — refrigerated trucking fleets, solar-powered cold rooms in off-grid areas — transfer directly to horticultural and seafood export logistics, with utilisation now split roughly evenly between the two use cases.",
            "The financing gap that remains is less about the core infrastructure and more about last-mile aggregation: getting produce from smallholder farms to a cold chain entry point fast enough to preserve shelf life, a problem health logistics networks solved differently because their entry points were fixed clinics rather than dispersed farms.",
            "\u201cThe cold room isn't the hard part anymore,\u201d one agri-logistics operator said. \u201cGetting a crate of produce to that cold room within four hours of harvest, at scale, across a rural network — that's still the unsolved problem.\u201d",
            "Development finance institutions that funded health cold chain buildout are now being approached to extend blended finance models to agricultural cold chain aggregation points, arguing the commercial case is stronger given recurring export revenue versus emergency-driven demand.",
            "Whether that financing materialises at the scale required will likely determine how much of this repurposed capacity becomes a durable part of the region's agri-export infrastructure rather than a temporary bridge.",
        ],
    },
    {
        id: "sme-supplier-financing",
        category: "Procurement",
        art: "procurement",
        title:
            "Closing the Financing Gap: How Anchor Buyers Are Backing SME Suppliers",
        excerpt:
            "Supply chain finance programmes tied to large anchor buyers are giving small suppliers access to working capital at rates banks won't offer.",
        author: "Aisha Bello",
        role: "Senior Reporter, Procurement",
        date: "2026-06-02",
        readTime: "5 min read",
        dateline: "JOHANNESBURG",
        tags: ["SME", "Supply Chain Finance", "Sourcing"],
        body: [
            "Supply chain finance programmes that let small suppliers borrow against confirmed purchase orders from a large anchor buyer, at rates tied to the buyer's credit rather than the supplier's own, have expanded sharply across the region over the past year.",
            "For SME suppliers who have historically faced working capital rates well above prime, the structures can cut financing costs by a significant margin — often the difference between accepting a large order and being unable to fund the inventory to fulfil it.",
            "Anchor buyers benefit too: several procurement heads interviewed said supply chain finance programmes have measurably improved on-time delivery from participating suppliers, who no longer face the cash flow squeeze that previously caused fulfilment delays.",
            "\u201cIt's not charity, it's risk management,\u201d said one group treasurer at a manufacturing group running such a programme. \u201cA supplier that can't fund the order is a supply chain risk to us, not just a problem for them.\u201d",
            "Rollout has concentrated so far among the largest anchor buyers with the balance sheet strength to underwrite the programmes, and among suppliers with digitised invoicing that can be verified quickly enough for financing decisions to clear within days rather than weeks.",
            "Extending similar structures down to smaller anchor buyers, and to suppliers still working from paper-based invoicing, is the next frontier — one that fintech providers serving the space say is now their primary product development focus.",
        ],
    },
    {
        id: "adea-2026-finalists",
        category: "Awards & Events",
        art: "awards",
        title: "ADEA 2026 Finalists Revealed Ahead of October Gala in Accra",
        excerpt:
            "The Africa Digital Economy Awards finalists include fintech, e-logistics and public-sector digitisation projects from 14 countries.",
        author: "Editorial Desk",
        role: "APSC Mag",
        date: "2026-05-29",
        readTime: "3 min read",
        dateline: "ACCRA",
        tags: ["ADEA 2026", "Digital Economy", "Awards"],
        body: [
            "Finalists for the 2026 Africa Digital Economy Awards have been confirmed ahead of October's gala in Accra, drawing entries from fourteen countries across categories spanning fintech, e-logistics platforms and public-sector digitisation initiatives.",
            "This year's judging criteria placed heavier weight on measurable adoption metrics rather than product ambition alone, a change organisers say was driven by feedback from last year's cycle.",
            "Public-sector digitisation entries were up sharply on the previous year, with several government revenue and procurement digitisation projects making the shortlist for the first time in the award's history.",
            "\u201cWe wanted finalists who could show us usage numbers, not just a polished demo,\u201d said the awards' programme director. \u201cThat shifted who made the cut this year.\u201d",
            "Tickets and the full finalist list, organised by category, are available through the Awards & Events section of this site, alongside coverage of the shortlisted projects as the gala approaches.",
        ],
    },
    {
        id: "ai-demand-forecasting-fmcg",
        category: "Technology & Digital Supply Chain",
        art: "technology",
        title:
            "FMCG Distributors Turn to AI Demand Forecasting to Tame Stockouts",
        excerpt:
            "Machine-learning forecasting models are cutting stockout rates by up to 30% for distributors navigating volatile last-mile demand.",
        author: "Daniel Mwangi",
        role: "Technology Correspondent",
        date: "2026-05-24",
        readTime: "7 min read",
        dateline: "LAGOS",
        tags: ["AI", "Forecasting", "FMCG"],
        body: [
            "Demand forecasting for fast-moving consumer goods has long been a weak point for distributors navigating fragmented informal retail networks, where point-of-sale data is thin and demand swings sharply with local events, weather and cash flow cycles.",
            "Machine-learning models trained on a wider mix of signals — mobile money transaction volume, weather data, and even social media activity around promotions — are now being deployed by several large distributors, with reported stockout reductions of up to 30% in pilot regions.",
            "The models don't replace the informal-market intuition that experienced route sales reps have built over years; rather, distributors say the more effective deployments combine the model's output with rep-level override capability, rather than trusting the forecast blindly.",
            "\u201cThe model gets us 80% of the way there in areas with decent data density,\u201d said one distributor's supply chain lead. \u201cThe reps close the last 20%, especially in markets where we just don't have enough historical data yet.\u201d",
            "Cost of deployment has fallen enough that mid-sized regional distributors, not just multinational-backed operators, are now piloting similar tools — several vendors interviewed for this piece cited demand from this segment as their fastest-growing customer base.",
            "The next challenge, distributors say, is extending the same forecasting discipline upstream to their own suppliers, so that improved demand visibility doesn't stop at the distribution centre door.",
        ],
    },
    {
        id: "finance-40-under-40-preview",
        category: "Leadership & People",
        art: "leadership",
        title:
            "Meet the Finance 40 Under 40: The Dealmakers Shaping Africa's Capital Markets",
        excerpt:
            "Ahead of the August conference in Lagos, we profile the young finance leaders driving cross-border investment into infrastructure and trade.",
        author: "Funmilayo Okafor",
        role: "People & Leadership Editor",
        date: "2026-05-20",
        readTime: "6 min read",
        dateline: "LAGOS",
        tags: ["Finance", "Leadership", "Conference"],
        body: [
            "Ahead of August's Finance 40 Under 40 conference in Lagos, this year's honourees skew heavily toward professionals working at the intersection of infrastructure finance and cross-border trade — a shift from previous cohorts weighted more toward traditional investment banking.",
            "Several honourees have led or structured deals connecting institutional capital, including pension funds and development finance institutions, to logistics and warehousing assets — a sector that a decade ago would rarely have featured on a finance leadership list.",
            "\u201cThe interesting deals right now aren't the ones everyone's chasing in fintech,\u201d said one honouree structuring infrastructure debt. \u201cThey're in the unglamorous assets — ports, warehouses, cold chain — that actually move the real economy.\u201d",
            "The conference programme this year adds a dedicated trade finance track for the first time, reflecting organiser interest in the growing overlap between the honouree cohort's deal focus and the continent's broader supply chain financing gap.",
            "Full honouree profiles, session schedules and registration details for the August conference are available through the Awards & Events section of this site.",
        ],
    },
    {
        id: "regional-warehousing-reits",
        category: "Logistics & Freight",
        art: "logistics",
        title:
            "Institutional Capital Eyes Africa's Warehousing Gap Through New REIT Structures",
        excerpt:
            "Pension funds and REITs are edging into Grade-A logistics real estate as e-commerce and manufacturing push demand for modern warehousing.",
        author: "Kwame Boateng",
        role: "Logistics Correspondent",
        date: "2026-05-14",
        readTime: "5 min read",
        dateline: "CASABLANCA",
        tags: ["Real Estate", "Warehousing", "Investment"],
        body: [
            "Grade-A logistics warehousing remains scarce across most major African metros, and a handful of newly structured REITs are positioning to close the gap with institutional capital that has historically avoided the asset class due to limited stock and unclear title.",
            "Demand drivers are consistent across the markets these vehicles are targeting: e-commerce fulfilment operators need modern, higher-eaves space near urban centres, while manufacturers reshoring parts of their supply base need warehousing closer to production rather than reliant on long-haul inland transport.",
            "\u201cFive years ago, institutional investors wouldn't look at logistics real estate here because there wasn't enough stabilised, income-producing stock to underwrite,\u201d said one fund manager involved in structuring a recent vehicle. \u201cNow there's a track record, which changes the conversation.\u201d",
            "Land title clarity and construction financing remain the binding constraints on new supply in most markets, rather than tenant demand, which fund managers interviewed for this piece described as consistently outstripping available space in prime locations.",
            "Pension fund allocators, under pressure to diversify beyond government securities and listed equities, are cited by multiple fund managers as the most active new source of capital in the space, with several African pension regulators having eased allocation limits for real assets in recent policy updates.",
        ],
    },
    {
        id: "procurement-fraud-controls",
        category: "Procurement",
        art: "procurement",
        title:
            "Beyond the Audit Trail: Building Fraud Controls Into Procurement Workflows",
        excerpt:
            "Procurement fraud costs African public institutions an estimated billions annually. Practitioners share the controls that actually move the needle.",
        author: "Aisha Bello",
        role: "Senior Reporter, Procurement",
        date: "2026-05-08",
        readTime: "8 min read",
        dateline: "PRETORIA",
        tags: ["Fraud Controls", "Compliance", "Public Sector"],
        body: [
            "Procurement fraud in the public sector rarely announces itself as fraud. It arrives as a bid specification narrowly written to favour one vendor, or a change order approved a level below where policy says it should be, or a vendor list that hasn't been refreshed in years.",
            "Practitioners interviewed for this piece were consistent on one point: after-the-fact audit trails catch fraud that has already happened, but rarely prevent it. The controls that actually move the needle sit earlier in the workflow — at specification and approval stage, not reconciliation stage.",
            "Segregation of duties between whoever writes a specification and whoever approves the award remains the single most cited control, followed closely by mandatory vendor rotation review and blind scoring of technical bids before commercial terms are visible to evaluators.",
            "\u201cThe fraud we catch in audit is embarrassing,\u201d said one internal audit lead at a state-owned enterprise. \u201cThe fraud we prevent at specification stage, nobody ever hears about, which is exactly the point.\u201d",
            "Digitised procurement platforms with built-in approval workflows are making some of these controls easier to enforce systematically rather than relying on individual diligence, though practitioners caution that a digital workflow with weak underlying policy simply digitises the loophole rather than closing it.",
            "The consistent recommendation across practitioners interviewed: treat fraud control as a design question for the procurement process itself, not a monitoring question to be solved after the process is already in motion.",
        ],
    },
    {
        id: "marketing-world-awards-recap",
        category: "Awards & Events",
        art: "awards",
        title:
            "Marketing World Awards Recap: The Campaigns Judges Couldn't Stop Talking About",
        excerpt:
            "From FMCG activations to fintech brand launches, we break down the winning campaigns and what procurement teams can learn from agency sourcing.",
        author: "Editorial Desk",
        role: "APSC Mag",
        date: "2026-04-30",
        readTime: "4 min read",
        dateline: "LAGOS",
        tags: ["Marketing World Awards", "Campaigns"],
        body: [
            "This year's Marketing World Awards drew entries from agencies and in-house brand teams across the continent, with the judging panel singling out campaigns that paired strong creative with disciplined media buying — a combination judges said was rarer than expected among this year's entries.",
            "For procurement teams reading beyond the creative headlines, the agency sourcing stories behind several winning campaigns are arguably the more useful takeaway: multiple winners credited structured agency roster reviews and clearer scope-of-work documentation for improving both cost and creative output.",
            "\u201cWe used to brief three agencies the same way and hope one came back with something great,\u201d said one brand lead whose campaign took a top category award. \u201cChanging how we sourced and briefed made more difference than any single creative idea.\u201d",
            "Full winners list, category breakdowns and behind-the-scenes coverage of the shortlisted campaigns are available through the Awards & Events section of this site.",
        ],
    },
];

export function formatDate(iso: string): string {
    const d = new Date(iso + "T00:00:00Z");
    return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}

export function initials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export function getArtUrl(art: string): string {
    if (!art) return "/images/procurement.svg";
    if (art.startsWith("/") || art.startsWith("http://") || art.startsWith("https://")) {
        return art;
    }
    return `/images/${art}.svg`;
}

export function slugifyCategory(name: string): string {
    return name
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export function getArticleById(id: string): Article | undefined {
    return ARTICLES.find((a) => a.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
    return CATEGORIES.find((c) => c.slug === slug);
}

export function getArticlesByCategory(categoryName: string): Article[] {
    return ARTICLES.filter((a) => a.category === categoryName);
}

export function getFeatured(): Article[] {
    return ARTICLES.filter((a) => a.featured);
}

export function getRelated(article: Article, n = 3): Article[] {
    const sameCat = ARTICLES.filter(
        (a) => a.category === article.category && a.id !== article.id
    );
    const others = ARTICLES.filter(
        (a) => a.id !== article.id && !sameCat.includes(a)
    );
    return [...sameCat, ...others].slice(0, n);
}

export const SITE = {
    name: "Africa Procurement and Supply Chain Mag",
    shortName: "APSC Mag",
    description:
        "The continent's trade press for procurement, logistics and supply chain leaders — covering policy, technology, awards and the people shaping how Africa moves goods and does business.",
    url: "https://www.oscmag.net",
    twitter: "@",
    locale: "en_US",
};