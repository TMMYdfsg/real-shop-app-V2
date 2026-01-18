import { NextRequest } from 'next/server';
import { eventManager } from '@/lib/eventManager';

export async function GET(req: NextRequest) {
    const stream = new ReadableStream({
        start(controller) {
            console.log('SSE: New client connected');
            const encoder = new TextEncoder();

            const onUpdate = (data: any) => {
                const message = `data: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(encoder.encode(message));
            };

            // Listen for events
            eventManager.on('game_update', onUpdate);

            // Send keep-alive every 15 seconds
            const keepAlive = setInterval(() => {
                controller.enqueue(encoder.encode(': keep-alive\n\n'));
            }, 15000);

            // Handle connection close
            req.signal.addEventListener('abort', () => {
                clearInterval(keepAlive);
                eventManager.off('game_update', onUpdate);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}
