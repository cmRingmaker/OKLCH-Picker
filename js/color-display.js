/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * ColorDisplayManager
 *
 * Manages color displays and updates color containers and text elements
 * based on color data. Uses ColorConverter for color space conversions.
 * Uses the containers and textElements defined in main.js.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

import { ColorConverter } from './color-conversions.js'

/**
 * Manages color displays and updates color containers and text elements.
 */
export class ColorDisplayManager {
	/**
	 * Constructs a ColorDisplayManager instance.
	 * @param {Object} containers   - Object containing references to color display containers from main.js.
	 * @param {Object} textElements - Object containing references to text elements from main.js.
	 *
	 */
	constructor(containers, textElements) {
		this.ColorConverter = new ColorConverter()
		this.containers = containers
		this.textElements = textElements
	}

	// Format returns for the generateColorString function.
	formatOklch = ({ l, c, h, a }) => `oklch(${l}% ${c} ${h}${a < 100 ? ` / ${a}%` : ''})`
	formatHex = ({ hex }) => hex
	formatRgba = ({ r, g, b, a = 1 }) => (a == 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`)
	formatHsla = ({ h, s, l, a = 1 }) => (a == 1 ? `hsl(${h}, ${s}%, ${l}%)` : `hsla(${h}, ${s}%, ${l}%, ${a})`)

	/**
	 * Generates a color string based on the color type and data.
	 * @param {string} colorType  - Type of color (oklch, hex, rgba, hsla).
	 * @param {Object} colorData  - Color data object.
	 * @returns {string}          - Generated color string.
	 *
	 */
	generateColorstring(colorType, colorData) {
		switch (colorType) {
			case 'oklch': {
				return this.formatOklch(colorData)
			}
			case 'hex': {
				return this.formatHex(colorData)
			}
			case 'rgba': {
				return this.formatRgba(colorData)
			}
			case 'hsla': {
				return this.formatHsla(colorData)
			}
			default:
				return ''
		}
	}

	/**
	 * Updates the text displays with the color values.
	 * @param {number} l            - Lightness value.
	 * @param {number} c            - Chroma value.
	 * @param {number} h            - Hue value.
	 * @param {number} a            - Alpha value.
	 * @param {Object} conversions  - Object containing color conversions (hex, rgba, hsla).
	 *
	 */
	updateTextDisplays(l, c, h, a, conversions) {
		this.textElements.okh1.innerText = this.generateColorstring('oklch', { l, c, h, a })
		this.textElements.okh2.innerText = this.generateColorstring('oklch', { l, c, h, a })
		this.textElements.hexh2.innerText = this.generateColorstring('hex', { hex: conversions.hex })
		this.textElements.rgbah2.innerText = this.generateColorstring('rgba', conversions.rgba)
		this.textElements.hslah2.innerText = this.generateColorstring('hsla', conversions.hsla)
	}

	/**
	 * Update color for a specific container.
	 * @param {string} colorType  - Type of color container (oklch, hex, rgba, hsla).
	 * @param {Object} colorData  - Color data to update.
	 *
	 */
	updateContainer(containerId, colorData) {
		const container = this.containers[containerId]

		// Update data attributes.
		Object.entries(colorData).forEach(([key, value]) => {
			container.dataset[key.toLowerCase()] = value
		})

		// Update color preview.
		const preview = container.querySelector('.color-preview')
		if (preview) {
			// Get type from data-color-type.
			const colorType = container.dataset.colorType
			const colorString = this.generateColorstring(colorType, colorData)

			preview.style.backgroundColor = colorString
		}
	}

	/**
	 * Updates all color containers and text displays with the given color values.
	 * @param {number} l - Lightness value.
	 * @param {number} c - Chroma value.
	 * @param {number} h - Hue value.
	 * @param {number} a - Alpha value (default 100).
	 *
	 */
	updateAllContainers(l, c, h, a = 100) {
		const conversions = this.ColorConverter.convertOKLCH(l, c, h, a)

		this.updateContainer('hero', { l, c, h, a })
		this.updateContainer('oklch', { l, c, h, a })
		this.updateContainer('hex', { hex: conversions.hex })
		this.updateContainer('rgba', conversions.rgba)
		this.updateContainer('hsla', conversions.hsla)

		this.updateTextDisplays(l, c, h, a, conversions)
	}
}
