// Main Game File
// Import required classes (assuming they're in separate files)
// If not, ensure these classes are defined before this code

import { StaticReadUsage } from "three"
import { Colors, getColor } from "./Colors.js"
import { Inventory } from "./Inventory.js"
import { renderOreGain } from "./OreGainSys.js"
import { ParticlesSys } from "./Particle.js"
import { Player } from "./Player.js"
import { SellShop } from "./SellShop.js"
import { initSounds, playSound, SoundManager } from "./SoundManager.js"
import { getTexture, initTextures } from "./Textures.js"

import { Grid, Tile, TileType, TileTypes } from "./Tiles.js"
import { UpgradeManager } from "./Upgrades.js"
import { UpgradeShop } from "./UpgradeShop.js"
import {
	PI,
	PI05,
	rndInt,
	seedRndGen,
	transformWorldToRenderP,
	Vec2,
} from "./util.js"
let tileSheet = {
	tile_width: 256,
	tile_height: 256,
	tiles: Array(16)
		.fill(0)
		.map((_, i) => {
			return {
				id: 0,
				x: 0 + 242 * (i % 4),
				y: 0 + Math.floor(i / 4) * 240,
				width: 200,
				height: 200,
			}
		}),
}
export let noiseOffset: Vec2
let game
export let player = new Player()
let oracleHasOpened = false
let sellHasOpened = false

// Game States
enum GameState {
	INIT,
	START_GAME,
	START_DAY,
	RUNNING,
	END_DAY,
	END_GAME,
}
export const CANVAS_WIDTH = 948 //800
export const CANVAS_HEIGHT = 533 //1000
export const GRID_HEIGHT = 1000 // Much deeper than wide
export const GRID_WIDTH = 250
export const TILE_SIZE = 48
export const PLAYER_SIZE = 32
export let upgradeManager: UpgradeManager = new UpgradeManager()
export let inventory: Inventory = new Inventory(15)

export let particles = [] as ParticlesSys[]
export let upgradeShop: UpgradeShop = new UpgradeShop()
export let sellShop: SellShop = new SellShop()

let isPlayDrillSound = false
interface Item {
	value: number
	name: string
	amount: number
	uncountable?: boolean
}
class Game {
	private canvas: HTMLCanvasElement
	private ctx: CanvasRenderingContext2D
	private player: Player
	private grid: Grid
	private state: GameState
	private lastTime: number
	private dayCount: number
	private dayTime: number
	private dayLength: number // Length of a day in milliseconds
	private tilesToKill: Vec2[] = []

	// inventory: Item[]

	// Configuration

	constructor() {
		// Create canvas element
		this.canvas = document.createElement("canvas")
		this.canvas.width = CANVAS_WIDTH
		this.canvas.height = CANVAS_HEIGHT
		this.canvas.style.display = "block"
		this.canvas.style.margin = "0 auto"
		this.canvas.style.backgroundColor = "#87CEEB" // Sky blue background

		// Add canvas to DOM
		document.getElementById("mainScreen")!.appendChild(this.canvas)
		document
			.getElementById("startScreen")
			?.querySelector("button")
			?.addEventListener("click", () => {
				let el = document.getElementById("startScreen")!
				el.parentElement?.removeChild(el)
			})

		// Get rendering context
		const context = this.canvas.getContext("2d")
		if (!context) {
			throw new Error("Could not get 2D context from canvas")
		}
		this.ctx = context

		// Initialize game objects
		this.player = player
		this.grid = new Grid(GRID_WIDTH, GRID_HEIGHT)

		// inventory.addResource("EMERALD", 5)
		// inventory.addResource("RUBY", 5)
		// inventory.addResource("IRON", 5)
		// inventory.addResource("COAL", 55)
		// inventory.addResource("DIAMOND", 55)
		console.log(this.grid)
		// Initialize game state
		this.state = GameState.INIT
		this.lastTime = 0
		this.dayCount = 0
		this.dayTime = 0
		this.dayLength = 60000 // 3 minutes for a full day
	}

