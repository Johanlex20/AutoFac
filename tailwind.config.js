/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,ts,css}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Google Sans Flex"', 'sans-serif'],
                google: ['"Google Sans Flex"', 'sans-serif'],
                display: ['"Archivo"', 'sans-serif'],
                plex: ['"IBM Plex Sans"', 'sans-serif'],
            },
            colors: {
                'blue-dark': '#001a4a',
                'blue-dark-medium': '#034579',
                'blue-main': '#008abb',
                'blue-light': '#95cadc',
                'blue-light-very': '#d4e7ed',
                primary: '#0F172A',
                'primary-foreground': '#FFFFFF',
                secondary: '#334155',
                accent: '#0369A1',
                background: '#F8FAFC',
                foreground: '#020617',
                muted: '#E8ECF1',
                border: '#E2E8F0',
                destructive: '#DC2626',
                // Identidad de marca publica (landing + login) — distinta de los
                // colores del panel admin de arriba, que no se tocan.
                'brand-ink': '#0E1A26',
                'brand-steel': '#55677A',
                'brand-paper': '#F2F4F2',
                'brand-depth': '#123B52',
                'brand-depth-light': '#1B5170',
                'brand-signal': '#008abb',
                'brand-signal-dark': '#034579',
                'brand-line': '#D9DFDD',
            },
            borderRadius: {
                'dashboard': '2rem', //  32px
            }
        },
        plugins: [],
    }
};