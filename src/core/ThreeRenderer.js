import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { store } from './Store.js';
import { getPlant } from '../data/plants.js';

export class ThreeRenderer {
  constructor(containerId, envControls = null) {
    this.container = document.getElementById(containerId);
    this.envControls = envControls;
    this.scene = new THREE.Scene();
    
    // Background color roughly matching the 2D surface background
    this.scene.background = new THREE.Color(0xf5f5f5);
    
    this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 1, 10000);
    this.camera.position.set(0, -600, 500); // Isometric-ish top angle viewing down
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    this.container.appendChild(this.renderer.domElement);
    
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // Materials that can be reused
    this.materials = {
      bedWall: new THREE.MeshLambertMaterial({ color: 0x8B5A2B }), // Wood brown
      bedSoil: new THREE.MeshLambertMaterial({ color: 0x3d2817 }), // Dark soil
      ground: new THREE.MeshLambertMaterial({ color: 0xe8f5e9 }) // Light grass green
    };

    // Emoji texture cache
    this.textureCache = {};

    this._setupLights();
    this._addGroundPlane();
    
    this.isRendering = false;
    this.animationId = null;

    // Window resize handler
    window.addEventListener('resize', () => {
      if (this.container.clientWidth === 0) return; // Hidden
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });
  }

  start() {
    if (this.isRendering) return;
    this.isRendering = true;
    this.rebuildScene();
    this._animate();
  }

  stop() {
    this.isRendering = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  _animate() {
    if (!this.isRendering) return;
    this.animationId = requestAnimationFrame(() => this._animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  _setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // Sun light (Directional)
    this.sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    this.sunLight.castShadow = true;
    
    // Configure shadow map size and bounds
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    const d = 1000;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 3000;
    
    this.scene.add(this.sunLight);
    
    this.updateSunPosition();
  }

  updateSunPosition() {
    if (!this.envControls) {
      this.sunLight.position.set(-200, -300, 600); // Default isometric sun
      return;
    }
    // Very basic mapping of 2D time/date sliders to a 3D position
    // E.g., time 6am -> east (x positive), 12pm -> south up (y neg, z high)
    const time = this.envControls.time || 12; // 6 to 20
    const season = this.envControls.season || 6; // 1 to 12
    
    // Normalized time: 0 = morning, 0.5 = noon, 1.0 = evening
    const t = (time - 6) / 14; 
    const angle = Math.PI * (1 - t); // PI to 0

    // Sun altitude (Z-axis in our coordinate system where Z is up)
    const maxAltitude = 500 + (300 * Math.sin((season / 12) * Math.PI)); // Higher in summer
    
    const x = Math.cos(angle) * 800;
    const y = -600; // Sun comes from the south (negative Y)
    const z = Math.sin(angle) * maxAltitude;
    
    this.sunLight.position.set(x, y, z);
    this.sunLight.target.position.set(0, 0, 0);
  }

  _addGroundPlane() {
    const geometry = new THREE.PlaneGeometry(8000, 8000);
    const plane = new THREE.Mesh(geometry, this.materials.ground);
    plane.receiveShadow = true;
    plane.position.z = -1; // Slightly below zero to avoid Z-fighting with flat beds
    this.scene.add(plane);
  }

  // Gets a texture for an Emoji by rendering it to an offscreen Canvas
  _getEmojiTexture(emoji) {
    if (this.textureCache[emoji]) return this.textureCache[emoji];
    
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Draw string
    ctx.font = '90px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 64, 74); // slight offset adjustment
    
    const texture = new THREE.CanvasTexture(canvas);
    this.textureCache[emoji] = texture;
    return texture;
  }

  // Clear all beds and plantings
  _clearDynamicObjects() {
    const toRemove = [];
    this.scene.children.forEach(child => {
      if (child.userData.isDynamic) toRemove.push(child);
    });
    toRemove.forEach(child => {
      this.scene.remove(child);
      if (child.geometry) child.geometry.dispose();
      // Materials might be shared, only dispose unique ones later if needed
    });
  }

  rebuildScene() {
    this._clearDynamicObjects();
    this.updateSunPosition();

    const beds = store.getBeds();
    
    // Calculate bounding box to center camera perfectly
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    beds.forEach(bed => {
      const group = new THREE.Group();
      group.userData.isDynamic = true;
      group.position.set(bed.x, bed.y, 0);
      
      if (bed.rotation) {
        group.rotation.z = -bed.rotation * Math.PI / 180;
      }
      
      // Keep track of gardening boundaries
      if (bed.x < minX) minX = bed.x;
      if (bed.y < minY) minY = bed.y;
      if (bed.x + bed.width > maxX) maxX = bed.x + bed.width;
      if (bed.y + bed.height > maxY) maxY = bed.y + bed.height;

      // 1. Build Bed Geometry
      const shape = new THREE.Shape();
      if (bed.type === 'rect') {
        shape.moveTo(0, 0);
        shape.lineTo(bed.width, 0);
        shape.lineTo(bed.width, bed.height);
        shape.lineTo(0, bed.height);
        shape.lineTo(0, 0);
      } else if (bed.type === 'circle') {
        const radius = bed.width / 2;
        shape.absarc(radius, radius, radius, 0, Math.PI * 2, false);
      } else if (bed.type === 'polygon' || bed.type === 'lshaped') {
        if (bed.points && bed.points.length > 0) {
          shape.moveTo(bed.points[0].x, bed.points[0].y);
          for (let i = 1; i < bed.points.length; i++) {
            shape.lineTo(bed.points[i].x, bed.points[i].y);
          }
          if (bed.isClosed !== false) {
             shape.lineTo(bed.points[0].x, bed.points[0].y);
          }
        }
      }

      // Height logic based on layer (pseudo height in our system for Hochbeet, etc)
      // Standard bed height is slightly extruded, Z-index implies a bit of height
      let wallHeight = bed.zIndex === 3 ? 40 : (bed.zIndex === 2 ? 15 : 2); // 40cm Hochbeet
      
      if (bed.type === 'line') wallHeight = 2; // path/line has no real height

      const extrudeSettings = { depth: wallHeight, bevelEnabled: false };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      
      // Bed Mesh (The walls / wood)
      const bedMesh = new THREE.Mesh(geometry, this.materials.bedWall);
      bedMesh.castShadow = true;
      bedMesh.receiveShadow = true;
      
      // Soil cap (slighly below the rim)
      const soilGeometry = new THREE.ExtrudeGeometry(shape, { depth: wallHeight - 2, bevelEnabled: false });
      const soilMesh = new THREE.Mesh(soilGeometry, this.materials.bedSoil);
      soilMesh.position.z = 2; // raise up internally
      soilMesh.receiveShadow = true;
      
      // Add meshes to group
      group.add(bedMesh);
      if (bed.type !== 'line') group.add(soilMesh); // Line usually path, no soil
      
      // 2. Add Plantings (Billboards)
      const plantings = store.getPlantings(bed.id).filter(p => !p.archived);
      plantings.forEach(p => {
         const tPlant = getPlant(p.name);
         // Average plant height mapping based on spacing / type
         const spacing = parseInt(p.spacing) || (tPlant ? parseInt(tPlant.spacing) : 30);
         // Height scales roughly with spacing. Small spacing = small plant. Large spacing = big plant.
         const height = Math.max(20, spacing * 1.5); 
         
         const emojiMat = new THREE.SpriteMaterial({ 
           map: this._getEmojiTexture(p.emoji),
           transparent: true
         });

         // Check if it has CAD intra-bed placements
         if (p.placements && p.placements.length > 0) {
            p.placements.forEach(loc => {
               if (loc.type === 'point') {
                  this._addPlantSprite(group, emojiMat, loc.x, loc.y, height, wallHeight);
               } else if (loc.type === 'line') {
                  const dist = Math.sqrt(Math.pow(loc.p2.x - loc.p1.x, 2) + Math.pow(loc.p2.y - loc.p1.y, 2));
                  const steps = Math.max(1, Math.floor(dist / spacing));
                  for (let i = 0; i <= steps; i++) {
                     const t = steps > 0 ? (i / steps) : 0;
                     const px = loc.p1.x + (loc.p2.x - loc.p1.x) * t;
                     const py = loc.p1.y + (loc.p2.y - loc.p1.y) * t;
                     this._addPlantSprite(group, emojiMat, px, py, height, wallHeight);
                  }
               } else if (loc.type === 'area') {
                  // Fill area with random scatter or grid
                  const padding = spacing / 2;
                  for (let ax = loc.x + padding; ax < loc.x + loc.w - padding; ax += spacing) {
                    for (let ay = loc.y + padding; ay < loc.y + loc.h - padding; ay += spacing) {
                       // Add a bit of jitter
                       const jitterX = (Math.random() - 0.5) * (spacing * 0.4);
                       const jitterY = (Math.random() - 0.5) * (spacing * 0.4);
                       this._addPlantSprite(group, emojiMat, ax + jitterX, ay + jitterY, height, wallHeight);
                    }
                  }
               }
            });
         } else {
            // Fallback for listings without CAD placements: Scatter them pseudo-randomly based on quantity
            const qty = p.quantity || 1;
            for (let i=0; i<qty; i++) {
               // Fallback within bounding box
               const px = (Math.random() * 0.8 + 0.1) * bed.width;
               const py = (Math.random() * 0.8 + 0.1) * bed.height;
               this._addPlantSprite(group, emojiMat, px, py, Math.max(15, spacing), wallHeight);
            }
         }
      });
      
      this.scene.add(group);
    });

    // Center Camera if it's the first build
    if (minX !== Infinity && this.controls.target.x === 0 && this.controls.target.y === 0) {
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      this.controls.target.set(cx, cy, 0);
      this.camera.position.set(cx, cy - 600, 500);
      this.controls.update();
    }
  }

  _addPlantSprite(group, material, x, y, height, zOffset) {
     const sprite = new THREE.Sprite(material);
     // Note: ThreeJS sprites scale uniformly. Height goes up from center
     sprite.scale.set(height, height, 1);
     // Sprite anchor is center. To put the base on the ground:
     sprite.position.set(x, y, zOffset + (height / 2));
     
     // To make sprites cast shadows, we actually need a custom shader or a dummy flat plane
     // But modern threeJS sprite shadows are complicated. Let's add a dummy shadow caster shape.
     const shadowCaster = new THREE.Mesh(
       new THREE.PlaneGeometry(height * 0.5, height),
       new THREE.MeshBasicMaterial({ visible: false }) // invisible
     );
     // Orient the plane to stand upright facing the sun roughly
     shadowCaster.rotation.x = Math.PI / 2;
     shadowCaster.position.set(x, y, zOffset + (height / 2));
     shadowCaster.castShadow = true;
     
     group.add(shadowCaster);
     group.add(sprite);
  }
}
