export const ANIM = {
    duration: {
        fast: 0.2,
        normal: 0.4,
        slow: 0.8,
        slower: 1.2
    },
    ease: {
        default: [0.25, 0.1, 0.25, 1.0] as const, // cubic-bezier(0.25, 0.1, 0.25, 1.0) approx to ease
        outBack: [0.175, 0.885, 0.32, 1.275] as const, // soft bounce
        inOut: [0.42, 0, 0.58, 1] as const
    }
};

export const VARIANTS = {
    page: {
        initial: { opacity: 0, y: 20 },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: ANIM.duration.normal,
                ease: ANIM.ease.default
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: ANIM.duration.fast,
                ease: ANIM.ease.inOut
            }
        }
    },
    fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    },
    slideInRight: {
        hidden: { x: '100%' },
        visible: {
            x: 0,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        },
        exit: { x: '100%' }
    },
    popup: {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1, opacity: 1,
            transition: { type: 'spring', stiffness: 400, damping: 25 }
        },
        exit: { scale: 0.8, opacity: 0 }
    },
    listItem: {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    }
};

export const TRANSITIONS = {
    spring: { type: 'spring' as const, stiffness: 400, damping: 30 },
    gentle: { duration: ANIM.duration.normal, ease: ANIM.ease.default }
};
