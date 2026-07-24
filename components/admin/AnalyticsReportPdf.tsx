import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { OverviewData, CategoryRow, TopArticleRow } from "@/lib/analytics-data";

const COLORS = {
  red: "#E2231A",
  redDark: "#B81B14",
  blue: "#0C1F8F",
  ink: "#0B0E1A",
  gray: "#6B7280",
  lightGray: "#9CA3AF",
  border: "#E5E7EB",
  paper: "#F9FAFB",
  green: "#16A34A",
};

const RANGE_LABEL: Record<string, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "12mo": "Last 12 months",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COLORS.ink,
  },
  headerBar: {
    height: 4,
    backgroundColor: COLORS.red,
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  brandTag: {
    backgroundColor: COLORS.red,
    color: "#fff",
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: COLORS.ink,
    marginTop: 8,
  },
  meta: {
    fontSize: 9,
    color: COLORS.gray,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.ink,
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.ink,
    paddingBottom: 6,
  },
  statRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderTopWidth: 3,
    borderTopColor: COLORS.red,
    paddingTop: 8,
    paddingRight: 8,
  },
  statLabel: {
    fontSize: 8,
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
    color: COLORS.blue,
    marginTop: 4,
  },
  statChange: {
    fontSize: 8,
    marginTop: 3,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  barLabel: {
    width: 170,
    fontSize: 9,
    color: COLORS.ink,
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.paper,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: 12,
    backgroundColor: COLORS.red,
    borderRadius: 2,
  },
  barValue: {
    width: 50,
    textAlign: "right",
    fontSize: 9,
    color: COLORS.gray,
  },
  table: {
    marginTop: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ink,
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingVertical: 6,
  },
  colRank: { width: 20, fontSize: 9, color: COLORS.lightGray },
  colTitle: { flex: 1, fontSize: 9, paddingRight: 8 },
  colCategory: { width: 110, fontSize: 8, color: COLORS.gray },
  colViews: { width: 55, fontSize: 9, textAlign: "right", fontWeight: 700 },
  colChange: { width: 55, fontSize: 8, textAlign: "right" },
  headerCell: { fontSize: 8, color: COLORS.gray, textTransform: "uppercase", letterSpacing: 0.5 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: COLORS.lightGray,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
});

function formatChange(pct: number | null): { text: string; color: string } {
  if (pct === null) return { text: "New", color: COLORS.lightGray };
  if (pct === 0) return { text: "0%", color: COLORS.gray };
  const sign = pct > 0 ? "+" : "";
  return { text: `${sign}${pct}%`, color: pct > 0 ? COLORS.green : COLORS.red };
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AnalyticsReportPdf({
  range,
  generatedAt,
  overview,
  categories,
  topArticles,
}: {
  range: string;
  generatedAt: Date;
  overview: OverviewData;
  categories: CategoryRow[];
  topArticles: TopArticleRow[];
}) {
  const maxCategoryViews = Math.max(...categories.map((c) => c.views), 1);
  const overviewChange = formatChange(overview.changePct);

  return (
    <Document
      title={`Africa Procurement and Supply Chain Mag — Analytics Report (${RANGE_LABEL[range] ?? range})`}
      author="Africa Procurement and Supply Chain Mag"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brandTag}>PROCUREMENT</Text>
            <Text style={styles.title}>Analytics Report</Text>
            <Text style={styles.meta}>
              Africa Procurement and Supply Chain Mag &middot; {RANGE_LABEL[range] ?? range}
            </Text>
            <Text style={styles.meta}>
              Generated {generatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}{" "}
              at {generatedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>

        {/* Summary stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Views</Text>
              <Text style={styles.statValue}>{overview.totalViews.toLocaleString()}</Text>
              <Text style={[styles.statChange, { color: overviewChange.color }]}>
                {overviewChange.text} vs previous period
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Unique Sessions</Text>
              <Text style={styles.statValue}>{overview.uniqueSessions.toLocaleString()}</Text>
              <Text style={styles.statChange}> </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Previous Period</Text>
              <Text style={styles.statValue}>{overview.previousPeriodViews.toLocaleString()}</Text>
              <Text style={styles.statChange}> </Text>
            </View>
          </View>
        </View>

        {/* Views by category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Views by Category</Text>
          {categories.map((c) => (
            <View style={styles.barRow} key={c.category}>
              <Text style={styles.barLabel}>{c.category}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.max((c.views / maxCategoryViews) * 100, c.views > 0 ? 3 : 0)}%` },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{c.views.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Top articles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Articles</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colRank, styles.headerCell]}>#</Text>
              <Text style={[styles.colTitle, styles.headerCell]}>Title</Text>
              <Text style={[styles.colCategory, styles.headerCell]}>Category</Text>
              <Text style={[styles.colViews, styles.headerCell]}>Views</Text>
              <Text style={[styles.colChange, styles.headerCell]}>Change</Text>
            </View>
            {topArticles.map((a, i) => {
              const change = formatChange(a.changePct);
              return (
                <View style={styles.tableRow} key={a.id} wrap={false}>
                  <Text style={styles.colRank}>{i + 1}</Text>
                  <Text style={styles.colTitle}>{a.title}</Text>
                  <Text style={styles.colCategory}>{a.category}</Text>
                  <Text style={styles.colViews}>{a.views.toLocaleString()}</Text>
                  <Text style={[styles.colChange, { color: change.color }]}>{change.text}</Text>
                </View>
              );
            })}
            {topArticles.length === 0 && (
              <Text style={{ fontSize: 9, color: COLORS.gray, paddingVertical: 12 }}>
                No views recorded for this range yet.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Africa Procurement and Supply Chain Mag &middot; Confidential — Internal Use Only</Text>
          <Text
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