	// Game setup
	setup(): void {
		// Initialize player

		// let img = new Image()
		// img.src = "images/tilesheet_no_background1.png"
		// img.onload = () => {
		// 	let mainCnv = document.createElement("canvas")

		// 	mainCnv.width = img.width
		// 	mainCnv.height = img.height
		// 	let ctx = mainCnv.getContext("2d")
		// 	ctx?.drawImage(img, 0, 0)
		// 	document.body.appendChild(mainCnv)
		// 	tileSheet.tiles.forEach(tile => {
		// 		let cn = document.createElement("canvas")
		// 		cn.width = tile.width
		// 		cn.height = tile.height
		// 		cn
		// 			.getContext("2d")
		// 			?.drawImage(
		// 				mainCnv,
		// 				tile.x,
		// 				tile.y,
		// 				tile.width,
		// 				tile.height,
		// 				0,
		// 				0,
		// 				tile.width,
		// 				tile.height,
		// 			)
		// 		document.body.appendChild(cn)
		// 	})
		// }

		//COLOR THEMES
		// Object.entries(Colors.themes).forEach(([col, theme]) => {
		// 	let themeCont = document.createElement("div")
		// 	themeCont.innerHTML = "<span>" + col + ":" + "</span>"
		// 	Object.entries(theme).forEach(([key, col]) => {
		// 		let cnv = document.createElement("canvas")
		// 		cnv.width = 128
		// 		cnv.height = 128
		// 		let ct = cnv.getContext("2d")!
		// 		ct.fillStyle = col
		// 		ct.fillRect(0, 0, 128, 128)
		// 		ct.fillStyle = "black"
		// 		ct.fillText(key, 5, 25)
		// 		themeCont.appendChild(cnv)
		// 	})
		// 	document.body.prepend(themeCont)
		// })

		// let cnv = document.createElement("canvas")
		// let cnv2 = document.createElement("canvas")
		// let cnvS = 8
		// cnv.width = cnvS
		// cnv.height = cnvS
		// cnv2.width = 256
		// cnv2.height = 256
		// let ct = cnv.getContext("2d")!
		// ct.drawImage(getTexture("PLAYER_01" as TileType)!, 0, 0, cnvS, cnvS)
		// // document.body.prepend(cnv)
		// let imgDt = ct.getImageData(0, 0, 256, 256)

		this.player.init()
		this.player.position._x = (GRID_WIDTH * TILE_SIZE) / 2

		// Generate terrain
		window.addEventListener("keydown", ev => {
			// console.log(ev.key)
			if (ev.key == "o") {
				upgradeShop.openShop()
			} else if (ev.key == "p") {
				sellShop.openShop()
			}
		})
		this.grid.generateTerrain()
		// Find surface level for player position
		const gridX = Math.floor(this.player.position.x / TILE_SIZE)
		for (let y = 0; y < GRID_HEIGHT; y++) {
			const tile = this.grid.getTile(gridX, y)
			if (tile && tile.type !== "EMPTY") {
				// Position player just above the first non-empty tile
				this.player.position._y = y * TILE_SIZE - 50
				break
			}
		}

		// Set initial state
		this.state = GameState.START_GAME
		window.addEventListener("click", () => playSound("BACKGROUND_MUSIC"))

		// Start game loop
		this.lastTime = performance.now()
		requestAnimationFrame(this.tick.bind(this))
	}

	// Main game loop
	private tick(timestamp: number): void {
		// Calculate delta time
		const deltaTime = timestamp - this.lastTime
		this.lastTime = timestamp

		this.render()
		this.update(deltaTime)

		if (isPlayDrillSound) {
			playSound("DRILL")
		}
		isPlayDrillSound = false
		// Update game based on current state

		// Render everything

		// Continue the loop
		requestAnimationFrame(this.tick.bind(this))
	}

