/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
          bg: 'hsl(var(--success-bg))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          bg: 'hsl(var(--warning-bg))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 14px)',
      },
      boxShadow: {
        soft: '0 1px 2px hsl(220 33% 11% / 0.04), 0 8px 24px -8px hsl(220 33% 11% / 0.08)',
        'soft-lg': '0 4px 12px -2px hsl(220 33% 11% / 0.08), 0 24px 48px -12px hsl(220 33% 11% / 0.12)',
        'glow-primary': '0 0 0 1px hsl(221 83% 53% / 0.18), 0 12px 32px -8px hsl(221 83% 53% / 0.35)',
        glass: 'inset 0 1px 0 hsl(0 0% 100% / 0.6), 0 8px 32px -8px hsl(220 33% 11% / 0.08)',
        'glass-dark': 'inset 0 1px 0 hsl(0 0% 100% / 0.06), 0 12px 40px -12px hsl(0 0% 0% / 0.5)',
      },
      backgroundImage: {
        'mesh-light':
          'radial-gradient(at 20% 10%, hsl(221 83% 53% / 0.10) 0px, transparent 50%), radial-gradient(at 80% 20%, hsl(280 70% 60% / 0.08) 0px, transparent 55%), radial-gradient(at 40% 90%, hsl(190 80% 55% / 0.06) 0px, transparent 50%)',
        'mesh-dark':
          'radial-gradient(at 20% 10%, hsl(221 83% 53% / 0.14) 0px, transparent 50%), radial-gradient(at 80% 20%, hsl(280 70% 60% / 0.10) 0px, transparent 55%), radial-gradient(at 40% 90%, hsl(190 80% 55% / 0.08) 0px, transparent 50%)',
        shimmer:
          'linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.18) 50%, transparent)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'fade-in': {
          from: { opacity: 0, transform: 'translateY(4px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-up': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'subtle-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.55 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-150% 0' },
          '100%': { backgroundPosition: '250% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-up': 'fade-up 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        'subtle-pulse': 'subtle-pulse 2.5s ease-in-out infinite',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
