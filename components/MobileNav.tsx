"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/data";

// "Advertise" intentionally excluded — it has a dedicated CTA slot
// in both the desktop header and the mobile panel footer, so it
// doesn't need to compete with content categories here.
const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/category/procurement-and-governance", label: "Procurement & Governance" },
  { href: "/category/logistics-and-supply-chain", label: "Logistics & Supply Chain" },
  { href: "/category/trade-policy", label: "Trade Policy" },
  { href: "/category/events", label: "Events" },
  { href: "/category/features-and-interviews", label: "Features and Interviews" },
  { href: "/about", label: "About" },
];

export default function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Escape closes the panel
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Auto-close on route change
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Focus management: move focus into the panel on open,
  // and hide the rest of the page from assistive tech while it's open
  useEffect(() => {
    const main = document.getElementById("main");

    if (open) {
      closeButtonRef.current?.focus();
      main?.setAttribute("inert", "");
      main?.setAttribute("aria-hidden", "true");
    } else {
      main?.removeAttribute("inert");
      main?.removeAttribute("aria-hidden");
    }

    return () => {
      main?.removeAttribute("inert");
      main?.removeAttribute("aria-hidden");
    };
  }, [open]);

  return (
    <>
      {/* Desktop nav — no-wrap with horizontal scroll fallback instead of
          flex-wrap, so a full row of labels never breaks the sticky header's
          fixed height on tablet/small-laptop widths. */}
      <nav
        aria-label="Primary"
        className="hidden border-t border-line-200 md:block"
      >
        <div className="container-x overflow-x-auto">
          <ul className="flex flex-nowrap whitespace-nowrap">
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
          ref={closeButtonRef}
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
          {/* Sole "Advertise" entry point on mobile */}
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