import type { ReadonlyURLSearchParams } from "next/navigation";
import type { ColorFormat, ImageFormat, RGBAColor } from "../types/color";
import {
	clamp,
	cmykToRgba,
	hexToRgba,
	hslaToRgba,
	hsvaToRgba,
	hwbToRgba,
	labToRgba,
	lchToRgba,
} from "./colorConversions";
import { getDefaultDownloadOptions } from "./imageGeneration";

type ReadOnlyParams =
	| URLSearchParams
	| ReadonlyURLSearchParams
	| { get(name: string): string | null; has(name: string): boolean };

export interface ParsedColorRequest {
	active: boolean;
	color?: RGBAColor;
	format?: ColorFormat;
	size: { width: number; height: number };
	download: boolean;
	extension: ImageFormat;
	errors: string[];
}

const SUPPORTED_FORMATS: readonly ColorFormat[] = [
	"hex",
	"rgb",
	"rgba",
	"hsl",
	"hsla",
	"hsv",
	"hsva",
	"cmyk",
	"lab",
	"hwb",
	"lch",
] as const;

const SUPPORTED_IMAGE_FORMATS: readonly ImageFormat[] = [
	"png",
	"jpeg",
	"svg",
] as const;

/**
 * Parse search params and extract color/image request information.
 */
export function parseColorRequestFromSearchParams(
	params: ReadOnlyParams,
): ParsedColorRequest {
	const relevantKeys = [
		"format",
		"formatValue",
		"size",
		"download",
		"extension",
	];
	const defaults = getDefaultDownloadOptions();

	const extensionParam = params.get("extension");
	const rawFormat = params.get("format");
	const rawFormatValue = params.get("formatValue");
	const sizeParam = params.get("size");
	const downloadParam = params.get("download");

	const active = relevantKeys.some((key) => params.has(key));
	const errors: string[] = [];

	const extension = parseExtensionParam(extensionParam);
	if (!extension.valid) {
		errors.push(extension.error);
	}

	const download = parseDownloadParam(downloadParam);
	if (!download.valid) {
		errors.push(download.error);
	}

	const size = parseSizeParam(sizeParam, defaults.width, defaults.height);
	if (!size.valid) {
		errors.push(size.error);
	}

	let parsedFormat: ColorFormat | undefined;
	let parsedColor: RGBAColor | undefined;

	if (rawFormat || rawFormatValue) {
		const formatResult = parseFormatParam(rawFormat);
		if (!formatResult.valid) {
			errors.push(formatResult.error);
		} else if (!rawFormatValue) {
			errors.push("`formatValue` parameter is required.");
		} else {
			parsedFormat = formatResult.format;
			const colorResult = parseColorValue(parsedFormat!, rawFormatValue);
			if (!colorResult.valid) {
				errors.push(colorResult.error);
			} else {
				parsedColor = colorResult.color;
			}
		}
	} else if (active) {
		errors.push("`format` and `formatValue` parameters are required.");
	}

	return {
		active,
		color: parsedColor,
		format: parsedFormat,
		size: {
			width: size.width ?? defaults.width,
			height: size.height ?? defaults.height,
		},
		download: download.value ?? false,
		extension: extension.value ?? defaults.format,
		errors,
	};
}

function parseFormatParam(formatParam: string | null): {
	valid: boolean;
	format?: ColorFormat;
	error: string;
} {
	if (!formatParam) {
		return {
			valid: false,
			error:
				"`format` parameter is missing. Supported formats: " +
				SUPPORTED_FORMATS.join(", "),
		};
	}

	const normalized = formatParam.trim().toLowerCase();
	if (SUPPORTED_FORMATS.includes(normalized as ColorFormat)) {
		return { valid: true, format: normalized as ColorFormat, error: "" };
	}

	return {
		valid: false,
		error:
			`Invalid format: ${formatParam}. Supported formats: ` +
			SUPPORTED_FORMATS.join(", "),
	};
}

