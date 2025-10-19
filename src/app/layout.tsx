import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Link from "@mui/material/Link";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";

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
			<head>
				<script
					defer
					src="https://umami.sametcc.me/script.js"
					data-website-id="099e8745-8e8a-4325-877a-3c5a4f6b9746"
				></script>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<Providers>
					<CssBaseline />
					{children}
					<Box
						component="footer"
						sx={{
							textAlign: "center",
							padding: 2.5,
							marginTop: "auto",
							borderTop: "1px solid",
							borderColor: "divider",
						}}
					>
						<Link
							href="https://sametcc.me/color-img-downloader"
							target="_blank"
							rel="noopener noreferrer"
							sx={{
								color: "primary.main",
								textDecoration: "none",
								fontWeight: 500,
								fontSize: "14px",
								"&:hover": {
									textDecoration: "underline",
								},
							}}
						>
							📋 Source Code
						</Link>
					</Box>
					<Analytics />
				</Providers>
			</body>
		</html>
	);
}
