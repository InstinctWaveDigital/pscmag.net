import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import Ticker from "@/components/Ticker";
import NewsletterSection from "@/components/NewsletterSection";
import { ARTICLES, CATEGORIES, formatDate, getFeatured, SITE } from "@/lib/data";

export const unstable_instant = false;

export const metadata: Metadata = {
  title: "Trade Press for Procurement & Supply Chain Leaders",
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const feats = getFeatured();
  const heroMain = feats[0];
  const heroSide = [...feats.slice(1), ...ARTICLES.filter((a) => !feats.includes(a))].slice(0, 3);

  const excludeIds = new Set([heroMain.id, ...heroSide.map((a) => a.id)]);
  const latestGrid = ARTICLES.filter((a) => !excludeIds.has(a.id)).slice(0, 4);
  latestGrid.forEach((a) => excludeIds.add(a.id));

  const awardsArticles = ARTICLES.filter((a) => a.category === "Awards & Events").slice(0, 3);
  awardsArticles.forEach((a) => excludeIds.add(a.id));

  const editorsPicks = ARTICLES.filter((a) => !excludeIds.has(a.id)).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="hero-watermark relative overflow-hidden bg-ink-900 text-white">
        <div className="container-x relative z-10 py-14 sm:py-20">
          <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
            <div className="flex flex-col gap-4">
              <span className="manifest on-dark w-fit">
                Featured &middot; {heroMain.dateline}
              </span>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                <Link href={`/article/${heroMain.id}`} className="transition-colors hover:text-[#EBD9B0]">
                  {heroMain.title}
                </Link>
              </h1>
              <p className="max-w-[60ch] text-lg text-[#C7CBE0]">{heroMain.excerpt}</p>
              <p className="flex flex-wrap gap-4 font-mono text-[0.78rem] text-[#9AA0C2]">
                <span>{heroMain.author}</span>
                <span>{formatDate(heroMain.date)}</span>
                <span>{heroMain.readTime}</span>
              </p>
              <div>
                <Link href={`/article/${heroMain.id}`} className="btn btn-outline-light">
                  Read the full story
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-5 border-t border-white/15 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-white">
                Also making headlines
              </h2>
              {heroSide.map((a) => (
                <div key={a.id} className="flex flex-col gap-1.5 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <span className="manifest on-dark w-fit">
                    {a.dateline} &middot; {a.category}
                  </span>
                  <Link href={`/article/${a.id}`} className="font-display text-lg font-bold hover:text-[#EBD9B0]">
                    {a.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Ticker items={ARTICLES.slice(0, 8)} />

      {/* Categories */}
      <section className="bg-paper-100 py-14">
        <div className="container-x">
          <div className="section-head">
            <div>
              <span className="eyebrow">Browse</span>
              <h2 className="text-3xl">Sections</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} className="card">
                <div className="card__art relative">
                  <Image src={`/images/${c.art}.svg`} alt="" fill sizes="33vw" className="object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold">{c.name}</h3>
                  <p className="mt-1 text-sm text-ink-500">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest */}
      <section className="py-14">
        <div className="container-x">
          <div className="section-head">
            <div>
              <span className="eyebrow">Just In</span>
              <h2 className="text-3xl">Latest Stories</h2>
            </div>
            <Link href="/category/procurement" className="flex items-center gap-1 font-semibold text-blue-700 hover:underline">
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {latestGrid.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>

      {/* Awards dark section */}
      <section className="bg-ink-900 py-14 text-white">
        <div className="container-x">
          <div className="section-head !border-white/25">
            <div>
              <span className="eyebrow">On Our Stage</span>
              <h2 className="text-3xl text-white">Awards &amp; Events</h2>
            </div>
            <Link href="/category/awards-and-events" className="flex items-center gap-1 font-semibold text-[#EBD9B0] hover:underline">
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {awardsArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>

      {/* Editors picks */}
      <section className="py-14">
        <div className="container-x">
          <div className="section-head">
            <div>
              <span className="eyebrow">Deep Dives</span>
              <h2 className="text-3xl">Editors&rsquo; Picks</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {editorsPicks.map((a) => (
              <ArticleCard key={a.id} article={a} variant="row" />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-paper-100 py-14">
        <div className="container-x">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              ["54", "Countries covered across our procurement & trade desks"],
              ["120K+", "Monthly readers among supply chain decision-makers"],
              ["6", "Annual awards programmes reported on and hosted"],
              ["300+", "Procurement & logistics leaders profiled since launch"],
            ].map(([num, label]) => (
              <div key={label} className="border-t-[3px] border-red-600 pt-4 text-left">
                <span className="block font-display text-4xl font-black text-blue-700">{num}</span>
                <span className="text-sm text-ink-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NewsletterSection />
    </>
  );
}