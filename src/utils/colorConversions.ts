import type {
	CMYKColor,
	HSLAColor,
	HSVAColor,
	HWBColor,
	LABColor,
	LCHColor,
	RGBAColor,
} from "../types/color";

/**
 * Convert RGBA to HEX string
 */
export function rgbaToHex(rgba: RGBAColor): string {
	const toHex = (n: number) => {
		const hex = Math.round(n).toString(16);
		return hex.length === 1 ? `0${hex}` : hex;
	};

	return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
}

/**
 * Convert HEX to RGBA
 */
export function hexToRgba(hex: string, alpha: number = 1): RGBAColor {
	const cleanHex = hex.replace("#", "");

	if (cleanHex.length === 3) {
		// Short hex format (e.g., #f0a)
		const r = parseInt(cleanHex[0] + cleanHex[0], 16);
		const g = parseInt(cleanHex[1] + cleanHex[1], 16);
		const b = parseInt(cleanHex[2] + cleanHex[2], 16);
		return { r, g, b, a: alpha };
	} else if (cleanHex.length === 6) {
		// Long hex format (e.g., #ff00aa)
		const r = parseInt(cleanHex.slice(0, 2), 16);
		const g = parseInt(cleanHex.slice(2, 4), 16);
		const b = parseInt(cleanHex.slice(4, 6), 16);
		return { r, g, b, a: alpha };
	}

	// Invalid hex, return black
	return { r: 0, g: 0, b: 0, a: alpha };
}

/**
 * Convert RGBA to HSLA
 */
export function rgbaToHsla(rgba: RGBAColor): HSLAColor {
	const r = rgba.r / 255;
	const g = rgba.g / 255;
	const b = rgba.b / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const diff = max - min;
	const sum = max + min;

	const l = sum / 2;

	let h = 0;
	let s = 0;

	if (diff !== 0) {
		s = l > 0.5 ? diff / (2 - sum) : diff / sum;

		switch (max) {
			case r:
				h = (g - b) / diff + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / diff + 2;
				break;
			case b:
				h = (r - g) / diff + 4;
				break;
		}
		h /= 6;
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100),
		a: rgba.a,
	};
}

/**
 * Convert HSLA to RGBA
 */
export function hslaToRgba(hsla: HSLAColor): RGBAColor {
	const h = hsla.h / 360;
	const s = hsla.s / 100;
	const l = hsla.l / 100;

	if (s === 0) {
		// Achromatic (gray)
		const gray = Math.round(l * 255);
		return { r: gray, g: gray, b: gray, a: hsla.a };
	}

	const hue2rgb = (p: number, q: number, t: number) => {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	};

	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;

	const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
	const g = Math.round(hue2rgb(p, q, h) * 255);
	const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

	return { r, g, b, a: hsla.a };
}

/**
 * Format RGBA as CSS string
 */
export function rgbaToString(rgba: RGBAColor): string {
	if (rgba.a === 1) {
		return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
	}
	return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
}

/**
 * Validate HEX color string
 */
export function isValidHex(hex: string): boolean {
	const cleanHex = hex.replace("#", "");
	return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex);
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: unknown[]) => void>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;

	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

// HSV Color Conversions
/**
 * Convert RGBA to HSVA
 */
export function rgbaToHsva(rgba: RGBAColor): HSVAColor {
	const r = rgba.r / 255;
	const g = rgba.g / 255;
	const b = rgba.b / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const diff = max - min;

	let h = 0;
	let s = 0;
	const v = max;

	if (diff !== 0) {
		s = diff / max;

		switch (max) {
			case r:
				h = (g - b) / diff + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / diff + 2;
				break;
			case b:
				h = (r - g) / diff + 4;
				break;
		}
		h /= 6;
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		v: Math.round(v * 100),
		a: rgba.a,
	};
}

/**
 * Convert HSVA to RGBA
 */
export function hsvaToRgba(hsva: HSVAColor): RGBAColor {
	const h = hsva.h / 360;
	const s = hsva.s / 100;
	const v = hsva.v / 100;

	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);

	let r: number, g: number, b: number;

	switch (i % 6) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
		case 1:
			r = q;
			g = v;
			b = p;
			break;
		case 2:
			r = p;
			g = v;
			b = t;
			break;
		case 3:
			r = p;
			g = q;
			b = v;
			break;
		case 4:
			r = t;
			g = p;
			b = v;
			break;
		case 5:
			r = v;
			g = p;
			b = q;
			break;
		default:
			r = g = b = 0;
	}

	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255),
		a: hsva.a,
	};
}

// CMYK Color Conversions
/**
 * Convert RGBA to CMYK
 */
export function rgbaToCmyk(rgba: RGBAColor): CMYKColor {
	const r = rgba.r / 255;
	const g = rgba.g / 255;
	const b = rgba.b / 255;

	const k = 1 - Math.max(r, g, b);

	if (k === 1) {
		return { c: 0, m: 0, y: 0, k: 100 };
	}

	const c = (1 - r - k) / (1 - k);
	const m = (1 - g - k) / (1 - k);
	const y = (1 - b - k) / (1 - k);

	return {
		c: Math.round(c * 100),
		m: Math.round(m * 100),
		y: Math.round(y * 100),
		k: Math.round(k * 100),
	};
}

/**
 * Convert CMYK to RGBA
 */
export function cmykToRgba(cmyk: CMYKColor, alpha: number = 1): RGBAColor {
	const c = cmyk.c / 100;
	const m = cmyk.m / 100;
	const y = cmyk.y / 100;
	const k = cmyk.k / 100;

	const r = 255 * (1 - c) * (1 - k);
	const g = 255 * (1 - m) * (1 - k);
	const b = 255 * (1 - y) * (1 - k);

	return {
		r: Math.round(r),
		g: Math.round(g),
		b: Math.round(b),
		a: alpha,
	};
}

