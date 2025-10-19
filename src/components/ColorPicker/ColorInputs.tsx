"use client";

import {
	Box,
	FormControl,
	InputAdornment,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import React, { useState } from "react";
import type {
	ColorFormat,
	ColorFormatInputs,
	RGBAColor,
} from "../../types/color";
import {
	clamp,
	cmykToRgba,
	hexToRgba,
	hslaToRgba,
	hsvaToRgba,
	hwbToRgba,
	isValidHex,
	labToRgba,
	lchToRgba,
	rgbaToCmyk,
	rgbaToHex,
	rgbaToHsla,
	rgbaToHsva,
	rgbaToHwb,
	rgbaToLab,
	rgbaToLch,
} from "../../utils/colorConversions";

interface ColorInputsProps {
	color: RGBAColor;
	onColorChange: (color: RGBAColor) => void;
}

export const ColorInputs: React.FC<ColorInputsProps> = ({
	color,
	onColorChange,
}) => {
	const [selectedFormat, setSelectedFormat] = useState<ColorFormat>("hex");
	const [inputValues, setInputValues] = useState<ColorFormatInputs>({
		hex: rgbaToHex(color),
		rgb: {
			r: color.r.toString(),
			g: color.g.toString(),
			b: color.b.toString(),
			a: (color.a * 100).toString(),
		},
		hsl: (() => {
			const hsl = rgbaToHsla(color);
			return {
				h: hsl.h.toString(),
				s: hsl.s.toString(),
				l: hsl.l.toString(),
				a: (hsl.a * 100).toString(),
			};
		})(),
		hsv: (() => {
			const hsv = rgbaToHsva(color);
			return {
				h: hsv.h.toString(),
				s: hsv.s.toString(),
				v: hsv.v.toString(),
				a: (hsv.a * 100).toString(),
			};
		})(),
		cmyk: (() => {
			const cmyk = rgbaToCmyk(color);
			return {
				c: cmyk.c.toString(),
				m: cmyk.m.toString(),
				y: cmyk.y.toString(),
				k: cmyk.k.toString(),
			};
		})(),
		lab: (() => {
			const lab = rgbaToLab(color);
			return {
				l: lab.l.toString(),
				a: lab.a.toString(),
				b: lab.b.toString(),
			};
		})(),
		hwb: (() => {
			const hwb = rgbaToHwb(color);
			return {
				h: hwb.h.toString(),
				w: hwb.w.toString(),
				b: hwb.b.toString(),
			};
		})(),
		lch: (() => {
			const lch = rgbaToLch(color);
			return {
				l: lch.l.toString(),
				c: lch.c.toString(),
				h: lch.h.toString(),
			};
		})(),
	});

	const updateInputValues = React.useCallback((newColor: RGBAColor) => {
		const hsl = rgbaToHsla(newColor);
		const hsv = rgbaToHsva(newColor);
		const cmyk = rgbaToCmyk(newColor);
		const lab = rgbaToLab(newColor);
		const hwb = rgbaToHwb(newColor);
		const lch = rgbaToLch(newColor);

		setInputValues({
			hex: rgbaToHex(newColor),
			rgb: {
				r: newColor.r.toString(),
				g: newColor.g.toString(),
				b: newColor.b.toString(),
				a: (newColor.a * 100).toString(),
			},
			hsl: {
				h: hsl.h.toString(),
				s: hsl.s.toString(),
				l: hsl.l.toString(),
				a: (hsl.a * 100).toString(),
			},
			hsv: {
				h: hsv.h.toString(),
				s: hsv.s.toString(),
				v: hsv.v.toString(),
				a: (hsv.a * 100).toString(),
			},
			cmyk: {
				c: cmyk.c.toString(),
				m: cmyk.m.toString(),
				y: cmyk.y.toString(),
				k: cmyk.k.toString(),
			},
			lab: {
				l: lab.l.toString(),
				a: lab.a.toString(),
				b: lab.b.toString(),
			},
			hwb: {
				h: hwb.h.toString(),
				w: hwb.w.toString(),
				b: hwb.b.toString(),
			},
			lch: {
				l: lch.l.toString(),
				c: lch.c.toString(),
				h: lch.h.toString(),
			},
		});
	}, []);

	const handleHexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		setInputValues((prev) => ({ ...prev, hex: value }));

		if (isValidHex(value)) {
			const newColor = hexToRgba(value, color.a);
			onColorChange(newColor);
			updateInputValues(newColor);
		}
	};

	const handleRgbChange =
		(channel: "r" | "g" | "b" | "a") =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value = event.target.value;
			const newRgb = { ...inputValues.rgb, [channel]: value };
			setInputValues((prev) => ({ ...prev, rgb: newRgb }));

			const r = clamp(parseInt(newRgb.r, 10) || 0, 0, 255);
			const g = clamp(parseInt(newRgb.g, 10) || 0, 0, 255);
			const b = clamp(parseInt(newRgb.b, 10) || 0, 0, 255);
			const a = clamp((parseInt(newRgb.a, 10) || 0) / 100, 0, 1);

			const newColor: RGBAColor = { r, g, b, a };
			onColorChange(newColor);
			updateInputValues(newColor);
		};

	const handleHslChange =
		(channel: "h" | "s" | "l" | "a") =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value = event.target.value;
			const newHsl = { ...inputValues.hsl, [channel]: value };
			setInputValues((prev) => ({ ...prev, hsl: newHsl }));

			const h = clamp(parseInt(newHsl.h, 10) || 0, 0, 360);
			const s = clamp(parseInt(newHsl.s, 10) || 0, 0, 100);
			const l = clamp(parseInt(newHsl.l, 10) || 0, 0, 100);
			const a = clamp((parseInt(newHsl.a, 10) || 0) / 100, 0, 1);

			const newColor = hslaToRgba({ h, s, l, a });
			onColorChange(newColor);
			updateInputValues(newColor);
		};

	const handleHsvChange =
		(channel: "h" | "s" | "v" | "a") =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value = event.target.value;
			const newHsv = { ...inputValues.hsv, [channel]: value };
			setInputValues((prev) => ({ ...prev, hsv: newHsv }));

			const h = clamp(parseInt(newHsv.h, 10) || 0, 0, 360);
			const s = clamp(parseInt(newHsv.s, 10) || 0, 0, 100);
			const v = clamp(parseInt(newHsv.v, 10) || 0, 0, 100);
			const a = clamp((parseInt(newHsv.a, 10) || 0) / 100, 0, 1);

			const newColor = hsvaToRgba({ h, s, v, a });
			onColorChange(newColor);
			updateInputValues(newColor);
		};

	const handleCmykChange =
		(channel: "c" | "m" | "y" | "k") =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value = event.target.value;
			const newCmyk = { ...inputValues.cmyk, [channel]: value };
			setInputValues((prev) => ({ ...prev, cmyk: newCmyk }));

			const c = clamp(parseInt(newCmyk.c, 10) || 0, 0, 100);
			const m = clamp(parseInt(newCmyk.m, 10) || 0, 0, 100);
			const y = clamp(parseInt(newCmyk.y, 10) || 0, 0, 100);
			const k = clamp(parseInt(newCmyk.k, 10) || 0, 0, 100);

			const newColor = cmykToRgba({ c, m, y, k }, color.a);
			onColorChange(newColor);
			updateInputValues(newColor);
		};

	const handleLabChange =
		(channel: "l" | "a" | "b") =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value = event.target.value;
			const newLab = { ...inputValues.lab, [channel]: value };
			setInputValues((prev) => ({ ...prev, lab: newLab }));

			const l = clamp(parseInt(newLab.l, 10) || 0, 0, 100);
			const a = clamp(parseInt(newLab.a, 10) || 0, -128, 127);
			const b = clamp(parseInt(newLab.b, 10) || 0, -128, 127);

			const newColor = labToRgba({ l, a, b }, color.a);
			onColorChange(newColor);
			updateInputValues(newColor);
		};

	const handleHwbChange =
		(channel: "h" | "w" | "b") =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value = event.target.value;
			const newHwb = { ...inputValues.hwb, [channel]: value };
			setInputValues((prev) => ({ ...prev, hwb: newHwb }));

			const h = clamp(parseInt(newHwb.h, 10) || 0, 0, 360);
			const w = clamp(parseInt(newHwb.w, 10) || 0, 0, 100);
			const b = clamp(parseInt(newHwb.b, 10) || 0, 0, 100);

			const newColor = hwbToRgba({ h, w, b }, color.a);
			onColorChange(newColor);
			updateInputValues(newColor);
		};

	const handleLchChange =
		(channel: "l" | "c" | "h") =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value = event.target.value;
			const newLch = { ...inputValues.lch, [channel]: value };
			setInputValues((prev) => ({ ...prev, lch: newLch }));

			const l = clamp(parseInt(newLch.l, 10) || 0, 0, 100);
			const c = clamp(parseInt(newLch.c, 10) || 0, 0, 150);
			const h = clamp(parseInt(newLch.h, 10) || 0, 0, 360);

			const newColor = lchToRgba({ l, c, h }, color.a);
			onColorChange(newColor);
			updateInputValues(newColor);
		};

	// Update local state when color prop changes
	React.useEffect(() => {
		updateInputValues(color);
	}, [color, updateInputValues]);

	const formatLabels: Record<ColorFormat, string> = {
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

	const renderInputs = () => {
		switch (selectedFormat) {
			case "hex":
				return (
					<TextField
						label="HEX"
						value={inputValues.hex}
						onChange={handleHexChange}
						placeholder="#FF5722"
						fullWidth
						InputProps={{
							startAdornment: !inputValues.hex.startsWith("#") ? (
								<InputAdornment position="start">#</InputAdornment>
							) : undefined,
						}}
						error={inputValues.hex !== "" && !isValidHex(inputValues.hex)}
						helperText={
							inputValues.hex !== "" && !isValidHex(inputValues.hex)
								? "Invalid HEX format"
								: "Enter hex color (e.g., #FF5722)"
						}
					/>
				);

			case "rgb":
			case "rgba":
				return (
					<Stack direction="row" spacing={2}>
						<TextField
							label="R"
							type="number"
							value={inputValues.rgb.r}
							onChange={handleRgbChange("r")}
							inputProps={{ min: 0, max: 255 }}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="G"
							type="number"
							value={inputValues.rgb.g}
							onChange={handleRgbChange("g")}
							inputProps={{ min: 0, max: 255 }}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="B"
							type="number"
							value={inputValues.rgb.b}
							onChange={handleRgbChange("b")}
							inputProps={{ min: 0, max: 255 }}
							sx={{ flex: 1 }}
						/>
						{selectedFormat === "rgba" && (
							<TextField
								label="A%"
								type="number"
								value={inputValues.rgb.a}
								onChange={handleRgbChange("a")}
								inputProps={{ min: 0, max: 100 }}
								sx={{ flex: 1 }}
							/>
						)}
					</Stack>
				);

			case "hsl":
			case "hsla":
				return (
					<Stack direction="row" spacing={2}>
						<TextField
							label="H"
							type="number"
							value={inputValues.hsl.h}
							onChange={handleHslChange("h")}
							inputProps={{ min: 0, max: 360 }}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="S%"
							type="number"
							value={inputValues.hsl.s}
							onChange={handleHslChange("s")}
							inputProps={{ min: 0, max: 100 }}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="L%"
							type="number"
							value={inputValues.hsl.l}
							onChange={handleHslChange("l")}
							inputProps={{ min: 0, max: 100 }}
							sx={{ flex: 1 }}
						/>
						{selectedFormat === "hsla" && (
							<TextField
								label="A%"
								type="number"
								value={inputValues.hsl.a}
								onChange={handleHslChange("a")}
								inputProps={{ min: 0, max: 100 }}
								sx={{ flex: 1 }}
							/>
						)}
					</Stack>
				);

			case "hsv":
			case "hsva":
				return (
					<Stack direction="row" spacing={2}>
						<TextField
							label="H"
							type="number"
							value={inputValues.hsv.h}
							onChange={handleHsvChange("h")}
							inputProps={{ min: 0, max: 360 }}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="S%"
							type="number"
							value={inputValues.hsv.s}
							onChange={handleHsvChange("s")}
							inputProps={{ min: 0, max: 100 }}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="V%"
							type="number"
							value={inputValues.hsv.v}
							onChange={handleHsvChange("v")}
							inputProps={{ min: 0, max: 100 }}
							sx={{ flex: 1 }}
						/>
						{selectedFormat === "hsva" && (
							<TextField
								label="A%"
								type="number"
								value={inputValues.hsv.a}
								onChange={handleHsvChange("a")}
								inputProps={{ min: 0, max: 100 }}
								sx={{ flex: 1 }}
							/>
						)}
					</Stack>
				);

			case "cmyk":
				return (
					<Stack direction="row" spacing={2}>
						<TextField
							label="C%"
							type="number"
							value={inputValues.cmyk.c}
							onChange={handleCmykChange("c")}
							inputProps={{ min: 0, max: 100 }}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="M%"
							type="number"
							value={inputValues.cmyk.m}
							onChange={handleCmykChange("m")}
							inputProps={{ min: 0, max: 100 }}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="Y%"
							type="number"
							value={inputValues.cmyk.y}
							onChange={handleCmykChange("y")}
							inputProps={{ min: 0, max: 100 }}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="K%"
							type="number"
							value={inputValues.cmyk.k}
							onChange={handleCmykChange("k")}
							inputProps={{ min: 0, max: 100 }}
							sx={{ flex: 1 }}
						/>
					</Stack>
				);

			case "lab":
				return (
					<Stack direction="row" spacing={2}>
						<TextField
							label="L"
							type="number"
							value={inputValues.lab.l}
							onChange={handleLabChange("l")}
							inputProps={{ min: 0, max: 100 }}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="A"
							type="number"
							value={inputValues.lab.a}
							onChange={handleLabChange("a")}
							inputProps={{ min: -128, max: 127 }}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="B"
							type="number"
							value={inputValues.lab.b}
							onChange={handleLabChange("b")}
							inputProps={{ min: -128, max: 127 }}
							sx={{ flex: 1 }}
						/>
					</Stack>
				);

			case "hwb":
				return (
					<Stack direction="row" spacing={2}>
						<TextField
							label="H"
							type="number"
							value={inputValues.hwb.h}
							onChange={handleHwbChange("h")}
							inputProps={{ min: 0, max: 360 }}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="W%"
							type="number"
							value={inputValues.hwb.w}
							onChange={handleHwbChange("w")}
							inputProps={{ min: 0, max: 100 }}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="B%"
							type="number"
							value={inputValues.hwb.b}
							onChange={handleHwbChange("b")}
							inputProps={{ min: 0, max: 100 }}
							sx={{ flex: 1 }}
						/>
					</Stack>
				);

			case "lch":
				return (
					<Stack direction="row" spacing={2}>
						<TextField
							label="L"
							type="number"
							value={inputValues.lch.l}
							onChange={handleLchChange("l")}
							inputProps={{ min: 0, max: 100 }}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="C"
							type="number"
							value={inputValues.lch.c}
							onChange={handleLchChange("c")}
							inputProps={{ min: 0, max: 150 }}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="H"
							type="number"
							value={inputValues.lch.h}
							onChange={handleLchChange("h")}
							inputProps={{ min: 0, max: 360 }}
							sx={{ flex: 1 }}
						/>
					</Stack>
				);

			default:
				return null;
		}
	};

	return (
		<Paper elevation={1} sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				Color Values
			</Typography>

			<FormControl fullWidth sx={{ mb: 3 }}>
				<InputLabel>Color Format</InputLabel>
				<Select
					value={selectedFormat}
					label="Color Format"
					onChange={(e) => setSelectedFormat(e.target.value as ColorFormat)}
				>
					{Object.entries(formatLabels).map(([format, label]) => (
						<MenuItem key={format} value={format}>
							{label}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			<Box sx={{ mb: 2 }}>{renderInputs()}</Box>

			<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
				{selectedFormat.toUpperCase()} format values with real-time updates
			</Typography>
		</Paper>
	);
};
