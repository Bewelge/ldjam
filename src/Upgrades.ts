import { upgradeManager } from "./main.js"
import { Player } from "./Player.js"
import { UpgradeList } from "./UpgradeList.js"

// Upgrade types
export enum UpgradeType {
	SPEED,
	FLY_SPEED,
	MINING_SPEED,
	MINING_DAMAGE,
	INVENTORY,
	WIN,
}
export class Upgrade {
	id: string
	type: UpgradeType
	level: number
	maxLevel: number
	name: string
	description: string
	cost: number
	costMultiplier: number
	effect: number
	effectMultiplier: number
	unlocked: boolean
	requirements: UpgradeRequirement[]

	constructor(
		id: string,
		type: UpgradeType,
		name: string,
		description: string,
		cost: number,
		costMultiplier: number,
		effect: number,
		effectMultiplier: number,
		maxLevel: number = 5,
		requirements: UpgradeRequirement[] = [],
	) {
		this.id = id
		this.type = type
		this.name = name
		this.description = description
		this.level = 0
		this.maxLevel = maxLevel
		this.cost = cost
		this.costMultiplier = costMultiplier
		this.effect = effect
		this.effectMultiplier = effectMultiplier
		this.unlocked = requirements.length === 0
		this.requirements = requirements
	}

	get getId(): string {
		return this.id
	}

	get getType(): UpgradeType {
		return this.type
	}

	get getName(): string {
		return this.name
	}

	get getDescription(): string {
		return this.description
	}

	get getLevel(): number {
		return this.level
	}

	get getMaxLevel(): number {
		return this.maxLevel
	}

	get isMaxLevel(): boolean {
		return this.level >= this.maxLevel
	}

	get isUnlocked(): boolean {
		return this.checkRequirements()
	}

	get getCurrentCost(): number {
		return Math.floor(this.cost * Math.pow(this.costMultiplier, this.level))
	}

	get getCurrentEffect(): number {
		return this.level == 0
			? 0
			: this.effect *
					(this.effectMultiplier == 1
						? this.level
						: Math.pow(this.effectMultiplier, this.level))
	}

	get getNextLevelEffect(): number {
		if (this.isMaxLevel) {
			return this.getCurrentEffect
		}
		return this.effect * Math.pow(this.effectMultiplier, this.level + 1)
	}

	get getRequirements(): UpgradeRequirement[] {
		return this.requirements
	}

	// Upgrade to the next level
	upgrade(): boolean {
		if (this.isMaxLevel || !this.unlocked) {
			return false
		}

		this.level++
		return true
	}

	// Check if requirements are met
	checkRequirements(): boolean {
		if (this.unlocked) {
			return true
		}

		// Check if all requirements are met
		const requirementsMet = this.requirements.every(requirement => {
			const requiredUpgrade = upgradeManager.getUpgradeById(
				requirement.upgradeId,
			)
			return (
				requiredUpgrade && requiredUpgrade.getLevel >= requirement.requiredLevel
			)
		})

		if (requirementsMet) {
			this.unlocked = true
		}

		return this.unlocked
	}

	// Calculate effect description (for UI display)
	getEffectDescription(): string {
		let effectStr = ""

		switch (this.type) {
			case UpgradeType.SPEED:
				effectStr = `Movement speed +${this.getCurrentEffect.toFixed(1)}`
				break
			case UpgradeType.FLY_SPEED:
				effectStr = `Fly speed +${this.getCurrentEffect.toFixed(1)}`
				break
			case UpgradeType.MINING_DAMAGE:
				effectStr = `Mining strength +${this.getCurrentEffect.toFixed(1)}%`
				break
			case UpgradeType.MINING_SPEED:
				effectStr = `Mining speed +${this.getCurrentEffect.toFixed(1)}%`
				break

			case UpgradeType.INVENTORY:
				effectStr = `Inventory slots +${this.getCurrentEffect.toFixed(0)}`
				break
			default:
				effectStr = `Effect: +${this.getCurrentEffect.toFixed(1)}`
		}

		return effectStr
	}

	// Reset upgrade to level 0
	reset(): void {
		this.level = 0
		this.unlocked = this.requirements.length === 0
	}
}
// Upgrade class - represents player upgrades

// Upgrade requirement - used to define prerequisites for unlocking upgrades
interface UpgradeRequirement {
	upgradeId: string
	requiredLevel: number
}

// Upgrade Manager - manages all available upgrades
export class UpgradeManager {
	private upgrades: Record<string, Upgrade>
	private resources: number

	constructor() {
		this.upgrades = {}
		this.resources = 0
		this.initDefaultUpgrades()
	}

	// Initialize with default upgrades
	initDefaultUpgrades(): void {
		Object.entries(UpgradeList).forEach(([key, upgrade]) => {
			this.registerUpgrade(upgrade)
		})
	}

	// Register a new upgrade
	registerUpgrade(upgrade: Upgrade): void {
		this.upgrades[upgrade.getId] = upgrade
	}

	// Get all upgrades
	getAllUpgrades(): Upgrade[] {
		return Object.values(this.upgrades)
	}

	// Get upgrade by ID
	getUpgradeById(id: string): Upgrade | undefined {
		return this.upgrades[id]
	}

	// Get all upgrades of a specific type
	getUpgradesByType(type: UpgradeType): Upgrade[] {
		return this.getAllUpgrades().filter(upgrade => upgrade.getType === type)
	}

	// Get all unlocked upgrades
	getUnlockedUpgrades(): Upgrade[] {
		return this.getAllUpgrades().filter(upgrade => upgrade.isUnlocked)
	}

	// Get all available upgrades (unlocked and not max level)
	getAvailableUpgrades(): Upgrade[] {
		return this.getUnlockedUpgrades()
		// .filter(upgrade => !upgrade.isMaxLevel)
	}

	// Update upgrade requirements (call this each game tick)
	updateRequirements(): void {
		Object.values(this.upgrades).forEach(upgrade => {
			upgrade.checkRequirements()
		})
	}

	// Get current resources
	getResources(): number {
		return this.resources
	}

	// Add resources
	addResources(amount: number): void {
		this.resources += amount
	}

	// Spend resources
	spendResources(amount: number): boolean {
		if (this.resources >= amount) {
			this.resources -= amount
			return true
		}
		return false
	}

	// Purchase an upgrade
	purchaseUpgrade(id: string): boolean {
		const upgrade = this.getUpgradeById(id)

		if (!upgrade || !upgrade.isUnlocked || upgrade.isMaxLevel) {
			return false
		}

		const cost = upgrade.getCurrentCost

		if (this.spendResources(cost)) {
			return upgrade.upgrade()
		}

		return false
	}

	// Reset all upgrades
	resetAllUpgrades(): void {
		Object.values(this.upgrades).forEach(upgrade => upgrade.reset())
		this.resources = 0
	}
}
