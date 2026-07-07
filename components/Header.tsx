"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MobileNav from "./MobileNav";
import SearchOverlay from "./SearchOverlay";

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <a
        href="#main"
        className="skip-link"
      >
        Skip to main content
      </a>

      <div className="bg-ink-900 font-mono text-xs tracking-wide text-[#C7CBE0]">
        <div className="container-x flex h-9 items-center justify-between gap-4">
          <div className="flex items-center gap-5 overflow-hidden whitespace-nowrap">
            <span>Africa&apos;s Trade &amp; Supply Chain Press</span>
            <span className="hidden sm:inline">
              Lagos 31&deg;C &middot; Nairobi 22&deg;C &middot; Accra 29&deg;C
            </span>
          </div>
          <div className="flex gap-5">
            <Link href="/advertise" className="hover:text-white">
              Advertise
            </Link>
            <Link href="/about#careers" className="hidden hover:text-white sm:inline">
              Careers
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-[90] border-b border-line-200 bg-white">
        <div className="container-x flex items-center justify-between gap-5 py-4">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Africa Procurement and Supply Chain Mag — home"
          >
            <Image
              src="/assets/logo.png"
              alt="Africa Procurement and Supply Chain Mag logo"
              width={120}
              height={32}
              className="h-9 w-auto"
              priority
            />

          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="icon-btn"
              aria-label="Open search"
              onClick={() => setSearchOpen(true)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0B0E1A"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                width="20"
                height="20"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <Link
              href="/advertise"
              className="btn btn-outline hidden lg:inline-flex"
            >
              Advertise
            </Link>
            <Link href="/#newsletter" className="btn btn-primary hidden sm:inline-flex">
              Subscribe
            </Link>
            <button
              type="button"
              className="icon-btn md:hidden"
              aria-label="Open menu"
              aria-expanded={navOpen}
              aria-controls="mobile-menu"
              onClick={() => setNavOpen(true)}
            >
              <svg
                viewBox="0 0 24 24"
                stroke="#0B0E1A"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                width="20"
                height="20"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}