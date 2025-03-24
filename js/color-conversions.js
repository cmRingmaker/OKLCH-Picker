/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * ColorConverter
 *
 * Handles conversions between various color spaces (OKLCH, Oklab, RGB, HEX, HSL).
 * Implements conversions based on CSS Color Module Level 4 specifications.
 * https://www.w3.org/TR/css-color-4/
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

/**
 * Converts OKLCH to various color formats.
 */
export class ColorConverter {
	constructor() {
		// Matrix M1 for Oklab to LMS conversion.
		this.M1 = [
			[1, 0.396337777408718568325042724609375, 0.21580375730345133215188979804515838623046875],
			[1, -0.1055613458125419479858875274658203125, -0.0638541728988224186599254608154296875],
			[1, -0.08948417751491888523101806640625, -1.29148554802059173583984375],
		]

		// Matrix M2 for LMS to linear RGB conversion.
		this.M2 = [
			[4.076741662108719609375, -3.307711591321111392974853515625, 0.2309699292089945112168788909912109375],
			[
				-1.268438004607870094478130340576171875, 2.60975740112341635562479496002197265625,
				-0.34131939651554626114666461944580078125,
			],
			[
				-0.004196086355900801718235015869140625, -0.7034186147013165391981601715087890625,
				1.70761470104896191775798797607421875,
			],
		]
	}

	/**
	 * Converts OKLCH to Oklab coordinates.
	 * @param {number} l  - Lightness (0-100).
	 * @param {number} c  - Chroma (0-0.4).
	 * @param {number} h  - Hue (0-360).
	 * @return {Object}   Oklab coordinates {L, a, b}.
	 *
	 */
	oklchToOklab(l, c, h) {
		const L = l / 100 // Normalize lightness to 0-1 range.
		const hueRad = (h * Math.PI) / 180 // Convert hue to radians.
		// Calculate oklab a and b components.
		const a = c * Math.cos(hueRad)
		const b = c * Math.sin(hueRad)

		return { L, a, b }
	}

	/**
	 * Converts Oklab coordinates to linear RGB.
	 * @param {number} L  - Lightness (0-1).
	 * @param {number} a  - a channel.
	 * @param {number} b  - b channel.
	 * @returns {Object}  Linear RGB values {r, g, b}.
	 *
	 */
	oklabToLinearRGB(L, a, b) {
		const lMSValues = this.M1.map((row) => row[0] * L + row[1] * a + row[2] * b)
		const lMSCubed = lMSValues.map((v) => v ** 3)
		const linearRGB = this.M2.map((row) => row[0] * lMSCubed[0] + row[1] * lMSCubed[1] + row[2] * lMSCubed[2])

		return {
			r: linearRGB[0],
			g: linearRGB[1],
			b: linearRGB[2],
		}
	}

	/**
	 * Converts linear RGB to sRGB.
	 * @param {number} value  - Linear RGB channel value.
	 * @returns {number}      sRGB channel value (0-1).
	 *
	 */
	linearToSRGB(value) {
		const absV = Math.abs(value)
		const sign = Math.sign(value)

		if (absV > 0.0031308) {
			return sign * (1.055 * Math.pow(absV, 1 / 2.4) - 0.055)
		} else {
			return sign * (12.92 * absV)
		}
	}

	/**
	 * Converts RGB object to standardized sRGB object with values 0-255.
	 * @param {Object} linearRGB  - Linear RGB values {r, g, b}.
	 * @param {number} alpha      - Alpha value (0-1).
	 * @returns {Object}          Standard RGB object with values 0-255.
	 *
	 */
	linearRGBToStandardRGB(linearRGB, alpha = 1) {
		const sRGB = {
			r: this.linearToSRGB(linearRGB.r),
			g: this.linearToSRGB(linearRGB.g),
			b: this.linearToSRGB(linearRGB.b),
		}

		return {
			r: Math.max(0, Math.min(255, Math.round(sRGB.r * 255))),
			g: Math.max(0, Math.min(255, Math.round(sRGB.g * 255))),
			b: Math.max(0, Math.min(255, Math.round(sRGB.b * 255))),
			a: alpha,
		}
	}

