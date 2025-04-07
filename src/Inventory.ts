import { upgradeManager, upgradeShop } from "./main.js"
import { TileType, TileTypes } from "./Tiles.js"
import { UpgradeList } from "./UpgradeList.js"

// Inventory class to track player resources
export class Inventory {
	private resources: Map<TileType, number>
	private capacity: number
	private currentSize: number

	constructor(initialCapacity: number = 20) {
		this.resources = new Map<TileType, number>()
		this.capacity = initialCapacity
		this.currentSize = 0

		// Initialize all resource types with 0 count
		Object.keys(TileTypes).forEach(type => {
			this.resources.set(type as TileType, 0)
		})
	}

	get getCapacity(): number {
		return this.capacity + UpgradeList.INVENTORY.getCurrentEffect
	}

	get getCurrentSize(): number {
		return this.currentSize
	}

	get getRemainingCapacity(): number {
		return this.getCapacity - this.currentSize
	}

	get isFull(): boolean {
		return this.currentSize >= this.getCapacity
	}

	// Add resources to inventory
	addResource(type: TileType, amount: number): number {
		// Calculate how much we can actually add
		const currentAmount = this.resources.get(type) || 0
		const actualAddAmount = Math.min(
			amount,
			this.getCapacity - this.currentSize,
		)

		// Update inventory
		this.resources.set(type, currentAmount + actualAddAmount)
		this.currentSize += actualAddAmount

		// Return how much was actually added
		return actualAddAmount
	}

	// Remove resources from inventory
	removeResource(type: TileType, amount: number): number {
		const currentAmount = this.resources.get(type) || 0
		const actualRemoveAmount = Math.min(amount, currentAmount)

		// Update inventory
		this.resources.set(type, currentAmount - actualRemoveAmount)
		this.currentSize -= actualRemoveAmount

		// Return how much was actually removed
		return actualRemoveAmount
	}

	// Get amount of a specific resource
	getResourceAmount(type: TileType): number {
		return this.resources.get(type) || 0
	}

	// Get all resources and their amounts
	getAllResources(): Map<TileType, number> {
		return new Map(this.resources)
	}

	// Check if we have at least this amount of resource
	hasResource(type: TileType, amount: number): boolean {
		return (this.resources.get(type) || 0) >= amount
	}

	// Clear all resources
	clear(): void {
		this.resources.forEach((_, key) => {
			this.resources.set(key, 0)
		})
		this.currentSize = 0
	}
}
