-- AddColumn publishedAt to Post (if not exists)
-- For existing published posts, set publishedAt to createdAt
UPDATE "Post" SET "publishedAt" = "createdAt" WHERE "published" = true AND "publishedAt" IS NULL;
