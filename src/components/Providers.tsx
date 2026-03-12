"use client";

import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { ReactNode } from "react";

const darkTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#7dd3fc",
			light: "#bae6fd",
			dark: "#0ea5e9",
		},
		secondary: {
			main: "#fbbf24",
			light: "#fde68a",
			dark: "#f59e0b",
		},
		background: {
			default: "#040b16",
			paper: "#0b1424",
		},
		text: {
			primary: "#e5eefb",
			secondary: "#93a8c6",
		},
		divider: alpha("#d7e4f8", 0.1),
	},
	shape: {
		borderRadius: 14,
	},
	typography: {
		fontFamily: "var(--font-geist-sans)",
		h1: {
			fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
			fontWeight: 800,
			letterSpacing: "-0.04em",
			lineHeight: 0.98,
		},
		h2: {
			fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
			fontWeight: 750,
			letterSpacing: "-0.035em",
			lineHeight: 1.02,
		},
		h3: {
			fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
			fontWeight: 720,
			letterSpacing: "-0.03em",
		},
		h4: {
			fontWeight: 700,
			letterSpacing: "-0.02em",
		},
		h5: {
			fontWeight: 680,
			letterSpacing: "-0.015em",
		},
		h6: {
			fontWeight: 650,
			letterSpacing: "-0.01em",
		},
		button: {
			fontWeight: 700,
			letterSpacing: "-0.01em",
			textTransform: "none",
		},
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				":root": {
					colorScheme: "dark",
				},
				body: {
					backgroundColor: "#040b16",
					backgroundImage:
						"radial-gradient(circle at top left, rgba(125, 211, 252, 0.18), transparent 26%), radial-gradient(circle at top right, rgba(251, 191, 36, 0.12), transparent 24%), linear-gradient(180deg, #07111f 0%, #040b16 52%, #040916 100%)",
					backgroundAttachment: "fixed",
				},
				"::selection": {
					backgroundColor: alpha("#7dd3fc", 0.28),
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: "none",
					backdropFilter: "blur(18px)",
					border: `1px solid ${alpha("#d7e4f8", 0.08)}`,
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					backgroundImage: "none",
					backgroundColor: alpha("#0b1424", 0.84),
					border: `1px solid ${alpha("#d7e4f8", 0.08)}`,
					boxShadow: "0 24px 64px rgba(0, 0, 0, 0.26)",
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 14,
					paddingInline: 18,
				},
				containedPrimary: {
					boxShadow: "0 18px 40px rgba(14, 165, 233, 0.26)",
				},
				outlined: {
					borderColor: alpha("#d7e4f8", 0.18),
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					borderRadius: 12,
					fontWeight: 600,
				},
				outlined: {
					borderColor: alpha("#d7e4f8", 0.12),
					backgroundColor: alpha("#08111f", 0.6),
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: 12,
					backgroundColor: alpha("#09111f", 0.72),
					transition: "border-color 150ms ease, background-color 150ms ease",
					"&:hover .MuiOutlinedInput-notchedOutline": {
						borderColor: alpha("#7dd3fc", 0.3),
					},
					"&.Mui-focused": {
						backgroundColor: alpha("#0b172a", 0.92),
					},
				},
				notchedOutline: {
					borderColor: alpha("#d7e4f8", 0.12),
				},
			},
		},
		MuiDialog: {
			styleOverrides: {
				paper: {
					backgroundColor: alpha("#09111f", 0.96),
					border: `1px solid ${alpha("#d7e4f8", 0.1)}`,
					boxShadow: "0 32px 80px rgba(0, 0, 0, 0.42)",
				},
			},
		},
		MuiDivider: {
			styleOverrides: {
				root: {
					borderColor: alpha("#d7e4f8", 0.08),
				},
			},
		},
	},
});

interface ProvidersProps {
	children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
	return (
		<AppRouterCacheProvider>
			<ThemeProvider theme={darkTheme}>{children}</ThemeProvider>
		</AppRouterCacheProvider>
	);
}
