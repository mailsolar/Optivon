/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                background: 'rgb(var(--bg-background) / <alpha-value>)',
                surface: 'rgb(var(--bg-surface) / <alpha-value>)',
                primary: 'rgb(var(--text-primary) / <alpha-value>)',
                secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
                muted: 'rgb(var(--text-muted) / <alpha-value>)',
                border: 'rgb(var(--border-color) / <alpha-value>)',
                accent: 'rgb(var(--accent) / <alpha-value>)',
            },
            fontFamily: {
                sans: ['"Inter"', 'system-ui', 'sans-serif'],
                display: ['"Playfair Display"', 'Georgia', 'serif'],
            },
            boxShadow: {
                'magazine': '0 20px 40px rgba(0,0,0,0.04)',
                'sharp': '4px 4px 0px rgba(20,20,20,1)',
            },
            transitionTimingFunction: {
                'slow': 'cubic-bezier(0.16, 1, 0.3, 1)',
            }
        },
    },
    plugins: [],
}
