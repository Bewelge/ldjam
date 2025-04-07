import { Colors, getColor } from "./Colors.js"
import { Ease } from "./easing.js"
import {
	CANVAS_WIDTH,
	GRID_WIDTH,
	inventory,
	noiseOffset,
	player,
	PLAYER_SIZE,
	TILE_SIZE,
} from "./main.js"
import { addOreGain } from "./OreGainSys.js"
import { getBrokenTexture0, getBrokenTexture1, getTexture } from "./Textures.js"
import { ns, PI2, rndFloat, transformWorldToRenderP, Vec2 } from "./util.js"

interface TileTypeInfo {
	hp: number
	name: string
	color: string
	baseValue?: number
	range?: { min: number; max: number }
	type?: "ore"
	test?: (p: Vec2, rangeRat: number) => boolean
	isBreakable: () => boolean
	resource?: TileType
	resourceAmount?: () => number
}
export type TileType =
	| "EMPTY"
	| "GRASS"
	| "DIRT"
	| "STONE"
	| "IRON"
	| "COAL"
	| "RUNE"
	| "EMERALD"
	| "RUBY"
	| "SAPPHIRE"
	| "DIAMOND"
	| "BEDROCK"
// TileType enum to define different types of tiles
export const TileTypes = {
	EMPTY: {
		hp: 0,
		name: "Empty",
		color: "rgba(0,250,0,1)",
		isBreakable: () => true,
	},

	GRASS: {
		hp: 3,
		name: "Grass",
		color: "brown",
		isBreakable: () => true,
	},
	DIRT: {
		hp: 3,
		name: "Dirt",
		color: "brown",
		resource: "DIRT",
		resourceAmount: () => 1,
		baseValue: 1,
		isBreakable: () => true,
	},

	BEDROCK: {
		hp: 1,
		name: "Bedrock",
		color: "darkgray",

		isBreakable: () => false,
	},
	STONE: {
		hp: 10,
		name: "Stone",
		color: "rgba(150,150,150,1)",
		type: "ore",
		resource: "STONE",
		resourceAmount: () => 1 + Math.floor(7 * rndFloat()),
		baseValue: 3,
		isBreakable: () => true,
		test: (p: Vec2, rangeRat: number) => {
			let ns0 = (ns(p, noiseOffset.copy().multiply(13.23), 1.15) + 1) / 2
			let ns1 = (ns(p, noiseOffset.copy().multiply(7.93), 0.19) + 1) / 2

			return (
				Math.abs(ns0 * ns1) <
				0.15 * (0.2 + 0.8 * Ease.easeOutQuad(1 - (1 - rangeRat - 0.5) / 0.5))
			)
		},
		range: { min: 1, max: 1000 },
	},
	IRON: {
		hp: 25,
		name: "Iron",
		color: "red",
		type: "ore",
		resource: "IRON",
		resourceAmount: () => 3 + Math.floor(4 * rndFloat()),
		baseValue: 15,
		isBreakable: () => true,
		test: (p: Vec2, rangeRat: number) => {
			let ns0 = (ns(p, noiseOffset.copy().multiply(5.23), 1.15) + 1) / 2
			let ns1 = (ns(p, noiseOffset.copy().multiply(15.23), 0.19) + 1) / 2

			return (
				Math.abs(ns0 * ns1) <
				0.05 * (0.2 + 0.8 * Ease.easeOutQuad(1 - (rangeRat - 0.5) / 0.5))
			)
		},
		range: { min: 5, max: 150 },
	},
	COAL: {
		hp: 150,
		name: "Coal",
		color: "black",
		type: "ore",
		resource: "COAL",
		resourceAmount: () => 3 + Math.floor(4 * rndFloat()),
		baseValue: 40,
		isBreakable: () => true,
		test: (p: Vec2, rangeRat: number) => {
			let ns0 = (ns(p, noiseOffset.copy().multiply(1255.23), 1.15) + 1) / 2
			let ns1 = (ns(p, noiseOffset.copy().multiply(1.623), 0.09) + 1) / 2

			return (
				Math.abs(ns0 * ns1) <
				0.05 * (0.2 + 0.8 * Ease.easeOutQuad(1 - (rangeRat - 0.5) / 0.5))
			)
		},
		range: { min: 25, max: 850 },
	},
	MITHRIL: {
		hp: 2500,
		name: "Mithril",
		color: "rgba(190,20,190,1)",
		type: "ore",
		resource: "MITHRIL",
		resourceAmount: () => 3 + Math.floor(4 * rndFloat()),
		baseValue: 150,
		isBreakable: () => true,
		test: (p: Vec2, rangeRat: number) => {
			let ns0 = (ns(p, noiseOffset.copy().multiply(1255.23), 1.15) + 1) / 2
			let ns1 = (ns(p, noiseOffset.copy().multiply(1.623), 0.09) + 1) / 2

			return (
				ns0 < 0.15 * (0.2 + 0.8 * Ease.easeOutQuad(1 - (rangeRat - 0.5) / 0.5))
			)
		},
		range: { min: 355, max: 1400 },
	},
	RUNE: {
		hp: 10000,
		name: "Rune",
		color: "rgba(250,250,250,1)",
		type: "ore",
		resource: "RUNE",
		resourceAmount: () => 3 + Math.floor(4 * rndFloat()),
		baseValue: 500,
		isBreakable: () => true,
		test: (p: Vec2, rangeRat: number) => {
			let ns0 = (ns(p, noiseOffset.copy().multiply(1255.23), 1.15) + 1) / 2
			let ns1 = (ns(p, noiseOffset.copy().multiply(1.623), 0.09) + 1) / 2

			return (
				ns0 < 0.15 * (0.2 + 0.8 * Ease.easeOutQuad(1 - (rangeRat - 0.5) / 0.5))
			)
		},
		range: { min: 855, max: 2000 },
	},
	SILVER: {
		hp: 200,
		name: "Silver Ore",
		color: "green",
		type: "ore",
		resource: "SILVER",
		baseValue: 250,
		resourceAmount: () => 3 + Math.floor(4 * rndFloat()),
		isBreakable: () => true,
		test: (p: Vec2) => {
			let ns0 = (ns(p, noiseOffset.copy().multiply(15.23), 0.9) + 1) / 2
			return ns0 < 0.05
		},
		//         drops(): {
		// return {"Silver":}
		//         },
		range: { min: 65, max: Infinity },
	},
	GOLD: {
		hp: 500,
		name: "Gold Ore",
		color: "gold",
		type: "ore",
		resource: "GOLD",
		baseValue: 750,
		resourceAmount: () => 3 + Math.floor(4 * rndFloat()),
		isBreakable: () => true,
		test: (p: Vec2, rangeRat: number) => {
			let ns0 = (ns(p, noiseOffset.copy().multiply(1556.23), 0.9) + 1) / 2
			return (
				ns0 <
				0.007 +
					Math.max(
						0.05,
						0.013 * Math.log(Math.max(1, p.y * 0.01)) * rangeRat ** 2,
					)
			)
		},
		range: { min: 155, max: Infinity },
	},
	SAPPHIRE: {
		hp: 1000,
		name: "Sapphire",
		color: "blue",
		type: "ore",
		resource: "SAPPHIRE",
		baseValue: 250,
		resourceAmount: () => 1 + Math.floor(2 * rndFloat() ** 3),
		isBreakable: () => true,
		test: (p: Vec2) => {
			let ns0 = (ns(p, noiseOffset.copy().multiply(17.23), 0.9) + 1) / 2
			return (
				ns0 <
				Math.max(0.05, 0.013 * Math.log(Math.max(1, (p.y - 250) * 0.0001)))
			)
		},
		range: { min: 325, max: Infinity },
	},
	EMERALD: {
		hp: 5000,
		name: "Emerald",
		color: "green",
		type: "ore",
		resource: "EMERALD",
		baseValue: 500,
		resourceAmount: () => 1 + Math.floor(2 * rndFloat() ** 3),
		isBreakable: () => true,
		test: (p: Vec2) => {
			let ns0 = (ns(p, noiseOffset.copy().multiply(17.23), 0.9) + 1) / 2
			return (
				ns0 <
				Math.max(0.05, 0.013 * Math.log(Math.max(1, (p.y - 250) * 0.0001)))
			)
		},
		range: { min: 325, max: Infinity },
	},
	RUBY: {
		hp: 10000,
		name: "Ruby",
		color: "red",
		type: "ore",
		resource: "RUBY",
		baseValue: 1500,
		resourceAmount: () => 1 + Math.floor(2 * rndFloat() ** 3),
		isBreakable: () => true,
		test: (p: Vec2) => {
			let ns0 = (ns(p, noiseOffset.copy().multiply(17.23), 0.9) + 1) / 2
			return (
				ns0 <
				Math.max(0.05, 0.013 * Math.log(Math.max(1, (p.y - 250) * 0.0001)))
			)
		},
		range: { min: 325, max: Infinity },
	},
	DIAMOND: {
		hp: 100000,
		name: "Diamond",
		color: "white",
		type: "ore",
		resource: "DIAMOND",
		baseValue: 10000,
		resourceAmount: () => 1 + Math.floor(2 * rndFloat() ** 3),
		isBreakable: () => true,
		test: (p: Vec2) => {
			let ns0 = (ns(p, noiseOffset.copy().multiply(17.23), 0.9) + 1) / 2
			return (
				ns0 <
				Math.max(0.05, 0.013 * Math.log(Math.max(1, (p.y - 250) * 0.0001)))
			)
		},
		range: { min: 325, max: Infinity },
	},
} as { [key in TileType]: TileTypeInfo }

