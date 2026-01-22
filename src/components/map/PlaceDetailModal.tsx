import React, { useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Place, Qualification } from '@/types';
import { useGame } from '@/context/GameContext';
import { QUALIFICATIONS } from '@/lib/gameData';
import { COMPANY_ABILITIES, COMPANY_STATS, COMPANY_ABILITY_QUAL_CATEGORIES, COMPANY_STAT_QUAL_CATEGORIES } from '@/lib/companyData';

interface PlaceDetailModalProps {
    place: Place | null;
    isOpen: boolean;
    onClose: () => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
    place,
    isOpen,
    onClose
}) => {
    const { currentUser } = useGame();
    if (!place) return null;

    const isConstruction = place.status === 'construction';
    const abilityLabel = place.companyProfile
        ? (COMPANY_ABILITIES.find((a) => a.id === place.companyProfile?.abilityId)?.name || place.companyProfile.abilityId)
        : '';
    const statLabel = place.companyProfile
        ? (COMPANY_STATS.find((s) => s.id === place.companyProfile?.statId)?.name || place.companyProfile.statId)
        : '';

    type QualificationCategory = Qualification['category'];
    const qualificationCategoryLabels: Record<QualificationCategory, string> = {
        business: 'ビジネス',
        creative: 'クリエイティブ',
        driving: '運転',
        food: 'フード',
        hobby: '趣味',
        language: '語学',
        medical: '医療',
        special: '専門'
    };

    const companyBonusSummary = useMemo(() => {
        if (!place.companyProfile || currentUser?.id !== place.ownerId) return null;
        const abilityBonus = COMPANY_ABILITIES.find((a) => a.id === place.companyProfile?.abilityId)?.salaryBonusPercent || 0;
        const statBonus = COMPANY_STATS.find((s) => s.id === place.companyProfile?.statId)?.salaryBonusPercent || 0;
        const qualificationBonus = (currentUser?.qualifications || []).reduce((sum, qualId) => {
            const qual = QUALIFICATIONS.find((q) => q.id === qualId);
            return sum + (qual?.effects?.salaryBonus || 0);
        }, 0);
        const abilityCategories = COMPANY_ABILITY_QUAL_CATEGORIES[place.companyProfile.abilityId] || [];
        const statCategories = COMPANY_STAT_QUAL_CATEGORIES[place.companyProfile.statId] || [];
        const matchedCategories = Array.from(new Set([...abilityCategories, ...statCategories]));
        const matchedQualifications = (currentUser?.qualifications || [])
            .map((qualId) => QUALIFICATIONS.find((q) => q.id === qualId))
            .filter((qual): qual is Qualification => Boolean(qual))
            .filter((qual) => matchedCategories.includes(qual.category));
        const synergyBonus = Math.min(12, matchedQualifications.length * 2);
        const totalBonus = abilityBonus + statBonus + qualificationBonus + synergyBonus;
        const estimatedSalary = Math.floor((place.companyProfile.baseSalary || 180000) * (1 + totalBonus / 100));

        return {
            abilityBonus,
            statBonus,
            qualificationBonus,
            synergyBonus,
            totalBonus,
            estimatedSalary,
            matchedCategories,
            matchedQualifications
        };
    }, [place.companyProfile, place.ownerId, currentUser?.id, currentUser?.qualifications]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="施設詳細">
            <div className="space-y-4">
                <div className="flex items-center gap-4 border-b pb-4">
                    <div className="text-4xl bg-gray-100 p-3 rounded-full">
                        {place.type === 'restaurant' ? '🍽️' :
                            place.type === 'retail' ? '🏪' :
                                place.type === 'office' ? '🏢' :
                                    place.type === 'factory' ? '🏭' : '🏢'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{place.name}</h2>
                        <div className="text-sm text-gray-500 badge inline-block px-2 py-1 bg-gray-200 rounded mt-1">
                            {place.type.toUpperCase()} - Level {place.level}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500">状態</div>
                        <div className={`font-bold ${isConstruction ? 'text-orange-500' : 'text-green-600'}`}>
                            {isConstruction ? '建設中 🚧' : '営業中 ✅'}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500">評判</div>
                        <div className="font-bold text-yellow-500">
                            {'⭐'.repeat(Math.round(place.stats.reputation))}
                            <span className="text-gray-400 text-xs ml-1">({place.stats.reputation})</span>
                        </div>
                    </div>
                </div>

                {!isConstruction && (
                    <div className="space-y-2">
                        <h3 className="font-bold text-gray-700">経営状況 (月次)</h3>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                            <div className="p-2 border rounded">
                                <div className="text-gray-500">売上</div>
                                <div className="font-bold text-indigo-600">¥{place.stats.sales.toLocaleString()}</div>
                            </div>
                            <div className="p-2 border rounded">
                                <div className="text-gray-500">経費</div>
                                <div className="font-bold text-red-500">¥{place.stats.expenses.toLocaleString()}</div>
                            </div>
                            <div className="p-2 border rounded bg-indigo-50">
                                <div className="text-gray-500">純利益</div>
                                <div className="font-bold text-indigo-800">¥{place.stats.profit.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                )}

                {place.buildingCategory === 'company' && place.companyProfile && (
                    <div className="space-y-2">
                        <h3 className="font-bold text-gray-700">会社プロファイル</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-2 border rounded">
                                <div className="text-gray-500">特殊能力</div>
                                <div className="font-bold text-indigo-700">{abilityLabel}</div>
                            </div>
                            <div className="p-2 border rounded">
                                <div className="text-gray-500">ステータス</div>
                                <div className="font-bold text-emerald-700">{statLabel}</div>
                            </div>
                            <div className="p-2 border rounded col-span-2">
                                <div className="text-gray-500">基準給与</div>
                                <div className="font-bold text-gray-800">¥{place.companyProfile.baseSalary.toLocaleString()}</div>
                            </div>
                        </div>
                        {companyBonusSummary && (
                            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs">
                                <div className="font-bold text-amber-900 mb-2">資格連動ボーナス</div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center justify-between bg-white/70 p-2 rounded-lg">
                                        <span className="text-amber-800">能力+ステ</span>
                                        <span className="font-bold text-amber-900">+{companyBonusSummary.abilityBonus + companyBonusSummary.statBonus}%</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-white/70 p-2 rounded-lg">
                                        <span className="text-amber-800">資格(共通)</span>
                                        <span className="font-bold text-amber-900">+{companyBonusSummary.qualificationBonus}%</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-white/70 p-2 rounded-lg">
                                        <span className="text-amber-800">資格シナジー</span>
                                        <span className="font-bold text-amber-900">+{companyBonusSummary.synergyBonus}%</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-amber-200/80 p-2 rounded-lg">
                                        <span className="text-amber-900">見込み給与</span>
                                        <span className="font-bold text-amber-900">¥{companyBonusSummary.estimatedSalary.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="mt-2 text-[11px] text-amber-800">
                                    対象カテゴリ: {companyBonusSummary.matchedCategories.length
                                        ? companyBonusSummary.matchedCategories.map((category) => qualificationCategoryLabels[category]).join(' / ')
                                        : 'なし'}
                                </div>
                                {companyBonusSummary.matchedQualifications.length > 0 && (
                                    <div className="mt-1 text-[11px] text-amber-900">
                                        適用資格: {companyBonusSummary.matchedQualifications.map((qual) => qual.name).join(' / ')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-700">所在地</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {place.location.address}
                    </p>
                </div>

                <div className="pt-2">
                    <Button fullWidth variant="secondary" onClick={onClose}>
                        閉じる
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
