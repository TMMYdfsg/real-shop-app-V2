export const transitions = {
    spring: {
        type: "spring",
        stiffness: 500,
        damping: 30
    },
    smooth: {
        duration: 0.3,
        ease: "easeInOut"
    }
};

export const variants = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    },
    popIn: {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.8, opacity: 0 }
    },
    slideUp: {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -20, opacity: 0 }
    },
    container: {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    },
    item: {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }
};

export const sounds = {
    // Placeholder for sound effects hooks or calls
    playSuccess: () => console.log('Ping! Success'),
    playFail: () => console.log('Buzz! Fail'),
    playClick: () => console.log('Click')
};
