/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Clipboard
 *
 * Handles copying color values to the clipboard and provides feedback.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

/**
 * Copies color values to the clipboard.
 */
export class Clipboard {
	/**
	 * @param {object} containers - An object of containers (hero, oklch, hex, rgba, hsla).
	 *
	 */
	constructor(containers) {
		this.containers = containers
		this.feedback = document.getElementById('copy-feedback')
		this.setupClipboardEvents()
		this.setupKeyboardEvents()
		this.setupTransitionListeners()
		this.isAnimating = false
		this.feedbackTimeout = null
	}

	// Container listeners.
	setupClipboardEvents() {
		Object.entries(this.containers).forEach(([key, container]) => {
			container.addEventListener('click', () => this.copyToClipboard(container))
		})
	}

	// Feedback + Animation listeners.
	setupTransitionListeners() {
		this.feedback.addEventListener('transitionend', (e) => {
			if (e.propertyName === 'transform' && this.feedback.dataset.state === 'slide-up') {
				this.feedback.dataset.state = 'fade-out'
			}

			if (e.propertyName === 'opacity' && this.feedback.dataset.state === 'fade-out') {
				this.feedback.dataset.state = 'hidden'
				this.isAnimating = false
			}
		})
	}

	// Hotkey listeners for getting color data from containers.
	setupKeyboardEvents() {
		document.addEventListener('keydown', (e) => {
			// Dont trigger when user is typing.
			if (document.activeElement.matches('input[type="text"]')) return

			const containerKeys = {
				1: this.containers.oklch,
				2: this.containers.hex,
				3: this.containers.rgba,
				4: this.containers.hsla,
			}

			if (containerKeys[e.key]) {
				const container = containerKeys[e.key]
				this.copyToClipboard(container)
			}
		})
	}

	// Format returns for the copyToClipboard() function.
	formatOklch = ({ l, c, h, a }) => `oklch(${l}% ${c} ${h}${a < 100 ? ` / ${a}%` : ''})`
	formatHex = ({ hex }) => hex
	formatRgba = ({ r, g, b, a = 1 }) => (a == 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`)
	formatHsla = ({ h, s, l, a = 1 }) => (a == 1 ? `hsl(${h}, ${s}%, ${l}%)` : `hsla(${h}, ${s}%, ${l}%, ${a})`)

	/**
	 * Copies the color value from the given container to the clipboard.
	 * @param {HTMLElement} container - The container element holding the color data.
	 *
	 */
	copyToClipboard(container) {
		if (this.isAnimating) {
			clearTimeout(this.feedbackTimeout)
			this.feedback.dataset.state = 'hidden'
			this.isAnimating = false
		}

		const colorType = container.dataset.colorType
		let textToCopy = ''

		switch (colorType) {
			case 'oklch':
				textToCopy = this.formatOklch(container.dataset)
				break
			case 'hex':
				textToCopy = this.formatHex(container.dataset)
				break
			case 'rgba':
				textToCopy = this.formatRgba(container.dataset)
				break
			case 'hsla':
				textToCopy = this.formatHsla(container.dataset)
				break
		}

		navigator.clipboard
			.writeText(textToCopy)
			.then(() => {
				this.showCopiedFeedback(textToCopy)
			})
			.catch((err) => {
				console.error(`Could not copy text: ${colorType}`)
			})
	}

	/**
	 * Shows feedback to the user after copying text to the clipboard.
	 * @param {string} copiedText - The text that was copied.
	 *
	 */
	showCopiedFeedback(copiedText) {
		this.isAnimating = true
		const feedback = this.feedback
		feedback.textContent = `Copied: ${copiedText}`
		feedback.dataset.state = 'visible'

		this.feedbackTimeout = setTimeout(() => {
			feedback.dataset.state = 'slide-up'
		}, 1000)
	}
}
