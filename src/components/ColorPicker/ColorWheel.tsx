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
	enableViewportControls?: boolean;
	framed?: boolean;
	showReadout?: boolean;
}

export const ColorWheel: React.FC<ColorWheelProps> = ({
	color,
	onColorChange,
	size = 200,
	enableViewportControls = false,
	framed = true,
	showReadout = true,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isPanning, setIsPanning] = useState(false);
	const [isSpacePressed, setIsSpacePressed] = useState(false);
	const [hsla, setHsla] = useState<HSLAColor>(rgbaToHsla(color));
	const [viewTransform, setViewTransform] = useState({ scale: 1, x: 0, y: 0 });
	const panStartRef = useRef<{
		pointerId: number;
		startX: number;
		startY: number;
		originX: number;
		originY: number;
	} | null>(null);
	const pinchStartRef = useRef<{
		initialDistance: number;
		initialScale: number;
		initialX: number;
		initialY: number;
		initialCenterX: number;
		initialCenterY: number;
	} | null>(null);

	const clampTransform = useCallback(
		(transform: { scale: number; x: number; y: number }) => {
			if (!enableViewportControls) {
				return { scale: 1, x: 0, y: 0 };
			}

			const scale = Math.min(Math.max(transform.scale, 1), 4);
			const maxOffset = (size * scale - size) / 2;

			return {
				scale,
				x: Math.min(Math.max(transform.x, -maxOffset), maxOffset),
				y: Math.min(Math.max(transform.y, -maxOffset), maxOffset),
			};
		},
		[enableViewportControls, size],
	);

	const updateTransform = useCallback(
		(
			updater:
				| { scale: number; x: number; y: number }
				| ((current: { scale: number; x: number; y: number }) => {
						scale: number;
						x: number;
						y: number;
				  }),
		) => {
			setViewTransform((current) => {
				const nextTransform =
					typeof updater === "function" ? updater(current) : updater;
				return clampTransform(nextTransform);
			});
		},
		[clampTransform],
	);

	const getRelativeCenterPoint = useCallback(
		(clientX: number, clientY: number) => {
			const container = containerRef.current;
			if (!container) {
				return null;
			}

			const rect = container.getBoundingClientRect();
			return {
				x: clientX - rect.left - rect.width / 2,
				y: clientY - rect.top - rect.height / 2,
			};
		},
		[],
	);

	// Canvas drawing function
	const drawColorWheel = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const centerX = size / 2;
		const centerY = size / 2;
		const radius = size / 2 - 10;

		// Clear the canvas
		ctx.clearRect(0, 0, size, size);

		// Draw the color wheel
		for (let angle = 0; angle < 360; angle++) {
			const startAngle = ((angle - 1) * Math.PI) / 180;
			const endAngle = (angle * Math.PI) / 180;

			// Outer circle (100% saturation)
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

	// Calculate HSL values from mouse coordinates
	const getHSLFromMousePosition = useCallback(
		(clientX: number, clientY: number) => {
			const canvas = canvasRef.current;
			if (!canvas) return null;

			const rect = canvas.getBoundingClientRect();
			const normalizedX = ((clientX - rect.left) / rect.width) * size;
			const normalizedY = ((clientY - rect.top) / rect.height) * size;
			const centerX = size / 2;
			const centerY = size / 2;
			const maxRadius = size / 2 - 10;

			const x = normalizedX - centerX;
			const y = normalizedY - centerY;

			const distance = Math.sqrt(x * x + y * y);
			if (distance > maxRadius) return null;

			// Calculate angle (0-360)
			let angle = (Math.atan2(y, x) * 180) / Math.PI;
			if (angle < 0) angle += 360;

			// Calculate saturation (0-100)
			const saturation = Math.min((distance / maxRadius) * 100, 100);

			return {
				h: Math.round(angle),
				s: Math.round(saturation),
				l: 50, // Fixed lightness
				a: hsla.a,
			};
		},
		[size, hsla.a],
	);

	const zoomAtPoint = useCallback(
		(clientX: number, clientY: number, scaleFactor: number) => {
			if (!enableViewportControls) {
				return;
			}

			const point = getRelativeCenterPoint(clientX, clientY);
			if (!point) {
				return;
			}

			updateTransform((current) => {
				const nextScale = Math.min(Math.max(current.scale * scaleFactor, 1), 4);
				if (nextScale === current.scale) {
					return current;
				}

				const scaleRatio = nextScale / current.scale;
				return {
					scale: nextScale,
					x: point.x - (point.x - current.x) * scaleRatio,
					y: point.y - (point.y - current.y) * scaleRatio,
				};
			});
		},
		[enableViewportControls, getRelativeCenterPoint, updateTransform],
	);

	// Mouse events
	const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
		if (event.button !== 0) {
			return;
		}

		if (enableViewportControls && isSpacePressed && viewTransform.scale > 1) {
			return;
		}

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

	// Touch events (mobile support)
	const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
		if (enableViewportControls && event.touches.length > 1) {
			setIsDragging(false);
			return;
		}

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
			if (enableViewportControls && event.touches.length > 1) {
				setIsDragging(false);
				return;
			}

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
		[
			enableViewportControls,
			isDragging,
			getHSLFromMousePosition,
			onColorChange,
		],
	);

	const handleTouchEnd = () => {
		setIsDragging(false);
	};

	const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
		if (!enableViewportControls) {
			return;
		}

		event.preventDefault();
		zoomAtPoint(
			event.clientX,
			event.clientY,
			event.deltaY < 0 ? 1.15 : 1 / 1.15,
		);
	};

	const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		if (!enableViewportControls) {
			return;
		}

		const isPanTrigger =
			event.button === 1 ||
			(event.button === 0 && isSpacePressed && viewTransform.scale > 1);

		if (!isPanTrigger) {
			return;
		}

		event.preventDefault();
		panStartRef.current = {
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			originX: viewTransform.x,
			originY: viewTransform.y,
		};
		setIsPanning(true);
		event.currentTarget.setPointerCapture(event.pointerId);
	};

	const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		if (!enableViewportControls || !isPanning || !panStartRef.current) {
			return;
		}

		if (panStartRef.current.pointerId !== event.pointerId) {
			return;
		}

		event.preventDefault();
		updateTransform({
			scale: viewTransform.scale,
			x:
				panStartRef.current.originX +
				(event.clientX - panStartRef.current.startX),
			y:
				panStartRef.current.originY +
				(event.clientY - panStartRef.current.startY),
		});
	};

	const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
		if (!enableViewportControls || !panStartRef.current) {
			return;
		}

		if (panStartRef.current.pointerId !== event.pointerId) {
			return;
		}

		panStartRef.current = null;
		setIsPanning(false);
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	};

	const getTouchMetrics = (event: React.TouchEvent<HTMLDivElement>) => {
		const [firstTouch, secondTouch] = [event.touches[0], event.touches[1]];
		if (!firstTouch || !secondTouch) {
			return null;
		}

		const firstPoint = getRelativeCenterPoint(
			firstTouch.clientX,
			firstTouch.clientY,
		);
		const secondPoint = getRelativeCenterPoint(
			secondTouch.clientX,
			secondTouch.clientY,
		);

		if (!firstPoint || !secondPoint) {
			return null;
		}

		const deltaX = secondTouch.clientX - firstTouch.clientX;
		const deltaY = secondTouch.clientY - firstTouch.clientY;

		return {
			centerX: (firstPoint.x + secondPoint.x) / 2,
			centerY: (firstPoint.y + secondPoint.y) / 2,
			distance: Math.hypot(deltaX, deltaY),
		};
	};

	const handleViewportTouchStart = (
		event: React.TouchEvent<HTMLDivElement>,
	) => {
		if (!enableViewportControls || event.touches.length !== 2) {
			return;
		}

		const metrics = getTouchMetrics(event);
		if (!metrics) {
			return;
		}

		event.preventDefault();
		setIsDragging(false);
		pinchStartRef.current = {
			initialDistance: metrics.distance,
			initialScale: viewTransform.scale,
			initialX: viewTransform.x,
			initialY: viewTransform.y,
			initialCenterX: metrics.centerX,
			initialCenterY: metrics.centerY,
		};
	};

	const handleViewportTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
		if (
			!enableViewportControls ||
			event.touches.length !== 2 ||
			!pinchStartRef.current
		) {
			return;
		}

		const metrics = getTouchMetrics(event);
		if (!metrics) {
			return;
		}

		event.preventDefault();

		const nextScale = Math.min(
			Math.max(
				pinchStartRef.current.initialScale *
					(metrics.distance / pinchStartRef.current.initialDistance),
				1,
			),
			4,
		);
		const scaleRatio = nextScale / pinchStartRef.current.initialScale;

		updateTransform({
			scale: nextScale,
			x:
				metrics.centerX -
				(pinchStartRef.current.initialCenterX -
					pinchStartRef.current.initialX) *
					scaleRatio,
			y:
				metrics.centerY -
				(pinchStartRef.current.initialCenterY -
					pinchStartRef.current.initialY) *
					scaleRatio,
		});
	};

	const handleViewportTouchEnd = () => {
		pinchStartRef.current = null;
	};

	// Draw selected color position
	const drawColorIndicator = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const centerX = size / 2;
		const centerY = size / 2;
		const maxRadius = size / 2 - 10;

		// Compute position from HSL values
		const angle = (hsla.h * Math.PI) / 180;
		const radius = (hsla.s / 100) * maxRadius;

		const x = centerX + Math.cos(angle) * radius;
		const y = centerY + Math.sin(angle) * radius;

		// Draw indicator
		ctx.beginPath();
		ctx.arc(x, y, 8, 0, 2 * Math.PI);
		ctx.fillStyle = `hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, ${hsla.a})`;
		ctx.fill();
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 2;
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(x, y, 6, 0, 2 * Math.PI);
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 2;
		ctx.stroke();
	}, [hsla, size]);

	// Draw the canvas
	useEffect(() => {
		drawColorWheel();
		drawColorIndicator();
	}, [drawColorWheel, drawColorIndicator]);

	// Update HSL when incoming color prop changes
	useEffect(() => {
		setHsla(rgbaToHsla(color));
	}, [color]);

	// Global mouse events (while dragging)
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

	useEffect(() => {
		if (!enableViewportControls) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.code === "Space") {
				setIsSpacePressed(true);
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.code === "Space") {
				setIsSpacePressed(false);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [enableViewportControls]);

	useEffect(() => {
		if (!enableViewportControls) {
			setViewTransform({ scale: 1, x: 0, y: 0 });
		}
	}, [enableViewportControls]);

	const wheelContent = (
		<>
			<Box
				ref={containerRef}
				onWheel={handleWheel}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerUp}
				onTouchStart={handleViewportTouchStart}
				onTouchMove={handleViewportTouchMove}
				onTouchEnd={handleViewportTouchEnd}
				sx={{
					display: "inline-block",
					cursor: isPanning
						? "grabbing"
						: enableViewportControls &&
								isSpacePressed &&
								viewTransform.scale > 1
							? "grab"
							: isDragging
								? "grabbing"
								: "crosshair",
					userSelect: "none",
					width: size,
					height: size,
					overflow: "hidden",
					touchAction: enableViewportControls ? "none" : "auto",
					"& canvas": {
						borderRadius: "50%",
						display: "block",
						touchAction: "none",
						transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`,
						transformOrigin: "center center",
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

			{showReadout && (
				<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
					H: {hsla.h}° S: {hsla.s}% L: {hsla.l}%
				</Typography>
			)}
		</>
	);

	if (!framed) {
		return (
			<Box
				sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
			>
				{wheelContent}
			</Box>
		);
	}

	return (
		<Paper elevation={1} sx={{ p: 3, textAlign: "center" }}>
			<Typography variant="h6" gutterBottom>
				Color Wheel
			</Typography>
			{wheelContent}
		</Paper>
	);
};
