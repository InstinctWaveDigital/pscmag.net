import NewsletterForm from "./NewsletterForm";

export default function NewsletterSection() {
  return (
    <section className="section py-14" id="newsletter">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-2xl bg-blue-700 p-8 sm:p-12">
          <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="manifest on-dark">Weekly Briefing</span>
              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                The Monday Manifest — straight to your inbox
              </h2>
              <p className="mt-3 max-w-[52ch] text-[#C9D2FF]">
                One email every Monday: the week&apos;s must-read procurement,
                logistics and trade policy stories from across the continent,
                plus early access to awards shortlists and event tickets.
              </p>
              <p className="mt-3 text-sm text-[#AAB4EA]">
                Free forever. Unsubscribe anytime. No spam, just the manifest.
              </p>
            </div>
            <div>
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}