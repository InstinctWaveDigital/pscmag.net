import NewsletterForm from "./NewsletterForm";

export default function NewsletterSection() {
  return (
    <section className="section py-14" id="newsletter">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-2xl bg-blue-700 p-8 sm:p-12 lg:p-14">
          {/* Faint dot-grid texture — evokes manifest/ledger paper without adding an asset */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          {/* Corner registration marks — print/customs-document crop marks */}
          {[
            "left-6 top-6 border-l border-t",
            "right-6 top-6 border-r border-t",
            "left-6 bottom-6 border-l border-b",
            "right-6 bottom-6 border-r border-b",
          ].map((pos) => (
            <span
              key={pos}
              className={`pointer-events-none absolute h-4 w-4 border-white/25 ${pos}`}
            />
          ))}

          {/* Stamp — rotated dashed-circle "verified" mark, like a manifest stamp */}
          <div className="pointer-events-none absolute -right-4 -top-4 hidden rotate-[12deg] sm:block lg:right-8 lg:top-8">
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-dashed border-[#EBD9B0]/60 text-center">
              <span className="font-mono text-[0.6rem] font-bold uppercase tracking-wider text-[#EBD9B0]">
                Every
              </span>
              <span className="font-display text-lg font-black leading-none text-[#EBD9B0]">
                Monday
              </span>
              <span className="font-mono text-[0.55rem] uppercase tracking-wider text-[#EBD9B0]/80">
                7AM WAT
              </span>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className="lg:pr-8">
              <span className="manifest on-dark">Weekly Briefing</span>
              <h2 className="mt-3 max-w-[16ch] text-3xl font-bold text-white sm:text-4xl">
                The Monday Manifest — straight to your inbox
              </h2>
              <p className="mt-3 max-w-[52ch] text-[#C9D2FF]">
                One email every Monday: the week&apos;s must-read procurement,
                logistics and trade policy stories from across the continent,
                plus early access to awards shortlists and event tickets.
              </p>

              <div className="mt-6 flex items-center gap-4 border-t border-white/15 pt-4">
                <p className="font-mono text-xs uppercase tracking-wider text-[#AAB4EA]">
                  Free forever &middot; Unsubscribe anytime
                </p>
              </div>
            </div>

            <div className="lg:border-l lg:border-white/15 lg:pl-8">
              <NewsletterForm />
              <p className="mt-3 font-mono text-[0.7rem] text-[#AAB4EA]">
                Joins 120K+ supply chain readers already subscribed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}