	// Update game logic
	private update(deltaTime: number): void {
		// Update based on current state
		switch (this.state) {
			case GameState.INIT:
				// Nothing to do here, handled in setup
				break

			case GameState.START_GAME:
				// Transition to start of first day
				this.dayCount = 1
				this.dayTime = 0
				this.state = GameState.START_DAY
				console.log(`Game started!`)
				break

			case GameState.START_DAY:
				// Transition to running state
				this.state = GameState.RUNNING
				console.log(`Day ${this.dayCount} started!`)
				break

			case GameState.RUNNING:
				// Update player
				this.player.update()

				// Update grid
				this.grid.update()

				// Update day time
				this.dayTime += deltaTime
				if (this.dayTime >= this.dayLength) {
					this.state = GameState.END_DAY
				}

				// Handle player-grid collision
				this.handleCollisions()

				this.tilesToKill.forEach(coord => {
					let oldTile = this.grid.getTile(coord.x, coord.y)
					oldTile?.triggerDeath(coord)
					this.grid.setTile(coord.x, coord.y, "EMPTY")
				})
				this.tilesToKill = []

				break

			case GameState.END_DAY:
				// Transition to next day or end game
				if (this.dayCount >= 7) {
					// End game after 7 days
					this.state = GameState.END_GAME
				} else {
					this.dayCount++
					this.dayTime = 0
					this.state = GameState.START_DAY
					console.log(`Day ${this.dayCount - 1} ended!`)
				}
				break

			case GameState.END_GAME:
				console.log(`Game ended after ${this.dayCount} days!`)
				// Could add a restart option here
				break
		}
	}

	// Render game
	private render(): void {
		// Clear canvas
		this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

		// Apply camera offset for scrolling (center on player)
		// this.ctx.save()
		// const cameraX = Math.max(
		// 	0,
		// 	Math.min(
		// 		this.player.position.x - CANVAS_WIDTH / 2,
		// 		GRID_WIDTH * TILE_SIZE - CANVAS_WIDTH,
		// 	),
		// )
		// const cameraY = Math.max(
		// 	0,
		// 	Math.min(
		// 		this.player.position.y - CANVAS_HEIGHT / 2,
		// 		GRID_HEIGHT * TILE_SIZE - CANVAS_HEIGHT,
		// 	),
		// )
		// this.ctx.translate(-cameraX, -cameraY)

		// Draw background (sky gradient based on time of day)
		this.drawBackground()
		let shopPos = new Vec2((GRID_WIDTH * TILE_SIZE) / 2 - 6 * TILE_SIZE, -1)
		if (player.position.distanceTo(shopPos) < 1000) {
			let shopP = transformWorldToRenderP(shopPos)
			// console.log(player.position.distanceTo(shopPos))
			if (player.position.distanceTo(shopPos) < 64) {
				if (!sellHasOpened && !sellShop.isOpen()) {
					sellHasOpened = true
					sellShop.openShop()
					console.log("Opening jsop")
				}
			} else {
				sellHasOpened = false
			}
			let shopSize = TILE_SIZE * 2
			this.ctx.drawImage(
				getTexture("SHOP" as TileType)!,
				shopP.x - player.position.x - shopSize / 2,
				shopP.y - player.position.y - shopSize + 12,
				shopSize,
				shopSize,
			)
		}
		let oraclePos = new Vec2((GRID_WIDTH * TILE_SIZE) / 2 + 5 * TILE_SIZE, -1)
		if (player.position.distanceTo(oraclePos) < 1000) {
			let shopP = transformWorldToRenderP(oraclePos)
			// console.log(player.position.distanceTo(oraclePos))
			if (player.position.distanceTo(oraclePos) < 64) {
				if (!oracleHasOpened && !upgradeShop.isOpen()) {
					oracleHasOpened = true
					upgradeShop.openShop()
					// console.log("Opening jsop")
				}
			} else {
				oracleHasOpened = false
			}
			let shopSize = TILE_SIZE * 2
			this.ctx.drawImage(
				getTexture("ORACLE" as TileType)!,
				shopP.x - player.position.x - shopSize / 2,
				shopP.y - player.position.y - shopSize + 12,
				shopSize,
				shopSize,
			)
		}
		// Render grid
		this.grid.render(this.ctx, this.player.position)

		this.player.render(this.ctx)

		// Render player
		for (let i = particles.length - 1; i >= 0; i--) {
			if (particles[i].particles.length == 0) {
				particles.splice(i, 1)
			} else {
				particles[i].render(this.ctx)
			}
		}

		renderOreGain(this.ctx)

		// Restore context
		this.ctx.restore()

		// Draw UI elements (on top of game world)
		this.drawUI()
	}

