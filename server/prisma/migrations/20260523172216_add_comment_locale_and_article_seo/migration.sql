-- Reconcile drift: dateOfBirth was already removed from the DB outside of migrations.
-- This is a no-op if the column is absent.
ALTER TABLE "User" DROP COLUMN IF EXISTS "dateOfBirth";

-- AlterTable: Comment.locale
ALTER TABLE "Comment" ADD COLUMN "locale" "Locale" NOT NULL DEFAULT 'en';

-- CreateIndex
CREATE INDEX "Comment_articleId_locale_idx" ON "Comment"("articleId", "locale");

-- AlterTable: ArticleTranslation SEO fields
ALTER TABLE "ArticleTranslation" ADD COLUMN "metaTitle" TEXT;
ALTER TABLE "ArticleTranslation" ADD COLUMN "metaDescription" TEXT;
ALTER TABLE "ArticleTranslation" ADD COLUMN "keywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
