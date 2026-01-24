/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cyber: {
                    black: '#050505',
                    dark: '#0a0a12',
                    cyan: '#00f3ff',
                    purple: '#bd00ff',
                    pink: '#ff00dc',
                    green: '#00ff9f',
                    yellow: '#faff00'
                },
            },
            fontFamily: {
                orb: ['"Orbitron"', 'sans-serif'],
                mono: ['"Share Tech Mono"', 'monospace'],
                sans: ['"Rajdhani"', 'sans-serif'],
            },
            backgroundImage: {
                'cyber-grid': "radial-gradient(circle at center, transparent 0%, #000 100%), linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)",
            },
            boxShadow: {
                'neon-cyan': '0 0 10px #00f3ff, 0 0 20px #00f3ff, 0 0 40px #00f3ff',
                'neon-purple': '0 0 10px #bd00ff, 0 0 20px #bd00ff, 0 0 40px #bd00ff',
                'neon-pink': '0 0 10px #ff00dc, 0 0 20px #ff00dc, 0 0 40px #ff00dc',
            },
            textShadow: {
                'neon': '0 0 5px #fff, 0 0 10px #fff, 0 0 20px #00f3ff, 0 0 40px #00f3ff',
            }
        },
    },
    plugins: [],
}