	// Handle collisions between player and grid
	private handleCollisions(): void {
		// Get player's grid coordinates

		const { player, grid } = this
		const { position: playerP, motion } = player
		const playerX = Math.floor(playerP.x / TILE_SIZE)
		const playerY = Math.floor(playerP.y / TILE_SIZE)

		const tileDown = this.grid.getTile(
			playerX,
			Math.floor((playerP.y + PLAYER_SIZE / 2) / TILE_SIZE + 0.1),
		)

		if (tileDown?.type == "EMPTY") {
			if (this.player.isLedged) {
				this.player.onGround = false
				this.player.isLedged = false
			} else if (this.player.ledgeTicker == 0) {
				this.player.ledgeTicker = 25
			}
		}
		let pixel = this.grid.gridToPixel(playerX, playerY + 1)

		// tileDown?.render(
		// 	this.ctx,
		// 	pixel.x - playerP.x,
		// 	pixel.y - playerP.y,
		// 	TILE_SIZE,
		// 	"red",
		// )

		const playerNextX = Math.floor(
			(playerP.x + (PLAYER_SIZE / 2) * Math.sign(motion.x) + motion.x) /
				TILE_SIZE,
		)
		const playerTargetX = Math.floor(
			(playerP.x + (PLAYER_SIZE / 2) * Math.sign(motion.x) + motion.x) /
				TILE_SIZE,
		)
		const playerNextY = Math.floor(
			(playerP.y + (PLAYER_SIZE / 2) * Math.sign(motion.y) + motion.y) /
				TILE_SIZE,
		)
		const playerTargetY = Math.floor(
			(playerP.y + (PLAYER_SIZE / 2) * Math.sign(motion.y) + motion.y) /
				TILE_SIZE,
		)

		let currentX = playerX
		while (currentX != playerTargetX) {
			let currentXTile = this.grid.getTile(currentX, playerY)
			if (currentXTile && currentXTile.type !== "EMPTY") {
				break
			} else {
				currentX += Math.sign(playerTargetX - playerX)
			}
		}
		let nextXTile = this.grid.getTile(currentX, playerY)
		let isKilled = false
		if (nextXTile && nextXTile.type !== "EMPTY") {
			if (motion.x > 0) {
				playerP._x = currentX * TILE_SIZE - PLAYER_SIZE / 2
			} else if (motion.x < 0) {
				playerP._x = currentX * TILE_SIZE + TILE_SIZE + PLAYER_SIZE / 2
			}
			if (nextXTile.isBreakable() && this.player.isDrilledX > 0) {
				const amount = this.player.isDrilledX
				this.player.isDrilledX = 0
				nextXTile.damage(this.player.getPlayerDamage() * amount)
				isPlayDrillSound = true
				this.addDigParticles(player, nextXTile)
				if (nextXTile.hp <= 0) {
					isKilled = true
					playSound("BREAK")
					this.tilesToKill.push(new Vec2(currentX, playerY))
				}
			}
			motion._x = 0
		}

		if (currentX < 0) {
			playerP._x = Math.max(
				PLAYER_SIZE / 2,
				Math.min(
					GRID_WIDTH * TILE_SIZE - PLAYER_SIZE / 2,
					playerP._x + motion._x,
				),
			)

			motion._x = 0
		}
		if (currentX > GRID_WIDTH - 1) {
			playerP._x = Math.max(
				PLAYER_SIZE / 2,
				Math.min(
					GRID_WIDTH * TILE_SIZE - PLAYER_SIZE / 2,
					playerP._x + motion._x,
				),
			)

			motion._x = 0
		}

		if (motion.y > 0) {
			let currentY = playerY
			while (currentY != playerTargetY) {
				let currentYTile = this.grid.getTile(playerX, currentY)
				if (currentYTile && currentYTile.type !== "EMPTY") {
					break
				} else {
					currentY += Math.sign(playerTargetY - playerY)
				}
			}
			let bottomTile = this.grid.getTile(playerX, currentY)
			if (bottomTile && bottomTile.type !== "EMPTY") {
				playerP._y = currentY * TILE_SIZE - PLAYER_SIZE / 2
				this.player.motion._y = 0
				this.player.isJumping = false
				this.player.onGround = true
				if (bottomTile.isBreakable() && this.player.isDrilledY > 0) {
					let amount = this.player.isDrilledY
					this.player.isDrilledY = 0

					bottomTile.damage(this.player.getPlayerDamage())
					isPlayDrillSound = true
					this.addDigParticles(player, bottomTile)
					if (bottomTile.hp <= 0) {
						isKilled = true
						playSound("BREAK")
						this.tilesToKill.push(new Vec2(playerX, currentY))
					}
				}
			}
		}
		if (motion.y < 0) {
			let upperTile = this.grid.getTile(
				playerX,
				Math.floor((playerP.y - PLAYER_SIZE / 2) / TILE_SIZE - 0.1),
			)
			if (upperTile && upperTile.type !== "EMPTY") {
				motion._y = 0
				player.ceilingHit = 10
			}
		}
		if (playerP.y + motion.y > 10000) {
			motion._x = 0
		}

		playerP._x += motion.x
		playerP._y += motion.y
	}

