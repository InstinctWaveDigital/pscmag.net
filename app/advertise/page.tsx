import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Advertise",
  description: "Advertise with Africa Procurement and Supply Chain Mag. Display, sponsored features and awards partnerships reaching 120,000+ monthly readers.",
  alternates: { canonical: "/advertise" },
};

const TIERS = [
  {
    name: "Display",
    price: "From $450/mo",
    desc: "Run-of-site banner placements across desktop and mobile, targeted by section.",
    features: ["Homepage & category placements", "Standard IAB ad sizes", "Monthly performance report"],
  },
  {
    name: "Sponsored Feature",
    price: "From $1,200",
    desc: "A dedicated editorial-style feature, written with our desk and clearly labelled as sponsored.",
    features: ["1,200–1,800 word feature", "Distributed via newsletter", "30 days homepage promotion"],
  },
  {
    name: "Awards Partnership",
    price: "Custom",
    desc: "Category sponsorship across our annual awards programmes, with gala visibility.",
    features: ["Logo on category & stage", "Speaking slot at gala", "Year-round brand association"],
  },
];

export default function AdvertisePage() {
  return (
    <>
      <div className="border-b border-line-200 bg-white py-14">
        <div className="container-x">
          <nav className="mb-3 flex flex-wrap gap-2 font-mono text-xs text-ink-300"><Link href="/" className="hover:text-blue-700 hover:underline">Home</Link><span>/</span><span aria-current="page">Advertise</span></nav>
          <span className="manifest is-gold">Media Kit 2026</span>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Reach the people who make procurement decisions</h1>
          <p className="mt-4 max-w-[70ch] text-lg text-ink-500">
            Put your brand in front of 120,000+ monthly readers — procurement heads,
            logistics operators and supply chain executives across 54 African markets.
          </p>
        </div>
      </div>

      <section className="bg-paper-100 py-14">
        <div className="container-x grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[["120K+", "Monthly readers"], ["68%", "Reader base at director level or above"], ["54", "Countries in our readership"], ["42K", "Weekly newsletter subscribers"]].map(([num, label]) => (
            <div key={label} className="border-t-[3px] border-red-600 pt-4">
              <span className="block font-display text-4xl font-black text-blue-700">{num}</span>
              <span className="text-sm text-ink-500">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-14" id="media-kit">
        <div className="container-x">
          <div className="section-head"><div><span className="eyebrow">Packages</span><h2 className="text-3xl">Advertising &amp; Partnerships</h2></div></div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {TIERS.map((t) => (
              <div key={t.name} className="card">
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <span className="manifest is-blue w-fit">{t.price}</span>
                  <h3 className="font-display text-xl font-bold">{t.name}</h3>
                  <p className="text-sm text-ink-500">{t.desc}</p>
                  <ul className="mt-1 flex flex-col gap-2">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0C1F8F" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-none"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact#write" className="btn btn-primary btn-block mt-auto">Request media kit</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-900 py-14 text-white">
        <div className="container-x grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-[#EBD9B0]">Who You&apos;ll Reach</span>
            <h2 className="mb-4 text-3xl font-bold">Our readers hold the budget</h2>
            <p className="leading-relaxed text-[#C7CBE0]">
              More than two-thirds of our audience sit at director level or above in
              procurement, logistics or supply chain functions — the people who approve
              vendor contracts, sponsor awards categories, and set technology budgets.
            </p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/5 p-5">
            <strong className="text-white">Request the full media kit</strong>
            <p className="mt-1 text-sm text-[#B9BDD4]">
              Rate card, audience breakdown by country and seniority, and available
              inventory calendar.
            </p>
            <Link href="/contact#write" className="btn btn-outline-light mt-4">Get the media kit &rarr;</Link>
          </div>
        </div>
      </section>
    </>
  );
}