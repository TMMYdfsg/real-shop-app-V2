import { getGameState, convertBigIntToNumber } from '@/lib/dataStore';
import BankerLayout from '@/components/layout/BankerLayout';

export default async function Layout({ children }: { children: React.ReactNode }) {
    // Server-side fetch to avoid "Loading..." flash
    const state = await getGameState();
    const safeState = convertBigIntToNumber(state);

    return <BankerLayout initialData={safeState}>{children}</BankerLayout>;
}
