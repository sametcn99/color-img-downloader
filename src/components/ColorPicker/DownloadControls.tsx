"use client";

// cSpell:ignore Umami

import {
	Check as CheckIcon,
	ContentCopy as ContentCopyIcon,
	Download as DownloadIcon,
	Share as ShareIcon,
} from "@mui/icons-material";
import {
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
import { alpha } from "@mui/material/styles";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import type {
	ColorFormat,
	DownloadOptions,
	ImageFormat,
	RGBAColor,
} from "../../types/color";
import { formatColorString, rgbaToHex } from "../../utils/colorConversions";
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

const PRESET_SIZES = [
	{ label: "Custom", width: 0, height: 0 },
	{ label: "1x1 Pixel", width: 1, height: 1 },
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

	const getCurrentPreset = () => {
		const currentPreset = PRESET_SIZES.find(
			(preset) =>
				preset.width === downloadOptions.width &&
				preset.height === downloadOptions.height,
		);
		return currentPreset ? currentPreset.label : "Custom";
	};

	const handlePresetChange = (presetLabel: string) => {
		const preset = PRESET_SIZES.find((item) => item.label === presetLabel);
		if (preset && preset.label !== "Custom") {
			setDownloadOptions((prev) => ({
				...prev,
				width: preset.width,
				height: preset.height,
			}));
		}
	};

	const handleFormatChange = (
		_event: React.MouseEvent<HTMLElement>,
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

	const handleQualityChange = (_event: Event, newValue: number | number[]) => {
		setDownloadOptions((prev) => ({
			...prev,
			quality: (newValue as number) / 100,
		}));
	};

	const handleDownload = async () => {
		setIsDownloading(true);
		setError(null);

		try {
			await downloadColorImage(color, downloadOptions);
		} catch (err) {
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
			if (!shareUrl) {
				return;
			}

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

	const _currentHex = rgbaToHex(color).toUpperCase();
	const sectionSx = {
		p: 2.5,
		borderRadius: 2,
		border: "1px solid",
		borderColor: "divider",
		backgroundColor: alpha("#08111f", 0.58),
	} as const;

	return (
		<Paper
			elevation={0}
			variant="outlined"
			sx={{
				borderRadius: 3,
				overflow: "hidden",
				background:
					"linear-gradient(180deg, rgba(9, 18, 33, 0.88), rgba(7, 12, 23, 0.76))",
			}}
		>
			<Box sx={{ p: 3 }}>
				<Stack spacing={3}>
					<Stack spacing={1.5}>
						<Typography variant="overline" color="secondary.light">
							Export settings
						</Typography>
						<Stack
							direction={{ xs: "column", md: "row" }}
							justifyContent="space-between"
							spacing={1.5}
						>
							<Box>
								<Typography variant="h4">Configure your asset</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mt: 0.75 }}
								>
									Define output format, dimensions, and sharing behavior before
									you export.
								</Typography>
							</Box>
						</Stack>
					</Stack>

					<Box sx={sectionSx}>
						<Typography
							variant="subtitle2"
							color="text.secondary"
							sx={{ fontWeight: 700, mb: 1.5 }}
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
								gap: 1.25,
								flexWrap: "wrap",
								"& .MuiToggleButton-root": {
									border: "1px solid",
									borderColor: "divider",
									borderRadius: "12px !important",
									flex: 1,
									textTransform: "none",
									py: 1.5,
									minWidth: { xs: "100%", sm: 0 },
									color: "text.secondary",
									backgroundColor: alpha("#09111f", 0.6),
									"&.Mui-selected": {
										color: "primary.main",
										backgroundColor: alpha("#7dd3fc", 0.12),
										borderColor: "primary.main",
										"&:hover": {
											backgroundColor: alpha("#7dd3fc", 0.16),
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

					<Box sx={sectionSx}>
						<Stack
							direction="row"
							justifyContent="space-between"
							alignItems="center"
							mb={1.5}
						>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								sx={{ fontWeight: 700 }}
							>
								DIMENSIONS
							</Typography>
							<Typography variant="caption" color="text.secondary">
								Up to 4096 px
							</Typography>
						</Stack>

						<Stack spacing={2}>
							<FormControl fullWidth size="small">
								<InputLabel>Preset</InputLabel>
								<Select
									value={getCurrentPreset()}
									label="Preset"
									onChange={(event) => handlePresetChange(event.target.value)}
								>
									{PRESET_SIZES.map((preset) => (
										<MenuItem key={preset.label} value={preset.label}>
											{preset.label}
											{preset.label !== "Custom" && (
												<Typography
													variant="caption"
													color="text.secondary"
													sx={{ ml: 1 }}
												>
													({preset.width}x{preset.height})
												</Typography>
											)}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
								<TextField
									label="Width"
									type="number"
									value={downloadOptions.width}
									onChange={handleSizeChange("width")}
									inputProps={{ min: 1, max: 4096 }}
									size="small"
									sx={{ flex: 1 }}
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
									size="small"
									sx={{ flex: 1 }}
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">px</InputAdornment>
										),
									}}
								/>
							</Stack>
						</Stack>
					</Box>

					{downloadOptions.format === "jpeg" && (
						<Box sx={sectionSx}>
							<Stack direction="row" justifyContent="space-between" mb={0.5}>
								<Typography
									variant="subtitle2"
									color="text.secondary"
									sx={{ fontWeight: 700 }}
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
								sx={{ mt: 1 }}
							/>
							<Typography variant="body2" color="text.secondary">
								Higher quality preserves smooth gradients, with larger file
								sizes.
							</Typography>
						</Box>
					)}

					{error && (
						<Alert
							severity="error"
							sx={{ mb: 1 }}
							onClose={() => setError(null)}
						>
							{error}
						</Alert>
					)}

					<Box sx={sectionSx}>
						<Stack spacing={2}>
							<Stack
								direction={{ xs: "column", md: "row" }}
								justifyContent="space-between"
								spacing={2}
							>
								<Box>
									<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
										Ready to export
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mt: 0.75 }}
									>
										Generate a {downloadOptions.width} x{" "}
										{downloadOptions.height}{" "}
										{downloadOptions.format.toUpperCase()} asset.
										{downloadOptions.format === "jpeg" &&
											` Quality ${Math.round((downloadOptions.quality || 0.9) * 100)}%.`}
									</Typography>
								</Box>
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
									size="large"
									sx={{ minWidth: { xs: "100%", md: 220 }, py: 1.5 }}
								>
									{isDownloading
										? "Generating file..."
										: `Download ${downloadOptions.format.toUpperCase()}`}
								</Button>
							</Stack>
						</Stack>
					</Box>

					<Divider sx={{ my: 0.5 }} />

					<Box sx={sectionSx}>
						<Stack spacing={2}>
							<Stack direction="row" spacing={1} alignItems="center">
								<ShareIcon color="action" fontSize="small" />
								<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
									Share or reopen this exact config
								</Typography>
							</Stack>
							<Typography variant="body2" color="text.secondary">
								Copy a link that restores the current color, dimensions, and
								optional auto-download behavior.
							</Typography>

							<Stack
								direction={{ xs: "column", md: "row" }}
								spacing={2}
								alignItems={{ xs: "stretch", md: "center" }}
							>
								<FormControl fullWidth size="small">
									<InputLabel>Color Format</InputLabel>
									<Select
										value={shareFormat}
										label="Color Format"
										onChange={(event) =>
											setShareFormat(event.target.value as ColorFormat)
										}
									>
										{Object.entries(SHARE_FORMAT_LABELS).map(
											([value, label]) => (
												<MenuItem key={value} value={value}>
													{label}
												</MenuItem>
											),
										)}
									</Select>
								</FormControl>

								<FormControlLabel
									control={
										<Checkbox
											checked={shareDownload}
											onChange={(event) =>
												setShareDownload(event.target.checked)
											}
											size="small"
										/>
									}
									label={
										<Typography variant="caption">Auto-Download</Typography>
									}
									sx={{
										mr: 0,
										whiteSpace: "nowrap",
										alignSelf: { xs: "flex-start", md: "center" },
									}}
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
					</Box>
				</Stack>
			</Box>
		</Paper>
	);
};
