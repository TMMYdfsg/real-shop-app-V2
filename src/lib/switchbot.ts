import crypto from 'crypto';

const SWITCHBOT_API_BASE = 'https://api.switch-bot.com/v1.1';

type SwitchBotCommand = {
    command: string;
    parameter?: string;
    commandType?: string;
};

type SwitchBotConfig = {
    token: string;
    secret: string;
    lightDeviceId?: string;
};

const getConfig = (): SwitchBotConfig | null => {
    const token = process.env.SWITCHBOT_TOKEN;
    const secret = process.env.SWITCHBOT_SECRET;
    if (!token || !secret) return null;
    return {
        token,
        secret,
        lightDeviceId: process.env.SWITCHBOT_LIGHT_DEVICE_ID,
    };
};

const buildHeaders = (token: string, secret: string) => {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
    const sign = crypto
        .createHmac('sha256', secret)
        .update(`${token}${timestamp}${nonce}`)
        .digest('base64');

    return {
        Authorization: token,
        t: timestamp,
        nonce,
        sign,
        'Content-Type': 'application/json',
    };
};

const switchbotRequest = async (path: string, init?: RequestInit) => {
    const config = getConfig();
    if (!config) {
        return { ok: false, status: 0, data: { message: 'missing_config' } };
    }
    const headers = buildHeaders(config.token, config.secret);
    const res = await fetch(`${SWITCHBOT_API_BASE}${path}`, {
        ...init,
        headers: {
            ...headers,
            ...(init?.headers || {}),
        },
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
};

export const isSwitchBotConfigured = () => {
    return Boolean(process.env.SWITCHBOT_TOKEN && process.env.SWITCHBOT_SECRET);
};

export const getSwitchBotDevices = async () => {
    return switchbotRequest('/devices', { method: 'GET' });
};

export const sendSwitchBotCommand = async (
    deviceId: string,
    command: SwitchBotCommand
) => {
    return switchbotRequest(`/devices/${deviceId}/commands`, {
        method: 'POST',
        body: JSON.stringify({
            command: command.command,
            parameter: command.parameter ?? 'default',
            commandType: command.commandType ?? 'command',
        }),
    });
};

export const setSwitchBotLightForDayState = async (isDay: boolean) => {
    const config = getConfig();
    if (!config) {
        return { ok: false, status: 0, data: { message: 'missing_config' } };
    }
    const deviceId = config.lightDeviceId;
    if (!deviceId) {
        return { ok: false, status: 0, data: { message: 'missing_device_id' } };
    }

    const dayCommand = process.env.SWITCHBOT_DAY_COMMAND || 'turnOn';
    const nightCommand = process.env.SWITCHBOT_NIGHT_COMMAND || 'turnOff';
    const commandType = process.env.SWITCHBOT_COMMAND_TYPE || 'command';
    const parameter = process.env.SWITCHBOT_COMMAND_PARAMETER || 'default';
    const command = isDay ? dayCommand : nightCommand;

    return sendSwitchBotCommand(deviceId, {
        command,
        parameter,
        commandType,
    });
};
