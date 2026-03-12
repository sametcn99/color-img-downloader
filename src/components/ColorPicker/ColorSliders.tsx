"use client";

import { Box, Paper, Slider, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type React from "react";
import type { RGBAColor } from "../../types/color";

interface ColorSlidersProps {
	color: RGBAColor;
	onColorChange: (color: RGBAColor) => void;
}

export const ColorSliders: React.FC<ColorSlidersProps> = ({
	color,
	onColorChange,
}) => {
	const handleSliderChange =
		(channel: "r" | "g" | "b" | "a") =>
		(_event: Event, value: number | number[]) => {
			const numValue = Array.isArray(value) ? value[0] : value;
			const newColor = {
				...color,
				[channel]: channel === "a" ? numValue / 100 : numValue,
			};
			onColorChange(newColor);
		};

	const sliderStyles = {
		py: 0.5,
		"& .MuiSlider-track": {
			border: "none",
		},
		"& .MuiSlider-rail": {
			opacity: 1,
		},
		"& .MuiSlider-thumb": {
			width: 20,
			height: 20,
			backgroundColor: "#fff",
			border: "2px solid currentColor",
			"&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
				boxShadow: `0 0 0 6px ${alpha("#7dd3fc", 0.18)}`,
			},
			"&::before": {
				display: "none",
			},
		},
	};

	return (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				borderRadius: 3,
				height: "100%",
				background:
					"linear-gradient(180deg, rgba(10, 18, 33, 0.88), rgba(8, 14, 26, 0.8))",
			}}
		>
			<Stack spacing={2.5}>
				<Box>
					<Typography variant="overline" color="primary.light">
						Channel tuning
					</Typography>
					<Typography variant="h5">Color sliders</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
						Fine tune red, green, blue, and opacity with direct channel
						feedback.
					</Typography>
				</Box>

				<Stack spacing={2.5}>
					<Box>
						<Stack
							direction="row"
							justifyContent="space-between"
							sx={{ mb: 1 }}
						>
							<Typography variant="body2">Red</Typography>
							<Typography variant="body2" color="text.secondary">
								{color.r}
							</Typography>
						</Stack>
						<Slider
							value={color.r}
							onChange={handleSliderChange("r")}
							min={0}
							max={255}
							step={1}
							sx={{
								...sliderStyles,
								color: "#f44336",
								"& .MuiSlider-rail": {
									background: "linear-gradient(to right, #000000, #ff0000)",
								},
							}}
							aria-label="Red color value"
						/>
					</Box>

					<Box>
						<Stack
							direction="row"
							justifyContent="space-between"
							sx={{ mb: 1 }}
						>
							<Typography variant="body2">Green</Typography>
							<Typography variant="body2" color="text.secondary">
								{color.g}
							</Typography>
						</Stack>
						<Slider
							value={color.g}
							onChange={handleSliderChange("g")}
							min={0}
							max={255}
							step={1}
							sx={{
								...sliderStyles,
								color: "#4caf50",
								"& .MuiSlider-rail": {
									background: "linear-gradient(to right, #000000, #00ff00)",
								},
							}}
							aria-label="Green color value"
						/>
					</Box>

					<Box>
						<Stack
							direction="row"
							justifyContent="space-between"
							sx={{ mb: 1 }}
						>
							<Typography variant="body2">Blue</Typography>
							<Typography variant="body2" color="text.secondary">
								{color.b}
							</Typography>
						</Stack>
						<Slider
							value={color.b}
							onChange={handleSliderChange("b")}
							min={0}
							max={255}
							step={1}
							sx={{
								...sliderStyles,
								color: "#2196f3",
								"& .MuiSlider-rail": {
									background: "linear-gradient(to right, #000000, #0000ff)",
								},
							}}
							aria-label="Blue color value"
						/>
					</Box>

					<Box>
						<Stack
							direction="row"
							justifyContent="space-between"
							sx={{ mb: 1 }}
						>
							<Typography variant="body2">Opacity</Typography>
							<Typography variant="body2" color="text.secondary">
								{Math.round(color.a * 100)}%
							</Typography>
						</Stack>
						<Slider
							value={color.a * 100}
							onChange={handleSliderChange("a")}
							min={0}
							max={100}
							step={1}
							sx={{
								...sliderStyles,
								color: "#9e9e9e",
								"& .MuiSlider-rail": {
									background: "linear-gradient(to right, transparent, #000000)",
								},
							}}
							aria-label="Opacity percentage"
						/>
					</Box>
				</Stack>
			</Stack>
		</Paper>
	);
};