	private addDigParticles(player: Player, nextXTile: Tile) {
		particles.push(
			new ParticlesSys({
				p: this.player.position
					.copy()
					.addAngle(this.player.direction, PLAYER_SIZE / 2)
					.addAngle(this.player.direction - PI05, PLAYER_SIZE / 18),

				amount: rndInt(2, 5),
				color: getColor(nextXTile.type),
				angRange: {
					min: this.player.direction - PI05 * 0.15 - PI * 0.7,
					max: this.player.direction + PI05 * 0.15 - PI * 0.7,
				},
			}),
		)
		particles.push(
			new ParticlesSys({
				p: this.player.position
					.copy()
					.addAngle(this.player.direction, PLAYER_SIZE / 2)
					.addAngle(this.player.direction + PI05, PLAYER_SIZE / 18),

				amount: rndInt(2, 5),
				color: getColor(nextXTile.type),
				angRange: {
					min: this.player.direction - PI05 * 0.15 - PI * 1.3,
					max: this.player.direction + PI05 * 0.15 - PI * 1.3,
				},
			}),
		)
	}

	// Draw background with day/night cycle
	private drawBackground(): void {
		// Sky color changes based on time of day
		const dayProgress = this.dayTime / this.dayLength
		let skyColor

		if (dayProgress < 0.2) {
			// Dawn
			skyColor = this.lerpColor("#0909b3", "#87CEEB", dayProgress * 5)
		} else if (dayProgress < 0.8) {
			// Day
			skyColor = "#87CEEB"
		} else {
			// Dusk
			skyColor = this.lerpColor("#87CEEB", "#0909b3", (dayProgress - 0.8) * 5)
		}

		// Fill background
		this.ctx.fillStyle = skyColor
		this.ctx.fillRect(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE)

		// Draw sun or moon
		const celestialX = GRID_WIDTH * TILE_SIZE * dayProgress
		const celestialY =
			GRID_HEIGHT * TILE_SIZE * 0.2 * Math.sin(Math.PI * dayProgress)

		if (dayProgress >= 0.2 && dayProgress <= 0.8) {
			// Sun
			this.ctx.fillStyle = "yellow"
			this.ctx.beginPath()
			this.ctx.arc(celestialX, celestialY, 40, 0, Math.PI * 2)
			this.ctx.fill()
		} else {
			// Moon
			this.ctx.fillStyle = "white"
			this.ctx.beginPath()
			this.ctx.arc(celestialX, celestialY, 30, 0, Math.PI * 2)
			this.ctx.fill()
		}
	}

