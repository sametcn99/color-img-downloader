"use client";

import {
	AutoAwesomeRounded,
	CloudDownloadRounded,
	InsightsRounded,
	TuneRounded,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
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
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ColorInputs } from "../components/ColorPicker/ColorInputs";
import { ColorPreview } from "../components/ColorPicker/ColorPreview";
import { ColorSliders } from "../components/ColorPicker/ColorSliders";
import { ColorWheelModal } from "../components/ColorPicker/ColorWheelModal";
import { DownloadControls } from "../components/ColorPicker/DownloadControls";
import { SquareColorPicker } from "../components/ColorPicker/SquareColorPicker";
import type { DownloadOptions, RGBAColor } from "../types/color";
import { rgbaToString } from "../utils/colorConversions";
import {
	downloadColorImage,
	getDefaultDownloadOptions,
} from "../utils/imageGeneration";
import { parseColorRequestFromSearchParams } from "../utils/searchParamParsers";

function HomeContent() {
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

	const colorSummary = rgbaToString(color);

	if (active) {
		if (hasSearchErrors || !searchColor) {
			return (
				<Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
					<Paper
						elevation={0}
						sx={{
							p: { xs: 3.5, md: 4.5 },
							borderRadius: 4,
							textAlign: "left",
							background:
								"linear-gradient(180deg, rgba(16, 26, 46, 0.96), rgba(8, 14, 27, 0.92))",
						}}
					>
						<Stack spacing={2.5}>
							<Chip
								label="URL request issue"
								color="secondary"
								variant="outlined"
								sx={{ alignSelf: "flex-start" }}
							/>
							<Box>
								<Typography variant="h4" gutterBottom>
									The requested color state could not be loaded
								</Typography>
								<Typography variant="body1" color="text.secondary">
									Some query parameters are malformed or incomplete. Review the
									messages below and try again.
								</Typography>
							</Box>
							<Divider />
							<Stack spacing={1.25}>
								{errors.map((error) => (
									<Alert key={error} severity="error" variant="outlined">
										{error}
									</Alert>
								))}
							</Stack>
						</Stack>
					</Paper>
				</Container>
			);
		}

		if (download) {
			return (
				<Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
					<Paper
						elevation={0}
						sx={{
							p: { xs: 3.5, md: 4.5 },
							borderRadius: 4,
							textAlign: "center",
							background:
								"linear-gradient(180deg, rgba(11, 21, 39, 0.96), rgba(7, 12, 23, 0.9))",
						}}
					>
						<Stack spacing={2.5} alignItems="center">
							<Chip label="Auto download" color="primary" />
							<Typography variant="h4">Preparing your color file</Typography>
							<Typography
								variant="body1"
								color="text.secondary"
								sx={{ maxWidth: 420 }}
							>
								The export should begin automatically. If nothing happens, check
								the browser download permission or popup settings.
							</Typography>
						</Stack>
						{downloadError && (
							<Alert severity="error" variant="outlined" sx={{ mt: 3 }}>
								{downloadError}
							</Alert>
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
					p: { xs: 2, md: 3 },
				}}
			>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 2.5,
						width: "100%",
						maxWidth: 720,
					}}
				>
					<Chip label="Preview mode" color="primary" />
					<Typography variant="h4" textAlign="center">
						Color asset preview
					</Typography>
					<Box
						sx={{
							position: "relative",
							borderRadius: 3,
							overflow: "hidden",
							boxShadow: "0 32px 64px rgba(0, 0, 0, 0.36)",
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
					<Stack spacing={0.75} alignItems="center">
						<Typography variant="body1">{colorString}</Typography>
						<Typography variant="body2" color="text.secondary">
							{size.width}×{size.height} · {extension.toUpperCase()}
						</Typography>
					</Stack>
					<Button
						variant="contained"
						onClick={handleManualDownload}
						disabled={isManualDownloadPending}
						size="large"
					>
						{isManualDownloadPending ? "Downloading..." : "Download color"}
					</Button>
					{downloadError && (
						<Alert severity="error" variant="outlined" sx={{ width: "100%" }}>
							{downloadError}
						</Alert>
					)}
				</Box>
			</Box>
		);
	}

	return (
		<>
			<Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 5 } }}>
				<Paper
					elevation={0}
					sx={{
						position: "relative",
						overflow: "hidden",
						p: { xs: 3, md: 5 },
						mb: 4,
						borderRadius: { xs: 3, md: 4 },
						background:
							"linear-gradient(135deg, rgba(10, 19, 34, 0.96) 0%, rgba(9, 27, 50, 0.92) 58%, rgba(47, 24, 11, 0.9) 100%)",
						"&::before": {
							content: '""',
							position: "absolute",
							inset: 0,
							background:
								"radial-gradient(circle at top left, rgba(125, 211, 252, 0.24), transparent 28%), radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.18), transparent 24%)",
							pointerEvents: "none",
						},
					}}
				>
					<Grid container spacing={4} sx={{ position: "relative", zIndex: 1 }}>
						<Grid size={{ xs: 12, lg: 8 }}>
							<Stack spacing={3}>
								<Chip
									icon={<AutoAwesomeRounded />}
									label="Creative studio workflow"
									color="default"
									sx={{ alignSelf: "flex-start", color: "text.primary" }}
								/>
								<Box>
									<Typography
										variant="h1"
										component="h1"
										sx={{ maxWidth: 760 }}
									>
										Build polished color assets with precise controls
									</Typography>
									<Typography
										variant="h6"
										color="text.secondary"
										sx={{ maxWidth: 720, mt: 2 }}
									>
										Dial in a color visually or numerically, inspect it across
										color spaces, then export clean PNG, JPEG, or SVG assets
										without leaving the workspace.
									</Typography>
								</Box>
								<Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
									<Chip
										icon={<CloudDownloadRounded />}
										label="PNG, JPEG, SVG export"
									/>
									<Chip
										icon={<TuneRounded />}
										label="Multi-format numeric controls"
									/>
									<Chip
										icon={<InsightsRounded />}
										label="Shareable URL states"
									/>
								</Stack>
								<Stack
									direction={{ xs: "column", sm: "row" }}
									spacing={1.5}
									alignItems={{ xs: "stretch", sm: "center" }}
								>
									<Button
										variant="contained"
										size="large"
										onClick={openInfoDialog}
									>
										URL parameter guide
									</Button>
									<Typography variant="body2" color="text.secondary">
										Use query params to open directly in preview or
										auto-download mode.
									</Typography>
								</Stack>
							</Stack>
						</Grid>
						<Grid size={{ xs: 12, lg: 4 }}>
							<Paper
								elevation={0}
								sx={{
									p: 3,
									height: "100%",
									background:
										"linear-gradient(180deg, rgba(9, 19, 35, 0.88), rgba(7, 12, 22, 0.72))",
								}}
							>
								<Stack spacing={2.5}>
									<Box>
										<Typography variant="overline" color="secondary.light">
											Current working color
										</Typography>
										<Typography variant="h4">{colorSummary}</Typography>
									</Box>
									<Box
										sx={{
											height: 220,
											borderRadius: 3,
											background: colorSummary,
											border: "1px solid rgba(255,255,255,0.12)",
											boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
										}}
									/>
									<Stack spacing={1.25}>
										<Stack direction="row" justifyContent="space-between">
											<Typography variant="body2" color="text.secondary">
												Formats
											</Typography>
											<Typography variant="body2">11 color spaces</Typography>
										</Stack>
										<Stack direction="row" justifyContent="space-between">
											<Typography variant="body2" color="text.secondary">
												Export pipeline
											</Typography>
											<Typography variant="body2">
												1-click asset output
											</Typography>
										</Stack>
									</Stack>
								</Stack>
							</Paper>
						</Grid>
					</Grid>
				</Paper>

				<Stack spacing={1} sx={{ mb: 3 }}>
					<Typography variant="overline" color="primary.light">
						Workspace
					</Typography>
					<Typography variant="h3">Pick, inspect, and refine</Typography>
					<Typography
						variant="body1"
						color="text.secondary"
						sx={{ maxWidth: 760 }}
					>
						The layout keeps the live preview visible while grouping numeric
						input, visual adjustment, and export steps into clearer zones.
					</Typography>
				</Stack>

				<Grid container spacing={3}>
					<Grid size={{ lg: 4, xs: 12 }} sx={{ display: "flex" }}>
						<ColorPreview color={color} size={224} />
					</Grid>

					<Grid size={{ lg: 8, xs: 12 }}>
						<Grid container spacing={3}>
							<Grid size={{ md: 6, xs: 12 }}>
								<ColorInputs color={color} onColorChange={handleColorChange} />
							</Grid>
							<Grid size={{ md: 6, xs: 12 }}>
								<ColorSliders color={color} onColorChange={handleColorChange} />
							</Grid>
							<Grid size={{ md: 6, xs: 12 }}>
								<ColorWheelModal
									color={color}
									onColorChange={handleColorChange}
									size={280}
									modalSize={500}
								/>
							</Grid>
							<Grid size={{ md: 6, xs: 12 }}>
								<SquareColorPicker
									color={color}
									onColorChange={handleColorChange}
								/>
							</Grid>
						</Grid>
					</Grid>

					<Grid size={{ lg: 12, xs: 12 }}>
						<Paper
							elevation={0}
							sx={{
								p: { xs: 3, md: 4 },
								borderRadius: { xs: 3, md: 4 },
								background:
									"linear-gradient(135deg, rgba(8, 15, 27, 0.92) 0%, rgba(9, 21, 37, 0.96) 50%, rgba(19, 16, 7, 0.88) 100%)",
							}}
						>
							<Stack spacing={3}>
								<Box textAlign="center">
									<Typography variant="overline" color="secondary.light">
										Export pipeline
									</Typography>
									<Typography variant="h3" sx={{ mt: 0.5 }}>
										Ship the exact color asset you need
									</Typography>
									<Typography
										variant="body1"
										color="text.secondary"
										sx={{ maxWidth: 720, mx: "auto", mt: 1.25 }}
									>
										Choose a preset, fine tune output quality, and generate a
										shareable URL for repeatable exports.
									</Typography>
								</Box>
								<Box display="flex" justifyContent="center">
									<Box sx={{ width: "100%", maxWidth: 760 }}>
										<DownloadControls color={color} />
									</Box>
								</Box>
							</Stack>
						</Paper>
					</Grid>
				</Grid>
			</Container>

			<Dialog
				open={isInfoDialogOpen}
				onClose={closeInfoDialog}
				maxWidth="md"
				fullWidth
				sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}
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
				<DialogActions sx={{ px: 3, pb: 3 }}>
					<Button onClick={closeInfoDialog} autoFocus>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

export default function Home() {
	return (
		<Suspense fallback={null}>
			<HomeContent />
		</Suspense>
	);
}
