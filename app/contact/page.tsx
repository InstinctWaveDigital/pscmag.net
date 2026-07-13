import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Africa Procurement and Supply Chain Mag — story tips, advertising and general enquiries.",
  alternates: { canonical: "/contact" },
};

const OFFICES = [
  { city: "Lagos", desc: "Head office & commercial team", detail: "Victoria Island, Lagos, Nigeria" },
  { city: "Nairobi", desc: "East Africa bureau", detail: "Westlands, Nairobi, Kenya" },
  { city: "Accra", desc: "West Africa bureau & events", detail: "Airport City, Accra, Ghana" },
];

export default function ContactPage() {
  return (
    <>
      <div className="border-b border-line-200 bg-white py-14">
        <div className="container-x">
          <nav className="mb-3 flex flex-wrap gap-2 font-mono text-xs text-ink-300"><Link href="/" className="hover:text-blue-700 hover:underline">Home</Link><span>/</span><span aria-current="page">Contact</span></nav>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Get in touch</h1>
          <p className="mt-4 max-w-[65ch] text-lg text-ink-500">
            Story tip, advertising enquiry, or interested in writing for us? Tell us a bit
            more below and the right desk will get back to you.
          </p>
        </div>
      </div>

      <section className="py-14">
        <div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div id="write">
            <h2 className="mb-6 text-2xl font-bold">Send us a message</h2>
            <ContactForm />
          </div>

          <div className="flex flex-col gap-8">
            <div id="tips" className="sidebar-box">
              <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-red-600">Submit A Tip</h3>
              <p className="text-sm text-ink-500">
                Have a story about procurement fraud, a supply chain disruption, or a
                policy change we should be covering? Use the form and select
                &ldquo;Story tip&rdquo; — sensitive tips are handled by our editorial
                desk only.
              </p>
            </div>
            <div className="sidebar-box">
              <h3 className="mb-4 font-mono text-xs uppercase tracking-wider text-red-600">Our Offices</h3>
              <ul className="flex flex-col gap-4">
                {OFFICES.map((o) => (
                  <li key={o.city} className="border-b border-line-200 pb-4 last:border-0 last:pb-0">
                    <div className="font-semibold">{o.city}</div>
                    <div className="text-sm text-ink-500">{o.desc}</div>
                    <div className="text-sm text-ink-300">{o.detail}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}