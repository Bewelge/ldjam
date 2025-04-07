import { sellShop, upgradeShop } from "./main.js";
function getAllShops() {
    return [sellShop, upgradeShop];
}
// Abstract base Shop class
export class AbstractShop {
    constructor() {
        this.isShopOpen = false;
        this.resourcesDisplayText = "";
    }
    // Helper function to create DOM elements with classes
    createElement(tag, className, textContent) {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        if (textContent) {
            element.textContent = textContent;
        }
        return element;
    }
    // Apply styles to an HTML element
    applyStyles(element, styles) {
        Object.keys(styles).forEach(key => {
            element.style[key] = styles[key];
        });
    }
    // Open the shop
    openShop() {
        getAllShops().forEach(shop => shop.closeShop());
        this.isShopOpen = true;
        console.log("Open2");
        if (this.shopContainer) {
            this.shopContainer.style.display = "flex";
            this.updateContent();
        }
        else {
            this.initializeDOM();
        }
    }
    // Close the shop
    closeShop() {
        this.isShopOpen = false;
        if (this.shopContainer) {
            this.shopContainer.style.display = "none";
        }
    }
    // Check if shop is open
    isOpen() {
        return this.isShopOpen;
    }
    // Toggle shop open/closed
    toggleShop() {
        if (this.isShopOpen) {
            this.closeShop();
        }
        else {
            this.openShop();
        }
    }
    // Initialize DOM elements - to be implemented by child classes
    initializeDOM() {
        // Create main container
        this.shopContainer = this.createElement("div", "shop-container");
        // Create header
        this.header = this.createElement("div", "shop-header");
        const title = this.createElement("h2", "shop-title", this.title);
        this.resourcesDisplay = this.createElement("div", "resources-display", this.resourcesDisplayText);
        const closeButton = this.createElement("button", "close-button", "✕");
        closeButton.addEventListener("click", () => this.closeShop());
        this.header.appendChild(title);
        this.header.appendChild(this.resourcesDisplay);
        this.header.appendChild(closeButton);
        const contentWrapper = this.createElement("div", "content-wrapper");
        // Create content container
        this.contentContainer = this.createElement("div", "content-container upgrades-content styledScroll");
        // Assemble the shop container
        this.shopContainer.appendChild(this.header);
        this.shopContainer.appendChild(contentWrapper);
        contentWrapper.appendChild(this.contentContainer);
        // Add to document but keep hidden initially
        document.body.appendChild(this.shopContainer);
    }
}
