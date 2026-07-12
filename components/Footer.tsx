import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink-900 text-[#B9BDD4]">
      <div className="container-x border-b border-white/10 py-14">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Image
              src="/assets/logo-white.png"
              alt="Africa Procurement and Supply Chain Mag"
              width={140}
              height={40}
              className="mb-4 h-9 w-auto"
            />
            <p className="max-w-[36ch] text-sm text-[#9AA0C2]">
              The continent&apos;s trade press for procurement, logistics and
              supply chain leaders — covering the policy, technology and
              people shaping how Africa moves goods and does business.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                {
                  label: "LinkedIn",
                  href: "https://linkedin.com",
                  path: "M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-6.9c0-1.65-.03-3.77-2.3-3.77-2.3 0-2.65 1.8-2.65 3.65V23h-4V8z",
                },
                {
                  label: "X",
                  href: "https://x.com",
                  path: "M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.6L4.6 22H1.5l8.1-9.3L1 2h7l4.9 6L18.9 2zm-1.2 18h1.9L7.4 4H5.4l12.3 16z",
                },
                {
                  label: "Instagram",
                  href: "https://instagram.com",
                  path: "M12 2c2.7 0 3 0 4.1.06 1.1.05 1.8.2 2.4.45.7.27 1.2.6 1.7 1.1.5.5.9 1 1.1 1.7.24.6.4 1.3.45 2.4C21.94 9 22 9.3 22 12s0 3-.06 4.1c-.05 1.1-.2 1.8-.45 2.4a4.6 4.6 0 0 1-1.1 1.7 4.6 4.6 0 0 1-1.7 1.1c-.6.24-1.3.4-2.4.45-1.1.06-1.4.06-4.1.06s-3 0-4.1-.06c-1.1-.05-1.8-.2-2.4-.45a4.6 4.6 0 0 1-1.7-1.1 4.6 4.6 0 0 1-1.1-1.7c-.24-.6-.4-1.3-.45-2.4C2 15 2 14.7 2 12s0-3 .06-4.1c.05-1.1.2-1.8.45-2.4.24-.66.6-1.2 1.1-1.7.5-.5 1-.86 1.7-1.1.6-.24 1.3-.4 2.4-.45C9 2.06 9.3 2 12 2zm0 1.8c-2.65 0-2.96 0-4 .06-.96.04-1.48.2-1.83.33-.46.18-.79.4-1.13.74-.34.34-.56.67-.74 1.13-.13.35-.29.87-.33 1.83-.05 1.04-.06 1.35-.06 4s0 2.96.06 4c.04.96.2 1.48.33 1.83.18.46.4.79.74 1.13.34.34.67.56 1.13.74.35.13.87.29 1.83.33 1.04.05 1.35.06 4 .06s2.96 0 4-.06c.96-.04 1.48-.2 1.83-.33.46-.18.79-.4 1.13-.74.34-.34.56-.67.74-1.13.13-.35.29-.87.33-1.83.05-1.04.06-1.35.06-4s0-2.96-.06-4c-.04-.96-.2-1.48-.33-1.83a3 3 0 0 0-.74-1.13 3 3 0 0 0-1.13-.74c-.35-.13-.87-.29-1.83-.33-1.04-.05-1.35-.06-4-.06zm0 4.5a5.7 5.7 0 1 1 0 11.4 5.7 5.7 0 0 1 0-11.4zm0 1.8a3.9 3.9 0 1 0 0 7.8 3.9 3.9 0 0 0 0-7.8zm5.9-2a1.34 1.34 0 1 1-2.68 0 1.34 1.34 0 0 1 2.68 0z",
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={`Follow us on ${s.label}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 transition hover:bg-white/10"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Sections">
            <h3 className="mb-4 font-mono text-xs uppercase tracking-wider text-white">
              Sections
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/category/procurement" className="hover:text-white hover:underline">
                  Procurement
                </Link>
              </li>
              <li>
                <Link href="/category/logistics-and-freight" className="hover:text-white hover:underline">
                  Logistics &amp; Freight
                </Link>
              </li>
              <li>
                <Link href="/category/trade-policy" className="hover:text-white hover:underline">
                  Trade Policy
                </Link>
              </li>
              <li>
                <Link href="/category/awards-and-events" className="hover:text-white hover:underline">
                  Awards &amp; Events
                </Link>
              </li>
              <li>
                <Link href="/category/technology-and-digital-supply-chain" className="hover:text-white hover:underline">
                  Technology
                </Link>
              </li>
              <li>
                <Link href="/category/leadership-and-people" className="hover:text-white hover:underline">
                  Leadership &amp; People
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className="mb-4 font-mono text-xs uppercase tracking-wider text-white">
              Company
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="hover:text-white hover:underline">
                  About the Mag
                </Link>
              </li>
              <li>
                <Link href="/about#team" className="hover:text-white hover:underline">
                  Editorial team
                </Link>
              </li>
              <li>
                <Link href="/about#careers" className="hover:text-white hover:underline">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="hover:text-white hover:underline">
                  Advertise
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:underline">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Resources">
            <h3 className="mb-4 font-mono text-xs uppercase tracking-wider text-white">
              Resources
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/#newsletter" className="hover:text-white hover:underline">
                  Newsletter
                </Link>
              </li>
              <li>
                <Link href="/contact#tips" className="hover:text-white hover:underline">
                  Submit a tip
                </Link>
              </li>
              <li>
                <Link href="/advertise#media-kit" className="hover:text-white hover:underline">
                  Media kit
                </Link>
              </li>
              <li>
                <Link href="/contact#write" className="hover:text-white hover:underline">
                  Write for us
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="container-x flex flex-wrap items-center justify-between gap-3 py-5 text-sm text-[#7F84A3]">
        <span>
          &copy; 2026 Africa Procurement and Supply
          Chain Mag. All rights reserved.
        </span>
        <span className="flex gap-5">
          <Link href="/privacy" className="hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms of Use
          </Link>
        </span>
      </div>
    </footer>
  );
}