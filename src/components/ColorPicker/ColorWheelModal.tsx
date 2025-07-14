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
	Tooltip,
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import type { RGBAColor } from "../../types/color";
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
	size = 200,
	modalSize = 400,
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [tempColor, setTempColor] = useState<RGBAColor>(color);

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

	return (
		<>
			{/* Küçük Color Wheel - Modal açmak için */}
			<Box sx={{ position: "relative", display: "inline-block" }}>
				<ColorWheel color={color} onColorChange={onColorChange} size={size} />

				{/* Genişletme butonu */}
				<Tooltip title="Open in full size">
					<IconButton
						onClick={handleOpenModal}
						sx={{
							position: "absolute",
							top: 8,
							right: 8,
							backgroundColor: "rgba(0, 0, 0, 0.6)",
							color: "white",
							width: 32,
							height: 32,
							"&:hover": {
								backgroundColor: "rgba(0, 0, 0, 0.8)",
							},
						}}
						size="small"
					>
						<ExpandIcon fontSize="small" />
					</IconButton>
				</Tooltip>
			</Box>

			{/* Modal Dialog */}
			<Dialog
				open={isModalOpen}
				onClose={handleCloseModal}
				maxWidth="md"
				fullWidth
				sx={{
					"& .MuiDialog-paper": {
						borderRadius: 2,
						maxWidth: modalSize + 100,
					},
				}}
			>
				<DialogTitle
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						pb: 1,
					}}
				>
					Color Wheel - Select Your Color
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
						justifyContent: "center",
						alignItems: "center",
						py: 3,
					}}
				>
					<ColorWheel
						color={tempColor}
						onColorChange={handleTempColorChange}
						size={modalSize}
					/>
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
