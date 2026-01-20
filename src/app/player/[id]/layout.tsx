import { PlayerLayout } from '@/components/layout/PlayerLayout';
import { getGameState, convertBigIntToNumber } from '@/lib/dataStore';

export default async function Layout({ children, params }: { children: React.ReactNode, params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Server-side fetch to avoid "Loading..." flash
    const state = await getGameState();
    const safeState = convertBigIntToNumber(state);

    return <PlayerLayout id={id} initialData={safeState}>{children}</PlayerLayout>;
}
