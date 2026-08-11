/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,ts,css}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Google Sans Flex"', 'sans-serif'],
                google: ['"Google Sans Flex"', 'sans-serif'],
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
            },
            borderRadius: {
                'dashboard': '2rem', //  32px
            }
        },
        plugins: [],
    }
};