function parseColorValue(
	format: ColorFormat,
	value: string,
): { valid: boolean; color?: RGBAColor; error: string } {
	const extract = (expected: number) => extractNumericValues(value, expected);

	try {
		switch (format) {
			case "hex": {
				const normalized = value.trim().startsWith("#")
					? value.trim()
					: `#${value.trim()}`;
				return { valid: true, color: hexToRgba(normalized, 1), error: "" };
			}
			case "rgb": {
				const values = extract(3);
				if (!values.valid) return values;
				const [rComp, gComp, bComp] = values.components;
				const r = normalizeRgbComponent(rComp);
				const g = normalizeRgbComponent(gComp);
				const b = normalizeRgbComponent(bComp);
				return { valid: true, color: { r, g, b, a: 1 }, error: "" };
			}
			case "rgba": {
				const values = extract(3);
				if (!values.valid) return values;
				const [rComp, gComp, bComp, aComp] = values.components;
				const r = normalizeRgbComponent(rComp);
				const g = normalizeRgbComponent(gComp);
				const b = normalizeRgbComponent(bComp);
				return {
					valid: true,
					color: { r, g, b, a: normalizeAlpha(aComp) },
					error: "",
				};
			}
			case "hsl":
			case "hsla": {
				const values = extract(3);
				if (!values.valid) return values;
				const [hComp, sComp, lComp, aComp] = values.components;
				const s = clamp(normalizePercentComponent(sComp), 0, 100);
				const l = clamp(normalizePercentComponent(lComp), 0, 100);
				const a = format === "hsla" ? normalizeAlpha(aComp) : 1;
				return {
					valid: true,
					color: hslaToRgba({ h: clampHue(hComp.value), s, l, a }),
					error: "",
				};
			}
			case "hsv":
			case "hsva": {
				const values = extract(3);
				if (!values.valid) return values;
				const [hComp, sComp, vComp, aComp] = values.components;
				const s = clamp(normalizePercentComponent(sComp), 0, 100);
				const v = clamp(normalizePercentComponent(vComp), 0, 100);
				const a = format === "hsva" ? normalizeAlpha(aComp) : 1;
				return {
					valid: true,
					color: hsvaToRgba({ h: clampHue(hComp.value), s, v, a }),
					error: "",
				};
			}
			case "cmyk": {
				const values = extract(4);
				if (!values.valid) return values;
				const [cComp, mComp, yComp, kComp] = values.components;
				const c = clamp(normalizePercentComponent(cComp), 0, 100);
				const m = clamp(normalizePercentComponent(mComp), 0, 100);
				const y = clamp(normalizePercentComponent(yComp), 0, 100);
				const k = clamp(normalizePercentComponent(kComp), 0, 100);
				return {
					valid: true,
					color: cmykToRgba({ c, m, y, k }, 1),
					error: "",
				};
			}
			case "lab": {
				const values = extract(3);
				if (!values.valid) return values;
				const [lComp, aComp, bComp] = values.components;
				const l = clamp(lComp.value, 0, 100);
				const a = clamp(aComp.value, -128, 127);
				const b = clamp(bComp.value, -128, 127);
				return {
					valid: true,
					color: labToRgba({ l, a, b }, 1),
					error: "",
				};
			}
			case "hwb": {
				const values = extract(3);
				if (!values.valid) return values;
				const [hComp, wComp, bComp] = values.components;
				const w = clamp(normalizePercentComponent(wComp), 0, 100);
				const b = clamp(normalizePercentComponent(bComp), 0, 100);
				return {
					valid: true,
					color: hwbToRgba({ h: clampHue(hComp.value), w, b }, 1),
					error: "",
				};
			}
			case "lch": {
				const values = extract(3);
				if (!values.valid) return values;
				const [lComp, cComp, hComp] = values.components;
				const l = clamp(lComp.value, 0, 100);
				const c = clamp(cComp.value, 0, 150);
				const h = clampHue(hComp.value);
				return {
					valid: true,
					color: lchToRgba({ l, c, h }, 1),
					error: "",
				};
			}
			default:
				return {
					valid: false,
					error: `Unsupported format: ${format}`,
				};
		}
	} catch (error) {
		return {
			valid: false,
			error:
				error instanceof Error
					? error.message
					: "An error occurred while converting the color.",
		};
	}
}

