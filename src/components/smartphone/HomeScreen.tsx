'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, PanInfo, useDragControls } from 'framer-motion';
import { APPS } from './constants';
import { Search } from 'lucide-react';
import { getVibrationAdapter, VibrationPatterns } from '@/lib/vibration';

type AppDefinition = (typeof APPS)[number];

const DRAG_HOLD_MS = 180;

// Compact Glass Icon matching reference image
const CompactGlassIcon = React.forwardRef<HTMLButtonElement, {
    app: AppDefinition;
    onClick: () => void;
    onDragStart?: () => void;
    onDragMove?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
    onDragEnd?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
    dragConstraints?: React.RefObject<HTMLElement | null>;
}>(({ app, onClick, onDragStart, onDragMove, onDragEnd, dragConstraints }, ref) => {
    const handleAppClick = () => {
        const vibration = getVibrationAdapter();
        vibration.vibrate(VibrationPatterns.tap);
        onClick();
    };

    const dragControls = useDragControls();
    const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dragActiveRef = useRef(false);

    const clearHoldTimer = () => {
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
        clearHoldTimer();
        holdTimerRef.current = setTimeout(() => {
            dragActiveRef.current = true;
            onDragStart?.();
            dragControls.start(event);
        }, DRAG_HOLD_MS);
    };

    const handlePointerUp = () => {
        if (holdTimerRef.current) {
            clearHoldTimer();
        }
        if (!dragActiveRef.current) {
            handleAppClick();
        }
    };

    const getPremiumStyles = (colorClass: string) => {
        if (colorClass.includes('green')) return 'from-[#4ade80] to-[#16a34a]';
        if (colorClass.includes('blue')) return 'from-[#60a5fa] to-[#2563eb]';
        if (colorClass.includes('red') || colorClass.includes('rose')) return 'from-[#fb7185] to-[#e11d48]';
        if (colorClass.includes('orange')) return 'from-[#fbbf24] to-[#ea580c]';
        if (colorClass.includes('purple') || colorClass.includes('indigo')) return 'from-[#c084fc] to-[#9333ea]';
        if (colorClass.includes('sky') || colorClass.includes('cyan')) return 'from-[#38bdf8] to-[#0284c7]';
        if (colorClass.includes('pink')) return 'from-[#f472b6] to-[#db2777]';
        if (colorClass.includes('teal')) return 'from-[#2dd4bf] to-[#0d9488]';
        if (colorClass.includes('yellow')) return 'from-[#fde047] to-[#ca8a04]';
        if (colorClass.includes('slate-900') || colorClass.includes('black')) return 'from-[#475569] to-[#0f172a]';
        return 'from-[#94a3b8] to-[#475569]';
    };

    const gradientClasses = getPremiumStyles(app.color);

    return (
        <motion.button
            whileTap={{ scale: 0.88 }}
            ref={ref}
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0.2}
            dragConstraints={dragConstraints}
            layout
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={clearHoldTimer}
            onPointerCancel={clearHoldTimer}
            onDragEnd={(event, info) => {
                dragActiveRef.current = false;
                onDragEnd?.(event, info);
            }}
            onDrag={(event, info) => {
                onDragMove?.(event, info);
            }}
            whileDrag={{ scale: 1.08, zIndex: 30 }}
            className="group flex flex-col items-center gap-1 focus:outline-none cursor-pointer active:cursor-grabbing"
            style={{ touchAction: 'none' }}
        >
            <div className={`
                w-[56px] h-[56px] rounded-[18px] bg-gradient-to-br ${gradientClasses}
                relative flex items-center justify-center 
                shadow-md transition-all duration-150
            `}>
                <div className="absolute inset-0 rounded-[18px] border border-white/20" />
                <div className="absolute inset-[1px] rounded-[17px] border border-black/5 shadow-[inset_0_1px_3px_rgba(255,255,255,0.3),inset_0_-2px_6px_rgba(0,0,0,0.2)]" />
                <div className="absolute top-[1px] left-[3px] right-[3px] h-[30%] bg-gradient-to-b from-white/25 via-white/8 to-transparent rounded-t-[16px]" />

                <div className="w-6 h-6 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] z-10 flex items-center justify-center">
                    {React.isValidElement(app.icon)
                        ? React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-full h-full stroke-[2.5px]" })
                        : <span className="text-xl">{app.icon}</span>}
                </div>
            </div>

            <span className="text-[9px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-center w-full truncate px-0.5">
                {app.name}
            </span>
        </motion.button>
    );
});

