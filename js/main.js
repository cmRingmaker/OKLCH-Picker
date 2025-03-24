import { ColorSlideManager } from './color-sliders.js'
import { Clipboard } from './clipboard.js'
import { ColorConverter } from './color-conversions.js'
import { ColorInputConverter } from './color-input-converter.js'

const containers = {
	hero: document.getElementById('hero'), // Hero container will always be OKLCH
	oklch: document.getElementById('oklch-container'),
	hex: document.getElementById('hex-container'),
	rgba: document.getElementById('rgba-container'),
	hsla: document.getElementById('hsla-container'),
}

const textElements = {
	okh1: document.getElementById('okh1'),
	okh2: document.getElementById('okh2'),
	hexh2: document.getElementById('hexh2'),
	rgbah2: document.getElementById('rgbah2'),
	hslah2: document.getElementById('hslah2'),
}

document.addEventListener('DOMContentLoaded', () => {
	const colorConverter = new ColorConverter()
	const sliderManager = new ColorSlideManager(containers, textElements)
	new Clipboard(containers)
	new ColorInputConverter(colorConverter, sliderManager)
})
