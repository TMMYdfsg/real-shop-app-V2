import { NextRequest, NextResponse } from 'next/server';
import { getSwitchBotDevices, sendSwitchBotCommand, setSwitchBotLightForDayState } from '@/lib/switchbot';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const action = new URL(req.url).searchParams.get('action') || 'devices';
        if (action !== 'devices') {
            return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
        }
        const response = await getSwitchBotDevices();
        return NextResponse.json(response.data, { status: response.ok ? 200 : response.status || 500 });
    } catch (error) {
        console.error('[SwitchBot] GET failed:', error);
        return NextResponse.json({ error: 'SwitchBot request failed' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const { deviceId, command, parameter, commandType, isDay } = body || {};

        if (typeof isDay === 'boolean') {
            const response = await setSwitchBotLightForDayState(isDay);
            return NextResponse.json(response.data, { status: response.ok ? 200 : response.status || 500 });
        }

        if (!deviceId || !command) {
            return NextResponse.json({ error: 'deviceId and command are required' }, { status: 400 });
        }

        const response = await sendSwitchBotCommand(deviceId, {
            command,
            parameter,
            commandType,
        });
        return NextResponse.json(response.data, { status: response.ok ? 200 : response.status || 500 });
    } catch (error) {
        console.error('[SwitchBot] POST failed:', error);
        return NextResponse.json({ error: 'SwitchBot request failed' }, { status: 500 });
    }
}
