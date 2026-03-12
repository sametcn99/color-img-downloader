"use client";

import {
	Close as CloseIcon,
	OpenInFull as ExpandIcon,
} from "@mui/icons-material";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Paper,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import type { RGBAColor } from "../../types/color";
import { rgbaToHex, rgbaToString } from "../../utils/colorConversions";
import { ColorWheel } from "./ColorWheel";

interface ColorWheelModalProps {
	color: RGBAColor;
	onColorChange: (color: RGBAColor) => void;
	size?: number;
	modalSize?: number;
}

export const ColorWheelModal: React.FC<ColorWheelModalProps> = ({
	color,
	onColorChange,
	size = 280,
	modalSize = 400,
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [tempColor, setTempColor] = useState<RGBAColor>(color);
	const [viewport, setViewport] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const updateViewport = () => {
			setViewport({ width: window.innerWidth, height: window.innerHeight });
		};

		updateViewport();
		window.addEventListener("resize", updateViewport);
		return () => {
			window.removeEventListener("resize", updateViewport);
		};
	}, []);

	const handleOpenModal = () => {
		setTempColor(color);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	const handleApplyColor = () => {
		onColorChange(tempColor);
		setIsModalOpen(false);
	};

	const handleTempColorChange = (newColor: RGBAColor) => {
		setTempColor(newColor);
	};

	const tempColorString = rgbaToString(tempColor);
	const tempHex = rgbaToHex(tempColor).toUpperCase();
	const isSmallViewport = viewport.width > 0 && viewport.width < 640;
	const dialogWheelSize = useMemo(() => {
		if (viewport.width === 0 || viewport.height === 0) {
			return Math.min(modalSize, 420);
		}

		const widthAllowance = isSmallViewport ? 48 : 160;
		const heightAllowance = isSmallViewport ? 260 : 240;
		return Math.max(
			220,
			Math.min(
				modalSize,
				viewport.width - widthAllowance,
				viewport.height - heightAllowance,
			),
		);
	}, [isSmallViewport, modalSize, viewport.height, viewport.width]);

	return (
		<>
			<Paper
				elevation={0}
				sx={{
					p: 3,
					borderRadius: 3,
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					background:
						"linear-gradient(180deg, rgba(10, 18, 33, 0.88), rgba(8, 14, 26, 0.8))",
				}}
			>
				<Stack spacing={2.5} sx={{ flex: 1, minHeight: 0 }}>
					<Box>
						<Typography variant="overline" color="primary.light">
							Wheel navigation
						</Typography>
						<Typography variant="h5">Color wheel</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mt: 0.75 }}
						>
							Use the compact wheel for quick selection or open the expanded
							canvas for zoom and pan controls.
						</Typography>
					</Box>

					<Box
						sx={{
							position: "relative",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							flex: 1,
							minHeight: 0,
						}}
					>
						<ColorWheel
							color={color}
							onColorChange={onColorChange}
							size={size}
							framed={false}
						/>
						<Tooltip title="Open in full size">
							<IconButton
								onClick={handleOpenModal}
								sx={{
									position: "absolute",
									top: 8,
									right: 8,
									backgroundColor: "rgba(0, 0, 0, 0.62)",
									color: "white",
									width: 36,
									height: 36,
									"&:hover": {
										backgroundColor: "rgba(0, 0, 0, 0.82)",
									},
								}}
								size="small"
							>
								<ExpandIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					</Box>
				</Stack>
			</Paper>

			<Dialog
				open={isModalOpen}
				onClose={handleCloseModal}
				maxWidth="md"
				fullWidth
				fullScreen={isSmallViewport}
				sx={{
					"& .MuiDialog-paper": {
						borderRadius: 1.5,
						maxWidth: isSmallViewport ? "100%" : dialogWheelSize + 112,
						width: isSmallViewport ? "100%" : "calc(100% - 32px)",
						maxHeight: "calc(100dvh - 32px)",
						overflow: "hidden",
					},
				}}
			>
				<DialogTitle
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						pb: 1.25,
					}}
				>
					Expanded color wheel
					<IconButton
						onClick={handleCloseModal}
						sx={{
							color: "text.secondary",
							"&:hover": {
								backgroundColor: "action.hover",
							},
						}}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>

				<DialogContent
					sx={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
						px: { xs: 2, sm: 3 },
						py: { xs: 2, sm: 3 },
						gap: 2,
						overflow: "hidden",
					}}
				>
					<Stack spacing={1} alignItems="center">
						<Box
							sx={{
								width: 72,
								height: 72,
								borderRadius: "50%",
								background: tempColorString,
								border: "1px solid rgba(255,255,255,0.14)",
							}}
						/>
						<Typography variant="body2" color="text.secondary">
							{tempHex} · {tempColorString}
						</Typography>
					</Stack>
					<ColorWheel
						color={tempColor}
						onColorChange={handleTempColorChange}
						size={dialogWheelSize}
						enableViewportControls
						framed={false}
						showReadout={false}
					/>
					<Box
						sx={{
							color: "text.secondary",
							fontSize: 13,
							textAlign: "center",
							maxWidth: 520,
						}}
					>
						Use the mouse wheel to zoom, hold Space and drag or use the middle
						mouse button to pan. Touch devices can pinch to zoom.
					</Box>
				</DialogContent>

				<DialogActions
					sx={{
						gap: 1,
						px: 3,
						pb: 3,
					}}
				>
					<Button onClick={handleCloseModal} variant="outlined" color="inherit">
						Cancel
					</Button>
					<Button
						onClick={handleApplyColor}
						variant="contained"
						color="primary"
					>
						Apply Color
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};
