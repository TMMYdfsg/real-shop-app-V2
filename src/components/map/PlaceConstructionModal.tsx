import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Land, PlaceType } from '@/types';

interface PlaceConstructionModalProps {
    land: Land | null;
    isOpen: boolean;
    onClose: () => void;
    onBuild: (name: string, type: PlaceType) => void;
}

const PLACE_TYPES: { type: PlaceType; label: string; icon: string; description: string; cost: number }[] = [
    { type: 'restaurant', label: '飲食店', icon: '🍽️', description: 'レストランやカフェ。安定した需要が見込める。', cost: 5000000 },
    { type: 'retail', label: '小売店', icon: '🏪', description: '雑貨屋やコンビニ。立地が重要。', cost: 4000000 },
    { type: 'office', label: 'オフィス', icon: '🏢', description: 'IT企業や事務所。高い収益性。', cost: 8000000 },
    { type: 'service', label: 'サービス', icon: '💇', description: '美容室やマッサージ店。リピーターが鍵。', cost: 3000000 },
    { type: 'factory', label: '工場', icon: '🏭', description: '製品を生産する。騒音に注意。', cost: 10000000 },
];

export const PlaceConstructionModal: React.FC<PlaceConstructionModalProps> = ({
    land,
    isOpen,
    onClose,
    onBuild
}) => {
    const [placeName, setPlaceName] = useState('');
    const [selectedType, setSelectedType] = useState<PlaceType>('retail');

    if (!land) return null;

    const handleSubmit = () => {
        if (!placeName.trim()) {
            alert('施設名を入力してください');
            return;
        }
        onBuild(placeName, selectedType);
        setPlaceName('');
        setSelectedType('retail');
    };

    const selectedTypeInfo = PLACE_TYPES.find(t => t.type === selectedType);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="新規施設の建設">
            <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                    <span className="font-bold">建設予定地:</span> {land.address}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">施設名</label>
                    <input
                        type="text"
                        value={placeName}
                        onChange={(e) => setPlaceName(e.target.value)}
                        placeholder="例: マイショップ東京本店"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">業種を選択</label>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                        {PLACE_TYPES.map((type) => (
                            <div
                                key={type.type}
                                onClick={() => setSelectedType(type.type)}
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedType === type.type
                                        ? 'border-indigo-600 bg-indigo-50'
                                        : 'border-gray-200 hover:border-indigo-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{type.icon}</div>
                                        <div>
                                            <div className="font-bold text-gray-900">{type.label}</div>
                                            <div className="text-xs text-gray-500">{type.description}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-gray-600">
                                        {type.cost.toLocaleString()}円
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedTypeInfo && (
                    <div className="flex justify-between items-center pt-2 border-t mt-4">
                        <span className="text-gray-600 font-bold">建設費用（概算）:</span>
                        <span className="text-xl font-bold text-red-600">
                            {selectedTypeInfo.cost.toLocaleString()}円
                        </span>
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={onClose} fullWidth>
                        キャンセル
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} fullWidth>
                        建設開始
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
