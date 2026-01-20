import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// デバッグ: DATABASE_URLの存在確認
if (!process.env.DATABASE_URL) {
    console.warn('[Prisma] WARNING: DATABASE_URL is not set');
} else {
    // console.log('[Prisma] DATABASE_URL is configured'); 
}

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
