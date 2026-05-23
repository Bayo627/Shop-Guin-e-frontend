/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E63946', // Rouge vif premium
          dark: '#C82935',
          light: '#FDF0F1',
        },
        secondary: {
          DEFAULT: '#2B2D42', // Noir élégant
          dark: '#1A1C2C',
          light: '#8D99AE',
        },
        accent: {
          DEFAULT: '#F4A261', // Orange chaleureux
          dark: '#E76F51',
          light: '#FFEBD6',
        },
        gn: {
          red: '#CE1126', // Rouge drapeau
          yellow: '#FCD116', // Jaune drapeau
          green: '#009460', // Vert drapeau
          greenDark: '#007A33',
        },
        bodyBg: '#F8F9FA',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px rgba(0, 0, 0, 0.04)',
        'premium-hover': '0 20px 40px rgba(0, 0, 0, 0.08)',
        'glow-red': '0 0 15px rgba(230, 57, 70, 0.35)',
        'glow-yellow': '0 0 15px rgba(252, 209, 22, 0.35)',
      }
    },
  },
  plugins: [],
}
