 
import * as THREE from "three"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js"
 

const vertexShader = `precision highp float;

in vec3 position;
in vec3 normal;
in vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`;

const fragmentShader = `precision highp float;

in vec2 vUv;

uniform sampler2D map;
uniform sampler2D paper;
uniform vec3 colors[3];

out vec4 fragColor;

vec4 sampleSrc(in sampler2D src, in vec2 uv) {
  vec4 c = texture(src, uv);
  c = round(c*1.)/1.;
  return c;
}

vec4 findBorder(in sampler2D src, in vec2 uv, in vec2 resolution, in float width){
	float x = width / resolution.x;
	float y = width / resolution.y;
	vec4 horizEdge = vec4( 0.0 );
	horizEdge -= sampleSrc(src, vec2( uv.x - x, uv.y - y ) ) * 1.0;
	horizEdge -= sampleSrc(src, vec2( uv.x - x, uv.y     ) ) * 2.0;
	horizEdge -= sampleSrc(src, vec2( uv.x - x, uv.y + y ) ) * 1.0;
	horizEdge += sampleSrc(src, vec2( uv.x + x, uv.y - y ) ) * 1.0;
	horizEdge += sampleSrc(src, vec2( uv.x + x, uv.y     ) ) * 2.0;
	horizEdge += sampleSrc(src, vec2( uv.x + x, uv.y + y ) ) * 1.0;
	vec4 vertEdge = vec4( 0.0 );
	vertEdge -= sampleSrc(src, vec2( uv.x - x, uv.y - y ) ) * 1.0;
	vertEdge -= sampleSrc(src, vec2( uv.x    , uv.y - y ) ) * 2.0;
	vertEdge -= sampleSrc(src, vec2( uv.x + x, uv.y - y ) ) * 1.0;
	vertEdge += sampleSrc(src, vec2( uv.x - x, uv.y + y ) ) * 1.0;
	vertEdge += sampleSrc(src, vec2( uv.x    , uv.y + y ) ) * 2.0;
	vertEdge += sampleSrc(src, vec2( uv.x + x, uv.y + y ) ) * 1.0;
	vec4 edge = sqrt((horizEdge * horizEdge) + (vertEdge * vertEdge));
	return edge;
}

vec4 findBorder2(in sampler2D src, in vec2 uv, in vec2 resolution, in float width){
	float x = width / resolution.x;
	float y = width / resolution.y;
	vec4 horizEdge = vec4( 0.0 );
	horizEdge -= texture(src, vec2( uv.x - x, uv.y - y ) ) * 1.0;
	horizEdge -= texture(src, vec2( uv.x - x, uv.y     ) ) * 2.0;
	horizEdge -= texture(src, vec2( uv.x - x, uv.y + y ) ) * 1.0;
	horizEdge += texture(src, vec2( uv.x + x, uv.y - y ) ) * 1.0;
	horizEdge += texture(src, vec2( uv.x + x, uv.y     ) ) * 2.0;
	horizEdge += texture(src, vec2( uv.x + x, uv.y + y ) ) * 1.0;
	vec4 vertEdge = vec4( 0.0 );
	vertEdge -= texture(src, vec2( uv.x - x, uv.y - y ) ) * 1.0;
	vertEdge -= texture(src, vec2( uv.x    , uv.y - y ) ) * 2.0;
	vertEdge -= texture(src, vec2( uv.x + x, uv.y - y ) ) * 1.0;
	vertEdge += texture(src, vec2( uv.x - x, uv.y + y ) ) * 1.0;
	vertEdge += texture(src, vec2( uv.x    , uv.y + y ) ) * 2.0;
	vertEdge += texture(src, vec2( uv.x + x, uv.y + y ) ) * 1.0;
	vec4 edge = sqrt((horizEdge * horizEdge) + (vertEdge * vertEdge));
	return edge;
}

//
// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20201014 (stegu)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
  }

float fbm3(vec3 v) {
  float result = snoise(v);
  result += snoise(v * 2.) / 2.;
  result += snoise(v * 4.) / 4.;
  result /= (1. + 1./2. + 1./4.);
  return result;
}

vec2 disturb(in vec2 uv, in float noisiness, in float offset) {
  float ss = 10.;
  vec2 disp = .005  *noisiness * vec2(fbm3(vec3(ss*uv + vec2(offset, 0.), 1.)), fbm3(vec3(ss*uv.yx, 1.)));
  return uv + disp;
}

#define OCTAVES 6

float fbm(in vec2 st) {

  float value = 0.0;
  float amplitude = .5;
  float frequency = 0.;

  for (int i = 0; i < OCTAVES; i++) {
      value += amplitude * snoise(vec3(st, 0.));
      st *= 2.; //lacunarity: steps in which we increment de frequencies
      amplitude *= .5; //gain: decreases the amplitude
  }
  return value;
}

float ink(in vec2 uv) {
  return .5 + .5 * fbm(10. * uv);
}


vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}



float blendLinearBurn(float base, float blend) {
  return max(base+blend-1.0,0.0);
}

vec3 blendLinearBurn(vec3 base, vec3 blend) {
  return max(base+blend-vec3(1.0),vec3(0.0));
}

vec3 blendLinearBurn(vec3 base, vec3 blend, float opacity) {
  return (blendLinearBurn(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blend(in vec3 src, in vec3 blend, in float a) {
  return blendLinearBurn(src, blend, a);
}

void main() {

  vec3 up = colors[0];// vec3(230., 27., 95.) / 255.;
  vec3 left = colors[1];//vec3(220., 207., 198.) / 255.;
  vec3 right = colors[2];//vec3(76., 141., 299.) / 255.;

  float s = 10.;

  up = rgb2hsv(up);
  up.x += .1 * fbm(vUv * s);
  up = hsv2rgb(up);
  
  left = rgb2hsv(left);
  left.x += .1 * fbm(vUv * s);
  left = hsv2rgb(left);

  right = rgb2hsv(right);
  right.x += .1 * fbm(vUv * s);
  right = hsv2rgb(right);

  vec2 uvr = disturb(vUv, 1.2, 23234.);
  vec2 uvg = disturb(vUv, 1.2, 2324.);
  vec2 uvb = disturb(vUv, 1.2, 234.);
  vec2 uvBorder = disturb(vUv, 1.2, -1234.);
  
  vec2 size = vec2(textureSize(map, 0));
  vec4 srcR = sampleSrc(map, uvr);
  float hueUp = (1.5*(texture(map, uvr).g) - .5);

  vec4 srcG = sampleSrc(map, uvg);
  vec4 srcB = sampleSrc(map, uvb);
  float b = 1. - length(findBorder(map, vUv, size, .1));

  float aR = texture(map, uvr).a;
  float aG = texture(map, uvg).a;
  float aB = texture(map, uvb).a;

  float inkUp = ink(vUv);
  float inkLeft = ink(vUv*1.1);
  float inkRight = ink(vUv*.9);

  vec3 rup = rgb2hsv(up);
  rup.y += .1 * hueUp;
  rup.z += .1 * hueUp;
  rup = hsv2rgb(rup);

  vec3 c = vec3(1.);

  c = blend(c, rup, srcG.g * inkUp * aG);
  c = blend(c, left, srcB.b * inkLeft * aB );
  c = blend(c, right, srcR.r * inkRight * aR );

  vec2 pSize = vec2(textureSize(paper, 0));
  vec4 p = .5 + .5 * texture(paper, gl_FragCoord.xy / pSize);

  // fragColor.rgb = blend(p.rgb, c, 1.);
  fragColor.rgb = p.rgb * c;
  fragColor.rgb *= .99 + .01 * b;
    

  float shade = length(findBorder(map, uvBorder, size, .1).rgb);
  fragColor.rgb *= 1. - .1 * vec3(shade);

  fragColor = vec4(vec3(srcG.g * up * inkUp * aG + srcB.b * left * inkLeft  * aB + srcR.r * right * inkRight * aR), 1.);
}`;

const loader = new THREE.TextureLoader();
let resFn;
const loaded = new Promise((resolve, reject) => {
  resFn = resolve;
});
const paper = loader.load("Watercolor_ColdPress.jpg", resFn);

const waterColorShader = new THREE.RawShaderMaterial({
  uniforms: {
    map: { value: null },
    paper: { value: paper },
    colors: { value: null },
  },
  vertexShader,
  fragmentShader,
  glslVersion: THREE.GLSL3,
});

const waterColorPass = new ShaderPass(waterColorShader,"map");

export { waterColorPass, loaded };
