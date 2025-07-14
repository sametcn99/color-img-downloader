"use client";

import { Box, Paper, Typography } from "@mui/material";
import type React from "react";
import type { RGBAColor } from "../../types/color";
import { rgbaToHex, rgbaToString } from "../../utils/colorConversions";

interface ColorPreviewProps {
	color: RGBAColor;
	size?: number;
}

export const ColorPreview: React.FC<ColorPreviewProps> = ({
	color,
	size = 200,
}) => {
	const colorString = rgbaToString(color);
	const hexString = rgbaToHex(color);

	return (
		<Paper
			elevation={3}
			sx={{
				p: 3,
				textAlign: "center",
				minWidth: 300,
			}}
		>
			<Typography variant="h6" gutterBottom>
				Color Preview
			</Typography>

			<Box
				sx={{
					width: size,
					height: size,
					backgroundColor: colorString,
					border: "2px solid",
					borderColor: "divider",
					borderRadius: 2,
					mx: "auto",
					mb: 2,
					position: "relative",
					// Checkerboard pattern for transparency
					backgroundImage:
						color.a < 1
							? `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                 linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                 linear-gradient(45deg, transparent 75%, #ccc 75%), 
                 linear-gradient(-45deg, transparent 75%, #ccc 75%)`
							: "none",
					backgroundSize: color.a < 1 ? "20px 20px" : "auto",
					backgroundPosition:
						color.a < 1 ? "0 0, 0 10px, 10px -10px, -10px 0px" : "auto",
					"&::after":
						color.a < 1
							? {
									content: '""',
									position: "absolute",
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									backgroundColor: colorString,
									borderRadius: 1,
								}
							: {},
				}}
				role="img"
				aria-label={`Color preview: ${hexString} with ${Math.round(color.a * 100)}% opacity`}
			/>

			<Typography variant="body2" color="text.secondary" gutterBottom>
				{hexString}
			</Typography>

			<Typography variant="body2" color="text.secondary">
				{colorString}
			</Typography>

			{color.a < 1 && (
				<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
					Opacity: {Math.round(color.a * 100)}%
				</Typography>
			)}
		</Paper>
	);
};
