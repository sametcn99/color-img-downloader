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

export interface HSVAColor {
	h: number; // 0-360
	s: number; // 0-100
	v: number; // 0-100
	a: number; // 0-1
}

export interface CMYKColor {
	c: number; // 0-100
	m: number; // 0-100
	y: number; // 0-100
	k: number; // 0-100
}

export interface LABColor {
	l: number; // 0-100
	a: number; // -128 to 127
	b: number; // -128 to 127
}

export interface HWBColor {
	h: number; // 0-360
	w: number; // 0-100
	b: number; // 0-100
}

export interface LCHColor {
	l: number; // 0-100
	c: number; // 0-150
	h: number; // 0-360
}

export type ColorFormat = "hex" | "rgb" | "rgba" | "hsl" | "hsla" | "hsv" | "hsva" | "cmyk" | "lab" | "hwb" | "lch";

export type ImageFormat = "png" | "jpeg" | "svg";

export interface ColorState {
	rgba: RGBAColor;
	hex: string;
	format: ColorFormat;
}

export interface ColorFormatInputs {
	hex: string;
	rgb: { r: string; g: string; b: string; a: string };
	hsl: { h: string; s: string; l: string; a: string };
	hsv: { h: string; s: string; v: string; a: string };
	cmyk: { c: string; m: string; y: string; k: string };
	lab: { l: string; a: string; b: string };
	hwb: { h: string; w: string; b: string };
	lch: { l: string; c: string; h: string };
}

export interface DownloadOptions {
	format: ImageFormat;
	width: number;
	height: number;
	quality?: number; // For JPEG only (0-1)
}