const Ores = Object.entries(TileTypes)
	.filter(([_, tileType]) => tileType.type == "ore")
	.map(([key, value]) => ({ key, value }))
	.reverse()
// Tile class representing a single tile in the grid
export class Tile {
	typeInfo: TileTypeInfo
	type: TileType
	hp: number
	texture?: HTMLCanvasElement
	indexP: Vec2

	constructor(type: TileType = "EMPTY", indexP: Vec2) {
		this.type = type
		this.typeInfo = TileTypes[type]
		this.hp = this.typeInfo.hp
		this.indexP = indexP
		this.init(type)
	}
	init(type: TileType) {
		this.type = type
		this.typeInfo = TileTypes[type]
		this.hp = this.typeInfo.hp
	}
	triggerDeath(p: Vec2) {
		console.log("Dying at " + p.x, p.y)
		if (this.typeInfo.resource && this.typeInfo.resourceAmount) {
			let amnt = this.typeInfo.resourceAmount()
			if (amnt > 0) {
				inventory.addResource(this.typeInfo.resource, amnt)
				addOreGain(
					player.position.copy().addAngle(player.direction, PLAYER_SIZE / 2),
					this.typeInfo.resource,
					amnt,
				)
			}
			console.log("added " + amnt + "x ", this.typeInfo)
		}
	}
	isBreakable(): boolean {
		return this.typeInfo.isBreakable()
	}
	damage(amount: number) {
		this.hp -= amount
	}
	getTexture(type: TileType, p?: Vec2) {
		if (!this.texture) {
			this.texture = getTexture(type, p) as HTMLCanvasElement
		}
		return this.texture
	}
	render(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		tileSize: number,
		color?: string,
	): void {
		if (this.type === "EMPTY") {
			ctx.drawImage(
				getTexture("EMPTY", this.indexP.copy().multiply(10))!,
				x,
				y,
				tileSize,
				tileSize,
			)
			return
		}

		let texture = this.getTexture(this.type, new Vec2(x, y))

		if (texture) {
			ctx.drawImage(texture, x, y, tileSize, tileSize)
		} else {
			ctx.fillStyle = color || this.typeInfo.color
			ctx.fillRect(x, y, tileSize, tileSize)

			// Add a simple border to distinguish tiles
			ctx.strokeStyle = "rgba(0, 0, 0, 0.2)"
			ctx.strokeRect(x, y, tileSize, tileSize)
		}

		if (this.hp < this.typeInfo.hp) {
			ctx.drawImage(getBrokenTexture0(), x, y, tileSize, tileSize)
		}
		if (this.hp < this.typeInfo.hp * 0.5) {
			ctx.drawImage(getBrokenTexture1(), x, y, tileSize, tileSize)
		}
		ctx.fillStyle = "green"
		// ctx.fillRect(x, y, (tileSize * this.hp) / this.typeInfo.hp, 2)
	}
}

