import { upgradeManager } from "./main.js";
import { AbstractShop } from "./Shop.js";
// UpgradeShop class for purchasing upgrades
export class UpgradeShop extends AbstractShop {
    constructor() {
        super();
        this.selectedUpgrade = null;
        this.title = "Mining Shop - Upgrades";
        this.resourcesDisplayText = `Resources: ${upgradeManager.getResources()}`;
    }
    // Set the selected upgrade
    selectUpgrade(id) {
        this.selectedUpgrade = id;
    }
    // Get the selected upgrade
    getSelectedUpgrade() {
        return this.selectedUpgrade;
    }
    // Buy an upgrade
    buyUpgrade(id) {
        return upgradeManager.purchaseUpgrade(id);
    }
    // Initialize DOM elements for the shop UI
    initializeDOM() {
        super.initializeDOM();
        this.updateContent();
    }
    // Update the shop content
    updateContent() {
        const contentContainer = this.shopContainer.querySelector(".content-container");
        const upgradesContent = contentContainer;
        upgradesContent.innerHTML = "";
        // Get available upgrades
        const availableUpgrades = upgradeManager.getAvailableUpgrades();
        if (availableUpgrades.length === 0) {
            // No upgrades available
            const emptyMessage = this.createElement("div", "empty-message", "No upgrades available");
            upgradesContent.appendChild(emptyMessage);
            return;
        }
        // Create upgrades list
        const upgradesList = this.createElement("div", "upgrades-list");
        // Populate with upgrades
        availableUpgrades.forEach(upgrade => {
            const isSelected = this.selectedUpgrade === upgrade.getId;
            const canAfford = upgradeManager.getResources() >= upgrade.getCurrentCost;
            const upgradeItem = this.createElement("div", isSelected ? "upgrade-item upgrade-item-selected" : "upgrade-item");
            upgradeItem.addEventListener("click", () => {
                this.selectedUpgrade = upgrade.getId;
                this.updateContent();
            });
            // Header row
            const header = this.createElement("div", "upgrade-header");
            const nameElement = this.createElement("div", "upgrade-name", upgrade.getName);
            const levelElement = this.createElement("div", "upgrade-level", `Level ${upgrade.getLevel}/${upgrade.getMaxLevel}`);
            header.appendChild(nameElement);
            header.appendChild(levelElement);
            // Description and effect
            const descriptionElement = this.createElement("div", "upgrade-description", upgrade.getDescription);
            const effectElement = this.createElement("div", "upgrade-effect", upgrade.getEffectDescription());
            // Footer with cost and purchase button
            const footer = this.createElement("div", "upgrade-footer");
            const costElement = this.createElement("div", canAfford ? "upgrade-cost" : "upgrade-cost upgrade-cost-unaffordable", upgrade.isMaxLevel ? "MAX LEVEL" : `Cost: ${upgrade.getCurrentCost}`);
            // Purchase button (only if we can afford it)
            if (canAfford && !upgrade.isMaxLevel) {
                const purchaseButton = this.createElement("button", "purchase-button", "Purchase");
                purchaseButton.addEventListener("click", e => {
                    e.stopPropagation(); // Prevent triggering the parent's click
                    if (this.buyUpgrade(upgrade.getId)) {
                        // Update display if purchase was successful
                        this.resourcesDisplay.textContent = `Resources: ${upgradeManager.getResources()}`;
                        this.updateContent();
                    }
                });
                footer.appendChild(costElement);
                footer.appendChild(purchaseButton);
            }
            else {
                footer.appendChild(costElement);
            }
            // Assemble the upgrade item
            upgradeItem.appendChild(header);
            upgradeItem.appendChild(descriptionElement);
            upgradeItem.appendChild(effectElement);
            upgradeItem.appendChild(footer);
            upgradesList.appendChild(upgradeItem);
        });
        upgradesContent.appendChild(upgradesList);
        // Update resources display
        this.resourcesDisplay.textContent = `Resources: ${upgradeManager.getResources()}`;
    }
}
