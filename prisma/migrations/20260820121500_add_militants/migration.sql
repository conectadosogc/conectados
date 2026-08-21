ALTER TABLE "Member" DROP CONSTRAINT "Member_dirigenteId_fkey";

ALTER TABLE "Member"
  ALTER COLUMN "dirigenteId" DROP NOT NULL,
  ADD COLUMN "isMilitant" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Member"
  ADD CONSTRAINT "Member_dirigenteId_fkey"
  FOREIGN KEY ("dirigenteId") REFERENCES "Dirigente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
