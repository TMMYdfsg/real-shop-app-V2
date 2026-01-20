'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { OwnedItem, CatalogItem } from '@/types';

// Grid Configuration
const GRID_SIZE = 8;
const CELL_SIZE = 40; // px

interface FurniturePlacementProps {
    onClose: () => void;
}

export const FurniturePlacement: React.FC<FurniturePlacementProps> = ({ onClose }) => {
    const { currentUser, gameState } = useGame();
    const [placedItems, setPlacedItems] = useState<OwnedItem[]>([]);
    const [inventory, setInventory] = useState<OwnedItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [catalogMap, setCatalogMap] = useState<Record<string, CatalogItem>>({});

    useEffect(() => {
        if (currentUser) {
            const allItems = currentUser.myRoomItems || [];
            setPlacedItems(allItems.filter(i => i.isPlaced));
            setInventory(allItems.filter(i => !i.isPlaced));

            // Build Catalog Map for easy lookup
            // Assuming gameState.catalogInventory exists or we use a hardcoded list for now
            // For now, let's mock or use what we have. 
            // Since we don't have a full catalog loaded on client always, we might need to fetch or use minimal data.
            // Let's assume we can map from existing data or generic.
        }
    }, [currentUser]);

    const handlePlace = (x: number, y: number) => {
        if (!selectedItemId) return;

        const itemToPlace = inventory.find(i => i.id === selectedItemId);
        if (!itemToPlace) return;

        // Removing from inventory, adding to placed
        const newItem = { ...itemToPlace, isPlaced: true, x, y, rotation: 0 };
        setPlacedItems([...placedItems, newItem]);
        setInventory(inventory.filter(i => i.id !== selectedItemId));
        setSelectedItemId(null);
    };

    const handleRemove = (item: OwnedItem) => {
        const removedItem = { ...item, isPlaced: false, x: undefined, y: undefined };
        setInventory([...inventory, removedItem]);
        setPlacedItems(placedItems.filter(i => i.id !== item.id));
    };

    const handleSave = async () => {
        const allItems = [...placedItems, ...inventory];

        try {
            await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'update_furniture_layout',
                    requesterId: currentUser?.id,
                    details: {
                        items: allItems
                    }
                })
            });
            alert('レイアウトを保存しました');
            onClose();
            window.location.reload(); // Refresh to update context
        } catch (e) {
            console.error(e);
            alert('保存に失敗しました');
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-100">
            {/* Header */}
            <div className="p-4 bg-white shadow-sm flex justify-between items-center z-10">
                <h3 className="font-bold text-lg">模様替え</h3>
                <div className="flex gap-2">
                    <button onClick={onClose} className="px-3 py-1 text-sm bg-gray-200 rounded">キャンセル</button>
                    <button onClick={handleSave} className="px-3 py-1 text-sm bg-blue-500 text-white rounded font-bold">保存</button>
                </div>
            </div>

            {/* Room View */}
            <div className="flex-1 overflow-hidden relative bg-amber-50 flex items-center justify-center p-4">
                <div
                    className="relative bg-white shadow-xl border-4 border-amber-200"
                    style={{
                        width: GRID_SIZE * CELL_SIZE,
                        height: GRID_SIZE * CELL_SIZE,
                        backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
                        backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
                    }}
                >
                    {/* Grid Cells for Click Detection */}
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);
                        const isOccupied = placedItems.some(item => item.x === x && item.y === y);

                        return (
                            <div
                                key={i}
                                onClick={() => !isOccupied && handlePlace(x, y)}
                                className={`absolute border border-gray-100/50 hover:bg-blue-100/30 transition-colors ${selectedItemId && !isOccupied ? 'cursor-pointer' : ''}`}
                                style={{
                                    left: x * CELL_SIZE,
                                    top: y * CELL_SIZE,
                                    width: CELL_SIZE,
                                    height: CELL_SIZE,
                                }}
                            />
                        );
                    })}

                    {/* Placed Items */}
                    {placedItems.map(item => (
                        <motion.div
                            key={item.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute flex items-center justify-center text-2xl cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => handleRemove(item)}
                            style={{
                                left: (item.x || 0) * CELL_SIZE,
                                top: (item.y || 0) * CELL_SIZE,
                                width: CELL_SIZE,
                                height: CELL_SIZE,
                            }}
                        >
                            {/* Placeholder Icon - normally lookup from Catalog */}
                            🪑
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Inventory Drawer */}
            <div className="h-48 bg-white border-t border-gray-200 flex flex-col">
                <div className="p-2 border-b text-xs font-bold text-gray-500 uppercase">
                    所持家具 ({inventory.length})
                </div>
                <div className="flex-1 overflow-x-auto p-4 flex gap-4">
                    {inventory.length === 0 && (
                        <div className="w-full text-center text-gray-400 text-sm py-4">
                            家具を持っていません
                        </div>
                    )}
                    {inventory.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setSelectedItemId(item.id)}
                            className={`flex flex-col items-center gap-1 min-w-[60px] p-2 rounded-lg border transition ${selectedItemId === item.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <span className="text-2xl">🪑</span>
                            <span className="text-[10px] truncate max-w-full">Item</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
