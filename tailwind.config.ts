import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0a0a0b',
          surface: '#111113',
          border: '#1e1e21',
          muted: '#3a3a3f',
          text: '#e4e4e7',
          dim: '#71717a',
          accent: '#22c55e',
          'accent-dim': '#16a34a',
        },
        cyber: {
          blue: '#3B82F6',
          amber: '#F59E0B',
          red: '#EF4444',
          purple: '#A855F7',
          cyan: '#06B6D4',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'Geist Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan-line': 'scanLine 8s linear infinite',
        'gradient-x': 'gradientX 3s ease infinite',
        'text-shimmer': 'textShimmer 2s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'glitch-loop': 'glitch 2s ease-in-out infinite',
        'matrix-fall': 'matrixFall 20s linear infinite',
        'flicker': 'flicker 0.15s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'border-flow': 'borderFlow 3s linear infinite',
        'typing': 'typing 3.5s steps(40, end)',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(34, 197, 94, 0.3), 0 0 10px rgba(34, 197, 94, 0.2)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.5), 0 0 30px rgba(34, 197, 94, 0.3)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        textShimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        glitch: {
          '0%': {
            transform: 'translate(0)',
            textShadow: '-2px 0 #ff0000, 2px 0 #00ffff',
          },
          '20%': {
            transform: 'translate(-2px, 2px)',
            textShadow: '2px 0 #ff0000, -2px 0 #00ffff',
          },
          '40%': {
            transform: 'translate(-2px, -2px)',
            textShadow: '-2px 0 #ff0000, 2px 0 #00ffff',
          },
          '60%': {
            transform: 'translate(2px, 2px)',
            textShadow: '2px 0 #ff0000, -2px 0 #00ffff',
          },
          '80%': {
            transform: 'translate(2px, -2px)',
            textShadow: '-2px 0 #ff0000, 2px 0 #00ffff',
          },
          '100%': {
            transform: 'translate(0)',
            textShadow: 'none',
          },
        },
        matrixFall: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        pulseGlow: {
          '0%, 100%': {
            opacity: '1',
            filter: 'brightness(1)',
          },
          '50%': {
            opacity: '0.8',
            filter: 'brightness(1.2)',
          },
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 0%' },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(34, 197, 94, 0.2)',
        'glow-md': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-lg': '0 0 30px rgba(34, 197, 94, 0.4)',
        'glow-xl': '0 0 40px rgba(34, 197, 94, 0.5)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.4)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.4)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyber-gradient': 'linear-gradient(90deg, #22c55e, #06B6D4, #A855F7, #22c55e)',
        'border-gradient': 'linear-gradient(90deg, transparent, #22c55e, transparent)',
      },
    },
  },
  plugins: [],
}

export default config