function parseSizeParam(
	sizeParam: string | null,
	defaultWidth: number,
	defaultHeight: number,
):
	| { valid: true; width?: number; height?: number }
	| { valid: false; error: string; width?: number; height?: number } {
	if (!sizeParam) {
		return { valid: true };
	}

	const match = sizeParam
		.trim()
		.toLowerCase()
		.match(/^(\d+)\s*x\s*(\d+)$/);
	if (!match) {
		return {
			valid: false,
			error: "`size` parameter must follow the `widthxheight` pattern.",
			width: defaultWidth,
			height: defaultHeight,
		};
	}

	const width = Number.parseInt(match[1], 10);
	const height = Number.parseInt(match[2], 10);

	if (
		Number.isNaN(width) ||
		Number.isNaN(height) ||
		width <= 0 ||
		height <= 0
	) {
		return {
			valid: false,
			error: "`size` parameter must contain positive numbers.",
			width: defaultWidth,
			height: defaultHeight,
		};
	}

	return { valid: true, width, height };
}

function parseDownloadParam(
	downloadParam: string | null,
):
	| { valid: true; value: boolean }
	| { valid: false; error: string; value: boolean | undefined } {
	if (!downloadParam) {
		return { valid: true, value: false };
	}

	const normalized = downloadParam.trim().toLowerCase();
	if (["true", "1", "yes"].includes(normalized)) {
		return { valid: true, value: true };
	}

	if (["false", "0", "no"].includes(normalized)) {
		return { valid: true, value: false };
	}

	return {
		valid: false,
		value: false,
		error: "`download` parameter must be true or false.",
	};
}

function parseExtensionParam(
	extensionParam: string | null,
):
	| { valid: true; value: ImageFormat | undefined }
	| { valid: false; error: string; value: ImageFormat | undefined } {
	if (!extensionParam) {
		return { valid: true, value: undefined };
	}

	const normalized = extensionParam.trim().toLowerCase();

	const jpegAliases = ["jpeg", "jpg"];
	if (jpegAliases.includes(normalized)) {
		return { valid: true, value: "jpeg" };
	}

	if (SUPPORTED_IMAGE_FORMATS.includes(normalized as ImageFormat)) {
		return { valid: true, value: normalized as ImageFormat };
	}

	return {
		valid: false,
		value: undefined,
		error: `Invalid extension: ${extensionParam}. Supported values: png, jpeg, svg.`,
	};
}

function clampHue(value: number): number {
	const normalized = value % 360;
	return normalized < 0 ? normalized + 360 : normalized;
}

function clampAlpha(value: number): number {
	if (value > 1) {
		return clamp(value / 100, 0, 1);
	}
	return clamp(value, 0, 1);
}

interface ParsedComponent {
	value: number;
	isPercent: boolean;
}

function extractNumericValues(
	input: string,
	expected: number,
):
	| { valid: true; components: ParsedComponent[] }
	| { valid: false; error: string } {
	const matches = input.match(/-?\d*\.?\d+%?/g);
	if (!matches || matches.length < expected) {
		return {
			valid: false,
			error: `Expected ${expected} value(s) but could not parse them from: ${input}`,
		};
	}

	const components = matches.map<ParsedComponent>((match) => {
		const isPercent = match.endsWith("%");
		const numeric = Number.parseFloat(isPercent ? match.slice(0, -1) : match);
		return { value: numeric, isPercent };
	});

	if (components.some((component) => Number.isNaN(component.value))) {
		return { valid: false, error: `Invalid numeric value in: ${input}` };
	}

	return { valid: true, components };
}

function normalizeRgbComponent(component: ParsedComponent): number {
	if (component.isPercent) {
		return Math.round(clamp(component.value, 0, 100) * 2.55);
	}
	return clamp(Math.round(component.value), 0, 255);
}

function normalizePercentComponent(component?: ParsedComponent): number {
	if (!component) {
		return 0;
	}

	if (component.isPercent) {
		return clamp(component.value, 0, 100);
	}

	return clamp(component.value, 0, 100);
}

function normalizeAlpha(component?: ParsedComponent): number {
	if (!component) {
		return 1;
	}

	if (component.isPercent) {
		return clamp(component.value / 100, 0, 1);
	}

	return clampAlpha(component.value);
}
