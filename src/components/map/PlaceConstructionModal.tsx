import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Land, BuildingCategory, CompanyType, CompanyAbilityId, CompanyStatId, Qualification } from '@/types';
import { useGame } from '@/context/GameContext';
import { QUALIFICATIONS } from '@/lib/gameData';
import { COMPANY_ABILITIES, COMPANY_STATS, COMPANY_BASE_SALARY, COMPANY_ABILITY_QUAL_CATEGORIES, COMPANY_STAT_QUAL_CATEGORIES } from '@/lib/companyData';

interface PlaceConstructionModalProps {
    isOpen: boolean;
    onClose: () => void;
    land: Land | null;
    onBuild: (name: string, type: BuildingCategory, companyType?: CompanyType, abilityId?: CompanyAbilityId, statId?: CompanyStatId) => void;
}

const COMPANY_TYPES: { value: CompanyType, label: string }[] = [
    { value: 'start_up', label: 'スタートアップ' },
    { value: 'venture', label: 'ベンチャー' },
    { value: 'sme', label: '中小企業' },
    { value: 'large_enterprise', label: '大企業' },
    { value: 'mega_venture', label: 'メガベンチャー' },
    { value: 'listed_company', label: '上場企業' },
    { value: 'unlisted_company', label: '非上場企業' },
    { value: 'public_company', label: '公開企業' },
    { value: 'private_company', label: '非公開企業' },
    { value: 'global_enterprise', label: 'グローバル企業' },
    { value: 'sole_proprietorship', label: '個人事業主' },
    { value: 'corporation', label: '法人' },
];

