/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Earthy Natural Palette
        'earth-clay': '#A0522D',
        'earth-terracotta': '#C8553D',
        'earth-rust': '#B85C38',
        'earth-amber': '#D4A574',
        'earth-sand': '#E8D5B7',

        // Botanical Greens
        'forest-deep': '#2C5F2D',
        'forest-moss': '#4A7C59',
        'forest-sage': '#7D8F69',
        'forest-mint': '#B5C99A',
        'forest-celery': '#D4E09B',

        // Natural Browns
        'wood-dark': '#3E2723',
        'wood-walnut': '#5D4037',
        'wood-cedar': '#795548',
        'wood-oak': '#8D6E63',
        'wood-birch': '#A1887F',

        // Soft Neutrals
        'cream-light': '#FAF8F3',
        'cream-warm': '#F5F1E8',
        'cream-beige': '#E8DCC7',
        'stone-light': '#D9D3C7',
        'stone-gray': '#B4AFA4',
        'charcoal': '#4A4A42',

        // Accent Colors
        'sunset-coral': '#E07A5F',
        'sunrise-peach': '#F2A490',
        'earth-gold': '#C9A961',
        'sky-blue': '#88B2CC',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        accent: ['var(--font-accent)'],
      },
      backgroundImage: {
        'gradient-earth': 'linear-gradient(135deg, #B85C38 0%, #D4A574 100%)',
        'gradient-forest': 'linear-gradient(135deg, #2C5F2D 0%, #B5C99A 100%)',
        'gradient-sunset': 'linear-gradient(180deg, #E07A5F 0%, #F2A490 100%)',
        'gradient-natural': 'linear-gradient(135deg, #FAF8F3 0%, #E8DCC7 100%)',
      },
      keyframes: {
        floatLeaf: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)', opacity: '0.1' },
          '50%': { transform: 'translateY(-40px) rotate(180deg)', opacity: '0.2' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.1) rotate(5deg)' },
        },
        organicGrow: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(0deg) translateX(0)' },
          '25%': { transform: 'rotate(-3deg) translateX(-5px)' },
          '75%': { transform: 'rotate(3deg) translateX(5px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'floatLeaf 15s ease-in-out infinite',
        breathe: 'breathe 8s ease-in-out infinite',
        grow: 'organicGrow 3s ease-in-out infinite',
        sway: 'sway 4s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 1s ease-out',
      },
    },
  },
  plugins: [],
}
