"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { ReactNode } from "react";

// Koyu tema oluştur
const darkTheme = createTheme({
	palette: {
		mode: "dark",
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
