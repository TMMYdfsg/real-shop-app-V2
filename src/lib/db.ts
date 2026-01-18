import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Prisma 7: ビルド時にDATABASE_URLがない場合のフォールバック
const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/dummy';

export const prisma = globalForPrisma.prisma || new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});


if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
