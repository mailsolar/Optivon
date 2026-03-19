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

                border: 'rgba(255, 255, 255, 0.05)',

                accent: {
                    DEFAULT: 'rgb(var(--accent-primary) / <alpha-value>)',
                    secondary: 'rgb(var(--accent-secondary) / <alpha-value>)',
                },

                success: 'rgb(var(--status-success) / <alpha-value>)',
                error: 'rgb(var(--status-error) / <alpha-value>)',
                warning: 'rgb(var(--status-warning) / <alpha-value>)',
            },
            fontFamily: {
                sans: ['"Outfit"', 'system-ui', 'sans-serif'],
                display: ['"Oswald"', 'system-ui', 'sans-serif'],
                mono: ['"SF Mono"', 'ui-monospace', 'monospace'],
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '30': '7.5rem',
            },
            borderRadius: {
                'premium': '1.5rem',
                'instrument': '0.5rem',
            },
            backgroundImage: {
                'gentle-grid': "linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)",
                'metallic-gradient': "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
            },
            boxShadow: {
                'soft': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
                'border-glow': 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
