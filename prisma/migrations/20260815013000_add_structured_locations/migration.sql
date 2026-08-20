ALTER TABLE "Coordinator"
ADD COLUMN "province" TEXT,
ADD COLUMN "municipality" TEXT,
ADD COLUMN "neighborhood" TEXT;

ALTER TABLE "Dirigente"
ADD COLUMN "province" TEXT,
ADD COLUMN "municipality" TEXT,
ADD COLUMN "neighborhood" TEXT;

ALTER TABLE "Member"
ADD COLUMN "province" TEXT,
ADD COLUMN "municipality" TEXT,
ADD COLUMN "neighborhood" TEXT;

UPDATE "Coordinator"
SET
  "province" = NULLIF(TRIM(SPLIT_PART("zone", '/', 1)), ''),
  "municipality" = NULLIF(TRIM(SPLIT_PART("zone", '/', 2)), ''),
  "neighborhood" = NULLIF(TRIM(SPLIT_PART("zone", '/', 3)), '')
WHERE "zone" LIKE '%/%';

UPDATE "Dirigente"
SET
  "province" = NULLIF(TRIM(SPLIT_PART("zone", '/', 1)), ''),
  "municipality" = NULLIF(TRIM(SPLIT_PART("zone", '/', 2)), ''),
  "neighborhood" = NULLIF(TRIM(SPLIT_PART("zone", '/', 3)), '')
WHERE "zone" LIKE '%/%';

UPDATE "Member"
SET
  "province" = NULLIF(TRIM(SPLIT_PART("zone", '/', 1)), ''),
  "municipality" = NULLIF(TRIM(SPLIT_PART("zone", '/', 2)), ''),
  "neighborhood" = NULLIF(TRIM(SPLIT_PART("zone", '/', 3)), '')
WHERE "zone" LIKE '%/%';
