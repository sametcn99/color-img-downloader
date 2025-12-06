"use client";

// cSpell:ignore Umami

import {
	Check as CheckIcon,
	ContentCopy as ContentCopyIcon,
	Download as DownloadIcon,
	ExpandMore as ExpandMoreIcon,
	Share as ShareIcon,
} from "@mui/icons-material";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Alert,
	Box,
	Button,
	Checkbox,
	CircularProgress,
	Divider,
	FormControl,
	FormControlLabel,
	IconButton,
	InputAdornment,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Slider,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	Typography,
} from "@mui/material";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useUmami } from "../../hooks/useUmami";
import type {
	ColorFormat,
	DownloadOptions,
	ImageFormat,
	RGBAColor,
} from "../../types/color";
import {
	formatColorString,
	rgbaToCmyk,
	rgbaToHex,
	rgbaToHsla,
} from "../../utils/colorConversions";
import {
	downloadColorImage,
	getDefaultDownloadOptions,
} from "../../utils/imageGeneration";

interface DownloadControlsProps {
	color: RGBAColor;
}

const SHARE_FORMAT_LABELS: Record<ColorFormat, string> = {
	hex: "HEX",
	rgb: "RGB",
	rgba: "RGBA",
	hsl: "HSL",
	hsla: "HSLA",
	hsv: "HSV",
	hsva: "HSVA",
	cmyk: "CMYK",
	lab: "LAB",
	hwb: "HWB",
	lch: "LCH",
};

