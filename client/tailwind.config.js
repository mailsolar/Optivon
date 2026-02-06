/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'rgb(var(--bg-background) / <alpha-value>)',
                surface: 'rgb(var(--bg-surface) / <alpha-value>)',
                card: 'rgb(var(--bg-card) / <alpha-value>)',

                primary: 'rgb(var(--text-primary) / <alpha-value>)',
                secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
                muted: 'rgb(var(--text-muted) / <alpha-value>)',

                border: 'rgb(var(--border-color) / <alpha-value>)',

                accent: {
                    DEFAULT: 'rgb(var(--accent-primary) / <alpha-value>)',
                    secondary: 'rgb(var(--accent-secondary) / <alpha-value>)',
                },

                success: 'rgb(var(--status-success) / <alpha-value>)',
                error: 'rgb(var(--status-error) / <alpha-value>)',
                warning: 'rgb(var(--status-warning) / <alpha-value>)',

                // Legacy mappings for smoother migration (mapped to semantic)
                cyber: {
                    black: '#000000',
                    dark: '#0a0a12', // Keep for absolute hardcoded needs
                    cyan: 'rgb(var(--accent-primary) / <alpha-value>)',
                    purple: 'rgb(var(--accent-secondary) / <alpha-value>)',
                },

                // Satoshi Brand Palette
                brand: {
                    dark: '#17172B',   // Deep Purple/Navy
                    lime: '#F5FFAB',   // Acid Lime
                    blue: '#3431A5',   // Royal Blue
                },
                optivon: {
                    primary: 'rgb(var(--optivon-primary) / <alpha-value>)',
                    surface: 'rgb(var(--optivon-surface) / <alpha-value>)',
                    bg: 'rgb(var(--optivon-bg) / <alpha-value>)',
                    text: 'rgb(var(--optivon-text) / <alpha-value>)',
                    muted: 'rgb(var(--optivon-muted) / <alpha-value>)',
                }
            },
            fontFamily: {
                sans: ['"Inter"', 'sans-serif'], // UI Font
                display: ['"Orbitron"', 'sans-serif'], // Headings
                mono: ['"Share Tech Mono"', 'monospace'], // Numbers
                orb: ['"Orbitron"', 'sans-serif'], // Legacy alias
            },
            backgroundImage: {
                'grid-pattern': "linear-gradient(to right, rgb(var(--border-color) / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--border-color) / 0.05) 1px, transparent 1px)",
                'cyber-grid': "radial-gradient(circle at center, transparent 0%, rgb(var(--bg-background)) 100%), linear-gradient(rgb(var(--border-color) / 0.1) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--border-color) / 0.1) 1px, transparent 1px)",
            },
            boxShadow: {
                'glow': '0 0 20px rgb(var(--accent-primary) / 0.3)',
                'card': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
