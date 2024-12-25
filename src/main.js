import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GUI } from 'dat.gui'; // Import dat.GUI
// Import custom object creation functions
import { 
    createChair, createdesk, createaircon, 
    createflower, createframe, createdispenser, created_design1, 
    created_design2, created_design3, created_floor, created_hallchairs,
    created_cheaproom, created_fence, created_statue, created_ceiling,
    created_nearstatue 
  } from './js/objects.js';
  

  import { loadWall } from './js/design.js';
  

//================================================================
// Scene Setup
//================================================================
const scene = new THREE.Scene();
//scene.background = new THREE.Color(0x2f303d); // Default background color
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('webgl-container').appendChild(renderer.domElement);


const textureLoader = new THREE.TextureLoader();

//================================================================
// Fog Setup
//================================================================
let fogDensity = 0.0030; // Adjusted density for fog
let fogColor = new THREE.Color(0xaaaaaa); // Set initial fog color (light gray)
scene.fog = new THREE.FogExp2(fogColor, fogDensity); // Exponential fog (color, density)


//================================================================
// Lighting Setup
//================================================================
const ambientLight = new THREE.AmbientLight(0x635900, 0.1); // Ambient light to illuminate all objects
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x635900, 0.010); // White directional light
directionalLight.position.set(-15.36, -50, 50).normalize(); // Light source position
scene.add(directionalLight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // For softer shadows


/*
//================================================================
// Lighting Setup
//================================================================
const ambientLight = new THREE.AmbientLight(0x635900, 0.1); // Ambient light to illuminate all objects
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x635900, 0.010); // White directional light
directionalLight.position.set(-15.36, -50, 50).normalize(); // Light source position
scene.add(directionalLight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // For softer shadows


*/

const localizedDirectionalLight = new THREE.DirectionalLight(0xffcc00, 1.0);

// Position it in your specific area
localizedDirectionalLight.position.set(-15.36, -50, 50); // Position it at (-115, -39, -40)

// Set the light's target to the area you want to illuminate
localizedDirectionalLight.target.position.set(29, 7, -28); // Focus it downward toward the ground

// Enable shadows for more localized effects
localizedDirectionalLight.castShadow = true;
localizedDirectionalLight.shadow.mapSize.width = 1024;  // Higher value for better resolution
localizedDirectionalLight.shadow.mapSize.height = 1024;
localizedDirectionalLight.shadow.camera.near = 0.1;  // Set the shadow camera near
localizedDirectionalLight.shadow.camera.far = 500;  // Set the shadow camera far (to control distance)

// Add the light to the scene
scene.add(localizedDirectionalLight);
scene.add(localizedDirectionalLight.target);


// Load the sound effect
const sparkSound = new Audio('sounds/Electricity spark sound effects HQ.mp3'); // Replace with the correct sound file path
sparkSound.volume = 1.0; // Set the volume to maximum (range: 0.0 to 1.0)


// Wait for the sound to be loaded and ensure the duration is valid before using it
sparkSound.addEventListener('loadedmetadata', () => {
  // The sound is loaded and duration is available, you can start using it
  console.log('Sound loaded, duration:', sparkSound.duration);
});

function flickerLight() {
  const flashCount = Math.floor(Math.random() * 6) + 3; // Random flashes (3 to 8)
  let currentFlash = 0;

  function flash() {
    if (currentFlash < flashCount) {
      // Decide if the light should flicker
      const isFlickering = Math.random() > 0.5; // 50% chance of flickering

      if (isFlickering) {
        // Flickering: Set random light intensity and play the sound
        ambientLight.intensity = Math.random() * 0.7 + 0.1; // Intensity: 0.1 to 0.8
        
        // Start the sound at a random time within its duration, but check if duration is valid
        if (sparkSound.paused && !isNaN(sparkSound.duration)) {
          const randomStartTime = Math.random() * sparkSound.duration; // Random start between 0 and the sound's duration
          sparkSound.currentTime = randomStartTime; // Set the random start time
          sparkSound.play();
        }
      } else {
        // Not flickering: Dim the light and stop the sound
        ambientLight.intensity = 1; // Normal ambient light
        if (!sparkSound.paused) {
          sparkSound.pause(); // Stop the sound if it's playing
        }
      }

      currentFlash++;

      // Random delay between each flash (50ms to 150ms)
      setTimeout(flash, Math.random() * 100 + 50);
    } else {
      // End of flashes: Dim the light, stop the sound, and wait for the next sequence
      ambientLight.intensity = 0.1; // Minimal ambient light during delay
      if (!sparkSound.paused) {
        sparkSound.pause(); // Ensure sound is stopped
      }
      setTimeout(flickerLight, 5000); // 5-second delay before the next sequence
    }
  }

  flash(); // Start the flashing sequence
}

// Start the flickering effect
flickerLight();




//================================================================
// Wall Setup (Front, Back, Left, Right)
//================================================================

// Front Wall
const frontWallTexture = textureLoader.load('images/texture/tile.jpg'); // Front wall texture
frontWallTexture.wrapS = THREE.RepeatWrapping;
frontWallTexture.wrapT = THREE.RepeatWrapping;
frontWallTexture.repeat.set(30, 10); // Scale texture to fit

const frontWallMaterial = new THREE.MeshStandardMaterial({ 
    map: frontWallTexture, 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5 // Optional: for added shininess
});
const frontWall = new THREE.Mesh(new THREE.BoxGeometry(100, 40, 1), frontWallMaterial);
frontWall.position.z = -50;
frontWall.castShadow = true;
frontWall.receiveShadow = true;
scene.add(frontWall);

// Back Wall
const backWallTexture = textureLoader.load('/images/texture/tile.jpg'); // Back wall texture
backWallTexture.wrapS = THREE.RepeatWrapping;
backWallTexture.wrapT = THREE.RepeatWrapping;
backWallTexture.repeat.set(30, 10); // Adjust the repeat scale

const backWallMaterial = new THREE.MeshStandardMaterial({ 
    map: backWallTexture, 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const backWall = new THREE.Mesh(new THREE.BoxGeometry(100, 40, 1), backWallMaterial);
backWall.position.z = 50;
backWall.castShadow = true;
backWall.receiveShadow = true;
scene.add(backWall);

// Left Wall
const leftWallTexture = textureLoader.load('/images/texture/tile.jpg'); // Left wall texture
leftWallTexture.wrapS = THREE.RepeatWrapping;
leftWallTexture.wrapT = THREE.RepeatWrapping;
leftWallTexture.repeat.set(30, 10); // Adjust the repeat scale

const leftWallMaterial = new THREE.MeshStandardMaterial({ 
    map: leftWallTexture, 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, 40, 100), leftWallMaterial);
leftWall.position.set(-52, 2, -1);
leftWall.scale.set(1, 2, 0.6);

leftWall.castShadow = true;
leftWall.receiveShadow = true;
scene.add(leftWall);

// Left Wall 1
const left1WallTexture = textureLoader.load('/images/texture/tile.jpg'); // Left wall texture
left1WallTexture.wrapS = THREE.RepeatWrapping;
left1WallTexture.wrapT = THREE.RepeatWrapping;
left1WallTexture.repeat.set(30, 10); // Adjust the repeat scale

const left1WallMaterial = new THREE.MeshStandardMaterial({ 
    map: left1WallTexture, 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const left1Wall = new THREE.Mesh(new THREE.BoxGeometry(1, 40, 100), left1WallMaterial);
left1Wall.scale.set(8, 0.3, 0.3);
left1Wall.position.set(-44, 20, 35);

left1Wall.castShadow = true;
left1Wall.receiveShadow = true;
scene.add(left1Wall);

// Right Wall
const rightWallTexture = textureLoader.load('/images/texture/tile.jpg'); // Right wall texture
rightWallTexture.wrapS = THREE.RepeatWrapping;
rightWallTexture.wrapT = THREE.RepeatWrapping;
rightWallTexture.repeat.set(30, 10); // Adjust the repeat scale

const rightWallMaterial = new THREE.MeshStandardMaterial({ 
    map: rightWallTexture, 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, 40, 100), rightWallMaterial);
rightWall.position.x = 50;
rightWall.castShadow = true;
rightWall.receiveShadow = true;
scene.add(rightWall);

//================================================================
// Ceiling and Floor Setup
//================================================================
/*
// Ceiling
const ceilingTexture = textureLoader.load('/images/texture/tile.jpg'); // Ceiling texture
ceilingTexture.wrapS = THREE.RepeatWrapping;
ceilingTexture.wrapT = THREE.RepeatWrapping;
ceilingTexture.repeat.set(30, 10); // Adjust the repeat scale

const ceilingMaterial = new THREE.MeshStandardMaterial({ 
    map: ceilingTexture,
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), ceilingMaterial);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 22; // Place it above the floor
ceiling.receiveShadow = true;
scene.add(ceiling);
*/
// Floor
const floorTexture = textureLoader.load('/images/texture/tile.jpg'); // Floor texture (same texture as ceiling)
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(30, 10); // Adjust the repeat scale

const floorMaterial = new THREE.MeshStandardMaterial({ 
    map: floorTexture, 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), floorMaterial);
floor.rotation.x = Math.PI / -2; // Rotate to make it horizontal
floor.position.y = 0; // Place it on the ground
floor.receiveShadow = true;
scene.add(floor);




/*

// New Floor (Renamed to alternateFloor to avoid confusion)
const NORMALLTexture = textureLoader.load(''); // Same texture as floor
NORMALLTexture.wrapS = THREE.RepeatWrapping;
NORMALLTexture.wrapT = THREE.RepeatWrapping;
NORMALLTexture.repeat.set(30, 10); // Adjust the repeat scale

const NORMALLTextureFloorMaterial = new THREE.MeshStandardMaterial({ 
    map: NORMALLTexture, 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const NORMAL = new THREE.Mesh(new THREE.BoxGeometry(40, 35, 1), NORMALLTextureFloorMaterial);
NORMAL.receiveShadow = true;
scene.add(NORMAL);

*/




// New Floor (Renamed to alternateFloor to avoid confusion)
const alternateFloorTexture = textureLoader.load('/images/texture/tile.jpg'); // Same texture as floor
alternateFloorTexture.wrapS = THREE.RepeatWrapping;
alternateFloorTexture.wrapT = THREE.RepeatWrapping;
alternateFloorTexture.repeat.set(30, 10); // Adjust the repeat scale

const alternateFloorMaterial = new THREE.MeshStandardMaterial({ 
    map: alternateFloorTexture, 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const alternateFloor = new THREE.Mesh(new THREE.BoxGeometry(40, 35, 1), alternateFloorMaterial);
alternateFloor.rotation.y = Math.PI / 2; // Rotate to make it horizontal
alternateFloor.position.set(33, 2, 33.6); // Set position
                    //nipis     //width    //heigh
alternateFloor.scale.set(0.040,         1,          22); // Shrink width to create space for the door
alternateFloor.receiveShadow = true;
scene.add(alternateFloor);



//left

const LEFT1Texture = textureLoader.load('/images/texture/tile.jpg'); // Same texture as floor
LEFT1Texture .wrapS = THREE.RepeatWrapping;
LEFT1Texture .wrapT = THREE.RepeatWrapping;
LEFT1Texture .repeat.set(30, 10); // Adjust the repeat scale

const LEFT1TextureMaterial = new THREE.MeshStandardMaterial({ 
    map: LEFT1Texture , 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const LEFT1Floor = new THREE.Mesh(new THREE.BoxGeometry(40, 35, 1), LEFT1TextureMaterial);
LEFT1Floor.rotation.y = Math.PI / 2; // Rotate to make it horizontal
LEFT1Floor.position.set(24, 2, 50); // Set position
                    //nipis     //width    //heigh
LEFT1Floor.scale.set(0.1, 0.5, 2); // Shrink width to create space for the door
LEFT1Floor.receiveShadow = true;
scene.add(LEFT1Floor);


//top
const topTexture = textureLoader.load('/images/texture/tile.jpg'); // Same texture as floor
topTexture .wrapS = THREE.RepeatWrapping;
topTexture .wrapT = THREE.RepeatWrapping;
topTexture .repeat.set(30, 10); // Adjust the repeat scale

const top1TextureMaterial = new THREE.MeshStandardMaterial({ 
    map: topTexture , 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const topFloor = new THREE.Mesh(new THREE.BoxGeometry(40, 35, 1), top1TextureMaterial);
topFloor.rotation.y = Math.PI / 2; // Rotate to make it horizontal
topFloor.position.set(24, 16, 45); // Set position
                    //nipis     //width    //heigh
                    topFloor.scale.set(0.3, 0.4, 2); // Shrink width to create space for the door
                    topFloor.receiveShadow = true;
scene.add(topFloor);

//ceiling room
const ceilingTexture = textureLoader.load('/images/texture/tile.jpg'); // Same texture as floor
ceilingTexture .wrapS = THREE.RepeatWrapping;
ceilingTexture .wrapT = THREE.RepeatWrapping;
ceilingTexture .repeat.set(30, 10); // Adjust the repeat scale

const ceilingTextureMaterial = new THREE.MeshStandardMaterial({ 
    map: ceilingTexture , 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const ceiling1 = new THREE.Mesh(new THREE.BoxGeometry(40, 35, 1), ceilingTextureMaterial);
ceiling1.rotation.x = Math.PI / 2; // Rotate to make it horizontal
ceiling1.position.set(42, 13.4, 45); // Set position
                    //nipis     //width    //heigh
                    ceiling1.scale.set(0.8, 1, 0.5); // Shrink width to create space for the door
                    ceiling1.receiveShadow = true;
scene.add(ceiling1);

//carpet

const carpetTexture = textureLoader.load('/images/texture/tile.jpg'); // Same texture as floor
carpetTexture .wrapS = THREE.RepeatWrapping;
carpetTexture .wrapT = THREE.RepeatWrapping;
carpetTexture .repeat.set(30, 10); // Adjust the repeat scale

const carpetTextureTextureMaterial = new THREE.MeshStandardMaterial({ 
    map: carpetTexture , 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const carpet = new THREE.Mesh(new THREE.BoxGeometry(40, 35, 1), carpetTextureTextureMaterial);
carpet.rotation.x = Math.PI / 2; // Rotate to make it horizontal
carpet.position.set(37, -0, 35); // Set position
                    //nipis     //width    //heigh
                    carpet.scale.set(0.4, 0.5, 0.2); // Shrink width to create space for the door
                    carpet.receiveShadow = true;
scene.add(carpet);

//OFFICE AREA-------------------------------------------------------------------

//right wall second path
const RWSPTexture = textureLoader.load('/images/texture/tile.jpg'); // Same texture as floor
RWSPTexture .wrapS = THREE.RepeatWrapping;
RWSPTexture .wrapT = THREE.RepeatWrapping;
RWSPTexture .repeat.set(30, 10); // Adjust the repeat scale

const RWSPTextureTextureMaterial = new THREE.MeshStandardMaterial({ 
    map: RWSPTexture , 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const RWSP = new THREE.Mesh(new THREE.BoxGeometry(40, 35, 1), RWSPTextureTextureMaterial);
RWSP.rotation.y = Math.PI / 2; // Rotate to make it horizontal
RWSP.position.set(24, 2, 17); // Set position
                    //nipis     //width    //heigh
                    RWSP.scale.set(1.2, 1, 2); // Shrink width to create space for the door
                    RWSP.receiveShadow = true;
scene.add(RWSP);

//left wall second path
const LWSPTexture = textureLoader.load('/images/texture/tile.jpg'); // Same texture as floor
LWSPTexture .wrapS = THREE.RepeatWrapping;
LWSPTexture .wrapT = THREE.RepeatWrapping;
LWSPTexture .repeat.set(30, 10); // Adjust the repeat scale

const LWSPTextureTextureMaterial = new THREE.MeshStandardMaterial({ 
    map: LWSPTexture , 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const LWSP = new THREE.Mesh(new THREE.BoxGeometry(40, 35, 1), LWSPTextureTextureMaterial);
LWSP.rotation.y = Math.PI / 2; // Rotate to make it horizontal
LWSP.position.set(24, 2, -24); // Set position
                    //nipis     //width    //heigh
                    LWSP.scale.set(0.5, 1, 2); // Shrink width to create space for the door
                    LWSP.receiveShadow = true;
scene.add(LWSP);


//top second path

const TSPTexture = textureLoader.load('/images/texture/tile.jpg'); // Same texture as floor
TSPTexture.wrapS = THREE.RepeatWrapping;
TSPTexture.wrapT = THREE.RepeatWrapping;
TSPTexture.repeat.set(5, 5); // Adjust the repeat scale

const TSPTextureMaterial = new THREE.MeshStandardMaterial({ 
    map: TSPTexture, 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const TSP = new THREE.Mesh(new THREE.BoxGeometry(40, 35, 1), TSPTextureMaterial);
TSP.rotation.y = Math.PI / 2; // Rotate to make it horizontal
TSP.position.set(24, 16, -11); // Set position
TSP.scale.set(2, 0.4, 2); // Shrink width to create space for the door
TSP.receiveShadow = true;
scene.add(TSP);



//entrance wall

const ENT1Texture = textureLoader.load('/images/texture/tile.jpg'); // Same texture as floor
ENT1Texture .wrapS = THREE.RepeatWrapping;
ENT1Texture .wrapT = THREE.RepeatWrapping;
ENT1Texture .repeat.set(30, 10); // Adjust the repeat scale

const ENT1TextureMaterial = new THREE.MeshStandardMaterial({ 
    map: ENT1Texture , 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const ENT1 = new THREE.Mesh(new THREE.BoxGeometry(40, 35, 1), ENT1TextureMaterial);

ENT1.position.set(35, 2, 23.6); // Set position
                    //nipis     //width    //heigh
                    ENT1.scale.set(0.653, 2, 2); // Shrink width to create space for the door
                    TSP.receiveShadow = true;
scene.add(ENT1);


//entrance wall 2

const ENT2Texture = textureLoader.load('/images/texture/tile.jpg'); // Same texture as floor
ENT2Texture .wrapS = THREE.RepeatWrapping;
ENT2Texture .wrapT = THREE.RepeatWrapping;
ENT2Texture .repeat.set(30, 10); // Adjust the repeat scale

const ENT2TextureMaterial = new THREE.MeshStandardMaterial({ 
    map: ENT2Texture , 
    side: THREE.DoubleSide, 
    roughness: 0, 
    metalness: 0.5
});
const ENT2 = new THREE.Mesh(new THREE.BoxGeometry(40, 35, 1), ENT2TextureMaterial);

ENT2.position.set(14, 2, -30); // Set position
                    //nipis     //width    //heigh
                    ENT2.scale.set(0.5, 1, 2); // Shrink width to create space for the door
                    ENT2.receiveShadow = true;
scene.add(ENT2);



// After adding all walls to the scene
const wallBoundingBoxes = [];

// Assuming you have an array of wall meshes
const walls = [frontWall, backWall, leftWall, rightWall, 
    floor , alternateFloor, LEFT1Floor , topFloor , ceiling1
    , carpet , RWSP , LWSP , TSP , ENT1 , ENT2





]; // Add all wall meshes here

walls.forEach(wall => {
    const box = new THREE.Box3().setFromObject(wall);
    wallBoundingBoxes.push(box);
});




//================================================================
// GUI Setup
//================================================================
const gui = new GUI();

// Light Intensity Control
const lightFolder = gui.addFolder('Lighting');
const ambientLightControl = lightFolder.add(ambientLight, 'intensity', 0, 2).name('Ambient Light Intensity');
const directionalLightControl = lightFolder.add(directionalLight, 'intensity', 0, 2).name('Directional Light Intensity');

// Directional Light Direction Controls
const lightDirectionFolder = gui.addFolder('Light Direction');
const initialLightPosition = {
  x: -15.36,
  y: -50,
  z: 50
};

// Set initial position of the directional light
directionalLight.position.set(initialLightPosition.x, initialLightPosition.y, initialLightPosition.z);

// Initialize GUI controls for light position
lightDirectionFolder.add(initialLightPosition, 'x', -50, 50).name('Light X Position').onChange((value) => {
  directionalLight.position.x = value;
});
lightDirectionFolder.add(initialLightPosition, 'y', -50, 50).name('Light Y Position').onChange((value) => {
  directionalLight.position.y = value;
});
lightDirectionFolder.add(initialLightPosition, 'z', -50, 50).name('Light Z Position').onChange((value) => {
  directionalLight.position.z = value;
});

// Fog Controls
const fogFolder = gui.addFolder('Fog');
const fogIntensityControl = fogFolder.add({ fogDensity: fogDensity }, 'fogDensity', 0, 0.1).name('Fog Density').onChange((value) => {
  scene.fog.density = value;
});

const fogColorControl = fogFolder.addColor({ fogColor: fogColor.getHex() }, 'fogColor').name('Fog Color').onChange((value) => {
  scene.fog.color.set(value);
});

//================================================================
// Initialize the GUI
//================================================================
lightFolder.open(); // Open the lighting folder
lightDirectionFolder.open(); // Open the light direction folder
fogFolder.open(); // Open the fog folder


// Set camera position
camera.position.set(0, 10, 0);

// Set camera to look downward (45 degrees downward)
camera.rotation.x = 0; // 45 degrees downward



// FPSControls class (integrated from your provided code)
class FPSControls {
  constructor(camera, scene) {
      this.camera = camera;
      this.scene = scene;
      this.pointerLockControls = new PointerLockControls(camera, document.body);

      scene.add(this.pointerLockControls.getObject()); // Use getObject()

      document.addEventListener('click', () => this.pointerLockControls.lock());

      this.velocity = new THREE.Vector3(0, 0, 0);
      this.acceleration = new THREE.Vector3(50, 2130, 50);
      this.deceleration = new THREE.Vector3(-10, -55, -10);
      this.move = { forward: false, backward: false, left: false, right: false };
      this.isStanding = true;
      this.isEditMode = false; // Track whether we are in edit mode


      // Initialize Audio Listener and Sounds
      this.listener = new THREE.AudioListener();
      this.camera.add(this.listener); // Attach the listener to the camera
  
      
      // First walking sound
      this.walkSound = new THREE.Audio(this.listener);
      const audioLoader = new THREE.AudioLoader();
      audioLoader.load('/sounds/Sound Effects - Walking on Tile Floor.mp3', (buffer) => {
        this.walkSound.setBuffer(buffer);
        this.walkSound.setLoop(true); // Set to loop if desired
        this.walkSound.setVolume(0.5); // Adjust volume as needed
      });
  
      // Second walking sound
      this.secondWalkSound = new THREE.Audio(this.listener);
      audioLoader.load('/sounds/Walking Through Water Sound Effect.mp3', (buffer) => {
        this.secondWalkSound.setBuffer(buffer);
        this.secondWalkSound.setLoop(true);
        this.secondWalkSound.setVolume(0.5); // Adjust volume as needed
      });
  

      document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
      document.addEventListener('keyup', (e) => this._onKeyUp(e), false);

       // Add event listener for the "Enter First Person Mode" button
    const firstPersonBtn = document.getElementById('firstPersonBtn');
    firstPersonBtn.addEventListener('click', () => this.enterFirstPersonMode());

    // Add event listener for the "Enter Edit Mode" button
    const editModeBtn = document.getElementById('editModeBtn');
    editModeBtn.addEventListener('click', () => this.enterEditMode());

    // Add a scroll wheel listener to handle zoom only in edit mode
    document.addEventListener('wheel', (event) => this.handleScroll(event), { passive: false });
     // Create the target marker in the game
     this.createTargetMarker();
  }

  createTargetMarker() {
    const targetPosition = new THREE.Vector3(-61, 4, -40); // The target position
  
    // Create a small sphere to act as the marker
    const geometry = new THREE.SphereGeometry(0.2, 32, 32); // Small sphere with radius 0.2
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xff0000,      // Red color
      transparent: true,    // Enable transparency
      opacity: 0.0         // Set the opacity to 50% (you can adjust this value)
    });
    const marker = new THREE.Mesh(geometry, material);
  
    // Set the marker's position to the target position
    marker.position.copy(targetPosition);
  
    // Add the marker to the scene
    this.scene.add(marker);
  }


  enterFirstPersonMode() {
    // Activates pointer lock controls when the button is clicked
    this.pointerLockControls.lock(); // This will activate the pointer lock
    this.isEditMode = false; // Disable edit mode when entering first-person view
  }

  enterEditMode() {
    this.isEditMode = true; // Enable edit mode (fly mode)
    this.velocity.set(0, 0, 0); // Reset velocity
  }
  handleScroll(event) {
    // Disable zoom on scroll in both modes
    event.preventDefault(); // Prevent the page from scrolling
  }

  _onKeyDown(event) {
    switch (event.code) {
      case 'KeyW': this.move.forward = true; break;
      case 'KeyS': this.move.backward = true; break;
      case 'KeyA': this.move.left = true; break;
      case 'KeyD': this.move.right = true; break;
      case 'Space': // Jump (move up in Edit Mode)
        if (this.isEditMode) {
          this.move.up = true;
        } else if (this.isStanding) {
          this.velocity.y += 15; // Adjust jump height as needed
          this.isStanding = false;
        }
        break;
      case 'ShiftLeft': // Move down in Edit Mode
        if (this.isEditMode) {
          this.move.down = true;
        }
        break;
    }
  }





  _onKeyUp(event) {
      switch (event.code) {
          case 'KeyW': this.move.forward = false; break;
          case 'KeyS': this.move.backward = false; break;
          case 'KeyA': this.move.left = false; break;
          case 'KeyD': this.move.right = false; break;
          case 'Space': break;
      }
  }

  update(delta) {
    const speedMultiplier = 1; // Adjust speed multiplier here
    const frameDeceleration = new THREE.Vector3(
        this.velocity.x * this.deceleration.x,
        this.deceleration.y,
        this.velocity.z * this.deceleration.z
    );
    frameDeceleration.multiplyScalar(delta);
    this.velocity.add(frameDeceleration);

    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);

    const forward = new THREE.Vector3(direction.x, 0, direction.z).normalize();
    const right = new THREE.Vector3().crossVectors(this.camera.up, forward).normalize();

    if (this.move.forward) this.velocity.addScaledVector(forward, this.acceleration.z * delta);
    if (this.move.backward) this.velocity.addScaledVector(forward, -this.acceleration.z * delta);
    if (this.move.left) this.velocity.addScaledVector(right, this.acceleration.x * delta);
    if (this.move.right) this.velocity.addScaledVector(right, -this.acceleration.x * delta);

    // Create a bounding box for the character
    const characterBox = new THREE.Box3().setFromCenterAndSize(
        this.pointerLockControls.getObject().position,
        new THREE.Vector3(1, 1.8, 1) // Adjust size based on your character's dimensions
    );
    

    // Check for collisions with walls
    for (const wallBox of wallBoundingBoxes) {
        if (characterBox.intersectsBox(wallBox)) {
            // Collision detected, revert position
            this.pointerLockControls.getObject().position.sub(this.velocity.clone().multiplyScalar(delta));
            this.velocity.set(0, 0, 0); // Stop movement
            break; // Exit loop after collision
        }
    }

    
    // Update camera position
    const position = this.pointerLockControls.getObject().position;
    position.addScaledVector(this.velocity, delta);

    // Apply gravity
    if (position.y < 5) {
        this.velocity.y = 0;
        position.y = 5;
        this.isStanding = true;
    }
}
}

// Instantiate FPSControls
const controls = new FPSControls(camera, scene);




// Load zombie model (or your character model)
const loader = new GLTFLoader();
let zombie;
let zombieMixer; // Declare a mixer for the zombie

loader.load('/images/models/zombie_monster_slasher_necromorph.glb', (gltf) => {
    zombie = gltf.scene;
    zombie.scale.set(5, 5, 5);
    zombie.position.set(-20, 0, -20);
    zombie.castShadow = true;
    scene.add(zombie);

    // Create an AnimationMixer for the zombie
    zombieMixer = new THREE.AnimationMixer(zombie);
    gltf.animations.forEach((clip) => {
        const action = zombieMixer.clipAction(clip);
        action.play(); // Play the walking animation
    });
});

// Load water model
let water;  // Declare water globally
let waterMixer;  // Declare a global mixer variable

loader.load('images/models/water_wave_for_ar.glb', (gltf) => {
    water = gltf.scene;
    water.scale.set(0.3, 0.3, 0.31);
    water.position.set(20, 23, 20); // Starting position of the water
    water.castShadow = true;
    water.receiveShadow = true;
    scene.add(water);

    // Make the water darker by adjusting its material
    water.traverse((child) => {
        if (child.isMesh) {
            if (child.material) {
                child.material.color = new THREE.Color(0x001a33); // Dark blue
                child.material.emissive = new THREE.Color(0x000000); // No emissive light
                child.material.needsUpdate = true; // Update the material
            }
        }
    });

    // Create an AnimationMixer if the model has animations
    if (gltf.animations && gltf.animations.length) {
        waterMixer = new THREE.AnimationMixer(water); // Initialize mixer inside if-block

        gltf.animations.forEach((clip) => {
            const action = waterMixer.clipAction(clip);
            action.play(); // Play all animations
            action.setEffectiveTimeScale(0.5); // Slow down the animation by setting time scale to 0.5 (50% speed)
        });
    }
});


// Zombie movement (unchanged)
function updateZombie() {
    if (zombie) {
        const playerPosition = camera.position;
        const zombiePosition = zombie.position;
        const distanceToPlayer = playerPosition.distanceTo(zombiePosition);

        if (distanceToPlayer < 50) { // Simple chase behavior
            const direction = new THREE.Vector3();
            direction.subVectors(playerPosition, zombiePosition).normalize();
            zombie.position.addScaledVector(direction, 0.02); // Adjust zombie speed
        }
    }
}



// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta(); // Get time delta for smooth movement

    // Update the zombie animation if it exists
    if (zombieMixer) {
        zombieMixer.update(delta); // Update the zombie animation
    }

    // Update the water animation if it exists
    if (waterMixer) {
        waterMixer.update(delta); // Update the water animation
    }

    // Update FPS controls
    if (controls.pointerLockControls.isLocked) {
        controls.update(delta);
    }

    updateZombie(); // Update zombie movement
    renderer.render(scene, camera);
}

const clock = new THREE.Clock();



createChair(scene);
    //createdesk(scene);
    //createaircon(scene);

 //   createflower(scene);
  //  createframe(scene);
 //   createdispenser(scene);
   // created_design1(scene);
   // created_design2(scene);
    created_design3(scene);
    created_floor(scene);
 //   created_hallchairs(scene);
 //   created_fence(scene);
    created_cheaproom(scene);
    created_nearstatue(scene);
    
    //created_ceiling(scene);
    created_statue(scene)
  

animate();