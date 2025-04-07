import { player } from "./main.js";
import { PI05, rndFloat, rndInt, transformWorldToRenderP, Vec2, } from "./util.js";
export class ParticlesSys {
    constructor(opts) {
        this.particles = [];
        const { angRange, amount, color, p } = opts;
        this.color = opts.color;
        for (let i = 0; i < amount; i++) {
            let ang = angRange.min +
                ((angRange.max - angRange.min) * (i + 0.5)) / amount +
                (i / amount) * rndFloat(-1) * 0.2;
            this.particles.push(new Particle({
                p: p.copy(),
                mot: new Vec2().addAngle(ang, rndFloat(2.4, 5.2)),
                // rad:rndFloat(2,4),
                color,
                life: rndInt(5, 15),
            }));
        }
    }
    render(ctx) {
        ctx.fillStyle = this.color;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let part = this.particles[i];
            part.update();
            part.life--;
            if (part.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            part.render(ctx);
        }
    }
}
class Particle {
    constructor(opts) {
        this.p = opts.p;
        this.mot = opts.mot;
        this.rad = rndFloat(1, 6);
        this.life = opts.life;
        this.color = opts.color;
        this.shade = rndFloat(0.1, 0.6);
    }
    update() {
        this.p.addVector(this.mot.copy().multiply(0.5));
        this.mot.multiply(0.95);
    }
    render(ct) {
        let trans = transformWorldToRenderP(this.p);
        ct.fillStyle = this.color;
        ct.fillRect(trans.x -
            player.position.x -
            this.rad +
            Math.sin(this.life * 0.1 + PI05) * 4, trans.y -
            player.position.y -
            this.rad +
            Math.sin(this.life * 0.1 + PI05) * 4, this.rad * 2, this.rad * 2);
        ct.fillStyle = "rgba(0,0,0," + this.shade + ")";
        ct.fillRect(trans.x - player.position.x - this.rad + Math.sin(this.life * 0.1) * 4, trans.y - player.position.y - this.rad + Math.sin(this.life * 0.1) * 4, this.rad * 2, this.rad * 2);
        // ct.beginPath()
        // ct.arc(
        // 	trans.x - player.position.x,
        // 	trans.y - player.position.y,
        // 	this.rad,
        // 	0,
        // 	PI2,
        // )
        // ct.fill()
        // ct.stroke()
        // ct.closePath()
    }
}
