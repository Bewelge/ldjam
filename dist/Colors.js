export const Colors = {
    themes: {
        Classic: {
            EMPTY: "#271302",
            GRASS: "#7B5E3B",
            DIRT: "#7B5E3B",
            STONE: "#a5a5a5",
            IRON: "#B8B8B8",
            COAL: "#3B3B3B",
            GOLD: "#FFD700",
            SILVER: "#C0C0C0",
            RUNE: "#6A4C93",
            MITHRIL: "#3CA3C4",
            SAPPHIRE: "#1E3A8A",
            EMERALD: "#2E8B57",
            RUBY: "#B22222",
            DIAMOND: "#7FDBFF",
        },
        Darkstone: {
            DIRT: "#5A3E2B",
            IRON: "#9A9A9A",
            COAL: "#2A2A2A",
            GOLD: "#E6C200",
            SILVER: "#AAAAAA",
            RUNE: "#532C8A",
            MITHRIL: "#2A9DB8",
            SAPPHIRE: "#153E75",
            EMERALD: "#1E6F4A",
            RUBY: "#8B1A1A",
            DIAMOND: "#5FCDE4",
        },
        "High-Fantasy": {
            DIRT: "#8C6239",
            IRON: "#D1CBC1",
            COAL: "#444444",
            GOLD: "#FFCC33",
            SILVER: "#D8D8D8",
            RUNE: "#7D55C7",
            MITHRIL: "#4DC0E8",
            SAPPHIRE: "#284B9B",
            EMERALD: "#3CB371",
            RUBY: "#C62828",
            DIAMOND: "#A1F4FF",
        },
    },
};
export function getColor(type) {
    return Colors.themes.Classic[type];
}
