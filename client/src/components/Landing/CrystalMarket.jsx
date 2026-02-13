import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// --- UTILS ---
const randomHeight = () => Math.floor(Math.random() * 250) + 150; // Taller crystals
const randomColor = () => Math.random() > 0.5 ? '#CCFF00' : '#00F0FF';

// --- PRISM COMPONENT ---
const CrystalPrism = ({ x, y, delay }) => {
    const height = useRef(randomHeight());
    const color = useRef(randomColor());
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            className="absolute"
            style={{
                left: x,
                bottom: y,
                width: 50, // Wider base
                height: height.current,
                transformStyle: 'preserve-3d',
                perspective: 1000
            }}
            initial={{ opacity: 0, y: 400, scale: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 1.5,
                delay: delay * 0.1,
                ease: [0.22, 1, 0.36, 1]
            }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
        >
            {/* PRISM STRUCTURE */}
            <motion.div
                className="relative w-full h-full cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{
                    rotateY: hovered ? 180 : 35,
                    rotateX: hovered ? 10 : -10,
                    y: hovered ? -50 : 0,
                    scale: hovered ? 1.1 : 1
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
                {/* FRONT FACE */}
                <div
                    className="absolute inset-0 border border-white/30 backdrop-blur-md"
                    style={{
                        backgroundColor: `${color.current}20`,
                        transform: 'translateZ(25px)',
                        boxShadow: `0 0 30px ${color.current}30 inset`
                    }}
                />

                {/* BACK FACE */}
                <div
                    className="absolute inset-0 border border-white/20"
                    style={{
                        backgroundColor: `${color.current}10`,
                        transform: 'translateZ(-25px) rotateY(180deg)'
                    }}
                />

                {/* RIGHT FACE */}
                <div
                    className="absolute inset-0 border border-white/30"
                    style={{
                        width: 50,
                        transform: 'rotateY(90deg) translateZ(25px)',
                        background: `linear-gradient(to bottom, transparent, ${color.current}40)`
                    }}
                />

                {/* LEFT FACE */}
                <div
                    className="absolute inset-0 border border-white/30"
                    style={{
                        width: 50,
                        transform: 'rotateY(-90deg) translateZ(25px)',
                        background: `linear-gradient(to top, transparent, ${color.current}30)`
                    }}
                />

                {/* TOP LID */}
                <div
                    className="absolute top-0 left-0 w-full bg-white"
                    style={{
                        height: 50,
                        transform: 'rotateX(90deg) translateZ(25px)',
                        boxShadow: `0 0 50px ${color.current}`
                    }}
                />

                {/* INNER CORE */}
                <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 bg-white"
                    style={{
                        height: '90%',
                        transform: 'translateZ(0px)',
                        boxShadow: `0 0 20px ${color.current}`
                    }}
                />
            </motion.div>
        </motion.div>
    );
};

export default function CrystalMarket() {
    const prisms = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        x: `${(i * 8) + 2}%`,
        y: Math.sin(i * 0.4) * 80 + 150,
        delay: i
    }));

    return (
        <div className="w-full h-full relative perspective-[1500px] overflow-visible">
            {/* AMBIENT GLOW */}
            <div className="absolute inset-0 bg-brand-lime/10 blur-[120px] rounded-full mix-blend-screen" />

            {/* THE PRISM GRID - Auto Rotating */}
            <motion.div
                className="w-full h-full relative transform-style-3d"
                initial={{ rotateY: -20, rotateX: 10 }}
                animate={{ rotateY: [-20, -10, -20] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            >
                {prisms.map((prism) => (
                    <CrystalPrism
                        key={prism.id}
                        {...prism}
                    />
                ))}
            </motion.div>

            {/* FLOATING PARTICLES */}
            {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                    key={`particle-${i}`}
                    className="absolute w-1.5 h-1.5 bg-brand-lime rounded-full blur-[1px]"
                    // FIX: Use numeric y value instead of percentage string to prevent animation type mismatch
                    initial={{ opacity: 0, x: '100%', y: 300 }}
                    animate={{
                        opacity: [0, 1, 0],
                        x: '-20%',
                        y: [300, Math.random() * 800]
                    }}
                    transition={{
                        duration: Math.random() * 5 + 8,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
}

