"use client";

import {
	Box,
	Card,
	CardContent,
	Chip,
	Container,
	Divider,
	Grid,
	Paper,
	Stack,
	Typography,
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import type { RGBAColor } from "../../types/color";
import { ColorInputs } from "./ColorInputs";
import { ColorPreview } from "./ColorPreview";
import { ColorSliders } from "./ColorSliders";
import { ColorWheelModal } from "./ColorWheelModal";
import { DownloadControls } from "./DownloadControls";

export const ColorPicker: React.FC = () => {
	const [color, setColor] = useState<RGBAColor>({
		r: 255,
		g: 87,
		b: 34,
		a: 1,
	});

	const handleColorChange = (newColor: RGBAColor) => {
		setColor(newColor);
	};

	return (
		<Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
			{/* Header Section */}
			<Paper
				elevation={0}
				sx={{
					background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
					color: "white",
					p: { xs: 3, md: 4 },
					mb: 4,
					borderRadius: 3,
					textAlign: "center",
				}}
			>
				<Typography
					variant="h3"
					component="h1"
					fontWeight="bold"
					sx={{ mb: 2 }}
				>
					Color Studio
				</Typography>
				<Typography
					variant="h6"
					sx={{ opacity: 0.9, maxWidth: 600, mx: "auto" }}
				>
					Professional color picker with advanced controls and export options
				</Typography>
				<Stack
					direction="row"
					spacing={1}
					justifyContent="center"
					sx={{ mt: 2 }}
				>
					<Chip
						label="PNG Export"
						variant="outlined"
						sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
					/>
					<Chip
						label="JPEG Export"
						variant="outlined"
						sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
					/>
					<Chip
						label="SVG Export"
						variant="outlined"
						sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
					/>
				</Stack>
			</Paper>

			<Grid container spacing={3}>
				{/* Color Preview Section */}
				<Grid
					size={{
						lg: 4,
						xs: 12,
					}}
				>
					<Card
						elevation={2}
						sx={{
							height: "100%",
							borderRadius: 3,
							overflow: "visible",
						}}
					>
						<CardContent sx={{ p: 3 }}>
							<Typography variant="h6" fontWeight="600" gutterBottom>
								Color Preview
							</Typography>
							<Divider sx={{ mb: 3 }} />

							<Stack spacing={3} alignItems="center">
								<ColorPreview color={color} size={200} />

								<Paper
									variant="outlined"
									sx={{
										p: 2,
										width: "100%",
										borderRadius: 2,
										bgcolor: "grey.50",
									}}
								>
									<Typography
										variant="body2"
										color="text.secondary"
										gutterBottom
									>
										Current Color
									</Typography>
									<Typography variant="h6" fontFamily="monospace">
										rgba({color.r}, {color.g}, {color.b}, {color.a})
									</Typography>
									<Typography variant="body2" color="text.secondary">
										#{Math.round(color.r).toString(16).padStart(2, "0")}
										{Math.round(color.g).toString(16).padStart(2, "0")}
										{Math.round(color.b).toString(16).padStart(2, "0")}
									</Typography>
								</Paper>

								<ColorWheelModal
									color={color}
									onColorChange={handleColorChange}
									size={200}
									modalSize={500}
								/>
							</Stack>
						</CardContent>
					</Card>
				</Grid>

				{/* Controls Section */}
				<Grid
					size={{
						lg: 8,
						xs: 12,
					}}
				>
					<Stack spacing={3}>
						{/* Color Inputs */}
						<Card elevation={2} sx={{ borderRadius: 3 }}>
							<CardContent sx={{ p: 3 }}>
								<Typography variant="h6" fontWeight="600" gutterBottom>
									Precise Controls
								</Typography>
								<Divider sx={{ mb: 3 }} />
								<ColorInputs color={color} onColorChange={handleColorChange} />
							</CardContent>
						</Card>

						{/* Color Sliders */}
						<Card elevation={2} sx={{ borderRadius: 3 }}>
							<CardContent sx={{ p: 3 }}>
								<Typography variant="h6" fontWeight="600" gutterBottom>
									Visual Sliders
								</Typography>
								<Divider sx={{ mb: 3 }} />
								<ColorSliders color={color} onColorChange={handleColorChange} />
							</CardContent>
						</Card>
					</Stack>
				</Grid>

				{/* Download Section */}
				<Grid
					size={{
						lg: 12,
						xs: 12,
					}}
				>
					<Card
						elevation={3}
						sx={{
							borderRadius: 3,
							background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
						}}
					>
						<CardContent sx={{ p: 4 }}>
							<Box textAlign="center" sx={{ mb: 3 }}>
								<Typography variant="h6" fontWeight="600" gutterBottom>
									Export Your Color
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Download your custom color in multiple formats
								</Typography>
							</Box>

							<Box display="flex" justifyContent="center">
								<Box sx={{ maxWidth: 500, width: "100%" }}>
									<DownloadControls color={color} />
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Container>
	);
};
