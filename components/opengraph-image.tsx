import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Africa Procurement and Supply Chain Mag";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0B0E1A",
          padding: "72px",
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
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              background: "#E2231A",
              color: "#fff",
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: 2,
              padding: "6px 14px",
              borderRadius: 4,
              display: "flex",
            }}
          >
            PROCUREMENT
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 88,
            fontWeight: 900,
            color: "#fff",
            marginTop: 24,
            lineHeight: 1.05,
          }}
        >
          Supply Chain <span style={{ color: "#E2231A", marginLeft: 20 }}>Africa</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#C7CBE0",
            marginTop: 32,
            maxWidth: 900,
          }}
        >
          The continent&apos;s trade press for procurement, logistics and
          supply chain leaders.
        </div>
      </div>
    ),
    { ...size }
  );
}