	/**
	 * Converts RGB values to hexadecimal color string.
	 * @param {Object} rgb  - RGB object with values 0-255.
	 * @returns {string}    Hexadecimal color string.
	 *
	 */
	rgbToHex(rgb) {
		const r = rgb.r.toString(16).padStart(2, '0')
		const g = rgb.g.toString(16).padStart(2, '0')
		const b = rgb.b.toString(16).padStart(2, '0')

		return `#${r}${g}${b}`.toUpperCase()
	}

	/**
	 * Converts RGB values to HSL color space.
	 * @param {Object} rgb  - RGB object with values 0-255.
	 * @returns {Object}    HSL object with h (0-360), s (0-100), l (0-100).
	 *
	 */
	rgbToHSL(rgb) {
		const r = rgb.r / 255
		const g = rgb.g / 255
		const b = rgb.b / 255

		const max = Math.max(r, g, b)
		const min = Math.min(r, g, b)
		const delta = max - min

		const lightness = (max + min) / 2

		let saturation = 0
		if (delta !== 0) {
			saturation = delta / (1 - Math.abs(2 * lightness - 1))
		}

		let hue = 0
		if (delta !== 0) {
			if (max === r) {
				hue = ((g - b) / delta) % 6
			} else if (max === g) {
				hue = (b - r) / delta + 2
			} else {
				hue = (r - g) / delta + 4
			}

			hue *= 60
			if (hue < 0) {
				hue += 360
			}
		}

		return {
			h: Math.round(hue),
			s: Math.round(saturation * 100),
			l: Math.round(lightness * 100),
		}
	}

	/**
	 * Converts sRGB value to linear RGB.
	 * @param {number} value  - sRGB channel value (0-1).
	 * @returns {number}      Linear RGB value.
	 *
	 */
	sRGBToLinear(value) {
		if (value <= 0.04045) {
			return value / 12.92
		} else {
			return Math.pow((value + 0.055) / 1.055, 2.4)
		}
	}

	/**
	 * Convert RGB to OKLCH color space.
	 * @param {number} r  - Red channel (0-255).
	 * @param {number} g  - Green channel (0-255).
	 * @param {number} b  - Blue channel (0-255).
	 * @param {number} a  - Alpha (0-1).
	 * @returns {Object}  OKLCH object with l (0-100), c (0-0.4), h (0-360), a (0-100).
	 *
	 */
	rgbToOKLCH(r, g, b, a = 1) {
		// Convert sRGB to linear RGB
		const linearR = this.sRGBToLinear(r / 255)
		const linearG = this.sRGBToLinear(g / 255)
		const linearB = this.sRGBToLinear(b / 255)

		// Convert linear RGB to LMS using inverse of M2 matrix.
		const invM2 = [
			[0.4122214708, 0.5363325363, 0.0514459929],
			[0.2119034982, 0.6806995451, 0.1073969566],
			[0.0883024619, 0.2817188376, 0.6299787005],
		]

		const lms = [
			invM2[0][0] * linearR + invM2[0][1] * linearG + invM2[0][2] * linearB,
			invM2[1][0] * linearR + invM2[1][1] * linearG + invM2[1][2] * linearB,
			invM2[2][0] * linearR + invM2[2][1] * linearG + invM2[2][2] * linearB,
		]

		// Apply cube root to LMS values.
		const lmsCubeRoot = lms.map((v) => Math.cbrt(v))

		// Convert to Lab using inverse of M1 matrix.
		const invM1 = [
			[0.2104542553, 0.793617785, -0.0040720468],
			[1.9779984951, -2.428592205, 0.4505937099],
			[0.0259040371, 0.7827717662, -0.808675766],
		]

		const L = invM1[0][0] * lmsCubeRoot[0] + invM1[0][1] * lmsCubeRoot[1] + invM1[0][2] * lmsCubeRoot[2]
		const a_value = invM1[1][0] * lmsCubeRoot[0] + invM1[1][1] * lmsCubeRoot[1] + invM1[1][2] * lmsCubeRoot[2]
		const b_value = invM1[2][0] * lmsCubeRoot[0] + invM1[2][1] * lmsCubeRoot[1] + invM1[2][2] * lmsCubeRoot[2]

		// Convert Lab to LCH.
		const c = Math.sqrt(a_value * a_value + b_value * b_value)
		let h = (Math.atan2(b_value, a_value) * 180) / Math.PI
		if (h < 0) {
			h += 360
		}

		return {
			l: L * 100,
			c: c,
			h: h,
			a: a * 100,
		}
	}

