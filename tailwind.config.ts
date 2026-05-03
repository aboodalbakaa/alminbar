import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        ink: {
          DEFAULT: '#1B2A4A',
          soft: '#4A5878',
          faint: '#8794AB',
        },
        clay: {
          DEFAULT: '#FAFAF6',
          deep: '#F1ECDF',
          line: '#E4DCC9',
        },
        gold: {
          DEFAULT: '#B8923A',
          soft: '#D4B76A',
          light: '#D4B76A',
          dark: '#9A7C36',
        },
        terracotta: {
          DEFAULT: '#8B3A2F',
        },
        // Legacy aliases (keep for backward compat)
        navy: {
          DEFAULT: '#1B2A4A',
          light: '#243659',
          dark: '#142039',
        },
        cream: '#FAFAF6',
      },
      fontFamily: {
        arabic: ['var(--font-arabic)', 'serif'],
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#1B2A4A',
            '--tw-prose-headings': '#1B2A4A',
            '--tw-prose-links': '#B8923A',
            '--tw-prose-bold': '#1B2A4A',
            '--tw-prose-hr': '#B8923A40',
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [typography],
}

export default config
