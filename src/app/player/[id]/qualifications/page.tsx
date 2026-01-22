'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function QualificationsPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();

    useEffect(() => {
        if (!params?.id) return;
        const timer = setTimeout(() => {
            router.replace(`/player/${params.id}/smartphone`);
        }, 300);
        return () => clearTimeout(timer);
    }, [params?.id, router]);

    return (
        <div className="ui-container u-max-w-lg ui-stack u-min-h-screen">
            <Card padding="lg">
                <h2 className="text-xl font-bold">資格・試験センター</h2>
                <p className="ui-muted">資格機能はスマホアプリに移行しました。</p>
                <Button
                    className="u-mt-4"
                    onClick={() => router.push(`/player/${params?.id}/smartphone`)}
                >
                    スマホで開く
                </Button>
            </Card>
        </div>
    );
}
