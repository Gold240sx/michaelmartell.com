export type Theme = {
	name: string
	id: string
	hc?: boolean
	background: string
	backgroundOverlay?: string
	colors: {
		primary: string
		secondary: string
		accent: string
		text: string
		border: string
	}
}

export const themes: Theme[] = [
	{
		name: "Light",
		id: "light",
		background: "#F6F6F6",
		colors: {
			primary: "#ffffff",
			secondary: "#f0f0f0",
			accent: "linear-gradient(to right, #FFCD4C, #FF824C, #FF0F90)",
			text: "#6F6F6F",
			border: "#e0e0e0",
		},
	},
	{
		name: "Light Blue",
		id: "light-blue",
		background: "#E4EEF6",
		backgroundOverlay: "linear-gradient(180deg, #CDDEEA 0%, #E5EEF6 100%)",
		colors: {
			primary: "#ffffff",
			secondary: "linear-gradient(to bottom right, #F3FCFF, #E2F1F7)",
			accent: "linear-gradient(to bottom right, #5CC8FC, #34ACFF)",
			text: "#687E8D",
			border: "#d1e2f2",
		},
	},
	{
		name: "Dark Blue",
		id: "dark-blue",
		background: "#343434",
		backgroundOverlay: "linear-gradient(180deg, #1F2225 0%, #25282C 100%)",
		colors: {
			primary: "#404040",
			secondary: "linear-gradient(to bottom right, #262A2C, #1C2123)",
			accent: "linear-gradient(to bottom right, #45F2BE, #6CC7DB)",
			text: "#7C8395",
			border: "#4a4a4a",
		},
	},
	{
		name: "Dark",
		id: "dark",
		background: "#262626",
		backgroundOverlay: "linear-gradient(180deg, #1B1C1C 0%, #292A2A 100%)",
		colors: {
			primary: "#2a2b2b",
			secondary: "linear-gradient(to bottom right, #242728, #181A1D)",
			accent: "linear-gradient(to bottom right, #A2DB01, #ADCC01, #6D9301)",
			text: "#ffffff",
			border: "#3a3a3a",
		},
	},
	{
		name: "High Contrast Light",
		hc: true,
		id: "high-contrast-light",
		background: "#ffffff",
		colors: {
			primary: "#ffffff",
			secondary: "#f0f0f0",
			accent: "#000000",
			text: "#000000",
			border: "#000000",
		},
	},
	{
		name: "High Contrast Dark",
		hc: true,
		id: "high-contrast-dark",
		background: "#000000",
		colors: {
			primary: "#000000",
			secondary: "#1a1a1a",
			accent: "#ffffff",
			text: "#ffffff",
			border: "#ffffff",
		},
	},
]
