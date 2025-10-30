"use client";

import { Box, Chip, Paper, Stack, Tooltip, Typography } from "@mui/material";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ColorFormat, RGBAColor } from "../../types/color";
import {
	formatColorString,
	rgbaToHex,
	rgbaToString,
} from "../../utils/colorConversions";

const SUPPORTED_FORMATS: ColorFormat[] = [
	"hex",
	"rgb",
	"rgba",
	"hsl",
	"hsla",
	"hsv",
	"hsva",
	"cmyk",
	"lab",
	"hwb",
	"lch",
];

const FORMAT_LABELS: Record<ColorFormat, string> = {
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

interface ColorPreviewProps {
	color: RGBAColor;
	size?: number;
}

export const ColorPreview: React.FC<ColorPreviewProps> = ({
	color,
	size = 200,
}) => {
	const colorString = rgbaToString(color);
	const hexString = rgbaToHex(color);

	const formatValues = useMemo(
		() =>
			SUPPORTED_FORMATS.map((format) => {
				const rawValue = formatColorString(color, format);
				return {
					format,
					label: FORMAT_LABELS[format],
					value: format === "hex" ? rawValue.toUpperCase() : rawValue,
				};
			}),
		[color],
	);

	const [copiedFormat, setCopiedFormat] = useState<ColorFormat | null>(null);
	const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (copyTimeoutRef.current) {
				clearTimeout(copyTimeoutRef.current);
			}
		};
	}, []);

	const copyToClipboard = async (format: ColorFormat, value: string) => {
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(value);
			} else {
				const textarea = document.createElement("textarea");
				textarea.value = value;
				textarea.style.position = "fixed";
				textarea.style.opacity = "0";
				document.body.appendChild(textarea);
				textarea.focus();
				textarea.select();
				document.execCommand("copy");
				document.body.removeChild(textarea);
			}

			setCopiedFormat(format);
			if (copyTimeoutRef.current) {
				clearTimeout(copyTimeoutRef.current);
			}
			copyTimeoutRef.current = setTimeout(() => {
				setCopiedFormat(null);
			}, 2000);
		} catch (error) {
			console.error("Failed to copy color value:", error);
		}
	};

	return (
		<Paper
			elevation={3}
			sx={{
				p: 3,
				textAlign: "center",
				minWidth: 300,
				width: "100%",
				height: "100%",
			}}
		>
			<Typography variant="h6" gutterBottom>
				Color Preview
			</Typography>

			<Box
				sx={{
					width: size,
					height: size,
					backgroundColor: colorString,
					border: "2px solid",
					borderColor: "divider",
					borderRadius: 2,
					mx: "auto",
					mb: 2,
					position: "relative",
					// Checkerboard pattern for transparency
					backgroundImage:
						color.a < 1
							? `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                 linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                 linear-gradient(45deg, transparent 75%, #ccc 75%), 
                 linear-gradient(-45deg, transparent 75%, #ccc 75%)`
							: "none",
					backgroundSize: color.a < 1 ? "20px 20px" : "auto",
					backgroundPosition:
						color.a < 1 ? "0 0, 0 10px, 10px -10px, -10px 0px" : "auto",
					"&::after":
						color.a < 1
							? {
									content: '""',
									position: "absolute",
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									backgroundColor: colorString,
									borderRadius: 1,
								}
							: {},
				}}
				role="img"
				aria-label={`Color preview: ${hexString} with ${Math.round(color.a * 100)}% opacity`}
			/>

			<Stack spacing={2}>
				<Box>
					<Typography variant="body2" color="text.secondary" gutterBottom>
						Supported Formats
					</Typography>
					<Stack
						direction="row"
						spacing={1}
						rowGap={1}
						flexWrap="wrap"
						useFlexGap
					>
						{formatValues.map(({ format, label, value }) => (
							<Tooltip
								key={format}
								title={
									copiedFormat === format
										? "Copied!"
										: "Click to copy to clipboard"
								}
							>
								<Chip
									label={`${label}: ${value}`}
									size="small"
									variant={copiedFormat === format ? "filled" : "outlined"}
									onClick={() => copyToClipboard(format, value)}
									sx={{
										fontFamily: "monospace",
										cursor: "pointer",
										userSelect: "none",
									}}
								/>
							</Tooltip>
						))}
					</Stack>
				</Box>

				{color.a < 1 && (
					<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
						Opacity: {Math.round(color.a * 100)}%
					</Typography>
				)}
			</Stack>
		</Paper>
	);
};
