import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Africa Procurement and Supply Chain Mag's mission, editorial team, and open roles.",
  alternates: { canonical: "/about" },
};

const TEAM = [
  { name: "Ngozi Adeyemi", role: "Trade Policy Editor", bio: "Covers AfCFTA, customs reform and cross-border regulation from Abuja." },
  { name: "Kwame Boateng", role: "Logistics Correspondent", bio: "Reports on ports, freight and warehousing infrastructure from Accra." },
  { name: "Aisha Bello", role: "Senior Reporter, Procurement", bio: "Writes on sourcing strategy, ESG and supplier finance from Nairobi." },
  { name: "Daniel Mwangi", role: "Technology Correspondent", bio: "Tracks AI, automation and digital supply chain tools from Nairobi." },
  { name: "Funmilayo Okafor", role: "People & Leadership Editor", bio: "Profiles the leaders and rising talent shaping the industry from Lagos." },
];

const ROLES = [
  { title: "Staff Reporter, Logistics & Freight", loc: "Lagos · Full-time", desc: "Cover ports, freight forwarding and warehousing across West Africa." },
  { title: "Events Producer, Awards & Events", loc: "Remote · Full-time", desc: "Help produce our annual awards galas and industry conferences." },
  { title: "Technology Correspondent", loc: "Nairobi · Full-time", desc: "Report on AI, automation and digitisation in East African supply chains." },
];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function AboutPage() {
  return (
    <>
      <div className="border-b border-line-200 bg-white py-14">
        <div className="container-x">
          <nav className="mb-3 flex flex-wrap gap-2 font-mono text-xs text-ink-300"><Link href="/" className="hover:text-blue-700 hover:underline">Home</Link><span>/</span><span aria-current="page">About</span></nav>
          <span className="manifest">Est. 2021 &middot; Pan-African</span>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
            The trade press for the people who move Africa&apos;s goods
          </h1>
          <p className="mt-4 max-w-[70ch] text-lg text-ink-500">
            {SITE.name} covers the policy, technology, deals and people shaping
            procurement, logistics and trade across the continent — and hosts
            the awards programmes that recognise the work.
          </p>
        </div>
      </div>

      <section className="py-14">
        <div className="container-x grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-red-600">Our Mission</span>
            <h2 className="mb-4 text-3xl font-bold">Reporting the supply chain story most outlets skip</h2>
            <p className="mb-4 leading-relaxed text-ink-700">
              Procurement and supply chain decisions rarely make headlines — until a port
              backs up, a border delays a shipment, or a supplier scandal breaks. We report
              the story before that point: the policy shift, the technology pilot, the
              leadership change that determines whether goods move efficiently across the
              continent.
            </p>
            <p className="leading-relaxed text-ink-700">
              Our newsroom is distributed across Lagos, Nairobi, Accra and Abuja, giving us
              reporting depth in the markets where procurement and logistics decisions are
              actually made.
            </p>
          </div>
          <div>
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-red-600">What We Cover</span>
            <ul className="flex flex-col gap-4">
              <li className="border-b border-line-200 pb-4"><strong>Procurement &amp; Sourcing</strong> &mdash; category strategy, supplier management, ESG and fraud controls.</li>
              <li className="border-b border-line-200 pb-4"><strong>Logistics &amp; Trade Policy</strong> &mdash; ports, freight, warehousing, AfCFTA and customs reform.</li>
              <li className="border-b border-line-200 pb-4"><strong>Technology</strong> &mdash; AI, automation and digitisation across the supply chain.</li>
              <li><strong>Awards &amp; Events</strong> &mdash; we report on, and host, the industry&apos;s leading recognition programmes.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-paper-100 py-14">
        <div className="container-x grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[["54", "Countries covered across our desks"], ["120K+", "Monthly readers among decision-makers"], ["6", "Annual awards programmes"], ["4", "Newsroom bureaus — Lagos, Nairobi, Accra, Abuja"]].map(([num, label]) => (
            <div key={label} className="border-t-[3px] border-red-600 pt-4">
              <span className="block font-display text-4xl font-black text-blue-700">{num}</span>
              <span className="text-sm text-ink-500">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-14" id="team">
        <div className="container-x">
          <div className="section-head"><div><span className="eyebrow">Meet The Desk</span><h2 className="text-3xl">Editorial Team</h2></div></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((t) => (
              <div key={t.name}>
                <div className="mb-4 flex aspect-square items-center justify-center rounded-lg bg-blue-700 font-display text-3xl font-black text-white">
                  {initials(t.name)}
                </div>
                <h3 className="text-lg font-bold">{t.name}</h3>
                <span className="font-mono text-xs uppercase tracking-wide text-red-600">{t.role}</span>
                <p className="mt-2 text-sm text-ink-500">{t.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}