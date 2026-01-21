'use client';

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

type SpringCounterProps = {
    value: number;
    direction?: "up" | "down";
    className?: string;
    prefix?: string;
    suffix?: string;
};

export const SpringCounter = ({ value, direction = "up", className = "", prefix = "", suffix = "" }: SpringCounterProps) => {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(direction === "down" ? value : 0);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
    });
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [motionValue, isInView, value]);

    useEffect(() => {
        springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = prefix + Intl.NumberFormat("en-US").format(latest.toFixed(0) as any) + suffix;
            }
        });
    }, [springValue, prefix, suffix]);

    return <span className={className} ref={ref} />;
};
