import { PrismaClient } from "@prisma/client";


const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};


const databaseUrl =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL
    : process.env.DIRECT_URL;


export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });


if (
  process.env.NODE_ENV !== "production"
) {
  globalForPrisma.prisma = prisma;
}


export default prisma;