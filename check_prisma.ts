import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking models...');
    console.log('User:', !!prisma.user);
    console.log('Stock:', !!prisma.stock);
    console.log('Parcel:', !!(prisma as any).parcel);
    console.log('VoiceCall:', !!(prisma as any).voiceCall);
    console.log('Transaction:', !!prisma.transaction);
}

main().catch(console.error).finally(() => prisma.$disconnect());
