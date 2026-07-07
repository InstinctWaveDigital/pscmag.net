"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/data";

const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/category/procurement", label: "Procurement" },
  { href: "/category/logistics-and-freight", label: "Logistics & Freight" },
  { href: "/category/trade-policy", label: "Trade Policy" },
  { href: "/category/awards-and-events", label: "Awards & Events" },
  {
    href: "/category/technology-and-digital-supply-chain",
    label: "Technology",
  },
  { href: "/category/leadership-and-people", label: "People" },
  { href: "/about", label: "About" },
  { href: "/advertise", label: "Advertise" },
];

export default function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Desktop nav */}
      <nav
        aria-label="Primary"
        className="hidden border-t border-line-200 md:block"
      >
        <div className="container-x">
          <ul className="flex flex-wrap">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block border-b-[3px] px-4 py-4 text-[0.9rem] font-semibold tracking-wide transition-colors ${
                      active
                        ? "border-red-600 text-blue-700"
                        : "border-transparent text-ink-700 hover:text-blue-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile scrim */}
      {open && (
        <div
          className="fixed inset-0 z-[99] bg-ink-900/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile slide-out panel */}
      <nav
        aria-label="Mobile primary"
        id="mobile-menu"
        className={`fixed inset-y-0 right-0 z-[100] flex w-[min(86vw,360px)] flex-col overflow-y-auto bg-white px-5 pb-5 pt-8 shadow-lg2 transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          type="button"
          className="icon-btn mb-4 ml-auto"
          onClick={onClose}
          aria-label="Close menu"
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.href} className="border-b border-line-200">
              <Link
                href={item.href}
                className="block px-2 py-4 text-lg font-semibold text-ink-800"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-3">
          <Link href="/advertise" className="btn btn-outline btn-block">
            Advertise with us
          </Link>
          <Link href="/#newsletter" className="btn btn-primary btn-block">
            Subscribe
          </Link>
        </div>
        <div className="mt-6 text-xs text-ink-300">
          {CATEGORIES.length} sections &middot; updated daily
        </div>
      </nav>
    </>
  );
}