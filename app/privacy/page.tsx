import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Africa Procurement and Supply Chain Mag collects, uses, and protects your information.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="container-x max-w-[820px] py-14">
      <nav className="mb-3 flex flex-wrap gap-2 font-mono text-xs text-ink-300">
        <Link href="/" className="hover:text-blue-700 hover:underline">
          Home
        </Link>
        <span>/</span>
        <span aria-current="page">Privacy Policy</span>
      </nav>
      <h1 className="mb-6 text-4xl font-bold">Privacy Policy</h1>
      <div className="flex flex-col gap-5 leading-relaxed text-ink-700">
        <p>Last updated: July 2026.</p>
        <p>
          Africa Procurement and Supply Chain Mag (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your
          privacy and is committed to protecting the personal data of our readers, subscribers, and contributors.
          This policy outlines the types of information we collect through our digital platform—including email
          subscriptions, contact submissions, and general site analytics—and how we ensure its security.
        </p>

        <h2 className="mt-4 text-xl font-bold">Information We Collect</h2>
        <p>
          We collect personal details that you voluntarily provide to us when subscribing to our newsletter or reaching out
          through our contact forms. This includes:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Subscription Data:</strong> Email addresses submitted for receiving our publication briefings.</li>
          <li><strong>Contact Submissions:</strong> Names, email addresses, subjects, and message content submitted for tips, editorial inquiries, or careers.</li>
          <li><strong>Usage Data:</strong> Anonymized analytical logs including browser type, page views, and time spent on our site to improve reader experience.</li>
        </ul>

        <h2 className="mt-4 text-xl font-bold">How We Use Your Information</h2>
        <p>
          We use collected data solely to deliver the services you request, including:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Sending the weekly news briefings and awards recaps.</li>
          <li>Responding to message submissions and editorial tips.</li>
          <li>Maintaining site security and analyzing aggregate usage patterns.</li>
        </ul>
        <p>
          We do not sell, rent, or distribute your personal information to third parties under any circumstances.
        </p>

        <h2 className="mt-4 text-xl font-bold">Data Security & Storage</h2>
        <p>
          All collected data is stored using secure, industry-standard hosting partners and email service providers.
          We implement encryption and firewalls to safeguard transmission pipelines and prevent unauthorized access.
        </p>

        <h2 className="mt-4 text-xl font-bold">Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal information at any time. Subscribers can immediately opt out
          of communications by using the unsubscribe link at the bottom of any newsletter, or by contacting us.
        </p>

        <h2 className="mt-4 text-xl font-bold">Contact</h2>
        <p>
          For any inquiries regarding this policy or your personal data, please contact our data team via our{" "}
          <Link href="/contact" className="font-semibold text-blue-700 hover:underline">
            contact page
          </Link>.
        </p>
      </div>
    </div>
  );
}