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
import type {
	DownloadOptions,
	ImageFormat,
	RGBAColor,
} from "../../types/color";
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

	const handleFormatChange = (format: ImageFormat) => {
		setDownloadOptions((prev) => ({ ...prev, format }));
	};

	const handleSizeChange =
		(dimension: "width" | "height") =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value = parseInt(event.target.value) || 0;
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
			await downloadColorImage(color, downloadOptions);
		} catch (err) {
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
