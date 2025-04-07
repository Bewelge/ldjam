// Import Three.js
import * as THREE from "three";
// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const TILE_SIZE = 32; // Set tile size to 32px
// Calculate how many tiles we can fit in the viewport
const tilesX = Math.ceil(window.innerWidth / TILE_SIZE);
const tilesY = Math.ceil(window.innerHeight / TILE_SIZE);
// Set up orthographic camera based on tile count
const camera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 0.1, 1000);
camera.position.z = 1;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Player state - position in tile coordinates
const player = {
    position: new THREE.Vector2(0, 0),
    speed: 4, // Tiles per second
};
// Terrain shade
const terrainVertexShader = `
  varying vec2 vUv;
  varying vec2 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const terrainFragmentShader = `
  uniform vec2 uPlayerPosition;
  uniform float uTime;
  uniform sampler2D uDirtTexture;
  uniform sampler2D uStoneTexture;
  uniform sampler2D uIronOreTexture;
  uniform sampler2D uGoldOreTexture;
  uniform sampler2D uDiamondTexture;
  
  varying vec2 vUv;
  varying vec2 vPosition;
  
  // Simple hash function
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  
  // 2D noise based on hash
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  
  // Fractal Brownian Motion (FBM)
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 3.0;
    
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return value;
  }
  
  void main() {
    // Convert world position to tile coordinates
    // We divide by tileSize in world units (which is 1.0 in our coordinate system)
    // since we're working with normalized coordinates in the shader
    vec2 tileCoord = floor(vPosition);
    
    // Get noise value for this tile - scale to make patterns more visible with 32px tiles
    float n = fbm(tileCoord * 0.1);
    
    // Sample another noise for ore type variation
    float oreNoise = fbm(tileCoord * 0.2 + 100.0);
    
    // Determine tile type based on noise value
    vec4 tileColor;
    
    // Top layer (near surface) - 0 to 50 blocks deep
    if (tileCoord.y > -50.0) {
      if (n < 0.3) {
        // Dirt
        tileColor = vec4(0.6, 0.4, 0.2, 1.0); // Brown
      } else if (n < 0.7) {
        // Stone
        tileColor = vec4(0.5, 0.5, 0.5, 1.0); // Gray
      } else {
        // Iron ore
        tileColor = vec4(0.6, 0.6, 0.7, 1.0); // Light bluish-gray
      }
    }
    // Middle layer - 50 to 100 blocks deep
    else if (tileCoord.y > -100.0) {
      if (n < 0.2) {
        // Stone
        tileColor = vec4(0.5, 0.5, 0.5, 1.0); // Gray
      } else if (n < 0.6) {
        // Iron ore
        tileColor = vec4(0.6, 0.6, 0.7, 1.0); // Light bluish-gray
      } else if (n < 0.85) {
        // Gold ore
        tileColor = vec4(0.9, 0.8, 0.2, 1.0); // Gold
      } else {
        // Diamond (rare)
        tileColor = vec4(0.2, 0.8, 0.8, 1.0); // Cyan
      }
    }
    // Deep layer - below 100 blocks
    else {
      if (n < 0.4) {
        // Stone
        tileColor = vec4(0.5, 0.5, 0.5, 1.0); // Gray
      } else if (n < 0.6) {
        // Gold ore
        tileColor = vec4(0.9, 0.8, 0.2, 1.0); // Gold
      } else if (n < 0.9) {
        // Diamond
        tileColor = vec4(0.2, 0.8, 0.8, 1.0); // Cyan
      } else {
        // Special rare ore
        tileColor = vec4(1.0, 0.2, 0.8, 1.0); // Pink
      }
    }
    
    // Add a grid pattern to visualize individual tiles
    vec2 grid = fract(vPosition);
    float gridLine = step(0.95, grid.x) + step(0.95, grid.y);
    tileColor = mix(tileColor, vec4(0.0, 0.0, 0.0, 1.0), gridLine * 0.5);
    
    gl_FragColor = tileColor;
  }
`;
// Create a plane for the terrain
// Size in tiles (add a few extra tiles beyond viewport for seamless scrolling)
const terrainTilesX = tilesX + 4;
const terrainTilesY = tilesY + 4;
// Ensure mesh vertices align with tile grid for precise rendering
const terrainGeometry = new THREE.PlaneGeometry(terrainTilesX, terrainTilesY, terrainTilesX, terrainTilesY);
const terrainMaterial = new THREE.ShaderMaterial({
    vertexShader: terrainVertexShader,
    fragmentShader: terrainFragmentShader,
    uniforms: {
        uPlayerPosition: { value: player.position },
        uTime: { value: 0 },
        uDirtTexture: { value: null },
        uStoneTexture: { value: null },
        uIronOreTexture: { value: null },
        uGoldOreTexture: { value: null },
        uDiamondTexture: { value: null },
    },
});
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
scene.add(terrain);
// Player representation (simple red square)
const playerGeometry = new THREE.PlaneGeometry(1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(playerMesh);
// Handle keyboard input
const keys = {};
window.addEventListener("keydown", e => {
    keys[e.key] = true;
});
window.addEventListener("keyup", e => {
    keys[e.key] = false;
});
// Handle window resize
window.addEventListener("resize", () => {
    // Recalculate tile counts based on new window size
    const tilesX = Math.ceil(window.innerWidth / TILE_SIZE);
    const tilesY = Math.ceil(window.innerHeight / TILE_SIZE);
    // Update camera frustum
    camera.left = -tilesX / 2;
    camera.right = tilesX / 2;
    camera.top = tilesY / 2;
    camera.bottom = -tilesY / 2;
    camera.updateProjectionMatrix();
    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
});
// Main animation loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    // Update player position based on input
    if (keys["w"] || keys["ArrowUp"])
        player.position.y += player.speed * deltaTime;
    if (keys["s"] || keys["ArrowDown"])
        player.position.y -= player.speed * deltaTime;
    if (keys["a"] || keys["ArrowLeft"])
        player.position.x -= player.speed * deltaTime;
    if (keys["d"] || keys["ArrowRight"])
        player.position.x += player.speed * deltaTime;
    // Update player mesh position
    playerMesh.position.set(player.position.x, player.position.y, 1);
    // Update camera to follow player
    camera.position.x = player.position.x;
    camera.position.y = player.position.y;
    // Update shader uniforms
    terrainMaterial.uniforms.uPlayerPosition.value = player.position;
    terrainMaterial.uniforms.uTime.value += deltaTime;
    // Update terrain position to follow player (creates the illusion of infinite terrain)
    // We move the terrain in chunks of terrainTilesX/Y to maintain seamless tiling
    terrain.position.x =
        Math.floor(player.position.x / terrainTilesX) * terrainTilesX;
    terrain.position.y =
        Math.floor(player.position.y / terrainTilesY) * terrainTilesY;
    renderer.render(scene, camera);
}
animate();
