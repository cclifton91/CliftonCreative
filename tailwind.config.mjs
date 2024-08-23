/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'primary': '#7F8052',
				'secondary': '#866B96',
				'tertiary': '#DCA464',
				'quaternary': '#9F422F',
				'light': '#E7E3DF',
				'dark': '#333330',
			},
			fontFamily: {
				'heading': ['DM Serif Text', 'serif'],
				'subheading': [ 'Merriweather', 'serif'],
				'body': ['DM Sans', 'sans-serif'],
			},
			animation: {
				marquee: 'marquee 100s linear infinite',
				marquee2: 'marquee2 100s linear infinite',
			},
			keyframes: {
				marquee: {
				'0%': { transform: 'translateX(0%)' },
				'100%': { transform: 'translateX(-100%)' },
				},
				marquee2: {
				'0%': { transform: 'translateX(100%)' },
				'100%': { transform: 'translateX(0%)' },
				},
			},
		},
	},
	plugins: [],
}
