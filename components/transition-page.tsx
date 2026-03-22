"use client";

import React from 'react'
import { staircaseVariants } from '@/utils/motion-transitions';
import { AnimatePresence, motion } from 'framer-motion';

const TransitionPage = () => {
    return (
        <AnimatePresence mode="wait">
            <div className='pointer-events-none'>
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="fixed top-0 bottom-0 right-0 w-[20vw] z-[60] bg-slate-900"
                        style={{ left: `${i * 20}%` }}
                        variants={staircaseVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{
                            duration: 0.5,
                            ease: 'easeInOut',
                            delay: i * 0.1
                        }}
                    />
                ))}
            </div>
        </AnimatePresence>
    )
}

export default TransitionPage