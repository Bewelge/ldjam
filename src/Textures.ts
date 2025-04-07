import { Colors } from "./Colors.js"
import { Ease } from "./easing.js"
import { noiseOffset, TILE_SIZE } from "./main.js"
import { noise } from "./noise.js"
import { TileType, TileTypes } from "./Tiles.js"
import { ns, PI05, PI2, rndAng, rndFloat, rndInt, Vec2 } from "./util.js"

interface TextureData {
	url?: string
	img?: HTMLImageElement | HTMLCanvasElement
	imgs?: (HTMLImageElement | HTMLCanvasElement)[]
}

export const textureList = {
	// GRASS: {
	// 	url: "images/grass_01.png",
	// },
	// DIRT: {
	// 	url: "images/dirt_01.png",
	// },
	// PLAYER_01: {
	// 	url: "images/player_01.png",
	// },
	// PLAYER_02: {
	// 	url: "images/player_02.png",
	// },
	// PLAYER_03: {
	// 	url: "images/player_03.png",
	// },
	// PLAYER_04: {
	// 	url: "images/player_04.png",
	// },
	PLAYER_01: {
		url: "images/player1.png",
	},
	PLAYER_HEAD: {
		url: "images/playerHead.png",
	},
	PLAYER_TORSO: {
		url: "images/playerTorso.png",
	},
	PLAYER_ARM: {
		url: "images/playerArm.png",
	},
	PLAYER_LEG: {
		url: "images/playerLeg.png",
	},
	DRILL: {
		url: "images/drill.png",
	},
	SHOP: {
		url: "images/shop.png",
	},
	ORACLE: {
		url: "images/oracle.png",
	},
} as { [key in TileType]?: TextureData }

export type TextureKey = keyof typeof textureList

class Textures {
	textures: Record<string, TextureData>
	loaded: number
	constructor() {
		this.textures = {}
		this.loaded = 0
		this.generateTextures()
	}
	async loadTextures() {
		return new Promise((resolve, reject) => {
			let texturesToLoad = Object.entries(textureList)

			const totalTextures = texturesToLoad.length

			this.loaded = 0

			texturesToLoad.forEach(([key, val]) => {
				let img = new Image()
				img.src = val.url!
				img.onload = () => {
					this.loaded++
					this.textures[key].img = img

					if (this.loaded >= totalTextures) {
						resolve(this.textures)
					}
				}
				if (!this.textures.hasOwnProperty(key)) {
					this.textures[key] = { img, url: val.url }
				}
				this.textures[key].img = img
				this.textures[key].url = val.url

				this.loaded++
				if (this.loaded >= totalTextures) {
					resolve(this.textures)
					console.log("Texture", this.textures)
				}

				img.onerror = error => {
					reject(`Failed to load texture: ${val.url}`)
				}
			})
		})
	}
	async generateTextures() {
		return new Promise((resolve, reject) => {
			let allTextures = Object.keys(TileTypes)
			const totalTextures = allTextures.length

			this.loaded = 0

			allTextures.forEach(key => {
				let imgs = [] as HTMLCanvasElement[]
				if (key != "")
					for (let i = 0; i < 16; i++) {
						let img = generateTexture(key as TileType)
						imgs.push(img)
					}

				this.textures[key] = {
					imgs: imgs,
				}
				this.loaded++
				if (this.loaded >= totalTextures) {
					resolve(this.textures)
				}
			})
		})
	}
	getTexture(key: TileType, p?: Vec2) {
		// console.log(this.textures)
		const texture = this.textures[key]
		if (!texture) return

		let imgs = texture.imgs!
		if (imgs) {
			let ind = p
				? Math.floor((imgs.length * (1 + ns(p, noiseOffset, 0.04))) / 2)
				: rndInt(0, imgs?.length)
			return texture.imgs![ind]
		} else if (texture.img) {
			return texture.img
		}
	}
}

let theTexture: Textures

export const initTextures = async () => {
	theTexture = new Textures()
	await theTexture.generateTextures()
	await theTexture.loadTextures()
}

export function getTexture(key: TextureKey, p?: Vec2) {
	return theTexture.getTexture(key, p)
}

let brokenTexture0: HTMLCanvasElement
let brokenTexture1: HTMLCanvasElement
export function getBrokenTexture0() {
	if (!brokenTexture0) {
		brokenTexture0 = generateBrokenTexture(16)
	}
	return brokenTexture0
}
export function getBrokenTexture1() {
	if (!brokenTexture1) {
		brokenTexture1 = generateBrokenTexture(50)
	}
	return brokenTexture1
}

