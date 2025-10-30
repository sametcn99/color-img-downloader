"use client";

import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	Paper,
	Stack,
	Typography,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ColorInputs } from "../components/ColorPicker/ColorInputs";
import { ColorPreview } from "../components/ColorPicker/ColorPreview";
import { ColorSliders } from "../components/ColorPicker/ColorSliders";
import { ColorWheelModal } from "../components/ColorPicker/ColorWheelModal";
import { DownloadControls } from "../components/ColorPicker/DownloadControls";
import type { DownloadOptions, RGBAColor } from "../types/color";
import { rgbaToString } from "../utils/colorConversions";
import {
	downloadColorImage,
	getDefaultDownloadOptions,
} from "../utils/imageGeneration";
import { parseColorRequestFromSearchParams } from "../utils/searchParamParsers";

export default function Home() {
	const searchParams = useSearchParams();
	const parsedRequest = useMemo(
		() => parseColorRequestFromSearchParams(searchParams),
		[searchParams],
	);
	const {
		active,
		color: searchColor,
		size,
		download,
		extension,
		errors,
	} = parsedRequest;
	const hasSearchErrors = errors.length > 0;

	const downloadOptions = useMemo<DownloadOptions>(() => {
		const options: DownloadOptions = {
			format: extension,
			width: size.width,
			height: size.height,
		};

		if (extension === "jpeg") {
			const defaults = getDefaultDownloadOptions();
			if (defaults.quality) {
				options.quality = defaults.quality;
			}
		}

		return options;
	}, [extension, size.height, size.width]);

	const [downloadError, setDownloadError] = useState<string | null>(null);
	const downloadSignatureRef = useRef<string | null>(null);
	const [isManualDownloadPending, setIsManualDownloadPending] = useState(false);
	const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

	const openInfoDialog = () => setIsInfoDialogOpen(true);
	const closeInfoDialog = () => setIsInfoDialogOpen(false);

	useEffect(() => {
		if (!active || !download || hasSearchErrors || !searchColor) {
			return;
		}

		const signature = [
			downloadOptions.format,
			downloadOptions.width,
			downloadOptions.height,
			downloadOptions.quality ?? "no-quality",
			searchColor.r,
			searchColor.g,
			searchColor.b,
			searchColor.a,
		].join("-");

		if (downloadSignatureRef.current === signature) {
			return;
		}

		downloadSignatureRef.current = signature;
		setDownloadError(null);

		let cancelled = false;

		(async () => {
			try {
				await downloadColorImage(searchColor, downloadOptions);
			} catch (error) {
				if (cancelled) {
					return;
				}

				setDownloadError(
					error instanceof Error
						? error.message
						: "An error occurred while downloading the color image.",
				);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [active, download, hasSearchErrors, searchColor, downloadOptions]);

	const [color, setColor] = useState<RGBAColor>({
		r: 255,
		g: 87,
		b: 34,
		a: 1,
	});

	const handleColorChange = (newColor: RGBAColor) => {
		setColor(newColor);
	};

	if (active) {
		if (hasSearchErrors || !searchColor) {
			return (
				<Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
					<Paper
						elevation={3}
						sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, textAlign: "left" }}
					>
						<Typography variant="h5" gutterBottom>
							Parameter error
						</Typography>
						<Divider sx={{ mb: 2 }} />
						<Stack spacing={1}>
							{errors.map((error) => (
								<Typography key={error} variant="body2" color="error">
									{error}
								</Typography>
							))}
						</Stack>
					</Paper>
				</Container>
			);
		}

		if (download) {
			return (
				<Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
					<Paper
						elevation={2}
						sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, textAlign: "center" }}
					>
						<Typography variant="h6" gutterBottom>
							Preparing your color file...
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
							The download should start automatically. If it does not, please
							check your browser's pop-up settings.
						</Typography>
						{downloadError && (
							<Typography variant="body2" color="error">
								{downloadError}
							</Typography>
						)}
					</Paper>
				</Container>
			);
		}

		const maxDimension = 600;
		const widthScale = maxDimension / size.width;
		const heightScale = maxDimension / size.height;
		const scale = Math.min(1, widthScale, heightScale);

		const previewWidth = Math.max(1, Math.round(size.width * scale));
		const previewHeight = Math.max(1, Math.round(size.height * scale));
		const colorString = rgbaToString(searchColor);
		const hasTransparency = searchColor.a < 1;
		const handleManualDownload = async () => {
			setDownloadError(null);
			setIsManualDownloadPending(true);
			try {
				await downloadColorImage(searchColor, downloadOptions);
			} catch (error) {
				setDownloadError(
					error instanceof Error
						? error.message
						: "An error occurred while downloading the color image.",
				);
			} finally {
				setIsManualDownloadPending(false);
			}
		};

		return (
			<Box
				component="main"
				sx={{
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					bgcolor: "background.default",
					p: 3,
				}}
			>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 2,
					}}
				>
					<Box
						sx={{
							position: "relative",
							borderRadius: 2,
							overflow: "hidden",
							boxShadow: 6,
							width: previewWidth,
							height: previewHeight,
							backgroundColor: colorString,
							backgroundImage: hasTransparency
								? `linear-gradient(45deg, #ccc 25%, transparent 25%),
					            linear-gradient(-45deg, #ccc 25%, transparent 25%),
					            linear-gradient(45deg, transparent 75%, #ccc 75%),
					            linear-gradient(-45deg, transparent 75%, #ccc 75%)`
								: "none",
							backgroundSize: hasTransparency ? "20px 20px" : "auto",
							backgroundPosition: hasTransparency
								? "0 0, 0 10px, 10px -10px, -10px 0"
								: "auto",
						}}
					>
						{hasTransparency && (
							<Box
								sx={{
									position: "absolute",
									inset: 0,
									backgroundColor: colorString,
								}}
							/>
						)}
					</Box>
					<Typography variant="body2" color="text.secondary">
						{size.width}×{size.height} · {extension.toUpperCase()}
					</Typography>
					<Button
						variant="contained"
						onClick={handleManualDownload}
						disabled={isManualDownloadPending}
					>
						{isManualDownloadPending ? "Downloading..." : "Download color"}
					</Button>
					{downloadError && (
						<Typography variant="body2" color="error">
							{downloadError}
						</Typography>
					)}
				</Box>
			</Box>
		);
	}

	return (
		<>
			<Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
				{/* Header Section */}
				<Paper
					elevation={0}
					sx={{
						color: "white",
						p: { xs: 3, md: 4 },
						mb: 4,
						borderRadius: 3,
						textAlign: "center",
					}}
				>
					<Typography
						variant="h3"
						component="h1"
						fontWeight="bold"
						sx={{ mb: 2 }}
					>
						Color Studio
					</Typography>
					<Typography
						variant="h6"
						sx={{ opacity: 0.9, maxWidth: 600, mx: "auto" }}
					>
						Professional color picker with advanced controls and export options
					</Typography>
					<Stack
						direction="row"
						spacing={1}
						justifyContent="center"
						sx={{ mt: 2 }}
					>
						<Chip
							label="PNG Export"
							variant="outlined"
							sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
						/>
						<Chip
							label="JPEG Export"
							variant="outlined"
							sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
						/>
						<Chip
							label="SVG Export"
							variant="outlined"
							sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
						/>
					</Stack>
					<Box
						sx={{
							mt: 3,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 1.5,
						}}
					>
						<Typography
							variant="body1"
							align="center"
							sx={{ color: "rgba(255,255,255,0.85)" }}
						>
							Instantly load or download colors with URL search parameters.
						</Typography>
						<Button
							variant="outlined"
							color="inherit"
							onClick={openInfoDialog}
							sx={{ borderColor: "rgba(255,255,255,0.4)" }}
						>
							Learn how it works
						</Button>
					</Box>
				</Paper>

				<Grid container spacing={3}>
					{/* Color Preview Section */}
					<Grid
						size={{
							lg: 4,
							xs: 12,
						}}
					>
						<Card
							elevation={2}
							sx={{
								height: "100%",
								borderRadius: 3,
								overflow: "visible",
							}}
						>
							<CardContent sx={{ p: 3 }}>
								<Typography variant="h6" fontWeight="600" gutterBottom>
									Color Preview
								</Typography>
								<Divider sx={{ mb: 3 }} />

								<Stack spacing={3} alignItems="center">
									<ColorPreview color={color} size={200} />
									<ColorWheelModal
										color={color}
										onColorChange={handleColorChange}
										size={200}
										modalSize={500}
									/>
								</Stack>
							</CardContent>
						</Card>
					</Grid>

					{/* Controls Section */}
					<Grid
						size={{
							lg: 8,
							xs: 12,
						}}
					>
						<Stack spacing={3}>
							{/* Color Inputs */}
							<Card elevation={2} sx={{ borderRadius: 3 }}>
								<CardContent sx={{ p: 3 }}>
									<Typography variant="h6" fontWeight="600" gutterBottom>
										Precise Controls
									</Typography>
									<Divider sx={{ mb: 3 }} />
									<ColorInputs
										color={color}
										onColorChange={handleColorChange}
									/>
								</CardContent>
							</Card>

							{/* Color Sliders */}
							<Card elevation={2} sx={{ borderRadius: 3, height: "100%" }}>
								<CardContent sx={{ p: 3, height: "100%" }}>
									<Typography variant="h6" fontWeight="600" gutterBottom>
										Visual Sliders
									</Typography>
									<Divider sx={{ mb: 3 }} />
									<ColorSliders
										color={color}
										onColorChange={handleColorChange}
									/>
								</CardContent>
							</Card>
						</Stack>
					</Grid>

					{/* Download Section */}
					<Grid
						size={{
							lg: 12,
							xs: 12,
						}}
					>
						<Card
							elevation={3}
							sx={{
								borderRadius: 3,
							}}
						>
							<CardContent sx={{ p: 4 }}>
								<Box textAlign="center" sx={{ mb: 3 }}>
									<Typography variant="h6" fontWeight="600" gutterBottom>
										Export Your Color
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Download your custom color in multiple formats
									</Typography>
								</Box>

								<Box display="flex" justifyContent="center">
									<Box sx={{ maxWidth: 500, width: "100%" }}>
										<DownloadControls color={color} />
									</Box>
								</Box>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Container>

			<Dialog
				open={isInfoDialogOpen}
				onClose={closeInfoDialog}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>URL Search Parameters</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={2}>
						<Typography>
							Color Studio can be launched directly into a specific color or
							download state by appending query parameters to the page URL. The
							following keys are supported:
						</Typography>
						<Box component="ul" sx={{ pl: 3, m: 0 }}>
							<Typography component="li" variant="body2">
								<code>format</code> — Accepts any supported color format listed
								in the app (hex, rgb, rgba, hsl, hsla, hsv, hsva, cmyk, lab,
								hwb, lch).
							</Typography>
							<Typography component="li" variant="body2">
								<code>formatValue</code> — The value for the chosen format.
								Provide data exactly as you would write it in the UI (e.g.&nbsp;
								<code>#ff5733</code>, <code>255,87,34</code>,{" "}
								<code>0,66,87,0</code>).
							</Typography>
							<Typography component="li" variant="body2">
								<code>size</code> — Optional image dimensions in{" "}
								<code>widthxheight</code> form (such as <code>1280x720</code>).
								If omitted, default export dimensions are used.
							</Typography>
							<Typography component="li" variant="body2">
								<code>download</code> — Set to <code>true</code> to immediately
								trigger a download, or <code>false</code> to render a minimalist
								preview page.
							</Typography>
							<Typography component="li" variant="body2">
								<code>extension</code> — Desired file format for downloads:{" "}
								<code>png</code>, <code>jpeg</code>, or <code>svg</code>.{" "}
								<code>jpg</code> is accepted as an alias for <code>jpeg</code>.
							</Typography>
						</Box>
						<Typography>
							Example preview (no auto-download):
							<br />
							<code>
								?format=hex&amp;formatValue=ff5733&amp;size=1280x720&amp;download=false&amp;extension=png
							</code>
						</Typography>
						<Typography>
							Example direct download:
							<br />
							<code>
								?format=rgba&amp;formatValue=255,87,34,1&amp;size=512x512&amp;download=true&amp;extension=svg
							</code>
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Leave every parameter unset to use Color Studio in its interactive
							default mode.
						</Typography>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={closeInfoDialog} autoFocus>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
