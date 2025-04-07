import { Inventory } from "./Inventory.js"
import { upgradeManager, inventory } from "./main.js"
import { AbstractShop } from "./Shop.js"
import { Tile, TileType, TileTypes } from "./Tiles.js"

// SellShop class for selling resources
export class SellShop extends AbstractShop {
	private selectedResource: TileType | null

	constructor() {
		super()
		this.selectedResource = null

		this.title = "Mining Shop - Sell Ores"
		this.resourcesDisplayText = `Resources: ${upgradeManager.getResources()}`
	}

	// Set the selected resource
	selectResource(type: TileType): void {
		this.selectedResource = type
	}

	// Get the selected resource
	getSelectedResource(): TileType | null {
		return this.selectedResource
	}

	// Sell a specific resource
	sellResource(inventory: Inventory, type: TileType, amount: number): number {
		// Get current amount in inventory
		const availableAmount = inventory.getResourceAmount(type)
		const actualAmount = Math.min(amount, availableAmount)
		console.log(availableAmount, actualAmount)
		if (actualAmount <= 0) {
			return 0
		}

		// Calculate value
		const value = (TileTypes[type].baseValue || 0) * actualAmount

		// Remove from inventory
		inventory.removeResource(type, actualAmount)

		// Add resources to the upgrade manager
		upgradeManager.addResources(value)

		return value
	}

	// Sell all resources of a specific type
	sellAllOfType(type: TileType): number {
		const amount = inventory.getResourceAmount(type)

		return this.sellResource(inventory, type, amount)
	}

	// Sell all resources in inventory
	sellAll(): number {
		let totalValue = 0
		console.log("sellall")
		// Get all resource types
		Object.keys(TileTypes).forEach(type => {
			totalValue += this.sellAllOfType(type as TileType)
		})

		return totalValue
	}

	// Initialize DOM elements for the shop UI
	protected initializeDOM(): void {
		super.initializeDOM()

		this.updateContent()
	}

	// Update the shop content
	protected updateContent(): void {
		const contentContainer = this.contentContainer!
		this.contentContainer!.innerHTML = ""
		if (!inventory) {
			return
		}
		const sellContent = contentContainer
		sellContent.id = "24523"
		sellContent.innerHTML = ""

		// Create resource grid
		const resourceGrid = this.createElement("div", "resource-grid")

		// Populate with resources
		let totalValue = 0

		Object.keys(TileTypes).forEach(type => {
			const { color, name, baseValue = 0 } = TileTypes[type as TileType]
			const amount = inventory.getResourceAmount(type as TileType)

			const total = amount * baseValue

			totalValue += total

			// Only show resources that we have
			if (amount > 0) {
				const isSelected = this.selectedResource === type
				const resourceItem = this.createElement(
					"div",
					isSelected ? "resource-item resource-item-selected" : "resource-item",
				)

				resourceItem.addEventListener("click", () => {
					this.selectedResource = type as TileType
					this.updateContent()
				})

				// Color indicator
				const colorBox = this.createElement("div", "resource-color-box")
				colorBox.style.backgroundColor = color // Color needs to be dynamic

				// Resource info
				const infoDiv = this.createElement("div", "resource-info")
				const nameElement = this.createElement("div", "resource-name", name)
				const amountElement = this.createElement(
					"div",
					"resource-amount",
					`Amount: ${amount}`,
				)

				infoDiv.appendChild(nameElement)
				infoDiv.appendChild(amountElement)

				// Value info
				const valueDiv = this.createElement("div", "resource-value-container")
				const valueElement = this.createElement(
					"div",
					"resource-value",
					`Value: ${baseValue}`,
				)
				const totalElement = this.createElement(
					"div",
					"resource-total",
					`Total: ${total}`,
				)

				valueDiv.appendChild(valueElement)
				valueDiv.appendChild(totalElement)

				resourceItem.appendChild(colorBox)
				resourceItem.appendChild(infoDiv)
				resourceItem.appendChild(valueDiv)

				resourceGrid.appendChild(resourceItem)
			}
		})

		// Add buttons container
		const buttonsContainer = this.createElement("div", "buttons-container")

		// Sell selected button
		if (this.selectedResource !== null) {
			const amount = inventory.getResourceAmount(this.selectedResource)

			if (amount > 0) {
				const sellSelectedButton = this.createElement(
					"button",
					"sell-button sell-selected",
					`Sell ${amount} Selected`,
				)

				sellSelectedButton.addEventListener("click", () => {
					if (this.selectedResource !== null) {
						this.sellAllOfType(this.selectedResource)
						this.selectedResource = null
						this.updateContent()
					}
				})

				buttonsContainer.appendChild(sellSelectedButton)
			}
		}

		// Sell all button (only if we have resources)
		if (totalValue > 0) {
			const sellAllButton = this.createElement(
				"button",
				"sell-button sell-all",
				`Sell All (${totalValue})`,
			)

			sellAllButton.addEventListener("click", () => {
				this.sellAll()
				this.selectedResource = null
				this.updateContent()
			})

			buttonsContainer.appendChild(sellAllButton)
		}

		// Empty state message
		if (totalValue === 0) {
			const emptyMessage = this.createElement(
				"div",
				"empty-message",
				"Your inventory is empty. Go mining to find resources!",
			)
			resourceGrid.appendChild(emptyMessage)
		}

		sellContent.appendChild(resourceGrid)
		sellContent.appendChild(buttonsContainer)

		// Update resources display
		this.resourcesDisplay!.textContent = `Resources: ${upgradeManager.getResources()}`
	}
}
