import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./main.js";
import { noise } from "./noise.js";
import * as THREE from "three";
export var scale = 1;
export let width = 2000 * scale;
export let height = 2000 * scale;
export const PI = Math.PI;
export const PI2 = Math.PI * 2;
export const PI05 = Math.PI * 0.5;
export class Vec2 {
    constructor(x = 0, y = 0) {
        this._x = x;
        this._y = y;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get length() {
        return this.distanceToOrigin();
    }
    addVector(vector) {
        this._x += vector.x;
        this._y += vector.y;
        return this;
    }
    add(x, y) {
        this._x += x;
        this._y += y;
        return this;
    }
    normalize() {
        let v = Math.sqrt(this._x * this._x + this._y * this._y);
        this._x /= v;
        this._y /= v;
        return this;
    }
    subtractVector(vector) {
        this._x -= vector.x;
        this._y -= vector.y;
        return this;
    }
    addAngle(angle, dist) {
        this._x += Math.cos(angle) * dist;
        this._y += Math.sin(angle) * dist;
        return this;
    }
    multiply(number) {
        this._x *= number;
        this._y *= number;
        return this;
    }
    floor() {
        this._x = Math.floor(this._x);
        this._y = Math.floor(this._y);
        return this;
    }
    ceil() {
        this._x = Math.ceil(this._x);
        this._y = Math.ceil(this._y);
        return this;
    }
    round() {
        this._x = Math.round(this._x);
        this._y = Math.round(this._y);
        return this;
    }
    rotateAround(vec, ang) {
        let curAng = this.angleTo(vec);
        let dis = vec.distanceTo(this);
        let newP = vec.copy().addAngle(curAng + ang, -dis);
        this._x = newP.x;
        this._y = newP.y;
        return this;
    }
    ceiling(num) {
        this._x = Math.min(num, this._x);
        this._y = Math.min(num, this._y);
        return this;
    }
    bottom(num) {
        this._x = Math.max(num, this._x);
        this._y = Math.max(num, this._y);
        return this;
    }
    peg(min, max) {
        this.ceiling(max);
        this.bottom(min);
        return this;
    }
    distanceTo(vector) {
        return distancePoints(this, vector);
    }
    distanceToOrigin() {
        return distancePoints(this, Vec2.origin());
    }
    angleTo(vector) {
        return anglePoints(this, vector);
    }
    angleToOrigin() {
        return this.angleTo(Vec2.origin());
    }
    copy() {
        return new Vec2(this._x, this._y);
    }
    isInBound(marg = 0) {
        return !this.isOutOfBounds(marg);
    }
    isOutOfBounds(marg = 0) {
        return (this._x < marg ||
            this._x > width - marg ||
            this._y < marg ||
            this._y > height - marg);
    }
    getPixelIndex() {
        return this._x * 4 + this._y * 4 * width;
    }
    translate(ct) {
        ct.translate(this.x, this.y);
    }
    mirrorAcross(p0, p1) {
        let vx = p1.x - p0.x;
        let vy = p1.y - p0.y;
        let x = p0.x - this.x;
        let y = p0.y - this.y;
        let r = 1 / (vx * vx + vy * vy);
        this._x = this.x + 2 * (x - x * vx * vx * r - y * vx * vy * r);
        this._y = this.y + 2 * (y - y * vy * vy * r - x * vx * vy * r);
        return this;
    }
    debug(ct, col = "red") {
        ct.save();
        ct.fillStyle = col;
        ct.strokeStyle = col;
        ct.globalCompositeOperation = "source-over";
        ct.beginPath();
        ct.arc(this.x, this.y, rndInt(1, 1), 0, PI2);
        ct.stroke();
        ct.fill();
        ct.closePath();
        ct.restore();
        return this;
    }
    static middle(w = width, h = height) {
        return new Vec2(w / 2, h / 2);
    }
    static middleOf(vec1, vec2, a = 0.5) {
        return new Vec2(vec1.x * (1 - a) + a * vec2.x, vec1.y * (1 - a) + a * vec2.y);
    }
    static random(margin = 0, x = width, y = height) {
        return new Vec2(rndInt(margin, x - margin), rndInt(margin, y - margin));
    }
    static create(x, y) {
        return new Vec2(x, y);
    }
    static origin() {
        return new Vec2(0, 0);
    }
    moveTo(ct) {
        ct.moveTo(this.x, this.y);
        return this;
    }
    lineTo(ct) {
        ct.lineTo(this.x, this.y);
        return this;
    }
    arc(ct, rad) {
        ct.arc(this.x, this.y, rad, 0, PI2, false);
        return this;
    }
    ellipse(ct, radX, radY, rot = 0) {
        ct.ellipse(this.x, this.y, radX, radY, rot, 0, PI2, false);
        return this;
    }
    fill(ct) {
        ct.fill();
        return this;
    }
    stroke(ct) {
        ct.stroke();
        return this;
    }
    strokefill(ct) {
        ct.stroke();
        ct.fill();
        return this;
    }
    fillstroke(ct) {
        ct.fill();
        ct.stroke();
        return this;
    }
    path(ct) {
        ct.beginPath();
        return this;
    }
    close(ct) {
        ct.closePath();
        return this;
    }
}
var rndGen;
function sfc32(a, b, c, d) {
    return function () {
        a |= 0;
        b |= 0;
        c |= 0;
        d |= 0;
        let t = (((a + b) | 0) + d) | 0;
        d = (d + 1) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
    };
}
export function rnd() {
    return rndGen();
}
export const seedRndGen = (date) => {
    let hash = cyrb128(date.toISOString());
    console.log("Hash", hash);
    rndGen = sfc32(...hash);
};
function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    (h1 ^= h2 ^ h3 ^ h4), (h2 ^= h1), (h3 ^= h1), (h4 ^= h1);
    return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}
