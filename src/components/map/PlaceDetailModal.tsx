import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Place } from '@/types';

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
    if (!place) return null;

    const isConstruction = place.status === 'construction';

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
