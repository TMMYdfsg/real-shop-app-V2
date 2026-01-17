import { User, AuditLog, ShopItem } from '@/types';

/**
 * 監査ログを生成してユーザーオブジェクトに追加する (ミューテーション)
 * Note: 実際にはAPIルート内で updateGameState の中で呼ばれることを想定
 */
export function logAudit(
    user: User,
    actionType: AuditLog['actionType'],
    details: string,
    severity: AuditLog['severity'] = 'info'
): void {
    const log: AuditLog = {
        id: crypto.randomUUID(),
        userId: user.id,
        actionType,
        details,
        severity,
        timestamp: Date.now()
    };

    if (!user.auditLogs) user.auditLogs = [];
    user.auditLogs.push(log);

    // 深刻度に応じて疑惑スコアを加算
    if (severity === 'warning') {
        increaseSuspicion(user, 10);
    } else if (severity === 'critical') {
        increaseSuspicion(user, 50);
    }
}

/**
 * 疑惑スコアを加算する
 */
export function increaseSuspicion(user: User, amount: number): void {
    user.suspicionScore = (user.suspicionScore || 0) + amount;
    if (user.suspicionScore > 100) user.suspicionScore = 100;
}

/**
 * 転売チェック
 * 仕入れ値に対して売値が過剰に高くないかチェックする
 * 
 * 基準:
 * - 売値が原価(平均コスト)の5倍以上: 警告 (Warning)
 * - 売値が原価(平均コスト)の10倍以上: 重大 (Critical) - 転売認定
 * 
 * @param cost 仕入れ値
 * @param price 売値
 * @returns 'ok' | 'warning' | 'critical'
 */
export function checkResalePrice(cost: number, price: number): 'ok' | 'warning' | 'critical' {
    if (cost <= 0) return 'ok'; // 原価0のアイテム(拾ったもの等)は一旦除外か、別途判定
    if (price <= cost) return 'ok'; // 定価以下ならOK

    const ratio = price / cost;

    if (ratio >= 10) return 'critical';
    if (ratio >= 5) return 'warning';

    return 'ok';
}

/**
 * 不正疑惑レベルに応じたメッセージを返す
 */
export function getSuspicionStatusMessage(score: number): string {
    if (score >= 80) return '税務署があなたの動向を注視しています...';
    if (score >= 50) return '不審な取引が疑われています';
    if (score >= 20) return '少し目立った行動があるようです';
    return '健全な経済活動が行われています';
}
