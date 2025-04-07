import { sellShop, upgradeShop } from "./main.js"

function getAllShops() {
	return [sellShop, upgradeShop]
}
// Abstract base Shop class
export abstract class AbstractShop {
	protected shopContainer?: HTMLDivElement
	protected contentContainer?: HTMLDivElement
	protected resourcesDisplay?: HTMLDivElement
	protected isShopOpen: boolean
	header!: HTMLDivElement
	title: string | undefined
	resourcesDisplayText: string

	constructor() {
		this.isShopOpen = false
		this.resourcesDisplayText = ""
	}

	// Helper function to create DOM elements with classes
	protected createElement<K extends keyof HTMLElementTagNameMap>(
		tag: K,
		className?: string,
		textContent?: string,
	): HTMLElementTagNameMap[K] {
		const element = document.createElement(tag)
		if (className) {
			element.className = className
		}
		if (textContent) {
			element.textContent = textContent
		}
		return element
	}

	// Apply styles to an HTML element
	protected applyStyles(
		element: HTMLElement,
		styles: { [key: string]: string },
	): void {
		Object.keys(styles).forEach(key => {
			element.style[key as any] = styles[key]
		})
	}

	// Open the shop
	openShop(): void {
		getAllShops().forEach(shop => shop.closeShop())
		this.isShopOpen = true
		console.log("Open2")
		if (this.shopContainer) {
			this.shopContainer.style.display = "flex"
			this.updateContent()
		} else {
			this.initializeDOM()
		}
	}

	// Close the shop
	closeShop(): void {
		this.isShopOpen = false
		if (this.shopContainer) {
			this.shopContainer.style.display = "none"
		}
	}

	// Check if shop is open
	isOpen(): boolean {
		return this.isShopOpen
	}

	// Toggle shop open/closed
	toggleShop(): void {
		if (this.isShopOpen) {
			this.closeShop()
		} else {
			this.openShop()
		}
	}

	// Initialize DOM elements - to be implemented by child classes
	protected initializeDOM(): void {
		// Create main container
		this.shopContainer = this.createElement("div", "shop-container")

		// Create header
		this.header = this.createElement("div", "shop-header")
		const title = this.createElement("h2", "shop-title", this.title)
		this.resourcesDisplay = this.createElement(
			"div",
			"resources-display",
			this.resourcesDisplayText,
		)

		const closeButton = this.createElement("button", "close-button", "✕")
		closeButton.addEventListener("click", () => this.closeShop())

		this.header.appendChild(title)
		this.header.appendChild(this.resourcesDisplay!)
		this.header.appendChild(closeButton)

		const contentWrapper = this.createElement("div", "content-wrapper")
		// Create content container
		this.contentContainer = this.createElement(
			"div",
			"content-container upgrades-content styledScroll",
		)

		// Assemble the shop container
		this.shopContainer.appendChild(this.header)

		this.shopContainer.appendChild(contentWrapper)
		contentWrapper.appendChild(this.contentContainer)

		// Add to document but keep hidden initially
		document.body.appendChild(this.shopContainer)
	}

	// Update content - to be implemented by child classes
	protected abstract updateContent(): void
}
