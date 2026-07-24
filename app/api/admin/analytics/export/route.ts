import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { getSession } from "@/lib/auth";
import { parseRange } from "@/lib/analytics-range";
import { getOverviewData, getByCategoryData, getTopArticlesData } from "@/lib/analytics-data";
import { csvRow } from "@/lib/csv";
import AnalyticsReportPdf from "@/components/admin/AnalyticsReportPdf";

// @react-pdf/renderer needs the Node runtime (uses Node APIs internally) —
// this route cannot run on the Edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function buildCsv(params: {
  range: string;
  generatedAt: Date;
  overview: Awaited<ReturnType<typeof getOverviewData>>;
  categories: Awaited<ReturnType<typeof getByCategoryData>>["categories"];
  topArticles: Awaited<ReturnType<typeof getTopArticlesData>>;
}): string {
  const { range, generatedAt, overview, categories, topArticles } = params;
  const lines: string[] = [];

  lines.push(csvRow(["Africa Procurement and Supply Chain Mag — Analytics Export"]));
  lines.push(csvRow(["Range", range]));
  lines.push(csvRow(["Generated At", generatedAt.toISOString()]));
  lines.push("");

  lines.push(csvRow(["OVERVIEW"]));
  lines.push(csvRow(["Metric", "Value"]));
  lines.push(csvRow(["Total Views", overview.totalViews]));
  lines.push(csvRow(["Unique Sessions", overview.uniqueSessions]));
  lines.push(csvRow(["Previous Period Views", overview.previousPeriodViews]));
  lines.push(csvRow(["Change vs Previous Period (%)", overview.changePct ?? "N/A"]));
  lines.push("");

  lines.push(csvRow(["VIEWS OVER TIME"]));
  lines.push(csvRow(["Period", "Views"]));
  for (const point of overview.series) {
    lines.push(csvRow([point.label, point.count]));
  }
  lines.push("");

  lines.push(csvRow(["VIEWS BY CATEGORY"]));
  lines.push(csvRow(["Category", "Views"]));
  for (const c of categories) {
    lines.push(csvRow([c.category, c.views]));
  }
  lines.push("");

  lines.push(csvRow(["TOP ARTICLES"]));
  lines.push(csvRow(["Rank", "Title", "Category", "Status", "Last Updated", "Views", "Previous Period Views", "Change (%)"]));
  topArticles.forEach((a, i) => {
    lines.push(
      csvRow([
        i + 1,
        a.title,
        a.category,
        a.status,
        a.updatedAt,
        a.views,
        a.previousViews,
        a.changePct ?? "N/A",
      ])
    );
  });

  return lines.join("\r\n");
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const range = parseRange(req.nextUrl.searchParams.get("range"));
  const format = req.nextUrl.searchParams.get("format") === "pdf" ? "pdf" : "csv";
  const generatedAt = new Date();

  const [overview, byCategory, topArticles] = await Promise.all([
    getOverviewData(range),
    getByCategoryData(range),
    getTopArticlesData(range, 20),
  ]);

  const dateStamp = generatedAt.toISOString().slice(0, 10);
  const filenameBase = `apsc-analytics-${range}-${dateStamp}`;

  if (format === "csv") {
    const csv = buildCsv({
      range,
      generatedAt,
      overview,
      categories: byCategory.categories,
      topArticles,
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filenameBase}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // format === "pdf"
  const stream = await renderToStream(
    AnalyticsReportPdf({
      range,
      generatedAt,
      overview,
      categories: byCategory.categories,
      topArticles,
    })
  );
  const buffer = await streamToBuffer(stream);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
