import { PlayerLayout } from '@/components/layout/PlayerLayout';
import { use } from 'react';

export default async function Layout({ children, params }: { children: React.ReactNode, params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <PlayerLayout id={id}>{children}</PlayerLayout>;
}
