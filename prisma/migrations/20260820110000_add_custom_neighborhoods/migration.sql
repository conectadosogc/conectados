CREATE TABLE "CustomNeighborhood" (
    "id" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomNeighborhood_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CustomNeighborhood_province_municipality_normalizedName_key"
ON "CustomNeighborhood"("province", "municipality", "normalizedName");

CREATE INDEX "CustomNeighborhood_province_municipality_idx"
ON "CustomNeighborhood"("province", "municipality");