// LAB Color Conversions
/**
 * Convert RGBA to LAB
 */
export function rgbaToLab(rgba: RGBAColor): LABColor {
	// First convert to XYZ
	let r = rgba.r / 255;
	let g = rgba.g / 255;
	let b = rgba.b / 255;

	// Apply gamma correction
	r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
	g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
	b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;

	// Convert to XYZ (D65 illuminant)
	let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
	let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1;
	let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

	// Convert XYZ to LAB
	x = x > 0.008856 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
	y = y > 0.008856 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
	z = z > 0.008856 ? z ** (1 / 3) : 7.787 * z + 16 / 116;

	const l = 116 * y - 16;
	const a = 500 * (x - y);
	const bValue = 200 * (y - z);

	return {
		l: Math.round(l),
		a: Math.round(a),
		b: Math.round(bValue),
	};
}

/**
 * Convert LAB to RGBA
 */
export function labToRgba(lab: LABColor, alpha: number = 1): RGBAColor {
	let y = (lab.l + 16) / 116;
	let x = lab.a / 500 + y;
	let z = y - lab.b / 200;

	const x3 = x ** 3;
	const y3 = y ** 3;
	const z3 = z ** 3;

	x = x3 > 0.008856 ? x3 : (x - 16 / 116) / 7.787;
	y = y3 > 0.008856 ? y3 : (y - 16 / 116) / 7.787;
	z = z3 > 0.008856 ? z3 : (z - 16 / 116) / 7.787;

	// Convert to RGB (D65 illuminant)
	x *= 0.95047;
	y *= 1;
	z *= 1.08883;

	let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
	let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
	let b = x * 0.0557 + y * -0.204 + z * 1.057;

	// Apply gamma correction
	r = r > 0.0031308 ? 1.055 * r ** (1 / 2.4) - 0.055 : 12.92 * r;
	g = g > 0.0031308 ? 1.055 * g ** (1 / 2.4) - 0.055 : 12.92 * g;
	b = b > 0.0031308 ? 1.055 * b ** (1 / 2.4) - 0.055 : 12.92 * b;

	return {
		r: Math.round(Math.max(0, Math.min(1, r)) * 255),
		g: Math.round(Math.max(0, Math.min(1, g)) * 255),
		b: Math.round(Math.max(0, Math.min(1, b)) * 255),
		a: alpha,
	};
}

// HWB Color Conversions
/**
 * Convert RGBA to HWB
 */
export function rgbaToHwb(rgba: RGBAColor): HWBColor {
	const hsv = rgbaToHsva(rgba);
	const w = ((100 - hsv.s) * hsv.v) / 100;
	const b = 100 - hsv.v;

	return {
		h: hsv.h,
		w: Math.round(w),
		b: Math.round(b),
	};
}

/**
 * Convert HWB to RGBA
 */
export function hwbToRgba(hwb: HWBColor, alpha: number = 1): RGBAColor {
	const w = hwb.w / 100;
	const b = hwb.b / 100;

	// Handle the case where w + b >= 1
	const ratio = w + b;
	if (ratio > 1) {
		const gray = Math.round((255 * w) / ratio);
		return { r: gray, g: gray, b: gray, a: alpha };
	}

	const v = 1 - b;
	const s = v === 0 ? 0 : 1 - w / v;

	const hsv: HSVAColor = {
		h: hwb.h,
		s: s * 100,
		v: v * 100,
		a: alpha,
	};

	return hsvaToRgba(hsv);
}

// LCH Color Conversions
/**
 * Convert RGBA to LCH
 */
export function rgbaToLch(rgba: RGBAColor): LCHColor {
	const lab = rgbaToLab(rgba);
	const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
	let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;

	if (h < 0) {
		h += 360;
	}

	return {
		l: lab.l,
		c: Math.round(c),
		h: Math.round(h),
	};
}

/**
 * Convert LCH to RGBA
 */
export function lchToRgba(lch: LCHColor, alpha: number = 1): RGBAColor {
	const hRad = (lch.h * Math.PI) / 180;
	const a = lch.c * Math.cos(hRad);
	const b = lch.c * Math.sin(hRad);

	const lab: LABColor = {
		l: lch.l,
		a: Math.round(a),
		b: Math.round(b),
	};

	return labToRgba(lab, alpha);
}

/**
 * Format color values as string for different formats
 */
export function formatColorString(color: RGBAColor, format: string): string {
	switch (format) {
		case "hex":
			return rgbaToHex(color);
		case "rgb":
			return `rgb(${color.r}, ${color.g}, ${color.b})`;
		case "rgba":
			return rgbaToString(color);
		case "hsl": {
			const hsl = rgbaToHsla(color);
			return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
		}
		case "hsla": {
			const hsl = rgbaToHsla(color);
			return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${hsl.a})`;
		}
		case "hsv": {
			const hsv = rgbaToHsva(color);
			return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
		}
		case "hsva": {
			const hsv = rgbaToHsva(color);
			return `hsva(${hsv.h}, ${hsv.s}%, ${hsv.v}%, ${hsv.a})`;
		}
		case "cmyk": {
			const cmyk = rgbaToCmyk(color);
			return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
		}
		case "lab": {
			const lab = rgbaToLab(color);
			return `lab(${lab.l}, ${lab.a}, ${lab.b})`;
		}
		case "hwb": {
			const hwb = rgbaToHwb(color);
			return `hwb(${hwb.h}, ${hwb.w}%, ${hwb.b}%)`;
		}
		case "lch": {
			const lch = rgbaToLch(color);
			return `lch(${lch.l}, ${lch.c}, ${lch.h})`;
		}
		default:
			return rgbaToString(color);
	}
}
