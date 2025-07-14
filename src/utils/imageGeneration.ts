import type { DownloadOptions, RGBAColor } from "../types/color";
import { rgbaToString } from "./colorConversions";

/**
 * Generate and download a color image
 */
export async function downloadColorImage(
	color: RGBAColor,
	options: DownloadOptions,
): Promise<void> {
	const { format, width, height, quality } = options;

	switch (format) {
		case "png":
		case "jpeg":
			return downloadCanvasImage(color, format, width, height, quality);
		case "svg":
			return downloadSvgImage(color, width, height);
		default:
			throw new Error(`Unsupported format: ${format}`);
	}
}

/**
 * Generate PNG/JPEG using Canvas API
 */
function downloadCanvasImage(
	color: RGBAColor,
	format: "png" | "jpeg",
	width: number,
	height: number,
	quality?: number,
): Promise<void> {
	return new Promise((resolve, reject) => {
		try {
			// Create canvas element
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;

			const ctx = canvas.getContext("2d");
			if (!ctx) {
				throw new Error("Could not get canvas context");
			}

			// Fill canvas with color
			ctx.fillStyle = rgbaToString(color);
			ctx.fillRect(0, 0, width, height);

			// Convert to blob and download
			const mimeType = format === "png" ? "image/png" : "image/jpeg";
			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error("Failed to create blob"));
						return;
					}

					downloadBlob(blob, `color-${Date.now()}.${format}`);
					resolve();
				},
				mimeType,
				quality,
			);
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * Generate SVG image
 */
function downloadSvgImage(
	color: RGBAColor,
	width: number,
	height: number,
): Promise<void> {
	return new Promise((resolve, reject) => {
		try {
			const colorString = rgbaToString(color);

			const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${colorString}" />
</svg>`;

			const blob = new Blob([svgContent], { type: "image/svg+xml" });
			downloadBlob(blob, `color-${Date.now()}.svg`);
			resolve();
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");

	link.href = url;
	link.download = filename;
	link.style.display = "none";

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Clean up the URL object
	URL.revokeObjectURL(url);
}

/**
 * Get default download options
 */
export function getDefaultDownloadOptions(): DownloadOptions {
	return {
		format: "png",
		width: 512,
		height: 512,
		quality: 0.9,
	};
}
