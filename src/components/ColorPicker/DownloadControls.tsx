"use client";

import { Download as DownloadIcon } from "@mui/icons-material";
import {
	Alert,
	Button,
	CircularProgress,
	FormControl,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import { useUmami } from "../../hooks/useUmami";
import type {
	DownloadOptions,
	ImageFormat,
	RGBAColor,
} from "../../types/color";
import {
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

export const DownloadControls: React.FC<DownloadControlsProps> = ({
	color,
}) => {
	const [downloadOptions, setDownloadOptions] = useState<DownloadOptions>(
		getDefaultDownloadOptions(),
	);
	const [isDownloading, setIsDownloading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { trackEvent } = useUmami();

	// Önceden tanımlanmış boyutlar
	const presetSizes = [
		{ label: "Custom", width: 0, height: 0 },
		{ label: "Instagram Post (1080×1080)", width: 1080, height: 1080 },
		{ label: "Instagram Story (1080×1920)", width: 1080, height: 1920 },
		{ label: "Facebook Post (1200×630)", width: 1200, height: 630 },
		{ label: "Twitter Header (1500×500)", width: 1500, height: 500 },
		{ label: "LinkedIn Banner (1584×396)", width: 1584, height: 396 },
		{ label: "YouTube Thumbnail (1280×720)", width: 1280, height: 720 },
		{ label: "Desktop Wallpaper (1920×1080)", width: 1920, height: 1080 },
		{ label: "Mobile Wallpaper (1080×1920)", width: 1080, height: 1920 },
		{ label: "Square Small (512×512)", width: 512, height: 512 },
		{ label: "Square Medium (1024×1024)", width: 1024, height: 1024 },
		{ label: "Square Large (2048×2048)", width: 2048, height: 2048 },
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

	const handleFormatChange = (format: ImageFormat) => {
		setDownloadOptions((prev) => ({ ...prev, format }));
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

	const handleQualityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseFloat(event.target.value) || 0;
		setDownloadOptions((prev) => ({
			...prev,
			quality: Math.max(0.1, Math.min(1, value)),
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

	const formatLabels: Record<ImageFormat, string> = {
		png: "PNG (with transparency)",
		jpeg: "JPEG (no transparency)",
		svg: "SVG (vector format)",
	};

	return (
		<Paper elevation={1} sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				Download Settings
			</Typography>

			<Stack spacing={3}>
				<FormControl fullWidth>
					<InputLabel>Format</InputLabel>
					<Select
						value={downloadOptions.format}
						label="Format"
						onChange={(e) => handleFormatChange(e.target.value as ImageFormat)}
					>
						{Object.entries(formatLabels).map(([format, label]) => (
							<MenuItem key={format} value={format}>
								{label}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<FormControl fullWidth>
					<InputLabel>Preset Size</InputLabel>
					<Select
						value={getCurrentPreset()}
						label="Preset Size"
						onChange={(e) => handlePresetChange(e.target.value)}
						MenuProps={{
							PaperProps: {
								style: {
									maxHeight: 250,
								},
							},
						}}
					>
						{presetSizes.map((preset) => (
							<MenuItem key={preset.label} value={preset.label}>
								{preset.label}
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
					/>
					<TextField
						label="Height"
						type="number"
						value={downloadOptions.height}
						onChange={handleSizeChange("height")}
						inputProps={{ min: 1, max: 4096 }}
						sx={{ flex: 1 }}
					/>
				</Stack>

				{downloadOptions.format === "jpeg" && (
					<TextField
						label="Quality"
						type="number"
						value={downloadOptions.quality}
						onChange={handleQualityChange}
						inputProps={{ min: 0.1, max: 1, step: 0.1 }}
						helperText="Quality from 0.1 (lowest) to 1.0 (highest)"
						fullWidth
					/>
				)}

				{error && (
					<Alert severity="error" onClose={() => setError(null)}>
						{error}
					</Alert>
				)}

				<Button
					variant="contained"
					onClick={handleDownload}
					disabled={isDownloading}
					startIcon={
						isDownloading ? <CircularProgress size={20} /> : <DownloadIcon />
					}
					fullWidth
					size="large"
				>
					{isDownloading
						? "Generating..."
						: `Download ${downloadOptions.format.toUpperCase()}`}
				</Button>

				<Typography variant="body2" color="text.secondary" textAlign="center">
					{downloadOptions.width} × {downloadOptions.height} pixels
					{downloadOptions.format === "jpeg" &&
						downloadOptions.quality &&
						` • Quality: ${Math.round(downloadOptions.quality * 100)}%`}
				</Typography>
			</Stack>
		</Paper>
	);
};
