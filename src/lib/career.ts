import { User, Occupation, PartTimeJob } from '@/types';
import { JOBS, PART_TIME_JOBS, QUALIFICATIONS } from './gameData';

// ------------------------------------------------------------------
// 就職・転職判定
// ------------------------------------------------------------------

/**
 * 職業に応募可能か判定する
 */
export function canApplyJob(user: User, job: Occupation | PartTimeJob): { canApply: boolean; reason?: string } {
    const reqs = job.requirements;

    // 1. 資格チェック
    if (reqs.qualifications && reqs.qualifications.length > 0) {
        const userQuals = user.qualifications || [];
        const missingQuals = reqs.qualifications.filter(qId => !userQuals.includes(qId));

        if (missingQuals.length > 0) {
            const missingNames = missingQuals.map(id => QUALIFICATIONS.find(q => q.id === id)?.name || id).join(', ');
            return { canApply: false, reason: `必須資格が不足しています: ${missingNames}` };
        }
    }

    // 2. ステータスチェック (Occupation only)
    if ('rank' in job) { // Occupation check
        const occ = job as Occupation;
        if (occ.requirements.stats) {
            // (簡易実装: 現状Userステータスにintelligence等が明示的にない場合はダミー判定やpopularity代用などを検討)
            // ここでは実装がある前提、または将来拡張用
        }

        // 3. 経験・前職チェック
        if (occ.requirements.prevJobId) {
            const prevIds = Array.isArray(occ.requirements.prevJobId) ? occ.requirements.prevJobId : [occ.requirements.prevJobId];
            const hasExperience = user.jobHistory?.some(h => prevIds.includes(h.jobId));

            if (!hasExperience) {
                // jobHistoryがない、または該当職歴がない
                // ただし、現在の職が該当する場合もOKとする
                const currentJobId = user.currentJobId;
                if (!currentJobId || !prevIds.includes(currentJobId)) {
                    // 名前解決
                    const prevJobName = JOBS.find(j => prevIds.includes(j.id))?.name || '指定の前職';
                    return { canApply: false, reason: `実務経験が必要です: ${prevJobName}` };
                }
            }
        }

        // 4. 勤続年数(経験値)チェック
        if (occ.requirements.experience) {
            // 簡易的にjobHistoryの数や、特定のjobでの期間を見る必要がある
            // 現状は全体のキャリア長さなどで代用するか、historyの詳細実装に依存
        }
    }

    return { canApply: true };
}

// ------------------------------------------------------------------
// 昇進・昇格判定
// ------------------------------------------------------------------

/**
 * 昇進の可能性があるかチェック
 * マニュアル昇進ではなく、自動昇進イベントなどで使用
 */
export function checkPromotion(user: User): { promoted: boolean; nextJobId?: string; message?: string } {
    if (!user.currentJobId) return { promoted: false };

    // 1. パートタイム -> 正社員
    const currentPartTime = PART_TIME_JOBS.find(p => p.id === user.currentJobId);
    if (currentPartTime && currentPartTime.promotionTargetId) {
        // 勤務回数チェック (簡易実装: user.jobHistory の長さ等で判定)
        const workCount = user.jobHistory.filter(h => h.jobId === currentPartTime.id).length;
        if (workCount >= currentPartTime.experienceOverride) {
            const nextJob = JOBS.find(j => j.id === currentPartTime.promotionTargetId);
            if (nextJob) {
                return {
                    promoted: true,
                    nextJobId: nextJob.id,
                    message: `勤務実績が認められ、${nextJob.name}への昇格オファーがあります！`
                };
            }
        }
    }

    // 2. 正社員 ランクアップ (同じ職種でのランクアップ)
    // 実装例: 警察官(Rank 1) -> 警察官(Rank 2) のようなデータ構造が必要
    // 今回のJOBSデータはフラットなため、ここでのランクアップは「別IDの職への転職」扱いとなることが多い
    // もし同一Job IDで内部ランクを持つなら、User.jobRankのようなフィールドが必要

    return { promoted: false };
}

// ------------------------------------------------------------------
// 給与計算
// ------------------------------------------------------------------

export function calculateSalary(user: User, job: Occupation | PartTimeJob, multiplier: number = 1.0): number {
    let base = 'salary' in job ? (job as Occupation).salary : (job as PartTimeJob).hourlyWage * 8; // バイトは日給換算(仮)

    // 資格ボーナス
    if (user.qualifications) {
        user.qualifications.forEach(qId => {
            const q = QUALIFICATIONS.find(q => q.id === qId);
            if (q && q.effects?.salaryBonus) {
                base += base * (q.effects.salaryBonus / 100);
            }
        });
    }

    // 能力ボーナス (Popularityなど)
    if (user.popularity > 50) {
        base += base * 0.05; // 人気者は5%アップ
    }

    return Math.floor(base * multiplier);
}
