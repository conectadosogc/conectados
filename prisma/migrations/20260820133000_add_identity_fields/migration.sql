ALTER TABLE "Coordinator"
  ADD COLUMN "alias" TEXT,
  ADD COLUMN "nationalId" TEXT;

ALTER TABLE "Dirigente"
  ADD COLUMN "alias" TEXT,
  ADD COLUMN "nationalId" TEXT;

ALTER TABLE "Member"
  ADD COLUMN "alias" TEXT,
  ADD COLUMN "nationalId" TEXT;

CREATE UNIQUE INDEX "Coordinator_nationalId_key" ON "Coordinator"("nationalId");
CREATE UNIQUE INDEX "Dirigente_nationalId_key" ON "Dirigente"("nationalId");
CREATE UNIQUE INDEX "Member_nationalId_key" ON "Member"("nationalId");
