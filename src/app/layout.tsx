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
					<Box
						sx={{
							minHeight: "100vh",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<Box component="div" sx={{ flex: 1 }}>
							{children}
						</Box>
						<Box
							component="footer"
							sx={{
								mt: { xs: 6, md: 8 },
								px: { xs: 2.5, md: 4 },
								pb: { xs: 3, md: 4 },
							}}
						>
							<Box
								sx={{
									maxWidth: 1280,
									mx: "auto",
									px: { xs: 2.5, md: 3 },
									py: 2.5,
									borderRadius: 20,
									border: "1px solid",
									borderColor: "divider",
									backgroundColor: "rgba(8, 15, 27, 0.68)",
									backdropFilter: "blur(18px)",
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									gap: 2,
									flexDirection: { xs: "column", md: "row" },
								}}
							>
								<Box sx={{ color: "text.secondary", fontSize: 14 }}>
									Color Studio for clean color inspection and export workflows.
								</Box>
								<Link
									href="https://sametcc.me/repo/color-img-downloader"
									target="_blank"
									rel="noopener noreferrer"
									sx={{
										color: "text.primary",
										textDecoration: "none",
										fontWeight: 600,
										fontSize: 14,
										"&:hover": {
											color: "primary.light",
										},
									}}
								>
									View source
								</Link>
							</Box>
						</Box>
					</Box>
					<Analytics />
				</Providers>
			</body>
		</html>
	);
}
