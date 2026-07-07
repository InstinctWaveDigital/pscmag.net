import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center gap-4 py-24 text-center">
      <span className="manifest">404 &middot; Not Found</span>
      <h1 className="text-4xl font-bold sm:text-5xl">This page shipped to the wrong address</h1>
      <p className="max-w-[55ch] text-lg text-ink-500">
        The page you&apos;re looking for doesn&apos;t exist or may have moved. Try
        heading back to the homepage or browsing our sections.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">Back to homepage</Link>
        <Link href="/category/procurement" className="btn btn-outline">Browse sections</Link>
      </div>
    </div>
  );
}