	// Draw UI elements
	private drawUI(): void {
		// Display day counter
		this.ctx.font = "bold 24px Arial"
		this.ctx.fillStyle = "white"
		this.ctx.strokeStyle = "black"
		this.ctx.lineWidth = 2
		const dayText = `Day ${this.dayCount}`
		this.ctx.strokeText(dayText, 20, 30)
		this.ctx.fillText(dayText, 20, 30)

		// Display day/night indicator
		const timeOfDay = this.dayTime / this.dayLength
		const { onGround, isJumping, position: playerP, motion } = this.player
		let timeText
		if (timeOfDay < 0.2) timeText = "Dawn"
		else if (timeOfDay < 0.4) timeText = "Morning"
		else if (timeOfDay < 0.6) timeText = "Afternoon"
		else if (timeOfDay < 0.8) timeText = "Evening"
		else timeText = "Night"

		this.ctx.strokeText(timeText, 20, 60)
		this.ctx.fillText(timeText, 20, 60)

		let invTx =
			"Inventory: " + inventory.getCurrentSize + "/" + inventory.getCapacity
		let moneyTx = "Money: " + upgradeManager.getResources()
		this.ctx.strokeText(invTx, 20, 90)
		this.ctx.fillText(invTx, 20, 90)
		this.ctx.strokeText(moneyTx, 20, 120)
		this.ctx.fillText(moneyTx, 20, 120)

		// this.ctx.fillText("isJump" + isJumping, 20, 90)
		// this.ctx.fillText("mot" + motion.x + "," + motion.y, 20, 120)
		// this.ctx.fillText("onground" + onGround, 20, 150)
		// this.ctx.fillText(
		// 	"tile" +
		// 		+Math.floor(playerP.x / TILE_SIZE) +
		// 		" ,  " +
		// 		Math.floor(playerP.y / TILE_SIZE),
		// 	20,
		// 	180,
		// )

		// Display game state message if needed
		if (
			this.state === GameState.START_GAME ||
			this.state === GameState.START_DAY ||
			this.state === GameState.END_DAY ||
			this.state === GameState.END_GAME
		) {
			this.ctx.font = "bold 40px Arial"
			this.ctx.textAlign = "center"

			let stateText = ""
			switch (this.state) {
				case GameState.START_GAME:
					stateText = "Game Starting"
					break
				case GameState.START_DAY:
					stateText = `Day ${this.dayCount} Beginning`
					break
				case GameState.END_DAY:
					stateText = `Day ${this.dayCount} Complete`
					break
				case GameState.END_GAME:
					stateText = "Game Complete!"
					break
			}

			this.ctx.strokeText(stateText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
			this.ctx.fillText(stateText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
			this.ctx.textAlign = "left"
		}
	}

	// Helper function to interpolate between colors
	private lerpColor(a: string, b: string, amount: number): string {
		const ah = parseInt(a.replace(/#/g, ""), 16)
		const ar = ah >> 16
		const ag = (ah >> 8) & 0xff
		const ab = ah & 0xff

		const bh = parseInt(b.replace(/#/g, ""), 16)
		const br = bh >> 16
		const bg = (bh >> 8) & 0xff
		const bb = bh & 0xff

		const rr = ar + amount * (br - ar)
		const rg = ag + amount * (bg - ag)
		const rb = ab + amount * (bb - ab)

		return `#${((1 << 24) + (Math.round(rr) << 16) + (Math.round(rg) << 8) + Math.round(rb)).toString(16).slice(1)}`
	}
}

// Start the game when the page loads
window.addEventListener("DOMContentLoaded", async () => {
	seedRndGen(new Date(10000000))
	noiseOffset = Vec2.random(0, 100, 100)
	game = new Game()
	console.log("Game created. Loading images")
	await initTextures()
	await initSounds()
	console.log("Textures loaded. Setup game")
	game.setup()
	console.log(game)
})
