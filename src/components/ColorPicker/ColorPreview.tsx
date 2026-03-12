"use client";

import {
	Box,
	Chip,
	Paper,
	Stack,
	Tab,
	Tabs,
	Tooltip,
	Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
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

type FormatTab = "standard" | "alpha";

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
	const [activeTab, setActiveTab] = useState<FormatTab>("standard");
	const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const standardFormats = useMemo(
		() =>
			formatValues.filter(({ format }) =>
				["hex", "rgb", "hsl", "hsv", "cmyk", "lab", "hwb", "lch"].includes(
					format,
				),
			),
		[formatValues],
	);

	const alphaFormats = useMemo(
		() =>
			formatValues.filter(({ format }) =>
				["rgba", "hsla", "hsva"].includes(format),
			),
		[formatValues],
	);

	const visibleFormats = activeTab === "alpha" ? alphaFormats : standardFormats;

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
			elevation={0}
			sx={{
				p: 3,
				textAlign: "left",
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				borderRadius: 3,
				background:
					"linear-gradient(180deg, rgba(10, 18, 33, 0.88), rgba(8, 14, 26, 0.8))",
			}}
		>
			<Stack spacing={3} sx={{ flex: 1 }}>
				<Box>
					<Typography variant="overline" color="primary.light">
						Live specimen
					</Typography>
					<Typography variant="h5">Color preview</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
						Inspect the active color, verify opacity, and copy values in the
						format you need.
					</Typography>
				</Box>

				<Box
					sx={{
						p: 1.5,
						borderRadius: 3,
						backgroundColor: alpha("#09111f", 0.72),
						border: `1px solid ${alpha("#d7e4f8", 0.08)}`,
					}}
				>
					<Box
						sx={{
							width: "100%",
							maxWidth: size,
							aspectRatio: "1 / 1",
							backgroundColor: colorString,
							border: "1px solid",
							borderColor: "divider",
							borderRadius: 2,
							mx: "auto",
							position: "relative",
							backgroundImage:
								color.a < 1
									? `linear-gradient(45deg, ${alpha("#d7e4f8", 0.16)} 25%, transparent 25%),
									   linear-gradient(-45deg, ${alpha("#d7e4f8", 0.16)} 25%, transparent 25%),
									   linear-gradient(45deg, transparent 75%, ${alpha("#d7e4f8", 0.16)} 75%),
									   linear-gradient(-45deg, transparent 75%, ${alpha("#d7e4f8", 0.16)} 75%)`
									: "none",
							backgroundSize: color.a < 1 ? "20px 20px" : "auto",
							backgroundPosition:
								color.a < 1 ? "0 0, 0 10px, 10px -10px, -10px 0px" : "auto",
							"&::after":
								color.a < 1
									? {
											content: '""',
											position: "absolute",
											inset: 0,
											backgroundColor: colorString,
											borderRadius: 2,
										}
									: {},
						}}
						role="img"
						aria-label={`Color preview: ${hexString} with ${Math.round(color.a * 100)}% opacity`}
					/>
				</Box>

				<Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
					<Chip label={`HEX ${hexString.toUpperCase()}`} color="primary" />
					<Chip
						label={`Opacity ${Math.round(color.a * 100)}%`}
						variant="outlined"
					/>
				</Stack>

				<Box>
					<Typography variant="body2" color="text.secondary" gutterBottom>
						Copy any supported format
					</Typography>
					<Tabs
						value={activeTab}
						onChange={(_event, value: FormatTab) => setActiveTab(value)}
						variant="fullWidth"
						sx={{
							mb: 1.5,
							minHeight: 40,
							backgroundColor: alpha("#08111f", 0.42),
							borderRadius: 2,
							p: 0.5,
							"& .MuiTabs-indicator": {
								display: "none",
							},
							"& .MuiTab-root": {
								minHeight: 32,
								borderRadius: 1.5,
								color: "text.secondary",
								fontSize: 12,
								fontWeight: 700,
								letterSpacing: "0.04em",
								textTransform: "uppercase",
							},
							"& .Mui-selected": {
								color: "text.primary",
								backgroundColor: alpha("#7dd3fc", 0.12),
							},
						}}
					>
						<Tab
							value="standard"
							label={`Standard ${standardFormats.length}`}
						/>
						<Tab value="alpha" label={`Opacity ${alphaFormats.length}`} />
					</Tabs>
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "1fr",
								sm: "repeat(2, minmax(0, 1fr))",
							},
							gap: 1,
						}}
					>
						{visibleFormats.map(({ format, label, value }) => (
							<Tooltip
								key={format}
								title={
									copiedFormat === format
										? "Copied!"
										: "Click to copy to clipboard"
								}
							>
								<Box
									component="button"
									onClick={() => copyToClipboard(format, value)}
									sx={{
										all: "unset",
										boxSizing: "border-box",
										cursor: "pointer",
										display: "flex",
										flexDirection: "column",
										gap: 0.4,
										minWidth: 0,
										padding: "10px 12px",
										borderRadius: 2,
										border: "1px solid",
										borderColor:
											copiedFormat === format ? "primary.main" : "divider",
										backgroundColor:
											copiedFormat === format
												? alpha("#7dd3fc", 0.12)
												: alpha("#08111f", 0.5),
										transition:
											"border-color 150ms ease, background-color 150ms ease, transform 150ms ease",
										"&:hover": {
											borderColor: "primary.main",
											backgroundColor: alpha("#7dd3fc", 0.08),
											transform: "translateY(-1px)",
										},
										"&:focus-visible": {
											outline: `2px solid ${alpha("#7dd3fc", 0.7)}`,
											outlineOffset: 2,
										},
										fontFamily: "var(--font-geist-mono)",
										userSelect: "none",
									}}
								>
									<Typography
										variant="caption"
										sx={{
											color:
												copiedFormat === format
													? "primary.light"
													: "text.secondary",
											fontWeight: 700,
											letterSpacing: "0.04em",
										}}
									>
										{label}
									</Typography>
									<Typography
										variant="body2"
										sx={{
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
											color: "text.primary",
										}}
									>
										{value}
									</Typography>
								</Box>
							</Tooltip>
						))}
					</Box>
				</Box>
			</Stack>
		</Paper>
	);
};
