import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Color Picker & Image Downloader",
	description:
		"Create and download custom color images in PNG, JPEG, and SVG formats",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<AppRouterCacheProvider>
					<CssBaseline />
					{children}
					<Box
						component="footer"
						sx={{
							textAlign: 'center',
							padding: 2.5,
							marginTop: 'auto',
							borderTop: '1px solid #eee',
						}}
					>
						<Link
							href="https://github.com/sametcn99/color-img-downloader"
							target="_blank"
							rel="noopener noreferrer"
							sx={{
								color: 'primary.main',
								textDecoration: 'none',
								fontWeight: 500,
								fontSize: '14px',
								'&:hover': {
									textDecoration: 'underline',
								},
							}}
						>
							📋 Source Code
						</Link>
					</Box>
				</AppRouterCacheProvider>
			</body>
		</html>
	);
}
