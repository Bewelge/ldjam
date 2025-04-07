import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	PLAYER_SIZE,
	TILE_SIZE,
	upgradeManager,
} from "./main.js"
import { getTexture } from "./Textures.js"
import { TileType } from "./Tiles.js"
import { UpgradeList } from "./UpgradeList.js"
import { PI, PI05, PI2, rndFloat, Vec2 } from "./util.js"

// Player class
export class Player {
	position: Vec2
	motion: Vec2
	private keysDown: { [key: string]: boolean }
	ticker: number = 0
	private gravity: number
	private maxDownSpeed: number
	isJumping: boolean
	isDrillingX: boolean = false
	isDrillingY: boolean = false
	isDrilledX: number = 0
	isDrilledY: number = 0
	ceilingHit: number = 0
	ledgeTicker: number = 0
	isLedged: boolean = false
	onGround: boolean
	drillTicker: number = 0
	direction: number = 0
	attackDuration: number
	attackSpeed: number
	walkTicker: number = 0

	damage: number
	speed: number
	jumpForce: number
	baseJumpForce: number
	maxHealth: number
	baseMaxHealth: number
	flightSpeed: number
	isFlying: boolean = false
	texture?: HTMLCanvasElement
	drillTexture?: HTMLCanvasElement
	drillTexture2?: HTMLCanvasElement

	constructor() {
		this.position = new Vec2(0, 0)
		this.motion = new Vec2()
		this.keysDown = {}
		this.gravity = 0.15
		this.maxDownSpeed = 5
		this.isJumping = false
		this.onGround = false
		this.ceilingHit = 0

		this.flightSpeed = 3
		this.damage = 1
		this.speed = 5
		this.jumpForce = 15
		this.attackSpeed = 1
		this.attackDuration = 15
		this.baseJumpForce = 5
		this.maxHealth = 5
		this.baseMaxHealth = 5
	}

	init(): void {
		// Set up key listeners
		window.addEventListener("keydown", this.handleKeyDown.bind(this))
		window.addEventListener("keyup", this.handleKeyUp.bind(this))

		// let drillSize = 64
		// let drillCnv = document.createElement("canvas")
		// drillCnv.width = drillSize
		// drillCnv.height = drillSize
		// let ct = drillCnv.getContext("2d")!
		// for (let i = 0; i < 6; i++) {
		// 	let w = drillSize * 0.4 * (1 - (i + 0.5) / 6)

		// 	for (let j = 0; j < 3; j++) {
		// 		let y = (0.2 + (0.6 * (j * i)) / (6 * 3)) * drillSize
		// 		ct.fillRect(drillSize / 2 - w / 2, y, w, 1)
		// 	}
		// }
		// document.body.appendChild(drillCnv)
	}

	private handleKeyDown(event: KeyboardEvent): void {
		if (event.key == "ArrowDown" || event.key == "ArrowUp") {
			event.preventDefault()
		}
		// Store the key state
		this.keysDown[event.key] = true
	}

	private handleKeyUp(event: KeyboardEvent): void {
		// Remove the key state
		delete this.keysDown[event.key]
	}
	getPlayerSpeed() {
		return this.speed + UpgradeList.SPEED.getCurrentEffect
	}