export const DownloadControls: React.FC<DownloadControlsProps> = ({
	color,
}) => {
	const [downloadOptions, setDownloadOptions] = useState<DownloadOptions>(
		getDefaultDownloadOptions(),
	);
	const [shareFormat, setShareFormat] = useState<ColorFormat>("hex");
	const [shareDownload, setShareDownload] = useState(false);
	const [shareBaseUrl, setShareBaseUrl] = useState("");
	const [isShareCopied, setIsShareCopied] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { trackEvent } = useUmami();

	// Predefined sizes
	const presetSizes = [
		{ label: "Custom", width: 0, height: 0 },
		{ label: "Instagram Post", width: 1080, height: 1080 },
		{ label: "Instagram Story", width: 1080, height: 1920 },
		{ label: "Facebook Post", width: 1200, height: 630 },
		{ label: "Twitter Header", width: 1500, height: 500 },
		{ label: "LinkedIn Banner", width: 1584, height: 396 },
		{ label: "YouTube Thumbnail", width: 1280, height: 720 },
		{ label: "Desktop Wallpaper", width: 1920, height: 1080 },
		{ label: "Mobile Wallpaper", width: 1080, height: 1920 },
		{ label: "Square Small", width: 512, height: 512 },
		{ label: "Square Medium", width: 1024, height: 1024 },
		{ label: "Square Large", width: 2048, height: 2048 },
	];

	const getCurrentPreset = () => {
		const currentPreset = presetSizes.find(
			(preset) =>
				preset.width === downloadOptions.width &&
				preset.height === downloadOptions.height,
		);
		return currentPreset ? currentPreset.label : "Custom";
	};

	const handlePresetChange = (presetLabel: string) => {
		const preset = presetSizes.find((p) => p.label === presetLabel);
		if (preset && preset.label !== "Custom") {
			setDownloadOptions((prev) => ({
				...prev,
				width: preset.width,
				height: preset.height,
			}));
		}
	};

	const handleFormatChange = (
		event: React.MouseEvent<HTMLElement>,
		newFormat: ImageFormat | null,
	) => {
		if (newFormat !== null) {
			setDownloadOptions((prev) => ({ ...prev, format: newFormat }));
		}
	};

	const handleSizeChange =
		(dimension: "width" | "height") =>
			(event: React.ChangeEvent<HTMLInputElement>) => {
				const value = parseInt(event.target.value, 10) || 0;
				setDownloadOptions((prev) => ({
					...prev,
					[dimension]: Math.max(1, value),
				}));
			};

	const handleQualityChange = (event: Event, newValue: number | number[]) => {
		setDownloadOptions((prev) => ({
			...prev,
			quality: (newValue as number) / 100,
		}));
	};

	const handleDownload = async () => {
		setIsDownloading(true);
		setError(null);

		try {
			// Track the download event before starting the download
			const hex = rgbaToHex(color);
			const hsl = rgbaToHsla(color);
			const cmyk = rgbaToCmyk(color);

			// Find the current preset for analytics
			const currentPreset = presetSizes.find(
				(preset) =>
					preset.width === downloadOptions.width &&
					preset.height === downloadOptions.height,
			);

			trackEvent("color_download", {
				// Color information
				color_hex: hex,
				color_rgb: `rgb(${color.r}, ${color.g}, ${color.b})`,
				color_rgba: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
				color_hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
				color_hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${hsl.a})`,
				color_cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,

				// Color components for analysis
				red: color.r,
				green: color.g,
				blue: color.b,
				alpha: color.a,
				hue: hsl.h,
				saturation: hsl.s,
				lightness: hsl.l,

				// Download settings
				format: downloadOptions.format,
				width: downloadOptions.width,
				height: downloadOptions.height,
				quality: downloadOptions.quality || null,
				preset: currentPreset?.label || "Custom",

				// Additional metrics
				image_size: `${downloadOptions.width}x${downloadOptions.height}`,
				total_pixels: downloadOptions.width * downloadOptions.height,
				aspect_ratio: (downloadOptions.width / downloadOptions.height).toFixed(
					2,
				),

				// Color categories for analysis
				is_grayscale: color.r === color.g && color.g === color.b,
				has_transparency: color.a < 1,
				brightness: Math.round(
					(color.r * 299 + color.g * 587 + color.b * 114) / 1000,
				),
			});

			await downloadColorImage(color, downloadOptions);
		} catch (err) {
			// Track download errors
			trackEvent("color_download_error", {
				error_message: err instanceof Error ? err.message : "Download failed",
				format: downloadOptions.format,
				width: downloadOptions.width,
				height: downloadOptions.height,
			});

			setError(err instanceof Error ? err.message : "Download failed");
		} finally {
			setIsDownloading(false);
		}
	};

	useEffect(() => {
		if (typeof window !== "undefined") {
			setShareBaseUrl(`${window.location.origin}${window.location.pathname}`);
		}
	}, []);

	const shareFormatValue = useMemo(() => {
		const formatted = formatColorString(color, shareFormat);
		return shareFormat === "hex" ? formatted.toUpperCase() : formatted;
	}, [color, shareFormat]);

	const shareUrl = useMemo(() => {
		const params = new URLSearchParams();
		params.set("format", shareFormat);
		params.set("formatValue", shareFormatValue);
		params.set("size", `${downloadOptions.width}x${downloadOptions.height}`);
		params.set("download", shareDownload ? "true" : "false");
		params.set("extension", downloadOptions.format);

		const query = params.toString();
		if (!query) {
			return shareBaseUrl;
		}
		if (shareBaseUrl) {
			return `${shareBaseUrl}?${query}`;
		}
		return `?${query}`;
	}, [
		downloadOptions.format,
		downloadOptions.height,
		downloadOptions.width,
		shareBaseUrl,
		shareDownload,
		shareFormat,
		shareFormatValue,
	]);

	useEffect(() => {
		if (!shareUrl) {
			return;
		}
		setIsShareCopied(false);
	}, [shareUrl]);

	const handleShareCopy = async () => {
		try {
			if (!shareUrl) return;

			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(shareUrl);
			} else {
				const textarea = document.createElement("textarea");
				textarea.value = shareUrl;
				textarea.style.position = "fixed";
				textarea.style.opacity = "0";
				document.body.appendChild(textarea);
				textarea.focus();
				textarea.select();
				document.execCommand("copy");
				document.body.removeChild(textarea);
			}

			setIsShareCopied(true);
		} catch (copyError) {
			console.error("Failed to copy share URL:", copyError);
		}
	};

	return (
		<Paper
			elevation={0}
			variant="outlined"
			sx={{ borderRadius: 3, overflow: "hidden" }}
		>
			<Box sx={{ p: 3, pb: 2 }}>
				<Stack spacing={4}>
					{/* Format Selection */}
					<Box>
						<Typography
							variant="subtitle2"
							color="text.secondary"
							gutterBottom
							sx={{ fontWeight: 600, mb: 1 }}
						>
							FILE FORMAT
						</Typography>
						<ToggleButtonGroup
							value={downloadOptions.format}
							exclusive
							onChange={handleFormatChange}
							fullWidth
							size="large"
							sx={{
								display: "flex",
								gap: 2,
								"& .MuiToggleButton-root": {
									border: "1px solid",
									borderColor: "divider",
									borderRadius: "12px !important",
									flex: 1,
									textTransform: "none",
									py: 1.5,
									color: "text.secondary",
									"&.Mui-selected": {
										color: "primary.main",
										backgroundColor: "primary.lighter",
										borderColor: "primary.main",
										"&:hover": {
											backgroundColor: "primary.lighter",
										},
									},
								},
							}}
						>
							<ToggleButton value="png">
								<Stack alignItems="center">
									<Typography fontWeight={600}>PNG</Typography>
									<Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
										Transparent
									</Typography>
								</Stack>
							</ToggleButton>
							<ToggleButton value="jpeg">
								<Stack alignItems="center">
									<Typography fontWeight={600}>JPEG</Typography>
									<Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
										Compact
									</Typography>
								</Stack>
							</ToggleButton>
							<ToggleButton value="svg">
								<Stack alignItems="center">
									<Typography fontWeight={600}>SVG</Typography>
									<Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
										Vector
									</Typography>
								</Stack>
							</ToggleButton>
						</ToggleButtonGroup>
					</Box>

					{/* Size Selection */}
					<Box>
						<Stack
							direction="row"
							justifyContent="space-between"
							alignItems="center"
							mb={1}
						>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								sx={{ fontWeight: 600 }}
							>
								DIMENSIONS
							</Typography>
						</Stack>

						<Stack spacing={2}>
							<FormControl fullWidth size="small">
								<InputLabel>Preset</InputLabel>
								<Select
									value={getCurrentPreset()}
									label="Preset"
									onChange={(e) => handlePresetChange(e.target.value)}
									sx={{ borderRadius: 2 }}
								>
									{presetSizes.map((preset) => (
										<MenuItem key={preset.label} value={preset.label}>
											{preset.label}
											{preset.label !== "Custom" && (
												<Typography
													variant="caption"
													color="text.secondary"
													sx={{ ml: 1 }}
												>
													({preset.width}×{preset.height})
												</Typography>
											)}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<Stack direction="row" spacing={2}>
								<TextField
									label="Width"
									type="number"
									value={downloadOptions.width}
									onChange={handleSizeChange("width")}
									inputProps={{ min: 1, max: 4096 }}
									sx={{ flex: 1 }}
									size="small"
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">px</InputAdornment>
										),
									}}
								/>
								<TextField
									label="Height"
									type="number"
									value={downloadOptions.height}
									onChange={handleSizeChange("height")}
									inputProps={{ min: 1, max: 4096 }}
									sx={{ flex: 1 }}
									size="small"
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">px</InputAdornment>
										),
									}}
								/>
							</Stack>
						</Stack>
					</Box>

					{/* Quality Slider (JPEG only) */}
					{downloadOptions.format === "jpeg" && (
						<Box>
							<Stack direction="row" justifyContent="space-between" mb={0.5}>
								<Typography
									variant="subtitle2"
									color="text.secondary"
									sx={{ fontWeight: 600 }}
								>
									QUALITY
								</Typography>
								<Typography variant="caption" fontWeight="bold" color="primary">
									{Math.round((downloadOptions.quality || 0.9) * 100)}%
								</Typography>
							</Stack>
							<Slider
								value={(downloadOptions.quality || 0.9) * 100}
								onChange={handleQualityChange}
								min={10}
								max={100}
								step={5}
								valueLabelDisplay="auto"
								size="medium"
							/>
						</Box>
					)}
				</Stack>
			</Box>

			{error && (
				<Alert
					severity="error"
					sx={{ mx: 3, mb: 2 }}
					onClose={() => setError(null)}
				>
					{error}
				</Alert>
			)}

			<Box sx={{ p: 3, pt: 0 }}>
				<Button
					variant="contained"
					onClick={handleDownload}
					disabled={isDownloading}
					startIcon={
						isDownloading ? (
							<CircularProgress size={20} color="inherit" />
						) : (
							<DownloadIcon />
						)
					}
					fullWidth
					size="large"
					sx={{
						py: 1.5,
						borderRadius: 2,
						fontSize: "1rem",
						fontWeight: 600,
						boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
						"&:hover": {
							boxShadow: "0 12px 20px rgba(0,0,0,0.15)",
							transform: "translateY(-1px)",
						},
						transition: "all 0.2s",
					}}
				>
					{isDownloading
						? "Generating File..."
						: `Download ${downloadOptions.format.toUpperCase()}`}
				</Button>
				<Typography
					variant="caption"
					display="block"
					textAlign="center"
					color="text.secondary"
					sx={{ mt: 1 }}
				>
					{downloadOptions.width} × {downloadOptions.height} pixels
					{downloadOptions.format === "jpeg" &&
						` • ${Math.round((downloadOptions.quality || 0.9) * 100)}% Quality`}
				</Typography>
			</Box>

			<Divider />

			{/* Share Section */}
			<Accordion
				elevation={0}
				disableGutters
				sx={{ "&:before": { display: "none" } }}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3 }}>
					<Stack direction="row" spacing={1} alignItems="center">
						<ShareIcon color="action" fontSize="small" />
						<Typography variant="subtitle2">Share or Link to Config</Typography>
					</Stack>
				</AccordionSummary>
				<AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
					<Stack spacing={2}>
						<Typography variant="body2" color="text.secondary">
							Copy a link that opens this page with your current color and
							download settings selected.
						</Typography>

						<Stack direction="row" spacing={2} alignItems="center">
							<FormControl fullWidth size="small">
								<InputLabel>Color Format</InputLabel>
								<Select
									value={shareFormat}
									label="Color Format"
									onChange={(event) =>
										setShareFormat(event.target.value as ColorFormat)
									}
								>
									{Object.entries(SHARE_FORMAT_LABELS).map(([value, label]) => (
										<MenuItem key={value} value={value}>
											{label}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<FormControlLabel
								control={
									<Checkbox
										checked={shareDownload}
										onChange={(event) => setShareDownload(event.target.checked)}
										size="small"
									/>
								}
								label={<Typography variant="caption">Auto-Download</Typography>}
								sx={{ mr: 0, whiteSpace: "nowrap" }}
							/>
						</Stack>

						<TextField
							fullWidth
							variant="outlined"
							size="small"
							value={shareUrl}
							InputProps={{
								readOnly: true,
								endAdornment: (
									<InputAdornment position="end">
										<Tooltip
											title={isShareCopied ? "Copied!" : "Copy to clipboard"}
											placement="top"
										>
											<IconButton
												onClick={handleShareCopy}
												edge="end"
												disabled={!shareUrl}
												color={isShareCopied ? "success" : "default"}
											>
												{isShareCopied ? (
													<CheckIcon fontSize="small" />
												) : (
													<ContentCopyIcon fontSize="small" />
												)}
											</IconButton>
										</Tooltip>
									</InputAdornment>
								),
							}}
							sx={{
								"& .MuiOutlinedInput-root": {
									bgcolor: "action.hover",
								},
							}}
						/>
					</Stack>
				</AccordionDetails>
			</Accordion>
		</Paper>
	);
};
