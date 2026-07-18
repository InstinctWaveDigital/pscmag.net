import { prisma } from "@/lib/db";
import { ImageResponse } from "next/og";

// Switch to nodejs runtime so Prisma database queries work properly
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Image({ params }: Props) {
  // Await params as required by Next.js 16 dynamic routing
  const resolvedParams = await params;
  
  // Directly query the database to bypass the missing export in lib/data
  const article = await prisma.article.findUnique({
    where: { id: resolvedParams.id }
  });
  
  const title = article?.title ?? "Africa Procurement and Supply Chain Mag";
  const category = article?.category ?? "APSC Mag";
  const dateline = article?.dateline ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B0E1A",
          padding: "64px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "16px",
            background: "#E2231A",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#fff",
            fontFamily: "monospace",
            fontSize: 22,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 999, background: "#E2231A", display: "flex" }} />
          {dateline} &middot; {category}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.2,
            maxWidth: 1050,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#EBD9B0", fontFamily: "monospace" }}>
          Africa Procurement and Supply Chain Mag
        </div>
      </div>
    ),
    { ...size }
  );
}