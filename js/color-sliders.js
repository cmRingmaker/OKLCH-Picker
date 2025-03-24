import { ColorDisplayManager } from './color-display.js'

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * ColorSlideManager
 *
 * Manages color sliders and updates color displays based on slider values.
 * Uses ColorDisplayManager to update color containers and text elements.
 * Uses the containers and textElements defined in main.js.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

const SLIDER_CONFIG = {
	// Lightness
	l: {
		min: 0,
		max: 100,
		steps: 11,
		slider: document.getElementById('l-slider'),
		label: document.getElementById('l-value'),
		format: (val) => val.toFixed(2) + '%',
		gradient: (val, c, h) => `oklch(${val}% ${c} ${h})`,
	},
	// Chroma
	c: {
		min: 0,
		max: 0.4,
		steps: 11,
		slider: document.getElementById('c-slider'),
		label: document.getElementById('c-value'),
		format: (val) => val.toFixed(2),
		gradient: (val, l, h) => `oklch(${l}% ${val} ${h})`,
	},
	// Hue
	h: {
		min: 0,
		max: 360,
		steps: 12, // 12 Steps around the color wheel
		slider: document.getElementById('h-slider'),
		label: document.getElementById('h-value'),
		format: (val) => val + '°',
		gradient: (val, l, c) => `oklch(${l}% ${c} ${val})`,
	},
	// Alpha
	a: {
		min: 0,
		max: 100,
		steps: 11,
		slider: document.getElementById('a-slider'),
		label: document.getElementById('a-value'),
		format: (val) => val.toFixed(0) + '%',
		gradient: (val, l, c, h) => `oklch(${l}% ${c} ${h} / ${val}%)`,
	},
}

/**
 * Manages color sliders and updates color displays.
 */
export class ColorSlideManager {
	/**
	 * Constructs a ColorSlideManager instance.
	 * @param {Object} containers   - Object containing references to color display containers from main.js.
	 * @param {Object} textElements - Object containing references to text elements from main.js.
	 */
	constructor(containers, textElements) {
		this.displayManager = new ColorDisplayManager(containers, textElements)
		this.sliderConfig = SLIDER_CONFIG
		this.initializeSliders()
	}

	// Slider listeners.
	initializeSliders() {
		Object.values(this.sliderConfig).forEach(({ slider }) => {
			slider.addEventListener('input', () => this.updateColor())
		})
		this.updateColor()
	}

	/**
	 * Retrieves the current values from the color sliders.
	 * @returns {Object} - Object containing the slider values (l, c, h, a).
	 */
	getSliderValues() {
		return {
			l: parseFloat(this.sliderConfig.l.slider.value),
			c: parseFloat(this.sliderConfig.c.slider.value),
			h: parseFloat(this.sliderConfig.h.slider.value),
			a: parseFloat(this.sliderConfig.a.slider.value),
		}
	}

	// Update color display based on slider values.
	updateColor() {
		const values = this.getSliderValues()

		this.updateLabels(values)
		this.updateGradients(values)
		this.displayManager.updateAllContainers(values.l, values.c, values.h, values.a)
	}

	// Update labels based on slider values.
	updateLabels(values) {
		Object.keys(values).forEach((key) => {
			this.sliderConfig[key].label.textContent = this.sliderConfig[key].format(values[key])
		})
	}

	/**
	 * Updates the gradient background of a specific slider.
	 * @param {string} sliderKey  - Key of the slider configuration (l, c, h, a).
	 * @param {number} l          - Lightness value.
	 * @param {number} c          - Chroma value.
	 * @param {number} h          - Hue value.
	 * @param {number} _a         - Alpha value (unused, but kept for consistency).
	 *
	 */
	updateSliderGradient(sliderKey, l, c, h, _a) {
		const config = this.sliderConfig[sliderKey]

		const gradient = []
		for (let i = 0; i < config.steps; i++) {
			const value = config.min + (config.max - config.min) * (i / (config.steps - 1))

			let colorValue
			switch (sliderKey) {
				case 'l':
					colorValue = config.gradient(value, c, h)
					break
				case 'c':
					colorValue = config.gradient(value, l, h)
					break
				case 'h':
					colorValue = config.gradient(value, l, c)
					break
				case 'a':
					colorValue = config.gradient(value, l, c, h)
					break
			}

			gradient.push(colorValue)
		}

		config.slider.style.background = `linear-gradient(to right, ${gradient.join(', ')})`
	}

	// Update gradients based on slider values.
	updateGradients(values) {
		const { l, c, h, a } = values

		this.updateSliderGradient('l', l, c, h, a)
		this.updateSliderGradient('c', l, c, h, a)
		this.updateSliderGradient('h', l, c, h, a)
		this.updateSliderGradient('a', l, c, h, a)
	}
}
