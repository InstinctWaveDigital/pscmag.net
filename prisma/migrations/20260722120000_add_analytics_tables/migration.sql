-- CreateTable
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referrer_source" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_daily_stats" (
    "id" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "unique_sessions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "article_daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_views_article_id_viewed_at_idx" ON "page_views"("article_id", "viewed_at");

-- CreateIndex
CREATE INDEX "page_views_viewed_at_idx" ON "page_views"("viewed_at");

-- CreateIndex
CREATE UNIQUE INDEX "article_daily_stats_article_id_date_key" ON "article_daily_stats"("article_id", "date");

-- CreateIndex
CREATE INDEX "article_daily_stats_date_idx" ON "article_daily_stats"("date");

-- AddForeignKey
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_daily_stats" ADD CONSTRAINT "article_daily_stats_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