	/**
	 * Convert HSL to RGB color space.
	 * @param {number} h  - Hue (0-360).
	 * @param {number} s  - Saturation (0-100).
	 * @param {number} l  - Lightness (0-100).
	 * @returns {Object}  RGB object with r, g, b values (0-255).
	 *
	 */
	hslToRGB(h, s, l) {
		// Convert HSL percentages to 0-1 range.
		s /= 100
		l /= 100

		const c = (1 - Math.abs(2 * l - 1)) * s
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
		const m = l - c / 2

		let r, g, b

		if (h >= 0 && h < 60) {
			;[r, g, b] = [c, x, 0]
		} else if (h >= 60 && h < 120) {
			;[r, g, b] = [x, c, 0]
		} else if (h >= 120 && h < 180) {
			;[r, g, b] = [0, c, x]
		} else if (h >= 180 && h < 240) {
			;[r, g, b] = [0, x, c]
		} else if (h >= 240 && h < 300) {
			;[r, g, b] = [x, 0, c]
		} else {
			;[r, g, b] = [c, 0, x]
		}

		return {
			r: Math.round((r + m) * 255),
			g: Math.round((g + m) * 255),
			b: Math.round((b + m) * 255),
		}
	}

	/**
	 * Convert HEX to RGB color space.
	 * @param {string} hex  - Hexadecimal color string.
	 * @returns {Object}    RGB object with r, g, b values (0-255).
	 *
	 */
	hexToRGB(hex) {
		// Remove # if present
		const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex

		// Parse hex values
		const r = parseInt(cleanHex.slice(0, 2), 16)
		const g = parseInt(cleanHex.slice(2, 4), 16)
		const b = parseInt(cleanHex.slice(4, 6), 16)

		return { r, g, b }
	}

	/**
	 * Convert HEX to OKLCH color space.
	 * @param {string} hex  - Hexadecimal color string.
	 * @returns {Object}    OKLCH object with l, c, h, a values.
	 *
	 */
	hexToOKLCH(hex) {
		const rgb = this.hexToRGB(hex)
		return this.rgbToOKLCH(rgb.r, rgb.g, rgb.b)
	}

	/**
	 * Convert HSL to OKLCH color space.
	 * @param {number} h  - Hue (0-360).
	 * @param {number} s  - Saturation (0-100).
	 * @param {number} l  - Lightness (0-100).
	 * @param {number} a  - Alpha (0-1).
	 * @returns {Object}  OKLCH object with l, c, h, a values.
	 *
	 */
	hslToOKLCH(h, s, l, a = 1) {
		const rgb = this.hslToRGB(h, s, l)
		return this.rgbToOKLCH(rgb.r, rgb.g, rgb.b, a)
	}

	/**
	 * Main conversion function: OKLCH to various color formats.
	 * @param {number} l  - Lightness (0-100).
	 * @param {number} c  - Chroma (0-0.4).
	 * @param {number} h  - Hue (0-360).
	 * @param {number} a  - Alpha (0-100).
	 * @returns {Object}  Color in multiple formats (hex, rgba, hsla).
	 *
	 */
	convertOKLCH(l, c, h, a = 100) {
		// Normalize alpha to 0-1.
		const alpha = a / 100

		// Step 1: Convert OKLCH to Oklab.
		const oklab = this.oklchToOklab(l, c, h)

		// Step 2: Convert Oklab to linear RGB.
		const linearRGB = this.oklabToLinearRGB(oklab.L, oklab.a, oklab.b)

		// Step 3: Convert linear RGB to standard RGB.
		const rgb = this.linearRGBToStandardRGB(linearRGB, alpha)

		// Step 4: Convert RGB to other formats.
		const hex = this.rgbToHex(rgb)
		const hsl = this.rgbToHSL(rgb)

		// Return all formats.
		return {
			hex: hex,
			rgba: {
				r: rgb.r,
				g: rgb.g,
				b: rgb.b,
				a: rgb.a,
			},
			hsla: {
				h: hsl.h,
				s: hsl.s,
				l: hsl.l,
				a: alpha,
			},
		}
	}
}