	getPlayerMiningSpeed() {
		return this.attackSpeed + UpgradeList.MINING_SPEED.getCurrentEffect
	}
	getPlayerFlightSpeed() {
		return this.flightSpeed + UpgradeList.FLY_SPEED.getCurrentEffect
	}
	getPlayerDamage() {
		return this.damage + UpgradeList.MINING_DAMAGE.getCurrentEffect
	}
	adjustDirection(target: number) {
		if (this.direction != target) {
			this.direction = this.direction + (target - this.direction) * 0.4
			if (Math.abs(this.direction - target) < 0.05) {
				this.direction = target
			}
		}
	}
	update(): void {
		this.ticker++
		const playerSpeed = this.getPlayerSpeed()
		const flightSpeed = this.getPlayerFlightSpeed()
		// Reset horizontal motion
		this.motion._x = 0
		if (this.motion.y < 0) {
			this.motion._y *= 0.5
		}
		this.isDrillingX = false
		this.isDrillingY = false
		let isMoving = false
		// Handle horizontal movement (WASD and arrow keys)
		if (this.keysDown["a"] || this.keysDown["ArrowLeft"]) {
			this.motion._x = -playerSpeed
			this.isDrillingX = true
			this.adjustDirection(PI)
			isMoving = true

			if (this.direction == PI) {
				this.drillX()
			}
		} else if (this.keysDown["d"] || this.keysDown["ArrowRight"]) {
			this.motion._x = playerSpeed
			this.isDrillingX = true
			isMoving = true
			this.adjustDirection(0)

			if (this.direction == 0) {
				this.drillX()
			}
		}

		// Handle jumping (W, Arrow Up, Space)
		this.isFlying = false
		if (
			this.keysDown["w"] ||
			this.keysDown["ArrowUp"] ||
			this.keysDown[" "]
			//  &&
			// this.onGround &&
			// !this.isJumping
		) {
			this.motion._y = Math.max(-flightSpeed, this.motion.y - this.jumpForce)
			this.onGround = false
			this.isJumping = true
			this.isFlying = true
			console.log("jump")
		} else if (
			(this.keysDown["s"] || this.keysDown["ArrowDown"]) &&
			this.onGround &&
			!this.isJumping
		) {
			isMoving = true
			this.motion._y = Math.min(
				Math.max(playerSpeed, this.maxDownSpeed),
				this.motion._y + playerSpeed,
			)
			this.isDrillingY = true
			this.adjustDirection(PI05)

			if (this.direction == PI05) {
				this.drillY()
			}
		}

		if (isMoving) {
			this.walkTicker++
		}
		// Apply gravity

		if (!this.onGround) {
			this.motion._y += this.gravity * (this.ceilingHit ? 0.15 : 1)
		}

		if (this.ledgeTicker > 0) {
			this.ledgeTicker--
			if (this.ledgeTicker == 0) {
				this.isLedged = true
			}
		}

		this.ceilingHit = Math.max(0, this.ceilingHit - 1)

		// Update position based on motion

		// Ground collision detection (simple example - replace with your collision logic)
		// if (this.position.y > 500) {
		// 	// Assuming 500 is the ground level
		// 	this.position._y = 500
		// 	this.motion._y = 0
		// 	this.isJumping = false
		// 	this.canJump = true
		// }
	}

