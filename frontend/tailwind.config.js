/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core dark palette — Nomu-inspired obsidian system
        bg: {
          primary:   '#080B12',   // deepest background
          secondary: '#0D1117',   // cards / panels
          tertiary:  '#12181F',   // elevated surface
          glass:     'rgba(13,17,23,0.72)',
        },
        border: {
          subtle:  'rgba(255,255,255,0.06)',
          default: 'rgba(255,255,255,0.10)',
          strong:  'rgba(255,255,255,0.18)',
        },
        // Brand accent — electric violet-indigo
        brand: {
          50:  '#F0EDFF',
          100: '#E0DAFF',
          200: '#C2B6FF',
          300: '#A08EFF',
          400: '#7C63FF',
          500: '#6248FF',   // primary CTA
          600: '#4F38D6',
          700: '#3D2BAD',
          800: '#2C1F84',
          900: '#1B125B',
        },
        // AI accent — cyan-teal
        ai: {
          50:  '#E0FFFE',
          100: '#C0FFFE',
          200: '#7DFFFE',
          300: '#3BFFFE',
          400: '#00FFFE',
          500: '#00D4D4',   // AI badge / highlights
          600: '#00AAAA',
          700: '#008080',
          800: '#005656',
          900: '#002B2B',
        },
        // Status palette
        success: '#22C55E',
        warning: '#F59E0B',
        error:   '#EF4444',
        info:    '#3B82F6',

        // Text system
        text: {
          primary:   '#F1F3F9',
          secondary: '#8B92A5',
          tertiary:  '#555D6E',
          disabled:  '#3A404F',
          inverse:   '#080B12',
        },
      },
      fontFamily: {
        sans:  ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Cal Sans', 'Inter var', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-mesh': `
          radial-gradient(ellipse 80% 60% at 50% -10%, rgba(98,72,255,0.25) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 85% 50%,  rgba(0,212,212,0.10) 0%, transparent 55%),
          radial-gradient(ellipse 50% 50% at 10% 80%,  rgba(98,72,255,0.12) 0%, transparent 50%)
        `,
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(255,255,255,0.01) 100%)',
        'brand-gradient': 'linear-gradient(135deg, #6248FF 0%, #00D4D4 100%)',
        'ai-pulse': 'linear-gradient(90deg, #00D4D4, #6248FF, #00D4D4)',
      },
      boxShadow: {
        'glow-brand': '0 0 20px rgba(98,72,255,0.35), 0 0 60px rgba(98,72,255,0.15)',
        'glow-ai':    '0 0 20px rgba(0,212,212,0.35), 0 0 60px rgba(0,212,212,0.10)',
        'card':       '0 1px 2px rgba(0,0,0,0.5), 0 4px 24px rgba(0,0,0,0.3)',
        'card-hover': '0 2px 4px rgba(0,0,0,0.6), 0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
        'glass':      '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        'modal':      '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in':       'fadeIn 0.4s ease forwards',
        'slide-up':      'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-in-right':'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-slow':    'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'spin-slow':     'spin 3s linear infinite',
        'float':         'float 6s ease-in-out infinite',
        'ai-thinking':   'aiThinking 1.5s ease-in-out infinite',
        'gradient-x':    'gradientX 4s ease infinite',
        'count-up':      'countUp 1s ease-out forwards',
      },
      keyframes: {
        fadeIn:       { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:      { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: 0, transform: 'translateX(30px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:        { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        aiThinking:   { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
        gradientX:    { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        countUp:      { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
