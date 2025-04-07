import { upgradeManager } from "./main.js";
import { UpgradeList } from "./UpgradeList.js";
// Upgrade types
export var UpgradeType;
(function (UpgradeType) {
    UpgradeType[UpgradeType["SPEED"] = 0] = "SPEED";
    UpgradeType[UpgradeType["FLY_SPEED"] = 1] = "FLY_SPEED";
    UpgradeType[UpgradeType["MINING_SPEED"] = 2] = "MINING_SPEED";
    UpgradeType[UpgradeType["MINING_DAMAGE"] = 3] = "MINING_DAMAGE";
    UpgradeType[UpgradeType["INVENTORY"] = 4] = "INVENTORY";
    UpgradeType[UpgradeType["WIN"] = 5] = "WIN";
})(UpgradeType || (UpgradeType = {}));
export class Upgrade {
    constructor(id, type, name, description, cost, costMultiplier, effect, effectMultiplier, maxLevel = 5, requirements = []) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.description = description;
        this.level = 0;
        this.maxLevel = maxLevel;
        this.cost = cost;
        this.costMultiplier = costMultiplier;
        this.effect = effect;
        this.effectMultiplier = effectMultiplier;
        this.unlocked = requirements.length === 0;
        this.requirements = requirements;
    }
    get getId() {
        return this.id;
    }
    get getType() {
        return this.type;
    }
    get getName() {
        return this.name;
    }
    get getDescription() {
        return this.description;
    }
    get getLevel() {
        return this.level;
    }
    get getMaxLevel() {
        return this.maxLevel;
    }
    get isMaxLevel() {
        return this.level >= this.maxLevel;
    }
    get isUnlocked() {
        return this.checkRequirements();
    }
    get getCurrentCost() {
        return Math.floor(this.cost * Math.pow(this.costMultiplier, this.level));
    }
    get getCurrentEffect() {
        return this.level == 0
            ? 0
            : this.effect *
                (this.effectMultiplier == 1
                    ? this.level
                    : Math.pow(this.effectMultiplier, this.level));
    }
    get getNextLevelEffect() {
        if (this.isMaxLevel) {
            return this.getCurrentEffect;
        }
        return this.effect * Math.pow(this.effectMultiplier, this.level + 1);
    }
    get getRequirements() {
        return this.requirements;
    }
    // Upgrade to the next level
    upgrade() {
        if (this.isMaxLevel || !this.unlocked) {
            return false;
        }
        this.level++;
        return true;
    }
    // Check if requirements are met
    checkRequirements() {
        if (this.unlocked) {
            return true;
        }
        // Check if all requirements are met
        const requirementsMet = this.requirements.every(requirement => {
            const requiredUpgrade = upgradeManager.getUpgradeById(requirement.upgradeId);
            return (requiredUpgrade && requiredUpgrade.getLevel >= requirement.requiredLevel);
        });
        if (requirementsMet) {
            this.unlocked = true;
        }
        return this.unlocked;
    }
    // Calculate effect description (for UI display)
    getEffectDescription() {
        let effectStr = "";
        switch (this.type) {
            case UpgradeType.SPEED:
                effectStr = `Movement speed +${this.getCurrentEffect.toFixed(1)}`;
                break;
            case UpgradeType.FLY_SPEED:
                effectStr = `Fly speed +${this.getCurrentEffect.toFixed(1)}`;
                break;
            case UpgradeType.MINING_DAMAGE:
                effectStr = `Mining strength +${this.getCurrentEffect.toFixed(1)}%`;
                break;
            case UpgradeType.MINING_SPEED:
                effectStr = `Mining speed +${this.getCurrentEffect.toFixed(1)}%`;
                break;
            case UpgradeType.INVENTORY:
                effectStr = `Inventory slots +${this.getCurrentEffect.toFixed(0)}`;
                break;
            default:
                effectStr = `Effect: +${this.getCurrentEffect.toFixed(1)}`;
        }
        return effectStr;
    }
    // Reset upgrade to level 0
    reset() {
        this.level = 0;
        this.unlocked = this.requirements.length === 0;
    }
}
// Upgrade Manager - manages all available upgrades
export class UpgradeManager {
    constructor() {
        this.upgrades = {};
        this.resources = 0;
        this.initDefaultUpgrades();
    }
    // Initialize with default upgrades
    initDefaultUpgrades() {
        Object.entries(UpgradeList).forEach(([key, upgrade]) => {
            this.registerUpgrade(upgrade);
        });
    }
    // Register a new upgrade
    registerUpgrade(upgrade) {
        this.upgrades[upgrade.getId] = upgrade;
    }
    // Get all upgrades
    getAllUpgrades() {
        return Object.values(this.upgrades);
    }
    // Get upgrade by ID
    getUpgradeById(id) {
        return this.upgrades[id];
    }
    // Get all upgrades of a specific type
    getUpgradesByType(type) {
        return this.getAllUpgrades().filter(upgrade => upgrade.getType === type);
    }
    // Get all unlocked upgrades
    getUnlockedUpgrades() {
        return this.getAllUpgrades().filter(upgrade => upgrade.isUnlocked);
    }
    // Get all available upgrades (unlocked and not max level)
    getAvailableUpgrades() {
        return this.getUnlockedUpgrades();
        // .filter(upgrade => !upgrade.isMaxLevel)
    }
    // Update upgrade requirements (call this each game tick)
    updateRequirements() {
        Object.values(this.upgrades).forEach(upgrade => {
            upgrade.checkRequirements();
        });
    }
    // Get current resources
    getResources() {
        return this.resources;
    }
    // Add resources
    addResources(amount) {
        this.resources += amount;
    }
    // Spend resources
    spendResources(amount) {
        if (this.resources >= amount) {
            this.resources -= amount;
            return true;
        }
        return false;
    }
    // Purchase an upgrade
    purchaseUpgrade(id) {
        const upgrade = this.getUpgradeById(id);
        if (!upgrade || !upgrade.isUnlocked || upgrade.isMaxLevel) {
            return false;
        }
        const cost = upgrade.getCurrentCost;
        if (this.spendResources(cost)) {
            return upgrade.upgrade();
        }
        return false;
    }
    // Reset all upgrades
    resetAllUpgrades() {
        Object.values(this.upgrades).forEach(upgrade => upgrade.reset());
        this.resources = 0;
    }
}
