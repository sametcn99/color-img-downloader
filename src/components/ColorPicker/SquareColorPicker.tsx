"use client";

import { Box, Paper, Slider, Typography } from "@mui/material";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RGBAColor } from "../../types/color";
import { clamp, hsvaToRgba, rgbaToHsva } from "../../utils/colorConversions";

interface SquareColorPickerProps {
	color: RGBAColor;
	onColorChange: (color: RGBAColor) => void;
	size?: number;
}

export const SquareColorPicker: React.FC<SquareColorPickerProps> = ({
	color,
	onColorChange,
	size = 280,
}) => {
	const areaRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const hsv = useMemo(() => rgbaToHsva(color), [color]);

	const updateSaturationValue = (clientX: number, clientY: number) => {
		const area = areaRef.current;
		if (!area) {
			return;
		}

		const rect = area.getBoundingClientRect();
		const relativeX = clamp((clientX - rect.left) / rect.width, 0, 1);
		const relativeY = clamp((clientY - rect.top) / rect.height, 0, 1);

		onColorChange(
			hsvaToRgba({
				h: hsv.h,
				s: Math.round(relativeX * 100),
				v: Math.round((1 - relativeY) * 100),
				a: color.a,
			}),
		);
	};

	const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragging(true);
		event.currentTarget.setPointerCapture(event.pointerId);
		updateSaturationValue(event.clientX, event.clientY);
	};

	const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		if (!isDragging) {
			return;
		}

		event.preventDefault();
		updateSaturationValue(event.clientX, event.clientY);
	};

	const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
		setIsDragging(false);
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	};

	useEffect(() => {
		if (!isDragging) {
			return;
		}

		const handleWindowPointerUp = () => {
			setIsDragging(false);
		};

		window.addEventListener("pointerup", handleWindowPointerUp);
		return () => {
			window.removeEventListener("pointerup", handleWindowPointerUp);
		};
	}, [isDragging]);

	return (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				textAlign: "left",
				borderRadius: 3,
				height: "100%",
				background:
					"linear-gradient(180deg, rgba(10, 18, 33, 0.88), rgba(8, 14, 26, 0.8))",
			}}
		>
			<Box>
				<Typography variant="overline" color="primary.light">
					Saturation and value
				</Typography>
				<Typography variant="h5">Spectrum picker</Typography>
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ mt: 0.75, mb: 2.5 }}
				>
					Drag inside the square to control saturation and brightness, then tune
					hue on the spectrum below.
				</Typography>
			</Box>

			<Box
				ref={areaRef}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerEnd}
				onPointerCancel={handlePointerEnd}
				sx={{
					position: "relative",
					width: "100%",
					maxWidth: size,
					aspectRatio: "1 / 1",
					mx: "auto",
					mb: 3,
					borderRadius: 2,
					overflow: "hidden",
					cursor: isDragging ? "grabbing" : "crosshair",
					backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
					backgroundImage:
						"linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
					boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
					touchAction: "none",
				}}
				aria-label="Spectrum color picker for saturation and brightness"
			>
				<Box
					sx={{
						position: "absolute",
						left: `${hsv.s}%`,
						top: `${100 - hsv.v}%`,
						transform: "translate(-50%, -50%)",
						width: 26,
						height: 26,
						borderRadius: "50%",
						border: "3px solid rgba(255,255,255,0.95)",
						boxShadow:
							"0 0 0 1px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.22)",
						backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
						pointerEvents: "none",
					}}
				/>
			</Box>

			<Slider
				value={hsv.h}
				onChange={(_event, value) => {
					const hue = Array.isArray(value) ? value[0] : value;
					onColorChange(
						hsvaToRgba({
							h: hue,
							s: hsv.s,
							v: hsv.v,
							a: color.a,
						}),
					);
				}}
				min={0}
				max={360}
				step={1}
				sx={{
					color: `hsl(${hsv.h}, 100%, 50%)`,
					px: 0.5,
					"& .MuiSlider-track": { border: "none" },
					"& .MuiSlider-rail": {
						opacity: 1,
						background:
							"linear-gradient(90deg, #ff3b30 0%, #ffd60a 17%, #34c759 33%, #64d2ff 50%, #0a84ff 67%, #bf5af2 83%, #ff375f 100%)",
					},
					"& .MuiSlider-thumb": {
						width: 24,
						height: 24,
						backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
						border: "3px solid rgba(255,255,255,0.95)",
						boxShadow: "0 0 0 1px rgba(0,0,0,0.25)",
						"&::before": { display: "none" },
						"&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
							boxShadow: "0 0 0 1px rgba(0,0,0,0.25)",
						},
					},
				}}
				aria-label="Hue value"
			/>

			<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
				H: {hsv.h}° S: {hsv.s}% V: {hsv.v}%
			</Typography>
		</Paper>
	);
};