function getRandomTile(x: number, y: number): TileType {
	let ns0 = ns(new Vec2(x, y), noiseOffset, 0.01)
	let ns1 = ns(new Vec2(x, y), noiseOffset, 0.1)
	let ns2 = ns(new Vec2(x, y), noiseOffset, 0.1)

	return "BEDROCK"
}

// Grid class representing the 2D grid of tiles
export class Grid {
	private tiles: Tile[][]
	private width: number
	private height: number

	constructor(width: number, height: number) {
		this.width = width
		this.height = height

		// Initialize the grid with empty tiles
		this.tiles = []
		for (let y = 0; y < height; y++) {
			this.tiles[y] = []
			for (let x = 0; x < width; x++) {
				this.tiles[y][x] = new Tile(getRandomTile(x, y), new Vec2(x, y))
			}
		}
	}

	getTile(x: number, y: number): Tile | null {
		// Check if coordinates are within bounds
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
			return null
		}

		return this.tiles[y][x]
	}

	setTile(x: number, y: number, type: TileType): boolean {
		// Check if coordinates are within bounds
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
			return false
		}
		this.tiles[y][x].init(type)

		return true
	}

	// Convert grid coordinates to pixel coordinates
	gridToPixel(gridX: number, gridY: number): { x: number; y: number } {
		return transformWorldToRenderP(
			new Vec2(gridX * TILE_SIZE, gridY * TILE_SIZE),
		)

		// {
		// 	x: gridX * TILE_SIZE + CANVAS_WIDTH / 2,
		// 	y: 350 + gridY * TILE_SIZE - TILE_SIZE / 2 - TILE_SIZE,
		// }
	}

	// Convert pixel coordinates to grid coordinates
	pixelToGrid(pixelX: number, pixelY: number): { x: number; y: number } {
		return {
			x: Math.floor(pixelX / TILE_SIZE),
			y: Math.floor(pixelY / TILE_SIZE),
		}
	}

	update(): void {
		// Empty for now - will be used for any tile updates that happen over time
		// For example, water flow, plant growth, etc.
	}

	render(ctx: CanvasRenderingContext2D, playerP: Vec2): void {
		// Render all tiles in the grid
		let playerCoordX = Math.floor(playerP.x / TILE_SIZE)
		let playerCoordY = Math.floor(playerP.y / TILE_SIZE)
		for (
			let y = Math.max(0, playerCoordY - 20);
			y < Math.min(this.height, playerCoordY + 20);
			y++
		) {
			for (
				let x = Math.max(0, playerCoordX - 20);
				x < Math.min(this.width, playerCoordX + 20);
				x++
			) {
				const pixel = this.gridToPixel(x, y)

				this.tiles[y][x].render(
					ctx,
					pixel.x - playerP.x,
					pixel.y - playerP.y,
					TILE_SIZE,
				)
			}
		}
	}

	// Helper method to fill the grid with a pattern or generate terrain
	generateTerrain(): void {
		// Create a hilly terrain
		const baseHeight = 0
		for (let y = 0; y < this.height; y++) {
			xLoop: for (let x = 0; x < this.width; x++) {
				for (let { key: oreKey, value: oreType } of Ores) {
					// console.log(oreType)
					const { range, test } = oreType
					if (range) {
						const { min, max } = range

						if (min < y && max > y) {
							if (test) {
								if (
									test(
										new Vec2(x, y),
										(y - range.min) / (range.max - range.min),
									)
								) {
									this.setTile(x, y, oreKey as TileType)
									continue xLoop
								}
							} else {
								let ironHtMod =
									(1 -
										Ease.easeInQuad(
											Math.abs(((y - min) / (max - min) - 0.5) / 0.5),
										)) *
									0.25
								let nsIron =
									(ns(new Vec2(x + min * max, y), noiseOffset, 1) + 1) / 2

								if (nsIron < ironHtMod) {
									this.setTile(x, y, oreKey as TileType)
									continue xLoop
								}
							}
						}
					}
				}
				if (y == 0) {
					this.setTile(x, y, "GRASS")
				} else {
					this.setTile(x, y, "DIRT")
				}

				// Set bedrock at the very bottom
				if (y === this.height - 1) {
					this.setTile(x, y, "BEDROCK")
				}
			}
		}
		for (let x = 0; x < this.width; x++) {
			this.setTile(x, this.height - 1, "BEDROCK")
		}
		// let ts = 6
		// for (let k = 0; k < 2; k++) {
		// 	let cnv = document.createElement("canvas")
		// 	cnv.width = this.width * ts
		// 	cnv.height = (this.height * ts) / 2
		// 	let ctx = cnv.getContext("2d")!
		// 	document.body.appendChild(cnv)
		// 	ctx.translate(0, -cnv.height * k)

		// 	for (let i = 0; i < this.width; i++) {
		// 		for (let j = Math.floor((k * this.height) / 2); j < this.height; j++) {
		// 			ctx.fillStyle =
		// 				Colors.themes.Classic[this.getTile(i, j)!.type as TileType]!
		// 			// typeInfo.color!
		// 			ctx?.fillRect(i * ts, j * ts, ts, ts)
		// 		}
		// 	}
		// }
	}
}
