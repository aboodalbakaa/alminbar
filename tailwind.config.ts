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
        navy: {
          DEFAULT: '#1B2A4A',
          light: '#243659',
          dark: '#142039',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#D4B76A',
          dark: '#B89238',
        },
        cream: '#FAFAFA',
      },
      fontFamily: {
        arabic: ['var(--font-arabic)', 'serif'],
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#1B2A4A',
            '--tw-prose-headings': '#1B2A4A',
            '--tw-prose-links': '#C9A84C',
            '--tw-prose-bold': '#1B2A4A',
            '--tw-prose-hr': '#C9A84C40',
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [typography],
}

export default config