export const PlaceConstructionModal: React.FC<PlaceConstructionModalProps> = ({ isOpen, onClose, land, onBuild }) => {
    const { currentUser } = useGame();
    const [name, setName] = useState('');
    const [type, setType] = useState<BuildingCategory>('house');
    const [companyType, setCompanyType] = useState<CompanyType>('start_up');
    const [companyAbility, setCompanyAbility] = useState<CompanyAbilityId>(COMPANY_ABILITIES[0].id);
    const [companyStat, setCompanyStat] = useState<CompanyStatId>(COMPANY_STATS[0].id);

    if (!land) return null;

    const handleSubmit = () => {
        if (!name && type !== 'house') return alert('名前を入力してください');
        onBuild(
            name || 'マイホーム',
            type,
            type === 'company' ? companyType : undefined,
            type === 'company' ? companyAbility : undefined,
            type === 'company' ? companyStat : undefined
        );
    };

    const getCost = () => {
        if (type === 'house') return 5000000;
        if (type === 'shop') return 10000000;
        if (type === 'company') return 20000000;
        return 0;
    };

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

    const companySummary = useMemo(() => {
        if (type !== 'company') return null;
        const baseSalary = COMPANY_BASE_SALARY[companyType] || 180000;
        const abilityBonus = COMPANY_ABILITIES.find((ability) => ability.id === companyAbility)?.salaryBonusPercent || 0;
        const statBonus = COMPANY_STATS.find((stat) => stat.id === companyStat)?.salaryBonusPercent || 0;
        const qualificationBonus = (currentUser?.qualifications || []).reduce((sum, qualId) => {
            const qual = QUALIFICATIONS.find((q) => q.id === qualId);
            return sum + (qual?.effects?.salaryBonus || 0);
        }, 0);

        const abilityCategories = COMPANY_ABILITY_QUAL_CATEGORIES[companyAbility] || [];
        const statCategories = COMPANY_STAT_QUAL_CATEGORIES[companyStat] || [];
        const matchedCategories = Array.from(new Set([...abilityCategories, ...statCategories]));
        const matchedQualifications = (currentUser?.qualifications || [])
            .map((qualId) => QUALIFICATIONS.find((q) => q.id === qualId))
            .filter((qual): qual is Qualification => Boolean(qual))
            .filter((qual) => matchedCategories.includes(qual.category));

        const synergyBonus = Math.min(12, matchedQualifications.length * 2);
        const totalBonus = abilityBonus + statBonus + qualificationBonus + synergyBonus;
        const estimatedSalary = Math.floor(baseSalary * (1 + totalBonus / 100));

        return {
            baseSalary,
            abilityBonus,
            statBonus,
            qualificationBonus,
            synergyBonus,
            totalBonus,
            estimatedSalary,
            matchedCategories,
            matchedQualifications
        };
    }, [type, companyType, companyAbility, companyStat, currentUser?.qualifications]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="建設プラン">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold mb-3 text-gray-700">建物の種類</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setType('house')}
                            className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${type === 'house'
                                    ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                                    : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                                }`}
                        >
                            <span className="text-3xl mb-1">🏠</span>
                            <span className="text-xs font-bold">家</span>
                        </button>
                        <button
                            onClick={() => setType('shop')}
                            className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${type === 'shop'
                                    ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200'
                                    : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                                }`}
                        >
                            <span className="text-3xl mb-1">🏪</span>
                            <span className="text-xs font-bold">店舗</span>
                        </button>
                        <button
                            onClick={() => setType('company')}
                            className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${type === 'company'
                                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                                    : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                                }`}
                        >
                            <span className="text-3xl mb-1">🏢</span>
                            <span className="text-xs font-bold">会社</span>
                        </button>
                    </div>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-indigo-700 font-medium">建設費用</span>
                        <span className="text-indigo-900 font-bold">{getCost().toLocaleString()}枚</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                        {type === 'house' ? '家の名前 (任意)' : type === 'shop' ? '店舗名' : '会社名'}
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors bg-gray-50"
                        placeholder={type === 'house' ? 'マイホーム' : type === 'shop' ? 'コンビニ幸運' : '株式会社...'}
                    />
                </div>

                {type === 'company' && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-bold mb-2 text-gray-700">会社形態</label>
                        <select
                            value={companyType}
                            onChange={e => setCompanyType(e.target.value as CompanyType)}
                            className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 focus:border-indigo-500 focus:outline-none transition-colors"
                        >
                            {COMPANY_TYPES.map(ct => (
                                <option key={ct.value} value={ct.value}>{ct.label}</option>
                            ))}
                        </select>

                        <div className="mt-4">
                            <label className="block text-sm font-bold mb-2 text-gray-700">特殊能力</label>
                            <div className="grid grid-cols-2 gap-2">
                                {COMPANY_ABILITIES.map((ability) => (
                                    <button
                                        key={ability.id}
                                        type="button"
                                        onClick={() => setCompanyAbility(ability.id)}
                                        className={`p-3 rounded-xl border text-left transition ${companyAbility === ability.id
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="text-xs font-bold">{ability.name}</div>
                                        <div className="text-[10px] text-gray-500">{ability.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-bold mb-2 text-gray-700">ステータス特化</label>
                            <div className="grid grid-cols-2 gap-2">
                                {COMPANY_STATS.map((stat) => (
                                    <button
                                        key={stat.id}
                                        type="button"
                                        onClick={() => setCompanyStat(stat.id)}
                                        className={`p-3 rounded-xl border text-left transition ${companyStat === stat.id
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="text-xs font-bold">{stat.name}</div>
                                        <div className="text-[10px] text-gray-500">{stat.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {companySummary && (
                            <div className="mt-5 p-4 rounded-xl border border-amber-200 bg-amber-50">
                                <div className="text-sm font-bold text-amber-900 mb-2">給与見込み (資格連動)</div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center justify-between bg-white/70 p-2 rounded-lg">
                                        <span className="text-amber-800">基準給与</span>
                                        <span className="font-bold text-amber-900">{companySummary.baseSalary.toLocaleString()}枚</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-white/70 p-2 rounded-lg">
                                        <span className="text-amber-800">合計ボーナス</span>
                                        <span className="font-bold text-amber-900">+{companySummary.totalBonus}%</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-white/70 p-2 rounded-lg">
                                        <span className="text-amber-800">能力+ステ</span>
                                        <span className="font-bold text-amber-900">+{companySummary.abilityBonus + companySummary.statBonus}%</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-white/70 p-2 rounded-lg">
                                        <span className="text-amber-800">資格(共通)</span>
                                        <span className="font-bold text-amber-900">+{companySummary.qualificationBonus}%</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-white/70 p-2 rounded-lg">
                                        <span className="text-amber-800">資格シナジー</span>
                                        <span className="font-bold text-amber-900">+{companySummary.synergyBonus}%</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-amber-200/80 p-2 rounded-lg col-span-2">
                                        <span className="text-amber-900">見込み給与</span>
                                        <span className="font-bold text-amber-900">{companySummary.estimatedSalary.toLocaleString()}枚</span>
                                    </div>
                                </div>
                                <div className="mt-3 text-[11px] text-amber-800">
                                    対象カテゴリ: {companySummary.matchedCategories.length
                                        ? companySummary.matchedCategories.map((category) => qualificationCategoryLabels[category]).join(' / ')
                                        : 'なし'}
                                </div>
                                {companySummary.matchedQualifications.length > 0 && (
                                    <div className="mt-2 text-[11px] text-amber-900">
                                        適用資格: {companySummary.matchedQualifications.map((qual) => qual.name).join(' / ')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                    <Button variant="secondary" onClick={onClose} className="flex-1" size="lg">
                        キャンセル
                    </Button>
                    <Button onClick={handleSubmit} className="flex-1" size="lg">
                        建設する
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
