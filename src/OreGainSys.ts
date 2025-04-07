import { getColor } from "./Colors.js"
import { Ease } from "./easing.js"
import { player } from "./main.js"
import { TileType, TileTypes } from "./Tiles.js"
import {
	PI,
	PI05,
	PI2,
	rndFloat,
	rndInt,
	transformWorldToRenderP,
	Vec2,
} from "./util.js"

export class OreGainsSys {
	oreGains: OreGain[] = []

	constructor() {}
	add(opts: { p: Vec2; resourceId: TileType; amount: number }) {
		const { p, resourceId, amount } = opts
		const { name } = TileTypes[resourceId]
		const color = getColor(resourceId)
		const text = "+" + amount + " " + name
		this.oreGains.push(new OreGain({ p, color, text }))
	}
	render(ctx: CanvasRenderingContext2D) {
		for (let i = this.oreGains.length - 1; i >= 0; i--) {
			let part = this.oreGains[i]
			part.update()
			part.life--
			if (part.life <= 0) {
				this.oreGains.splice(i, 1)
				continue
			}

			part.render(ctx)
		}
	}
}
let theOreGainSys = new OreGainsSys()
export const addOreGain = (p: Vec2, resourceId: TileType, amount: number) => {
	theOreGainSys.add({ p, resourceId, amount })
}
export const renderOreGain = (ct: CanvasRenderingContext2D) => {
	theOreGainSys.render(ct)
}
class OreGain {
	p: Vec2

	color: string
	text: string
	life: number
	startLife: number
	constructor(opts: { p: Vec2; text: string; color: string }) {
		this.p = opts.p
		this.text = opts.text
		this.startLife = 50
		this.life = this.startLife
		this.color = opts.color
	}
	update() {
		this.p.add(0, (-5 * this.life) / this.startLife)
	}
	render(ct: CanvasRenderingContext2D) {
		let trans = transformWorldToRenderP(this.p)
		ct.fillStyle = this.color
		ct.strokeStyle = "black"
		ct.lineWidth = 0.5
		let rat = 1 - this.life / this.startLife
		let ratBreak = 0.8
		let rat0 = Ease.easeInOutQuad(Math.min(1, rat / ratBreak))
		let rat1 = Math.min(1, (rat - ratBreak) / (1 - ratBreak))
		let size = rat < ratBreak ? 14 + 10 * rat0 : 24 - 10 * rat1
		ct.font = "bold " + size + "px Arial"
		let wd = ct.measureText(this.text).width / 2
		ct.lineWidth = 2
		ct.globalAlpha = rat < ratBreak ? 1 : 1 - rat1
		ct.strokeText(
			this.text,
			trans.x - player.position.x - wd + Math.sin(this.life * 0.01) * 4,
			trans.y - player.position.y + Math.sin(this.life * 0.1) * 4,
		)
		ct.fillText(
			this.text,
			trans.x - player.position.x - wd + Math.sin(this.life * 0.01 + PI05) * 4,
			trans.y - player.position.y + Math.sin(this.life * 0.1 + PI05) * 4,
		)
		ct.globalAlpha = 1
		// ct.beginPath()
		// ct.fill()
		// ct.stroke()
		// ct.closePath()
	}
}