	private drillX() {
		this.drillTicker += this.getPlayerMiningSpeed()
		while (this.drillTicker >= this.attackDuration) {
			let amnt = Math.floor(this.drillTicker / this.attackDuration)
			this.drillTicker -= amnt * this.attackDuration
			this.isDrilledX = amnt
		}
	}
	private drillY() {
		this.drillTicker += this.getPlayerMiningSpeed()
		while (this.drillTicker >= this.attackDuration) {
			let amnt = Math.floor(this.drillTicker / this.attackDuration)
			this.drillTicker -= amnt * this.attackDuration
			this.isDrilledY = amnt
		}
	}
	getTexture() {
		if (!this.texture) {
			let cnv = document.createElement("canvas")
			this.texture = cnv
			let cnvS = 32
			cnv.width = cnvS
			cnv.height = cnvS
			let ct = cnv.getContext("2d")!
			ct.drawImage(getTexture("PLAYER_01" as TileType)!, 0, 0, cnvS, cnvS)
		}
		return this.texture
	}
	getDrillTexture() {
		if (!this.drillTexture) {
			let cnv = document.createElement("canvas")
			this.drillTexture = cnv
			let cnvS = 32
			cnv.width = cnvS
			cnv.height = cnvS
			let ct = cnv.getContext("2d")!
			ct.drawImage(getTexture("DRILL" as TileType)!, 0, 0, cnvS, cnvS)
		}
		return this.drillTexture
	}
	getDrillTexture2() {
		if (!this.drillTexture2) {
			let cnv = document.createElement("canvas")
			this.drillTexture2 = cnv
			let cnvS = 32
			cnv.width = cnvS
			cnv.height = cnvS
			let ct = cnv.getContext("2d")!
			ct.drawImage(getTexture("DRILL" as TileType)!, cnvS, 0, -cnvS, cnvS)
		}
		return this.drillTexture2
	}
	render(ctx: CanvasRenderingContext2D): void {
		// Simple rendering - replace with your own graphics

		let playerText = this.getTexture()
		//  getTexture("PLAYER_01" as TileType)
		getTexture(
			("PLAYER_0" + ((Math.floor(this.walkTicker * 0.5) % 4) + 1)) as TileType,
		)

		let headOffset = PLAYER_SIZE * 0.4
		let shoulderOffset = PLAYER_SIZE * 0
		let shoulderOffsetW = PLAYER_SIZE * 0.6
		let legOffsetT = -PLAYER_SIZE * 0.2
		let legOffsetB = -PLAYER_SIZE * 0.75
		let legOffsetTW = PLAYER_SIZE * 0.2
		let legOffsetBW = PLAYER_SIZE * 0.5

		let center = new Vec2(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)

		let torsoSize = PLAYER_SIZE * 0.75
		let headSize = PLAYER_SIZE * 0.75
		let armSize = PLAYER_SIZE * 0.3
		let legSize = PLAYER_SIZE * 0.2

		let headT = getTexture("PLAYER_HEAD" as TileType)!
		let torsoT = getTexture("PLAYER_TORSO" as TileType)!
		let armT = getTexture("PLAYER_ARM" as TileType)!
		let legT = getTexture("PLAYER_LEG" as TileType)!

		let headP = center.copy().addAngle(PI05, -headOffset)
		let shoulderL = center
			.copy()
			.addAngle(PI05, -shoulderOffset)
			.addAngle(PI, shoulderOffsetW)
		let shoulderR = center
			.copy()
			.addAngle(PI05, -shoulderOffset)
			.addAngle(0, shoulderOffsetW)
		let legTL = center
			.copy()
			.addAngle(PI05, -legOffsetT)
			.addAngle(PI, legOffsetTW)
		let legTR = center
			.copy()
			.addAngle(PI05, -legOffsetT)
			.addAngle(0, legOffsetTW)
		let legBL = center
			.copy()
			.addAngle(PI05, -legOffsetB)
			.addAngle(PI, legOffsetBW)
		let legBR = center
			.copy()
			.addAngle(PI05, -legOffsetB)
			.addAngle(0, legOffsetBW)
		let dirRat = Math.min(
			1,
			Math.max(0, Math.abs(this.direction - PI05) / PI05),
		)
		let drillOriginP = center.copy().add(0, dirRat * 5)

		{
			//legs
			ctx.save()
			ctx.translate(legTL.x, legTL.y)
			ctx.drawImage(legT, -legSize * 0.5, 0, legSize, legOffsetT - legOffsetB)
			ctx.restore()
			ctx.save()
			ctx.translate(legTR.x, legTR.y)
			ctx.drawImage(legT, -legSize * 0.5, 0, legSize, legOffsetT - legOffsetB)
			ctx.restore()
		}
		{
			let drillP = drillOriginP
				.copy()
				.addAngle(this.direction + PI05, PLAYER_SIZE * 0.2)
			ctx.save()
			ctx.translate(shoulderR.x, shoulderR.y)
			let ang = shoulderR.angleTo(drillP)
			let dis = shoulderR.distanceTo(drillP)
			ctx.rotate(ang)
			ctx.drawImage(armT, 0, 0, dis, armSize)
			ctx.restore()
		}

		ctx.save()
		ctx.translate(center.x, center.y)
		ctx.drawImage(torsoT, -torsoSize / 2, -torsoSize / 2, torsoSize, torsoSize)
		ctx.restore()

		{
			let drillP = drillOriginP
				.copy()
				.addAngle(this.direction - PI05, PLAYER_SIZE * 0.2)

			ctx.save()
			ctx.translate(shoulderL.x, shoulderL.y)
			let ang = shoulderL.angleTo(drillP)
			let dis = shoulderL.distanceTo(drillP)
			ctx.rotate(ang)
			ctx.drawImage(armT, 0, -armSize / 2, dis, armSize)
			ctx.restore()
		}
		{
			let drillP = drillOriginP
				.copy()
				.addAngle(this.direction + PI05, PLAYER_SIZE * 0.2)
			ctx.save()
			ctx.translate(shoulderR.x, shoulderR.y)
			let ang = shoulderR.angleTo(drillP)
			let dis = shoulderR.distanceTo(drillP)
			ctx.rotate(ang)
			ctx.drawImage(armT, 0, -armSize / 2, dis, armSize)
			ctx.restore()
		}

		// ctx.translate(shoulderL.x, shoulderL.y)
		// let ang = shoulderL.angleTo(drillOriginP)
		// let dis = shoulderL.distanceTo(drillOriginP)
		// ctx.rotate(ang)
		// ctx.drawImage(armT, -5, 0, dis + 5, armSize)
		// ctx.restore()

		ctx.save()
		ctx.translate(headP.x, headP.y)
		// ctx.rotate(Math.sin(this.ticker * 0.1) * 0.1)
		ctx.drawImage(headT, -headSize / 2, -headSize / 2, headSize, headSize)
		ctx.restore()

		// ctx.drawImage(torsoT, center.x - torsoSize / 2, center.y - torsoSize / 2)

		// if (playerText) {
		// 	ctx.drawImage(
		// 		playerText,
		// 		center.x - PLAYER_SIZE / 2,
		// 		center.y - PLAYER_SIZE / 2,
		// 		PLAYER_SIZE,
		// 		PLAYER_SIZE,
		// 	)
		// }
		// else
		{
			ctx.fillStyle = "white"
			ctx.beginPath()
			ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, PLAYER_SIZE / 4, 0, PI2)
			// ctx.fill()
			ctx.closePath()
		}
		// ctx.fillStyle = "pink"
		// ctx.fillRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE)
		ctx.fillStyle = "rgba(0,0,0,0.7)"
		ctx.save()
		ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)

		let text = this.getDrillTexture()
		// getTexture("DRILL" as any)
		if (text) {
			ctx.translate(0, dirRat * 5)
			ctx.rotate(
				this.direction +
					(this.isDrillingX || this.isDrillingY ? rndFloat(-1) * 0.15 : 0),
			)
			ctx.drawImage(
				text,
				(this.drillTicker % 5) * 0 - PLAYER_SIZE / 6,
				// PLAYER_SIZE / 4 +
				// dirRat * PLAYER_SIZE * 0.2 +
				(-PLAYER_SIZE * 0.75) / 2,
				PLAYER_SIZE * 0.75,
				PLAYER_SIZE * 0.75,
			)
		}
		// ctx.fillRect((this.drillTicker % 5) - 4.5, -1, 9, 2)
		ctx.restore()

		// headP.debug(ctx, "red")
		// shoulderL.debug(ctx, "green")
		// shoulderR.debug(ctx, "green")
		// legTL.debug(ctx, "green")
		// legTR.debug(ctx, "green")
		// legBL.debug(ctx, "green")
		// legBR.debug(ctx, "green")
		// drillOriginP.debug(ctx, "red")
		// ctx.beginPath()
		// ctx.lineWidth = 5
		// shoulderL.moveTo(ctx)
		// center
		// 	.copy()
		// 	.addAngle(this.direction, PLAYER_SIZE * 0.2)
		// 	.lineTo(ctx)
		// shoulderR.moveTo(ctx)
		// center
		// 	.copy()
		// 	.addAngle(this.direction, PLAYER_SIZE * 0.2)
		// 	.lineTo(ctx)
		// ctx.stroke()
		// ctx.closePath()
	}
}
