"use client";

import {
	Box,
	InputAdornment,
	Paper,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import React, { useState } from "react";
import type { RGBAColor } from "../../types/color";
import {
	clamp,
	hexToRgba,
	isValidHex,
	rgbaToHex,
} from "../../utils/colorConversions";

interface ColorInputsProps {
	color: RGBAColor;
	onColorChange: (color: RGBAColor) => void;
}

export const ColorInputs: React.FC<ColorInputsProps> = ({
	color,
	onColorChange,
}) => {
	const [hexValue, setHexValue] = useState(rgbaToHex(color));
	const [rgbValues, setRgbValues] = useState({
		r: color.r.toString(),
		g: color.g.toString(),
		b: color.b.toString(),
		a: (color.a * 100).toString(),
	});

	const handleHexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		setHexValue(value);

		if (isValidHex(value)) {
			const newColor = hexToRgba(value, color.a);
			setRgbValues({
				r: newColor.r.toString(),
				g: newColor.g.toString(),
				b: newColor.b.toString(),
				a: (newColor.a * 100).toString(),
			});
			onColorChange(newColor);
		}
	};

	const handleRgbChange =
		(channel: "r" | "g" | "b" | "a") =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value = event.target.value;
			const newRgbValues = { ...rgbValues, [channel]: value };
			setRgbValues(newRgbValues);

			// Validate and parse values
			const r = clamp(parseInt(newRgbValues.r) || 0, 0, 255);
			const g = clamp(parseInt(newRgbValues.g) || 0, 0, 255);
			const b = clamp(parseInt(newRgbValues.b) || 0, 0, 255);
			const a = clamp((parseInt(newRgbValues.a) || 0) / 100, 0, 1);

			const newColor: RGBAColor = { r, g, b, a };
			setHexValue(rgbaToHex(newColor));
			onColorChange(newColor);
		};

	// Update local state when color prop changes
	React.useEffect(() => {
		setHexValue(rgbaToHex(color));
		setRgbValues({
			r: color.r.toString(),
			g: color.g.toString(),
			b: color.b.toString(),
			a: (color.a * 100).toString(),
		});
	}, [color]);

	return (
		<Paper elevation={1} sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				Color Values
			</Typography>

			<Box sx={{ mb: 3 }}>
				<TextField
					label="HEX"
					value={hexValue}
					onChange={handleHexChange}
					placeholder="#FF5722"
					fullWidth
					InputProps={{
						startAdornment: !hexValue.startsWith("#") ? (
							<InputAdornment position="start">#</InputAdornment>
						) : undefined,
					}}
					error={hexValue !== "" && !isValidHex(hexValue)}
					helperText={
						hexValue !== "" && !isValidHex(hexValue)
							? "Invalid HEX format"
							: "Enter hex color (e.g., #FF5722)"
					}
				/>
			</Box>

			<Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
				RGB Values
			</Typography>

			<Stack direction="row" spacing={2}>
				<TextField
					label="R"
					type="number"
					value={rgbValues.r}
					onChange={handleRgbChange("r")}
					inputProps={{ min: 0, max: 255 }}
					sx={{ flex: 1 }}
				/>
				<TextField
					label="G"
					type="number"
					value={rgbValues.g}
					onChange={handleRgbChange("g")}
					inputProps={{ min: 0, max: 255 }}
					sx={{ flex: 1 }}
				/>
				<TextField
					label="B"
					type="number"
					value={rgbValues.b}
					onChange={handleRgbChange("b")}
					inputProps={{ min: 0, max: 255 }}
					sx={{ flex: 1 }}
				/>
				<TextField
					label="A%"
					type="number"
					value={rgbValues.a}
					onChange={handleRgbChange("a")}
					inputProps={{ min: 0, max: 100 }}
					sx={{ flex: 1 }}
				/>
			</Stack>
		</Paper>
	);
};
