import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Land, BuildingCategory, CompanyType } from '@/types';

interface PlaceConstructionModalProps {
    isOpen: boolean;
    onClose: () => void;
    land: Land | null;
    onBuild: (name: string, type: BuildingCategory, companyType?: CompanyType) => void;
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
    const [name, setName] = useState('');
    const [type, setType] = useState<BuildingCategory>('house');
    const [companyType, setCompanyType] = useState<CompanyType>('start_up');

    if (!land) return null;

    const handleSubmit = () => {
        if (!name && type !== 'house') return alert('名前を入力してください');
        onBuild(name || 'マイホーム', type, type === 'company' ? companyType : undefined);
    };

    const getCost = () => {
        if (type === 'house') return 5000000;
        if (type === 'shop') return 10000000;
        if (type === 'company') return 20000000;
        return 0;
    };

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
                        <span className="text-indigo-900 font-bold">¥{getCost().toLocaleString()}</span>
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
