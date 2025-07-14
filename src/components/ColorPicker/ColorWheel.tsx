"use client";

import { Box, Paper, Typography } from "@mui/material";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HSLAColor, RGBAColor } from "../../types/color";
import { hslaToRgba, rgbaToHsla } from "../../utils/colorConversions";

interface ColorWheelProps {
	color: RGBAColor;
	onColorChange: (color: RGBAColor) => void;
	size?: number;
}

export const ColorWheel: React.FC<ColorWheelProps> = ({
	color,
	onColorChange,
	size = 200,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [hsla, setHsla] = useState<HSLAColor>(rgbaToHsla(color));

	// Canvas çizim fonksiyonu
	const drawColorWheel = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const centerX = size / 2;
		const centerY = size / 2;
		const radius = size / 2 - 10;

		// Canvas temizle
		ctx.clearRect(0, 0, size, size);

		// Renk tekerleğini çiz
		for (let angle = 0; angle < 360; angle++) {
			const startAngle = ((angle - 1) * Math.PI) / 180;
			const endAngle = (angle * Math.PI) / 180;

			// Dış daire (doygunluk %100)
			for (let r = 0; r < radius; r += 1) {
				const saturation = (r / radius) * 100;
				const hsl = `hsl(${angle}, ${saturation}%, 50%)`;

				ctx.beginPath();
				ctx.strokeStyle = hsl;
				ctx.lineWidth = 1;
				ctx.arc(centerX, centerY, r, startAngle, endAngle);
				ctx.stroke();
			}
		}
	}, [size]);

	// Mouse koordinatlarından HSL değerlerini hesapla
	const getHSLFromMousePosition = useCallback(
		(clientX: number, clientY: number) => {
			const canvas = canvasRef.current;
			if (!canvas) return null;

			const rect = canvas.getBoundingClientRect();
			const centerX = size / 2;
			const centerY = size / 2;
			const maxRadius = size / 2 - 10;

			const x = clientX - rect.left - centerX;
			const y = clientY - rect.top - centerY;

			const distance = Math.sqrt(x * x + y * y);
			if (distance > maxRadius) return null;

			// Açıyı hesapla (0-360)
			let angle = (Math.atan2(y, x) * 180) / Math.PI;
			if (angle < 0) angle += 360;

			// Doygunluğu hesapla (0-100)
			const saturation = Math.min((distance / maxRadius) * 100, 100);

			return {
				h: Math.round(angle),
				s: Math.round(saturation),
				l: 50, // Sabit aydınlık
				a: hsla.a,
			};
		},
		[size, hsla.a],
	);

	// Mouse olayları
	const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
		setIsDragging(true);
		handleMouseMove(event);
	};

	const handleMouseMove = useCallback(
		(event: React.MouseEvent<HTMLCanvasElement>) => {
			if (!isDragging && event.type !== "mousedown") return;

			const newHSLA = getHSLFromMousePosition(event.clientX, event.clientY);
			if (newHSLA) {
				setHsla(newHSLA);
				const newRGBA = hslaToRgba(newHSLA);
				onColorChange(newRGBA);
			}
		},
		[isDragging, getHSLFromMousePosition, onColorChange],
	);

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	// Touch olayları (mobil destek)
	const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
		event.preventDefault();
		setIsDragging(true);
		const touch = event.touches[0];
		const newHSLA = getHSLFromMousePosition(touch.clientX, touch.clientY);
		if (newHSLA) {
			setHsla(newHSLA);
			const newRGBA = hslaToRgba(newHSLA);
			onColorChange(newRGBA);
		}
	};

	const handleTouchMove = useCallback(
		(event: React.TouchEvent<HTMLCanvasElement>) => {
			if (!isDragging) return;
			event.preventDefault();

			const touch = event.touches[0];
			const newHSLA = getHSLFromMousePosition(touch.clientX, touch.clientY);
			if (newHSLA) {
				setHsla(newHSLA);
				const newRGBA = hslaToRgba(newHSLA);
				onColorChange(newRGBA);
			}
		},
		[isDragging, getHSLFromMousePosition, onColorChange],
	);

	const handleTouchEnd = () => {
		setIsDragging(false);
	};

	// Seçili rengin pozisyonunu çiz
	const drawColorIndicator = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const centerX = size / 2;
		const centerY = size / 2;
		const maxRadius = size / 2 - 10;

		// HSL değerlerinden pozisyon hesapla
		const angle = (hsla.h * Math.PI) / 180;
		const radius = (hsla.s / 100) * maxRadius;

		const x = centerX + Math.cos(angle) * radius;
		const y = centerY + Math.sin(angle) * radius;

		// İndikatör çiz
		ctx.beginPath();
		ctx.arc(x, y, 8, 0, 2 * Math.PI);
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 2;
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(x, y, 6, 0, 2 * Math.PI);
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 2;
		ctx.stroke();
	}, [hsla, size]);

	// Canvas'ı çiz
	useEffect(() => {
		drawColorWheel();
		drawColorIndicator();
	}, [drawColorWheel, drawColorIndicator]);

	// Prop'tan gelen renk değiştiğinde HSL'yi güncelle
	useEffect(() => {
		setHsla(rgbaToHsla(color));
	}, [color]);

	// Global mouse olayları (dragging sırasında)
	useEffect(() => {
		if (!isDragging) return;

		const handleGlobalMouseMove = (event: MouseEvent) => {
			const newHSLA = getHSLFromMousePosition(event.clientX, event.clientY);
			if (newHSLA) {
				setHsla(newHSLA);
				const newRGBA = hslaToRgba(newHSLA);
				onColorChange(newRGBA);
			}
		};

		const handleGlobalMouseUp = () => {
			setIsDragging(false);
		};

		document.addEventListener("mousemove", handleGlobalMouseMove);
		document.addEventListener("mouseup", handleGlobalMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleGlobalMouseMove);
			document.removeEventListener("mouseup", handleGlobalMouseUp);
		};
	}, [isDragging, getHSLFromMousePosition, onColorChange]);

	return (
		<Paper elevation={1} sx={{ p: 3, textAlign: "center" }}>
			<Typography variant="h6" gutterBottom>
				Color Wheel
			</Typography>

			<Box
				sx={{
					display: "inline-block",
					cursor: isDragging ? "grabbing" : "grab",
					userSelect: "none",
					"& canvas": {
						borderRadius: "50%",
						display: "block",
						touchAction: "none",
					},
				}}
			>
				<canvas
					ref={canvasRef}
					width={size}
					height={size}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
					aria-label="Color wheel for selecting hue and saturation"
				/>
			</Box>

			<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
				H: {hsla.h}° S: {hsla.s}% L: {hsla.l}%
			</Typography>
		</Paper>
	);
};