function turnTowards(ang0, ang1) {
    let diff = ang0 - ang1;
    if (diff < -PI) {
        diff += PI2;
    }
    if (diff > PI) {
        diff -= PI2;
    }
    return diff;
}
function anglePoints(point1, point2) {
    return Math.atan2(point2.y - point1.y, point2.x - point1.x);
}
function distancePoints(point1, point2) {
    return Math.sqrt((point1.x - point2.x) * (point1.x - point2.x) +
        (point1.y - point2.y) * (point1.y - point2.y));
}
function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}
export function clamp(val, min = 0, max = 1) {
    return Math.min(max, Math.max(min, val));
}
export function rndFloat(min = 0, max = 1) {
    return min + (max - min) * rnd();
}
export function rndInt(min = 0, max = 1) {
    return Math.floor(min + (max - min) * rnd() + 0.5);
}
export function rndAng() {
    return rndFloat(0, Math.PI * 2);
}
export function rndSign() {
    let num = rndFloat(-1, 1);
    while (num == 0) {
        num = rndFloat(-1, 1);
    }
    return Math.sign(num);
}
export function rndArr(list) {
    return list[rndInt(0, list.length - 1)];
}
export function peg(val, min = 0, max = 1) {
    return Math.min(max, Math.max(min, val));
}
export function ns(p, off, res) {
    return noise.simplex2((p.x % 1000) * res + off.x, (p.y % 1000) * res + off.y);
}
export function ns3(p, off, res) {
    return noise.simplex3(p.x * res + off.x, p.y * res + off.y, p.z * res + off.y + off.x);
}
export class Line {
    constructor(pts) {
        this.pts = pts;
        this.distances = pts.map((pt, i) => i < pts.length - 1 ? pt.distanceTo(pts[i + 1]) : 0);
        this._length = this.distances.reduce((prev, curr) => prev + curr, 0);
    }
    get length() {
        return this._length;
    }
    getPosAt(rat) {
        if (rat < 0) {
            let firstLength = this.distances[0];
            let firstAng = this.pts[0].angleTo(this.pts[1]);
            return this.pts[0].copy().addAngle(firstAng, -firstLength);
        }
        let lengthAt = this.length * rat;
        let curLength = 0;
        let lastP = this.pts[0];
        for (let i = 1; i < this.pts.length; i++) {
            let thisPt = this.pts[i];
            let dis = this.distances[i - 1];
            if (curLength + dis >= lengthAt) {
                return Vec2.middleOf(lastP, thisPt, (dis - (curLength + dis - lengthAt)) / dis);
            }
            curLength += dis;
            lastP = thisPt;
        }
        return lastP;
        console.log(this.pts, lastP, curLength, lengthAt, this.length, rat);
    }
    getAngleAt(rat) {
        if (rat > 0.9999) {
            rat = 0.99989;
        }
        let p0 = this.getPosAt(rat);
        let p1 = this.getPosAt(rat + 0.0001);
        try {
            return p0.angleTo(p1);
        }
        catch (error) {
            console.log(error);
        }
    }
    getPoints(num = 10) {
        return Array(num + 1)
            .fill(0)
            .map((_, i) => this.getPosAt(i / num));
    }
}
export function centerGeometry(geom) {
    geom.computeBoundingBox();
    const bbox = geom.boundingBox;
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    // This will shift your geometry so that its center is at (0, 0, 0)
    geom.translate(-center.x, -center.y, -center.z);
    return center;
}
export function transformWorldToRenderP(p) {
    return p.copy().add(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}
// x: gridX * TILE_SIZE + CANVAS_WIDTH / 2,
// y: 350 + gridY * TILE_SIZE - TILE_SIZE / 2 - TILE_SIZE,
