export interface RGBAColor {
	r: number; // 0-255
	g: number; // 0-255
	b: number; // 0-255
	a: number; // 0-1
}

export interface HSLAColor {
	h: number; // 0-360
	s: number; // 0-100
	l: number; // 0-100
	a: number; // 0-1
}

export type ColorFormat = "hex" | "rgb" | "rgba" | "hsl" | "hsla";

export type ImageFormat = "png" | "jpeg" | "svg";

export interface ColorState {
	rgba: RGBAColor;
	hex: string;
	format: ColorFormat;
}

export interface DownloadOptions {
	format: ImageFormat;
	width: number;
	height: number;
	quality?: number; // For JPEG only (0-1)
}