CompactGlassIcon.displayName = 'CompactGlassIcon';

interface HomeScreenProps {
    onOpenApp: (appId: string) => void;
    apps?: typeof APPS;
    onReorder?: (appIds: string[]) => void;
    era?: 'present' | 'past' | 'future';
}

export const HomeScreen = ({ onOpenApp, apps = APPS, onReorder, era = 'present' }: HomeScreenProps) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [orderedIds, setOrderedIds] = useState(() => apps.map(app => app.id));
    const [isDraggingIcon, setIsDraggingIcon] = useState(false);
    const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const lastHoverTargetRef = useRef<string | null>(null);
    const draggingIdRef = useRef<string | null>(null);
    const gridBoundsRef = useRef<HTMLDivElement | null>(null);
    const appsPerPage = 24; // 6 rows × 4 columns
    const isFuture = era === 'future';
    const appsById = useMemo(() => new Map(apps.map(app => [app.id, app])), [apps]);
    const orderedApps = useMemo(() => {
        return orderedIds
            .map(id => appsById.get(id))
            .filter((app): app is AppDefinition => Boolean(app));
    }, [orderedIds, appsById]);
    const totalPages = Math.max(1, Math.ceil(orderedApps.length / appsPerPage));

    useEffect(() => {
        const nextIds = apps.map(app => app.id);
        setOrderedIds((prev) => {
            const installedSet = new Set(nextIds);
            const next: string[] = [];
            const used = new Set<string>();
            for (const id of prev) {
                if (installedSet.has(id) && !used.has(id)) {
                    next.push(id);
                    used.add(id);
                }
            }
            for (const id of nextIds) {
                if (!used.has(id)) {
                    next.push(id);
                    used.add(id);
                }
            }
            if (next.length === prev.length && next.every((id, index) => id === prev[index])) {
                return prev;
            }
            return next;
        });
    }, [apps]);

    useEffect(() => {
        if (currentPage > totalPages - 1) {
            setCurrentPage(totalPages - 1);
        }
    }, [currentPage, totalPages]);

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 50;
        if (isDraggingIcon) return;
        if (info.offset.x > threshold && currentPage > 0) {
            setCurrentPage(currentPage - 1);
        } else if (info.offset.x < -threshold && currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const getCurrentPageApps = useCallback(() => {
        const startIndex = currentPage * appsPerPage;
        return orderedApps.slice(startIndex, startIndex + appsPerPage);
    }, [currentPage, orderedApps]);

    const handleReorderDrop = useCallback((draggedId: string, point: { x: number; y: number }, updateHover = false) => {
        const pageApps = getCurrentPageApps();
        if (!pageApps.length) return;
        const bounds = gridBoundsRef.current?.getBoundingClientRect();
        const clampedPoint = bounds
            ? {
                x: Math.min(Math.max(point.x, bounds.left), bounds.right),
                y: Math.min(Math.max(point.y, bounds.top), bounds.bottom)
            }
            : point;

        const positions = pageApps
            .map((app) => {
                const node = itemRefs.current[app.id];
                if (!node) return null;
                const rect = node.getBoundingClientRect();
                return {
                    id: app.id,
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };
            })
            .filter((entry): entry is { id: string; x: number; y: number } => Boolean(entry));

        if (!positions.length) return;

        let closest = positions[0];
        let minDistance = Number.POSITIVE_INFINITY;
        for (const entry of positions) {
            const dx = entry.x - clampedPoint.x;
            const dy = entry.y - clampedPoint.y;
            const distance = dx * dx + dy * dy;
            if (distance < minDistance) {
                minDistance = distance;
                closest = entry;
            }
        }

        const targetId = closest.id;
        if (targetId === draggedId) return;
        if (updateHover && lastHoverTargetRef.current === targetId) return;

        const fromIndex = orderedIds.indexOf(draggedId);
        const toIndex = orderedIds.indexOf(targetId);
        if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;

        const next = [...orderedIds];
        next.splice(fromIndex, 1);
        next.splice(toIndex, 0, draggedId);
        setOrderedIds(next);
        onReorder?.(next);
        if (updateHover) lastHoverTargetRef.current = targetId;
    }, [getCurrentPageApps, orderedIds, onReorder]);

    return (
        <div className={`w-full h-full flex flex-col relative overflow-hidden font-sans select-none ${isFuture ? 'bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617]' : 'bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b]'}`}>
            {/* Animated Glows */}
            <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[40%] blur-[100px] rounded-full ${isFuture ? 'bg-cyan-500/25' : 'bg-indigo-500/30'}`} />
            <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] blur-[120px] rounded-full ${isFuture ? 'bg-fuchsia-500/20' : 'bg-violet-600/20'}`} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col pt-8 px-4 z-10 relative">

                {/* Search Bar - matching reference style */}
                <div className="mb-6 w-full">
                    <div className={`h-[48px] w-full backdrop-blur-2xl rounded-[24px] flex items-center px-5 border shadow-xl group transition-all ${isFuture ? 'bg-cyan-500/10 border-cyan-400/30 hover:bg-cyan-500/15' : 'bg-white/10 border-white/20 hover:bg-white/15'}`}>
                        <Search className={`w-4 h-4 mr-3 ${isFuture ? 'text-cyan-200/60' : 'text-white/50'}`} strokeWidth={2.5} />
                        <span className={`text-[15px] font-medium ${isFuture ? 'text-cyan-100/70' : 'text-white/50'}`}>Search Apps...</span>
                    </div>
                </div>

                {/* App Grid Container with rounded corners - matching reference */}
                <div className="flex-1 relative overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={currentPage}
                            drag={isDraggingIcon ? false : 'x'}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={handleDragEnd}
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute inset-0"
                        >
                            {/* Rounded container for apps */}
                            <div
                                ref={gridBoundsRef}
                                className={`relative h-full backdrop-blur-md rounded-[32px] border shadow-xl p-5 overflow-hidden ${isFuture ? 'bg-white/5 border-cyan-400/20 shadow-[0_0_25px_rgba(34,211,238,0.2)]' : 'bg-white/15 border-white/20'}`}
                            >
                                {/* 6 rows × 4 columns grid */}
                                <div className="grid grid-cols-4 grid-rows-6 gap-y-4 gap-x-3 justify-items-center h-full">
                                    {getCurrentPageApps().map((app) => (
                                        <div key={app.id} className="w-full flex justify-center">
                                            <CompactGlassIcon
                                                ref={(node) => {
                                                    itemRefs.current[app.id] = node;
                                                }}
                                                app={app}
                                                onClick={() => onOpenApp(app.id)}
                                                onDragStart={() => {
                                                    setIsDraggingIcon(true);
                                                    draggingIdRef.current = app.id;
                                                    lastHoverTargetRef.current = null;
                                                }}
                                                onDragMove={(_event, info) => {
                                                    if (!draggingIdRef.current) return;
                                                    handleReorderDrop(draggingIdRef.current, info.point, true);
                                                }}
                                                onDragEnd={(event, info) => {
                                                    setIsDraggingIcon(false);
                                                    draggingIdRef.current = null;
                                                    lastHoverTargetRef.current = null;
                                                    handleReorderDrop(app.id, info.point);
                                                }}
                                                dragConstraints={gridBoundsRef}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Page Indicators - matching reference image */}
                <div className="flex justify-center items-center gap-1.5 py-4 z-20">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <motion.div
                            key={index}
                            className={`rounded-full transition-all ${index === currentPage
                                ? 'w-2 h-2 bg-white'
                                : 'w-1.5 h-1.5 bg-white/40'
                                }`}
                            whileTap={{ scale: 1.2 }}
                            onClick={() => setCurrentPage(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
