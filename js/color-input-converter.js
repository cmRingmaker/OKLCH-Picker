/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Color Input Converter
 *
 * Handles parsing and conversion of color inputs from various formats
 * (HEX, RGB, HSL, OKLCH) to OKLCH, and updates the UI.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

/**
 * Parses user input to convert to various color formats, and updates the UI.
 */
export class ColorInputConverter {
	/**
	 * @param {ColorConverter} colorConverter - An instance of the ColorConverter class.
	 * @param {SliderManager} sliderManager   - An instance of the SliderManager class.
	 *
	 */
	constructor(colorConverter, sliderManager) {
		this.colorConverter = colorConverter
		this.sliderManager = sliderManager
		this.input = document.getElementById('color-input')
		this.button = document.querySelector('fieldset button')
		this.hotkeyFocus()

		this.initEventListeners()
	}

	// Button and Input listeners.
	initEventListeners() {
		this.button.addEventListener('click', () => this.handleConversion())
		this.input.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				this.handleConversion()
			}
		})
	}

	// Hotkey (c) listener to focus text input.
	hotkeyFocus() {
		document.addEventListener('keydown', (e) => {
			if (document.activeElement.matches('input[type="text"]')) return

			if (e.key === 'c') {
				if (document.activeElement !== this.input) {
					this.input.focus()
					e.preventDefault()
				}
			}
		})
	}

	// Handle text input conversion. (oklch, hex, rgba, hsla)
	handleConversion() {
		const inputValue = this.input.value.trim()
		if (!inputValue) return
		const colorValues = this.parseColorInput(inputValue)

		if (colorValues) {
			this.updateColorValues(colorValues)
			this.input.value = ''
		} else {
			console.error('Invalid color format')
		}
	}

	/**
	 * Parses the color input and determines the color format.
	 * @param {string} input  - The color input string.
	 * @returns {object|null} - The parsed color values or null if invalid.
	 *
	 */
	parseColorInput(input) {
		if (input.startsWith('#') || /^[0-9A-Fa-f]{6}$/.test(input)) {
			return this.parseHexColor(input)
		}

		if (input.startsWith('rgb')) {
			return this.parseRgbColor(input)
		}

		if (input.startsWith('hsl')) {
			return this.parseHslColor(input)
		}

		if (input.startsWith('oklch')) {
			return this.parseOklchColor(input)
		}
		return null
	}

	/**
	 * Parses a HEX color input.
	 * @param {string} input  - The HEX color input string.
	 * @returns {object|null} - The parsed OKLCH values or null if invalid.
	 *
	 */
	parseHexColor(input) {
		const hex = input.startsWith('#') ? input : `#${input}`
		if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return null
		return this.colorConverter.hexToOKLCH(hex)
	}

	/**
	 * Parses an RGBA color input.
	 * @param {string} input  - The RGB color input string.
	 * @returns {object|null} - The parsed OKLCH values or null if invalid.
	 *
	 */
	parseRgbColor(input) {
		const rgbMatch = input.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/)
		if (!rgbMatch) return null
		const r = parseInt(rgbMatch[1])
		const g = parseInt(rgbMatch[2])
		const b = parseInt(rgbMatch[3])
		const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
		return this.colorConverter.rgbToOKLCH(r, g, b, a)
	}

	/**
	 * Parses an HSL color input.
	 * @param {string} input  - The HSL color input string.
	 * @returns {object|null} - The parsed OKLCH values or null if invalid.
	 *
	 */
	parseHslColor(input) {
		const hslMatch = input.match(
			/hsla?\(\s*([\d.]+)\s*[,\s]\s*(\d+)%?\s*[,\s]\s*(\d+)%?(?:\s*[,\/]\s*([\d.]+)%?)?\s*\)/
		)
		if (!hslMatch) return null
		const h = parseInt(hslMatch[1])
		const s = parseInt(hslMatch[2])
		const l = parseInt(hslMatch[3])
		const a = hslMatch[4] ? parseFloat(hslMatch[4]) : 1
		return this.colorConverter.hslToOKLCH(h, s, l, a)
	}

	/**
	 * Parses an OKLCH color input.
	 * @param {string} input  - The OKLCH color input string.
	 * @returns {object|null} - The parsed OKLCH values or null if invalid.
	 *
	 */
	parseOklchColor(input) {
		const oklchMatch = input.match(/oklch\(\s*(\d*\.?\d+)%\s*(\d*\.?\d+)\s*(\d*\.?\d+)(?:\s*\/\s*(\d*\.?\d+%?))?\s*\)/)
		if (!oklchMatch) return null

		let alpha = 100
		if (oklchMatch[4]) {
			alpha = oklchMatch[4].endsWith('%') ? parseFloat(oklchMatch[4]) : parseFloat(oklchMatch[4]) * 100
		}

		return {
			l: parseFloat(oklchMatch[1]),
			c: parseFloat(oklchMatch[2]),
			h: parseFloat(oklchMatch[3]),
			a: alpha,
		}
	}

	/**
	 * Updates the UI with the parsed OKLCH color values.
	 * @param {object} oklch - The OKLCH color values.
	 *
	 */
	updateColorValues(oklch) {
		this.sliderManager.sliderConfig.l.slider.value = oklch.l
		this.sliderManager.sliderConfig.c.slider.value = oklch.c
		this.sliderManager.sliderConfig.h.slider.value = oklch.h
		this.sliderManager.sliderConfig.a.slider.value = oklch.a
		this.sliderManager.updateColor()
	}
}
