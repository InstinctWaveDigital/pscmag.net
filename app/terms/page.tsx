import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for Africa Procurement and Supply Chain Mag.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="container-x max-w-[820px] py-14">
      <nav className="mb-3 flex flex-wrap gap-2 font-mono text-xs text-ink-300"><Link href="/" className="hover:text-blue-700 hover:underline">Home</Link><span>/</span><span aria-current="page">Terms of Use</span></nav>
      <h1 className="mb-6 text-4xl font-bold">Terms of Use</h1>
      <div className="flex flex-col gap-5 leading-relaxed text-ink-700">
        <p>Last updated: July 2026.</p>
        <p>
          By accessing this site, you agree to use it for lawful purposes only. Editorial
          content is provided for general information and does not constitute financial,
          legal or trade compliance advice. Always confirm regulatory requirements with a
          qualified professional or the relevant government agency.
        </p>
        <h2 className="mt-4 text-xl font-bold">Intellectual Property</h2>
        <p>All articles, illustrations and branding on this site are the property of Africa Procurement and Supply Chain Mag unless otherwise credited.</p>
        <h2 className="mt-4 text-xl font-bold">Contact</h2>
        <p>Questions about these terms can be sent via our <Link href="/contact" className="font-semibold text-blue-700 hover:underline">contact page</Link>.</p>
      </div>
    </div>
  );
}