-- CreateTable UserProfile
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "googleId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "isGoogle" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- CreateIndex on UserProfile
CREATE UNIQUE INDEX "UserProfile_googleId_key" ON "UserProfile"("googleId");
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- Add columns to Comment table for nested comments and status
ALTER TABLE "Comment" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE "Comment" ADD COLUMN "isGoogle" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Comment" ADD COLUMN "parentId" TEXT;
ALTER TABLE "Comment" ADD COLUMN "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create index for parentId
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- Add foreign key for parentId
CREATE TABLE "_temp_comment" AS SELECT * FROM "Comment";
DROP TABLE "Comment";

CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "isGoogle" BOOLEAN NOT NULL DEFAULT false,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "parentId" TEXT,
    CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id"),
    CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment" ("id") ON DELETE CASCADE
);

INSERT INTO "Comment" ("id", "text", "name", "avatar", "createdAt", "updatedAt", "status", "isGoogle", "postId", "userId", "parentId")
SELECT "id", "text", "name", "avatar", "createdAt", "createdAt", "approved", false, "postId", "userId", NULL FROM "_temp_comment";

DROP TABLE "_temp_comment";

CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");