export function generateBrokenTexture(amount: number) {
	let cnv = document.createElement("canvas")
	cnv.width = TILE_SIZE * 2
	cnv.height = TILE_SIZE * 2
	let ct = cnv.getContext("2d")!

	let rndP = Vec2.random(0, 1000, 1000)

	let baseColor = Colors.themes.Classic.BEDROCK!
	ct.fillStyle = baseColor
	ct.globalAlpha = 0.2
	for (let i = 0; i < amount; i++) {
		let wh = rndInt()
		let rndP = new Vec2(
			rndInt(0, 1 + TILE_SIZE / 16) * 16,
			rndInt(0, 1 + TILE_SIZE / 16) * 16,
		)
		Vec2.random(-TILE_SIZE, TILE_SIZE * 2, TILE_SIZE * 2)

		ct.fillRect(
			rndP.x,
			rndP.y,
			1 * rndInt(1, 3) + wh * rndInt(15, 40),
			8 * rndInt(1, 3) + (1 - wh) * rndInt(15, 40),
		)
	}

	// document.body.appendChild(cnv)
	cnv.id = "typeKey"
	return cnv
}
export function generateTexture(typeKey: TileType) {
	let cnv = document.createElement("canvas")
	cnv.width = TILE_SIZE * 2
	cnv.height = TILE_SIZE * 2
	let ct = cnv.getContext("2d")!

	let rndP = Vec2.random(0, 1000, 1000)

	let baseColor = Colors.themes.Classic[typeKey]!
	if (TileTypes[typeKey].type == "ore") {
		baseColor = Colors.themes.Classic.DIRT!
	}
	ct.fillStyle = baseColor
	ct.beginPath()
	ct.fillRect(0, 0, TILE_SIZE * 2, TILE_SIZE * 2)
	ct.fill()
	ct.closePath()

	ct.fillStyle = "rgba(255,255,255,0.05)"
	let bitSize = 16
	for (let i = 0; i < (TILE_SIZE * 2) / bitSize; i += bitSize) {
		for (let j = 0; j < (TILE_SIZE * 2) / bitSize; j += bitSize) {
			let nois = ns(new Vec2(i, j), noiseOffset, 0.01)
			// if (nois.)
		}
	}
	for (let i = 0; i < 55; i++) {
		let tsBit = Math.floor(TILE_SIZE / bitSize)
		let rndX = rndInt(-tsBit, tsBit * 2) * bitSize
		let rndY = rndInt(-tsBit, tsBit * 2) * bitSize
		let rndW = rndInt(-tsBit, tsBit * 2) * bitSize
		let rndH = rndInt(-tsBit, tsBit * 2) * bitSize
		ct.fillRect(rndX, rndY, rndW, rndH)
	}
	ct.fillStyle = "rgba(0,0,0,0.05)"
	for (let i = 0; i < 55; i++) {
		let tsBit = Math.floor(TILE_SIZE / bitSize)
		let rndX = rndInt(-tsBit, tsBit * 2) * bitSize
		let rndY = rndInt(-tsBit, tsBit * 2) * bitSize
		let rndW = rndInt(-tsBit, tsBit * 2) * bitSize
		let rndH = rndInt(-tsBit, tsBit * 2) * bitSize
		ct.fillRect(rndX, rndY, rndW, rndH)
	}
	if (TileTypes[typeKey].type == "ore") {
		let oreColor = Colors.themes.Classic[typeKey]!
		let step = 16
		let nsOff = rndP.copy().addAngle(0, 250)
		let bitSize = 16
		for (let i = 1; i < TILE_SIZE * 2 - 1; i += step) {
			for (let j = 1; j < TILE_SIZE * 2 - 1; j += step) {
				let nois = ns(new Vec2(i, j), nsOff, 0.1)
				let xRat = Ease.easeInOutQuad(
					1 - Math.abs(i - TILE_SIZE) / (TILE_SIZE - 2),
				)
				let yRat = Ease.easeInOutQuad(
					1 - Math.abs(j - TILE_SIZE) / (TILE_SIZE - 2),
				)
				if (Math.abs(nois) < 0.5 * xRat * yRat) {
					for (let k = 0; k < 1; k++) {
						ct.fillStyle = oreColor
						let p = new Vec2(i, j)
						// .addAngle(rndAng(), rndFloat(-1) * 5)
						// ct.fillStyle = "rgba(0," + yRat * 255 + "," + 0 * 255 + ",1)"
						let rndW = rndInt(1, 4 * xRat) * bitSize
						let rndH = rndInt(1, 4 * yRat) * bitSize
						// ct.fillStyle = "black"
						let offset = bitSize
						ct.fillRect(p.x, p.y - offset, rndW, rndH)
						ct.fillStyle = "rgba(0,0,0," + rndFloat() * 0.4 + ")"
						ct.fillRect(p.x, p.y - offset + bitSize / 4, rndW, rndH)
						ct.fillStyle = "rgba(255,255,255," + rndFloat() * 0.4 + ")"
						ct.fillRect(
							p.x,
							p.y - offset - bitSize / 4 - bitSize / 4,
							rndW,
							rndH,
						)
					}
				}
			}
		}
	}

	if (typeKey == "GRASS") {
		let grassH = 16
		let bitSize = 16
		for (let i = 0; i < TILE_SIZE * 2; i += bitSize) {
			let p = new Vec2(i, TILE_SIZE * 0.4)
			let dir = -PI05 + ns(p, noiseOffset, 0.01) * 0.2
			let dirChange = ns(p, noiseOffset, 0.1) * 0.05

			let y = rndInt(1, grassH)
			let h = rndInt(1, grassH)

			ct.clearRect(i, 0, bitSize, y)

			ct.fillStyle = "rgba(0,0,0,0.5)"
			ct.fillRect(i, y + 8, bitSize, h)
			ct.fillStyle = "rgba(50," + rndInt(100, 160) + ",50,1)"
			ct.fillRect(i, y + 0, bitSize, h)
			// ct.beginPath()
			// ct.lineWidth = 2
			// ct.strokeStyle = "green"
			// p.moveTo(ct)
			// for (let j = 0; j < 6; j++) {
			// 	console.log(p)
			// 	p.addAngle(dir, 15.25 / (1 + j))
			// 	dir += dirChange
			// 	p.lineTo(ct)
			// }
			// ct.stroke()
			// ct.closePath()
			// }
		}
	}
	// document.body.appendChild(cnv)
	cnv.id = typeKey
	return cnv
}
