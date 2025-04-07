// const blur13 = `
// vec4 blur13(sampler2D image, vec2 uv, vec2 direction) {
//   vec2 resolution = vec2(textureSize(image,0));
//   vec4 color = vec4(0.0);
//   vec2 off1 = vec2(1.411764705882353) * direction;
//   vec2 off2 = vec2(3.2941176470588234) * direction;
//   vec2 off3 = vec2(5.176470588235294) * direction;
//   color += texture(image, uv) * 0.1964825501511404;
//   color += texture(image, uv + (off1 / resolution)) * 0.2969069646728344;
//   color += texture(image, uv - (off1 / resolution)) * 0.2969069646728344;
//   color += texture(image, uv + (off2 / resolution)) * 0.09447039785044732;
//   color += texture(image, uv - (off2 / resolution)) * 0.09447039785044732;
//   color += texture(image, uv + (off3 / resolution)) * 0.010381362401148057;
//   color += texture(image, uv - (off3 / resolution)) * 0.010381362401148057;
//   return color;
// }
// `;

// const blurShader = `
// precision highp float;

// uniform sampler2D inputTexture;
// uniform vec2 direction;

// in vec2 vUv;

// out vec4 color;

// ${blur13}

// void main() {
//   color = blur13(inputTexture, vUv, direction);
// }`;

// export { blurShader };


// import * as THREE from "three"
// import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js"
 
 
//   const blurShaderMat = new THREE.RawShaderMaterial({
//     uniforms: {
//       inputTexture: { value: null },
//       direction: { value: new THREE.Vector2(0, 1) },
//     },
//     vertexShader: `precision highp float;

// in vec3 position;
// in vec2 uv;

// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;

// out vec2 vUv;

// void main() {
//   vUv = uv;
//   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1. );
// }`,
//     fragmentShader: blurShader,
//     glslVersion: THREE.GLSL3,
//   });
  
//   class BlurPass {
//     strength: number;
//     levels: number;
//     blurPasses: never[];
//     width: number;
//     height: number;
//     aspectRatio: number;
//     output: any;
//     constructor(strength = 1, levels = 5) {
//       this.strength = strength;
//       this.levels = levels;
//       this.blurPasses = [];
//       this.width = 1;
//       this.height = 1;
//       this.aspectRatio = 1;
//       for (let i = 0; i < this.levels; i++) {
//         const blurPass = new ShaderPingPongPass(blurShaderMat, {
//           format: THREE.RGBAFormat,
//         });
//         this.blurPasses.push(blurPass);
//       }
//     }
  
//     setSize(w, h) {
//       this.width = w;
//       this.height = h;
//       this.aspectRatio = w / h;
//       let tw = w;
//       let th = h;
//       for (let i = 0; i < this.levels; i++) {
//         tw /= 2;
//         th /= 2;
//         tw = Math.round(tw);
//         th = Math.round(th);
//         this.blurPasses[i].setSize(tw, th);
//       }
//     }
  
//     set source(texture) {
//       blurShader.uniforms.inputTexture.value = texture;
//     }
  
//     render(renderer) {
//       let offset = this.strength;
//       const u = blurShader.uniforms;
//       for (let j = 0; j < this.levels; j++) {
//         const blurPass = this.blurPasses[j];
  
//         u.direction.value.set(offset, 0);
//         blurPass.render(renderer);
  
//         u.inputTexture.value = blurPass.current.texture;
//         u.direction.value.set(0, offset / 2);
  
//         blurPass.render(renderer);
//         u.inputTexture.value = blurPass.current.texture;
//         this.output = blurPass.current.texture;
//       }
//     }
//   }
  
//   export { BlurPass };