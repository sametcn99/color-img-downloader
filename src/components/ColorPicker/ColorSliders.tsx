"use client";

import { Box, Paper, Slider, Stack, Typography } from "@mui/material";
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
		"& .MuiSlider-track": {
			border: "none",
		},
		"& .MuiSlider-thumb": {
			width: 20,
			height: 20,
			backgroundColor: "#fff",
			border: "2px solid currentColor",
			"&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
				boxShadow: "inherit",
			},
			"&::before": {
				display: "none",
			},
		},
	};

	return (
		<Paper elevation={1} sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				Color Sliders
			</Typography>

			<Stack spacing={3}>
				<Box>
					<Typography variant="body2" gutterBottom>
						Red: {color.r}
					</Typography>
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
					<Typography variant="body2" gutterBottom>
						Green: {color.g}
					</Typography>
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
					<Typography variant="body2" gutterBottom>
						Blue: {color.b}
					</Typography>
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
					<Typography variant="body2" gutterBottom>
						Opacity: {Math.round(color.a * 100)}%
					</Typography>
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
		</Paper>
	);
};
