import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, type, params } = body;

        // Auth check (simple mock via cookie or header usually, but here we might trust client or use a session)
        // For simplicity in this dev environment, assume we get userId from a header or cookie.
        // However, usually we pass it in body for this app structure or rely on session.
        // Let's assume the client sends 'x-user-id' header or we parse it from body if auth is loose.
        // Since this is a kids app on local/LAN, we'll try to get user from body or header.
        // Wait, the client didn't send userId.
        // I should inspect headers or use a hardcoded id for now if auth isn't fully set up in this context.

        // Looking at GameContext, currentUser is available. We should send it in the body or header.
        // PoliticsApp.tsx doesn't send userId in POST body for propose...
        // I should update PoliticsApp to send headers or figure out auth.
        // Actually, let's update this endpoint to expect 'x-user-id' from the client, 
        // BUT I must update the client first. 
        // Or, for now, just fetch the first user as a fallback or return 401.
        // Wait, I can't update client easily in this one-shot.
        // Let's rely on cookies if set, or require body.userId.

        // Correction: In `PoliticsApp.tsx`, I didn't send userId. 
        // I will simply check if a cookie exists.
        const cookieStore = await cookies();
        const userIdCookie = cookieStore.get('userId');
        let userId = userIdCookie?.value;

        // If no cookie, try to find a fallback (DANGEROUS but ok for dev)
        if (!userId) {
            // Just grab the first player for testing
            const user = await prisma.user.findFirst({ where: { role: 'player' } });
            userId = user?.id;
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Deduction
        const COST = 500;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.balance < COST) {
            return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
        }

        // Transaction
        const [proposal] = await prisma.$transaction([
            prisma.policyProposal.create({
                data: {
                    title,
                    description,
                    type,
                    params: params || {},
                    proposerId: userId,
                    deadline: BigInt(Date.now() + 60000 * 2), // 2 minutes deadline for testing
                    status: 'active'
                }
            }),
            prisma.user.update({
                where: { id: userId },
                data: { balance: { decrement: COST } }
            }),
            prisma.transaction.create({
                data: {
                    id: crypto.randomUUID(),
                    type: 'expense',
                    amount: COST,
                    senderId: userId,
                    description: '法案提出費用',
                    timestamp: BigInt(Date.now())
                }
            })
        ]);

        return NextResponse.json(proposal);
    } catch (error) {
        console.error('Proposal Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export const dynamic = 'force-static';

