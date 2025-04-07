import { Upgrade, UpgradeType } from "./Upgrades.js";
export const UpgradeList = {
    SPEED: new Upgrade("SPEED", UpgradeType.SPEED, "Basic Speed", "Increases player movement speed.", 25, 8, 2, 2, 5, []),
    FLY_SPEED: new Upgrade("FLY_SPEED", UpgradeType.FLY_SPEED, "Flight Speed", "Increases flight speed.", 25, 10, 1, 2.5, 5, []),
    MINING_DAMAGE: new Upgrade("MINING_DAMAGE", UpgradeType.MINING_DAMAGE, "Basic Mining", "Increases mining strength.", 25, 1.5, 10, 1.5, 20, []),
    MINING_SPEED: new Upgrade("MINING_SPEED", UpgradeType.MINING_SPEED, "Advanced Mining", "Increases mining speed.", 400, 15, 5, 1, 3, [{ upgradeId: "MINING_DAMAGE", requiredLevel: 3 }]),
    INVENTORY: new Upgrade("INVENTORY", UpgradeType.INVENTORY, "Inventory Expansion", "Increases inventory capacity.", 10, 5, 4, 4, 7, []),
    WIN: new Upgrade("WIN", UpgradeType.WIN, "Win the Game", "", 1e6, 5, 4, 1.0, 1, [
        { upgradeId: "INVENTORY", requiredLevel: 7 },
        { upgradeId: "MINING_SPEED", requiredLevel: 3 },
        { upgradeId: "MINING_DAMAGE", requiredLevel: 20 },
        { upgradeId: "FLY_SPEED", requiredLevel: 5 },
        { upgradeId: "SPEED", requiredLevel: 5 },
    ]),
};
