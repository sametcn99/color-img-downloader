import type { HSLAColor, RGBAColor } from "../types/color";

/**
 * Convert RGBA to HEX string
 */
export function rgbaToHex(rgba: RGBAColor): string {
	const toHex = (n: number) => {
		const hex = Math.round(n).toString(16);
		return hex.length === 1 ? "0" + hex : hex;
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
