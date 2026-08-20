import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString =
  process.env.DATABASE_URL_NEON?.trim() || process.env.DATABASE_URL?.trim() || "";

if (!connectionString) {
  throw new Error("Configura DATABASE_URL o DATABASE_URL_NEON para conectar Prisma.");
}

const adapter = new PrismaPg({ connectionString });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
