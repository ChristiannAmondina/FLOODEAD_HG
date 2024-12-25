//================================================================
// Imports
//================================================================
import './assets/styles.css'; // Adjust the path as necessary
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GUI } from 'dat.gui'; // Import dat.GUI

import { 
  createChair, createdesk , createaircon, 
  createflower, createframe, createdispenser, created_design1, 
  created_design2, created_design3, created_floor, created_hallchairs,
   created_cheaproom, created_fence,    created_statue , created_ceiling
   ,created_nearstatue, 
} 
from './js/objects.js';




import { createblood } from './js/effects.js';
import { loadWall } from './js/design.js';


import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';




//================================================================
// Scene Setup
//================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2f303d); // Default white background
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('webgl-container').appendChild(renderer.domElement);


//================================================================
// TextureLoader
//================================================================
const textureLoader = new THREE.TextureLoader();


//================================================================
// Fog Setup
//================================================================
//0.0080
let fogDensity = 0; // Adjusted density for fog
let fogColor = new THREE.Color(0xaaaaaa); // Set initial fog color (light gray)
scene.fog = new THREE.FogExp2(fogColor, fogDensity); // Exponential fog (color, density)

//================================================================
// Lighting Setup
//================================================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Ambient light to illuminate all objects
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x635900, 0.010); // White directional light
directionalLight.position.set(-15.36, -50, 50).normalize(); // Light source position
scene.add(directionalLight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // For softer shadows
// Create a DirectionalLight with yellow color and intensity 1









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



// --- FPSControls Class Definition ---
class FPSControls {
  constructor(camera, scene, pointerLockControls) {
    this.camera = camera;
    this.scene = scene;
    this.pointerLockControls = pointerLockControls;

    if (!this.pointerLockControls || !this.pointerLockControls.object) {
      console.error('PointerLockControls object is not initialized correctly.');
      return;
    }


    if (this.isPointerLockAvailable()) {
      console.log("Pointer Lock API is supported by your browser.");
      this.pointerLockControls.lock(); // Lock the pointer for first-person mode
      this.isEditMode = false;
    } else {
      console.error("Pointer Lock API is not available.");
      alert('Your browser does not support Pointer Lock API. Please try a different browser or enable permissions.');
    }
    
    
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(80, 2130, 80);
    this.deceleration = new THREE.Vector3(-10, -55, -10);
    this.move = { forward: false, backward: false, left: false, right: false };
    this.isStanding = true;
    this.isEditMode = false;

    // Initialize Audio Listener and Sounds
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);

    // Walking sounds
    this.walkSound = new THREE.Audio(this.listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('/sounds/Sound Effects - Walking on Tile Floor.mp3', (buffer) => {
      this.walkSound.setBuffer(buffer);
      this.walkSound.setLoop(true);
      this.walkSound.setVolume(0.5);
    });

    this.secondWalkSound = new THREE.Audio(this.listener);
    audioLoader.load('/sounds/Walking Through Water Sound Effect.mp3', (buffer) => {
      this.secondWalkSound.setBuffer(buffer);
      this.secondWalkSound.setLoop(true);
      this.secondWalkSound.setVolume(0.5);
    });

    // Event listeners for key events
    document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this._onKeyUp(e), false);

    // Buttons for switching modes
    const firstPersonBtn = document.getElementById('firstPersonBtn');
    firstPersonBtn.addEventListener('click', () => this.enterFirstPersonMode());

    const editModeBtn = document.getElementById('editModeBtn');
    editModeBtn.addEventListener('click', () => this.enterEditMode());

    // Scroll event listener for zooming in edit mode
    document.addEventListener('wheel', (event) => this.handleScroll(event), { passive: false });

    // Create the target marker in the game
    this.createTargetMarker();
  }


  isPointerLockAvailable() {
    // Check if Pointer Lock is supported
    return !!(document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement);
  }


  createTargetMarker() {
    const targetPosition = new THREE.Vector3(-61, 4, -40); // Target position for marker
    const geometry = new THREE.SphereGeometry(0.2, 32, 32); // Small sphere with radius 0.2
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000, // Red color
      transparent: true, // Enable transparency
      opacity: 0.0 // Set opacity to 0 (invisible)
    });
    const marker = new THREE.Mesh(geometry, material);
    marker.position.copy(targetPosition);
    this.scene.add(marker);
  }

  enterFirstPersonMode() {
    // Lock pointer if supported
    if (this.isPointerLockAvailable()) {
      this.pointerLockControls.lock(); // Lock the pointer for first-person mode
      this.isEditMode = false;
    } else {
      console.error("Pointer Lock API is not available.");
    }
  }

  enterEditMode() {
    this.isEditMode = true;
    this.velocity.set(0, 0, 0); // Reset velocity for flying mode
  }

  handleScroll(event) {
    event.preventDefault(); // Prevent page scrolling
  }

  _onKeyDown(event) {
    switch (event.code) {
      case 'KeyW': this.move.forward = true; break;
      case 'KeyS': this.move.backward = true; break;
      case 'KeyA': this.move.left = true; break;
      case 'KeyD': this.move.right = true; break;
      case 'Space':
        if (this.isEditMode) {
          this.move.up = true;
        } else if (this.isStanding) {
          this.velocity.y += 15; // Jump height
          this.isStanding = false;
        }
        break;
      case 'ShiftLeft':
        if (this.isEditMode) this.move.down = true;
        break;
    }
  }

  _onKeyUp(event) {
    switch (event.code) {
      case 'KeyW': this.move.forward = false; break;
      case 'KeyS': this.move.backward = false; break;
      case 'KeyA': this.move.left = false; break;
      case 'KeyD': this.move.right = false; break;
      case 'Space': this.move.up = false; break;
      case 'ShiftLeft': this.move.down = false; break;
    }
  }

  update(delta) {
    const targetPosition = new THREE.Vector3(-61, 4, -40); // Target position
    const tolerance = 4; // Tolerance for target position proximity

    if (!this.pointerLockControls || !this.pointerLockControls.object) {
      console.error("PointerLockControls or its object is not defined.");
      return;
    }

    const position = this.pointerLockControls.object.position;

    if (
      Math.abs(position.x - targetPosition.x) < tolerance &&
      Math.abs(position.y - targetPosition.y) < tolerance &&
      Math.abs(position.z - targetPosition.z) < tolerance
    ) {
      this.gameFinished(); // Trigger game finish if near the target
      return;
    }

    const speedMultiplier = this.isEditMode ? 10 : 1;
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
    const up = this.camera.up; // Up direction for flying (vertical movement)

    if (this.move.forward) this.velocity.addScaledVector(forward, this.acceleration.z * delta * speedMultiplier);
    if (this.move.backward) this.velocity.addScaledVector(forward, -this.acceleration.z * delta * speedMultiplier);
    if (this.move.left) this.velocity.addScaledVector(right, this.acceleration.x * delta * speedMultiplier);
    if (this.move.right) this.velocity.addScaledVector(right, -this.acceleration.x * delta * speedMultiplier);
    if (this.move.up) this.velocity.addScaledVector(up, this.acceleration.y * delta * speedMultiplier);
    if (this.move.down) this.velocity.addScaledVector(up, -this.acceleration.y * delta * speedMultiplier);

    const raycaster = new THREE.Raycaster(position, forward, 0, 1.5); // Raycasting for collisions
    const intersects = raycaster.intersectObjects(this.scene.children, true);

    if (this.isEditMode) {
      this.velocity.y = 0; // Disable gravity effect
      position.addScaledVector(this.velocity, delta);
    } else {
      position.addScaledVector(this.velocity, delta);
      if (position.y < 5) {
        this.velocity.y = 0;
        position.y = 5;
        this.isStanding = true;
      }

      if (intersects.length > 0) {
        position.sub(this.velocity.clone().multiplyScalar(delta)); // Prevent clipping into walls
        this.velocity.set(0, this.velocity.y, 0); // Stop movement on collision axis
      }
    }

    // Walking sounds
    if (this.move.forward || this.move.backward || this.move.left || this.move.right) {
      if (!this.walkSound.isPlaying) this.walkSound.play();
      if (!this.secondWalkSound.isPlaying) this.secondWalkSound.play();
      position.y += Math.sin(Date.now() / 100) * 0.090; // Bumping effect
    } else {
      if (this.walkSound.isPlaying) this.walkSound.stop();
      if (this.secondWalkSound.isPlaying) setTimeout(() => this.secondWalkSound.stop(), 1000);
    }
  }

  gameFinished() {
    // Create a fade-out effect when the game finishes
    const whiteScreen = document.createElement('div');
    whiteScreen.style.position = 'absolute';
    whiteScreen.style.top = 0;
    whiteScreen.style.left = 0;
    whiteScreen.style.width = '100vw';
    whiteScreen.style.height = '100vh';
    whiteScreen.style.backgroundColor = 'black';
    whiteScreen.style.zIndex = 1000;
    whiteScreen.style.opacity = 0; // Fade-in effect
    whiteScreen.style.transition = 'opacity 35s ease-out';
    document.body.appendChild(whiteScreen);

    const imageElement = document.createElement('img');
    imageElement.style.position = 'absolute';
    imageElement.style.top = '50%';
    imageElement.style.left = '50%';
    imageElement.style.transform = 'translate(-50%, -50%)';
    imageElement.style.width = 'auto';
    imageElement.style.height = 'auto';
    imageElement.style.zIndex = 1100;
    imageElement.style.opacity = 0;
    imageElement.style.transition = 'opacity 35s ease-out';
    imageElement.style.pointerEvents = 'none';
    document.body.appendChild(imageElement);

    // Play sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const soundWater = new Audio('/sounds/The Lobotomy.mp3');
    const track = audioContext.createMediaElementSource(soundWater);
    const gainNode = audioContext.createGain();
    track.connect(gainNode).connect(audioContext.destination);
    gainNode.gain.value = 0;

    soundWater.playbackRate = 2.0;

    // Fade effects
    setTimeout(() => {
      whiteScreen.style.opacity = 1;
      imageElement.style.opacity = 1;
      soundWater.play();
      const fadeInDuration = 1000;
      const currentTime = audioContext.currentTime;
      gainNode.gain.linearRampToValueAtTime(1, currentTime + fadeInDuration / 1000);
    }, 2000);

    // Restart game on CTRL + R
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'r') {
        window.location.reload(); // Reload the page
      }
    });
  }
}



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

//================================================================
// Camera Setup
//================================================================
camera.position.set(23, 7, -42); // Set camera position

// Setup OrbitControls for environment editing
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.25;
orbitControls.screenSpacePanning = false;
orbitControls.zoomSpeed = false;
orbitControls.minDistance = 10;
orbitControls.maxDistance = 200;


// Add a click event listener to request pointer lock when the user clicks
document.body.addEventListener('click', function() {
    document.body.requestPointerLock();
});

// Declare pointerLockControls outside the conditional to make it accessible globally
let pointerLockControls;

// Ensure renderer.domElement is ready before initializing controls
if (renderer.domElement) {
  pointerLockControls = new PointerLockControls(camera, renderer.domElement);

  // Validate and add controls to the scene
  if (pointerLockControls && pointerLockControls.object instanceof THREE.Object3D) {
      scene.add(pointerLockControls.object);
  } else {
      console.error("PointerLockControls initialization failed.");
  }
} else {
  console.error("Renderer DOM element is not ready.");
}

// Debug logging to check initialization status
console.log("PointerLockControls state:", pointerLockControls);
console.log("PointerLockControls object:", pointerLockControls.object);

// Add the camera to the scene (only once, after initializing controls)
scene.add(camera); 

// Instantiate FPSControls with pointerLockControls
const fpsControls = new FPSControls(camera, scene, pointerLockControls);


// Event listeners for pointer lock/unlock
pointerLockControls.addEventListener('lock', () => {
    console.log('Pointer locked');
    orbitControls.enabled = false; // Disable OrbitControls when pointer lock is active
});




//
//
//
//

let isFirstPerson = false;
let isZombieMoving = false; // Track whether the zombie should move
let zombieState = "patrolling"; // Initial state of the zombie

const clock = new THREE.Clock();






//================================================================
// Zombie Movement (AI Behavior)
//================================================================
// Square boundaries (min and max coordinates)
const minX = -40, maxX = 40;
const minZ = -40, maxZ = 40;

let currentTarget = new THREE.Vector3();  // Current target position for the zombie
let isMovingToTarget = false;  // Flag to track if the zombie is moving to a new target
const wanderDistance = 50; // Distance at which the zombie starts wandering

// Update zombie state and movement
//================================================================
function updateZombie() {
  if (zombie) {
    const playerPosition = camera.position;
    const zombiePosition = zombie.position;
    const distanceToPlayer = playerPosition.distanceTo(zombiePosition);
    const direction = new THREE.Vector3();
    direction.subVectors(playerPosition, zombiePosition).normalize();






    
    switch (zombieState) {
      case "patrolling":
        patrolRandomly();
        if (distanceToPlayer < 32) {
          zombieState = "chasing"; // Start chasing if within range
        }
        break;

      case "chasing":
        chasePlayer(direction, distanceToPlayer);
        if (distanceToPlayer < 5) {
        
          zombieState = "attacking"; // Attack if extremely close
        } else if (distanceToPlayer > 50) {
          zombieState = "patrolling"; // Return to patrol if too far away
          isMovingToTarget = false;  // Reset movement flag to trigger new patrol target
        } else if (distanceToPlayer > wanderDistance) {
          zombieState = "wandering"; // Start wandering if player is far away
        }
        
        break;

      case "attacking":
        onZombieAttack(); // Trigger red flicker effect when attacking
        if (distanceToPlayer < 1) {
          gameOver(); // Trigger game over if zombie catches player
        } else if (distanceToPlayer > 30) {
          zombieState = "chasing"; // Continue chasing if player is still close
          damageOverlay.style.opacity = '0'; // Stop the red flicker when player is too far
        } else if (distanceToPlayer > 5) {
          zombieState = "chasing"; // Stop attacking and go back to chasing
          damageOverlay.style.opacity = '0'; // Stop the red flicker
        }
        break;

      case "wandering":
        wanderRandomly();
        if (distanceToPlayer < wanderDistance) {
          zombieState = "chasing"; // Return to chasing if player is within range
        }
        break;
    }
  }
}




//================================================================
// Game Over Effect
//================================================================
//================================================================
// Game Over Effect with Delay
//================================================================

let gameOverState = false; // Track the game over state
const gameoverSound = new Audio('/sounds/Game Over Sound Effect - SFX.mp3');  // Replace with actual path

function gameOver() {
  // Stop all animations
  if (mixer) {
    mixer.stopAllAction();  // Stop all animations
  }

 // Set the gameOverState flag to true
gameOverState = true;

// Add a delay before showing the "Game Over" message
setTimeout(() => {
  // Display "Game Over" message
  const gameOverMessage = document.createElement('div');
  gameoverSound.play();
  gameOverMessage.style.position = 'absolute';
  gameOverMessage.style.top = '50%';
  gameOverMessage.style.left = '50%';
  gameOverMessage.style.transform = 'translate(-50%, -50%)';
  gameOverMessage.style.fontSize = '48px';
  gameOverMessage.style.fontFamily = 'Courier New, Courier, monospace';
  gameOverMessage.style.color = 'red';
  gameOverMessage.style.fontWeight = 'bold';
  gameOverMessage.innerText = 'GAME OVER\nPress Ctrl + R to restart';
  document.body.appendChild(gameOverMessage);

  // Create the image element
  const gameOverImage = document.createElement('img');
  gameOverImage.src = '/images/pics/bloodscreen.png'; // Correct image path
  gameOverImage.style.position = 'absolute';
  gameOverImage.style.position = 'fixed';
  gameOverImage.style.top = '0';
  gameOverImage.style.left = '0';
  gameOverImage.style.width = '100%';
  gameOverImage.style.height = '100%';
  gameOverImage.style.filter = 'contrast(41)';
  gameOverImage.style.mixBlendMode = 'multiply';
  gameOverImage.style.zIndex = '-5'; // Set the z-index behind other elements
  document.body.appendChild(gameOverImage); // Append the image to the body

  // Listen for 'Ctrl + R' key press to restart the game
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'r') {
      restartGame();  // Restart the game when Ctrl + R is pressed
      document.body.removeChild(gameOverMessage);  // Remove the game over message
      document.body.removeChild(gameOverImage);  // Remove the image as well
    }
  });
}, 2000); // Delay for 2 seconds before showing the message

// Play the key collection sound
gameoverSound.play();
}


//================================================================
// Game Restart Function
//================================================================
function restartGame() {
  // Reset game state
  zombie.position.set(-20, 0, -20); // Reset zombie position
  camera.position.set(0, 14, 24); // Reset camera position
  zombieState = "patrolling"; // Reset zombie state
  isZombieMoving = true; // Enable zombie movement

  // Restart the animation
  if (mixer) {
    mixer.stopAllAction();  // Stop any active animation
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play(); // Play animations again
    });
  }

  // Additional reset logic (if needed)
  // Reset the player's position, game variables, etc.

  // You can call any necessary functions to reset the game scene here
  // For example: resetPlayerPosition(), resetGameEnvironment(), etc.
}


// Patrol randomly within the square area
function patrolRandomly() {
  if (!isMovingToTarget) {
    // Set a random target within the defined area
    currentTarget.set(
      Math.random() * (maxX - minX) + minX,  // Random x within the range
      0,  // Y remains constant (since this is a flat 2D plane for movement)
      Math.random() * (maxZ - minZ) + minZ   // Random z within the range
    );
    isMovingToTarget = true;  // Start moving to the new target
  }

  // Move zombie towards the target
  const distanceToTarget = zombie.position.distanceTo(currentTarget);
  
  if (distanceToTarget < 1) {
    // If the zombie reaches the target, stop moving and pick a new target
    isMovingToTarget = false;
    currentTarget.set(
      Math.random() * (maxX - minX) + minX,  // Random x within the range
      0,  // Y remains constant (since this is a flat 2D plane for movement)
      Math.random() * (maxZ - minZ) + minZ   // Random z within the range
    );
  } else {
    // Move towards the target
    const direction = new THREE.Vector3();
    direction.subVectors(currentTarget, zombie.position).normalize();

    // Update zombie's rotation to face the target
    const angle = Math.atan2(direction.x, direction.z);  // Calculate the angle
    zombie.rotation.y = angle;  // Make the zombie face the target

    const patrolSpeed = 0.04;  // Patrol speed
    zombie.position.addScaledVector(direction, patrolSpeed);  // Move towards the target
  }

  // Optional: Randomly rotate slightly to simulate looking around
  if (Math.random() < 0.04) {
    zombie.rotation.y += (Math.random() - 0.5) * Math.PI / 4; // Randomly adjust rotation
  }
}


// Chase the player
function chasePlayer(direction, distanceToPlayer) {
  if (distanceToPlayer < 10) {
    zombie.position.addScaledVector(direction, 0.0040); // Speed up when closer to the player
    zombie.lookAt(camera.position); // Always face the player

    // Ensure zombie remains upright during chase
    zombie.rotation.x = 10;  // Lock tilt on X-axis
    zombie.rotation.z = 0;  // Lock tilt on Z-axis
    
    
  }

  // Ensure zombie stays on the ground (y = 0)
  zombie.position.y = 0.8;
}



// Wander randomly within the defined area
function wanderRandomly() {
  if (!isMovingToTarget) {
    // Set a random target within the defined area
    currentTarget.set(
      Math.random() * (maxX - minX) + minX,  // Random x within the range
      0,  // Y remains constant (since this is a flat 2D plane for movement)
      Math.random() * (maxZ - minZ) + minZ   // Random z within the range
    );
    isMovingToTarget = true;  // Start moving to the new target

      if (Math.random() < 0.04) {
    zombie.rotation.y += (Math.random() - 0.15) * Math.PI / 4; // Randomly adjust rotation
  }
  }

  // Move zombie towards the target
  const distanceToTarget = zombie.position.distanceTo(currentTarget);
  
  if (distanceToTarget < 1) {
    // If the zombie reaches the target, stop moving and pick a new target
    isMovingToTarget = false;
    currentTarget.set(
      Math.random() * (maxX - minX) + minX,  // Random x within the range
      0,  // Y remains constant (since this is a flat 2D plane for movement)
      Math.random() * (maxZ - minZ) + minZ   // Random z within the range
    );
  } else {
    // Move towards the target
    const direction = new THREE.Vector3();
    direction.subVectors(currentTarget, zombie.position).normalize();

    // Update zombie's rotation to face the target
    const angle = Math.atan2(direction.x, direction.z);  // Calculate the angle
    zombie.rotation.y = angle;  // Make the zombie face the target

    const wanderSpeed = 0.05;  // Wander speed
    zombie.position.addScaledVector(direction, wanderSpeed);  // Move towards the target
  }

  // Optional: Randomly rotate slightly to simulate looking around
  if (Math.random() < 0.04) {
    zombie.rotation.y += (Math.random() - 0.5) * Math.PI / 4; // Randomly adjust rotation
  }
}





//================================================================
// Character (Zombie) Setup
//================================================================
const loader = new GLTFLoader();
let zombie, mixer;

loader.load('/images/models/zombie_monster_slasher_necromorph.glb', (gltf) => {
  zombie = gltf.scene;
  zombie.scale.set(5, 5, 5);
  zombie.position.set(-20, 0, -20); // Starting position of the zombie
  zombie.castShadow = true;
  zombie.receiveShadow = true;
  scene.add(zombie);

  // Initialize the animation mixer for the zombie
  mixer = new THREE.AnimationMixer(zombie);

  gltf.animations.forEach((clip) => {
    mixer.clipAction(clip).play(); // Play animations
  });
});







//================================================================
// Input and Controls
//================================================================
document.addEventListener('click', () => {
  if (!isFirstPerson) {
    pointerLockControls.lock(); // Enable first-person mode
    isFirstPerson = true;
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isFirstPerson) {
    pointerLockControls.unlock(); // Exit first-person mode
    isFirstPerson = false;
  }
});

const zombieSound = new Audio('/sounds/Zombie sound effect.mp3');
zombieSound.loop = true; // Make sure the sound loops to continuously fade in/out

function zombieFollowPlayer() {
  if (isZombieMoving && zombie) {
    const playerPosition = camera.position;
    const zombiePosition = zombie.position;

    const direction = new THREE.Vector3();
    direction.subVectors(playerPosition, zombiePosition).normalize();

    zombie.lookAt(playerPosition);

    const distanceToPlayer = playerPosition.distanceTo(zombiePosition);

    let speed = 0.017; // Base zombie speed

    // Adjust volume based on distance (closer = louder)
    let volume = 0;

    if (distanceToPlayer <= 8) {
      // At 8 units or less, volume is at maximum (1)
      volume = 1;
    } else if (distanceToPlayer > 8 && distanceToPlayer <= 20) {
      // Between 8 and 20 units, volume stays high (near max)
      volume = 1;
    } else if (distanceToPlayer > 20 && distanceToPlayer <= 26) {
      // Between 20 and 26 units, gradually fade out the sound
      volume = Math.max(0, 1 - (distanceToPlayer - 20) / 6);
    } else {
      // Beyond 26 units, pause the sound and reset it
      zombieSound.pause();
      zombieSound.currentTime = 0; // Reset sound to the beginning
      zombieSound.volume = 0; // No sound
    }

    // Apply the adjusted volume
    if (distanceToPlayer <= 26) {
      if (zombieSound.paused) {
        zombieSound.play(); // Start the sound if not playing and player is in range
      }
      zombieSound.volume = volume;
    }

    // Adjust playback rate based on distance (closer = higher pitch)
    const maxPlaybackRate = 1.5; // Maximum pitch (close)
    const minPlaybackRate = 0.5; // Minimum pitch (far)
    let playbackRate = THREE.MathUtils.mapLinear(
      distanceToPlayer,
      35, // max distance (far)
      1,  // min distance (close)
      minPlaybackRate,
      maxPlaybackRate
    );
    playbackRate = THREE.MathUtils.clamp(playbackRate, minPlaybackRate, maxPlaybackRate);
    zombieSound.playbackRate = playbackRate;

    if (distanceToPlayer < 1) {
      speed = 0.2; // Increase zombie speed when very close

      // Attack player if extremely close
      if (distanceToPlayer < 5) {
        onZombieAttack(); // Trigger attack
      }
    }

    // Move zombie towards the player
    zombie.position.addScaledVector(direction, speed);
  }
}







//================================================================
// Candle Setup and Interactions
//================================================================

let lightObject;

let pointLight; // For candle-like light


// Load the .glb model for the candle
loader.load(
  '/images/models/copper_candlestick.glb',
  function (gltf) {
    lightObject = gltf.scene;

    // Position and scale the model
    lightObject.position.set(2.3, -4, -1.5);
    lightObject.scale.set(21, 21, 21); 
    lightObject.rotation.x = Math.PI / -23;

    // Add the model to the camera
    camera.add(lightObject);

    // Create a yellow point light (simulating candle light)
    pointLight = new THREE.PointLight(0xFFFF00, 1, 10); // Yellow light, intensity of 1, range 10
    pointLight.position.set(0, 0, 0); // Place it at the camera's position
    pointLight.scale.set(110, 110, 110); 
    camera.add(pointLight);

    // Create an AnimationMixer if the model has animations
    if (gltf.animations && gltf.animations.length) {
      mixer = new THREE.AnimationMixer(lightObject);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play(); // Play all animations
      });
    }

    // Optional: Log the object to check it's been added to the camera
    console.log(lightObject);
  },
  undefined, // Optional: onProgress callback
  function (error) { // onError callback
    console.error('An error occurred while loading the model:', error);
  }
);








//================================================================
// Key Setup and Interactions
//================================================================
let hasKey = false;  // Flag to check if the player has the key
let hasUsedKey = false;  // Flag to check if the key has been used
let boundDoor = null;  // The specific door this key is bound to

// Sound effect for collecting the key
const keyCollectSound = new Audio('/sounds/key.mp3');  // Replace with actual path

// Sound effect for opening the door
const doorOpenSound = new Audio('/sounds/Door.mp3');  // Replace with actual path
doorOpenSound.volume = 1.0;  // Set volume to maximum

// Load the .glb model for the key
let keyObject;
loader.load('/images/models/metal_credit_card.glb', function (gltf) {
  keyObject = gltf.scene; // The loaded key model
  keyObject.position.set(-35, 3, 19);
  keyObject.scale.set(0.4, 0.4, 0.4); // Adjust scale if needed
  scene.add(keyObject);
  keyObject.rotation.x = Math.PI / 2;
}, undefined, function (error) {
  console.error(error);
});

// Bind the key to a specific door
function bindKeyToDoor(door) {
  boundDoor = door;  // Assign the key to open this door
}

// Export functions for key-related interactions
export function showKeyCollectNote() {
  const keyCollectNote = document.getElementById('key-collect-note');
  if (keyCollectNote) {
    keyCollectNote.style.display = 'block';  // Show the key collect note
  }
}

export function hideKeyCollectNote() {
  const keyCollectNote = document.getElementById('key-collect-note');
  if (keyCollectNote) {
    keyCollectNote.style.display = 'none';  // Hide the key collect note
  }
}

// Function to check proximity to key and show note
function checkProximityToKey(playerPosition) {
  if (keyObject) {
    const keyPosition = keyObject.position.clone();
    const distance = playerPosition.distanceTo(keyPosition);

    if (distance < 5 && !hasKey) {  // Only show note if the player doesn't already have the key
      showKeyCollectNote();
      document.addEventListener('keydown', onKeyPress);
    } else {
      hideKeyCollectNote();
    }
  }
}

// Handle key press to collect the key
function onKeyPress(event) {
  if (event.key === 'c' && !hasUsedKey) {  // Only collect key if it hasn't been used yet
    const distanceToKey = camera.position.distanceTo(keyObject.position);
    if (distanceToKey < 15) {
      onKeyCollected();
      hideKeyCollectNote();
      keyCollectSound.play();  // Play the sound when the key is collected
    }
  }
}

// Function to collect the key
function onKeyCollected() {
  if (keyObject) {
    // Remove the key from its current position in the scene
    scene.remove(keyObject);

    // Attach the key to the camera
    camera.add(keyObject);

    // Position the key in front of the camera (e.g., 2 units forward, 0.5 units up)
    keyObject.position.set(0.2, -0.5, -1); // Adjust as needed
    
    // Adjust the scale to make the key visible but not too large
    keyObject.scale.set(0.3, 0.4, 0.3); // Fine-tune scale if needed
  }


  hasKey = true; // Update the flag

  // Hide the key collect note
  hideKeyCollectNote();

  // Play the key collection sound
  keyCollectSound.play();

  // Show the key in the inventory UI (optional)
  const keyImageContainer = document.getElementById('key-image-container');
  if (keyImageContainer) {
    keyImageContainer.style.display = 'block';
  }
}


//================================================================
// Door Setup and Interactions
//================================================================

// Load the texture for the door
const doorTexture = textureLoader.load('/images/texture/moderndoor.jpg'); // Set your image path

// Set the texture to repeat
doorTexture.wrapS = THREE.RepeatWrapping;  // Repeat the texture on the X-axis
doorTexture.wrapT = THREE.RepeatWrapping;  // Repeat the texture on the Y-axis

// Adjust the number of times the texture repeats (adjust these values as needed)
doorTexture.repeat.set(1, 1);  // Repeat the texture 2 times along X, 3 times along Y

// Create a material with the loaded texture
const doorMaterial = new THREE.MeshStandardMaterial({
  map: doorTexture,  // Apply the texture to the material

  side: THREE.DoubleSide  // Optionally, apply texture to both sides of the door
});

// Define the door geometry (size of the door)
const doorGeometry = new THREE.BoxGeometry(3, 6, 0.2); // Width, height, depth of the door

// Create the door mesh with the geometry and material
const door = new THREE.Mesh(doorGeometry, doorMaterial);

// Position the door in your scene (adjust position as needed)
door.position.set(24, 4,44); // Example position (x, y, z)
door.rotation.y = Math.PI / -2;
door.scale.set(3,2, 7); // Example position (x, y, z)

// Add the door to the scene
scene.add(door);

// Bind the key to this door
bindKeyToDoor(door);

let doorOpen = false; // Flag to track if the door is open

function checkProximityToDoor(playerPosition) {
  const doorPosition = door.position.clone();
  const distanceToDoor = playerPosition.distanceTo(doorPosition);

  if (distanceToDoor < 10) { // You can adjust the distance to your needs
    if (hasKey && !doorOpen && !hasUsedKey && boundDoor === door) {  // Ensure the key is bound to this door
      // Display a prompt to open the door if the player has the key
      showDoorOpenNote();  // Function to show a prompt on the screen (optional)
      document.addEventListener('keydown', onDoorPress);
    } else {
      // Display a different message if the player doesn't have the key
      showNoKeyNote();  // Function to show a "no key" message
      document.removeEventListener('keydown', onDoorPress);
    }
  } else {
    hideDoorNote();  // Hide the door prompt when not close
    document.removeEventListener('keydown', onDoorPress);
  }
}

// Handle "E" key press to open the door
function onDoorPress(event) {
  if (event.key === 'e') {
    if (hasKey && !hasUsedKey && boundDoor === door) {  // Only open this specific door with the key
      openDoor();  // Function to open the door
      doorOpenSound.play();  // Play the sound when the door opens
    } else {
      alert('You need the correct key to open the door!');  // Alert if the player doesn't have the key or tries to open the wrong door
    }
  }
}

function openDoor() {
  if (doorOpen) return; // Prevent reopening if already open
  doorOpen = true;

  // Animate the door's position to simulate it opening
  const doorTargetPosition = door.position.clone();
  doorTargetPosition.z -= 5.4; // Move the door 5 units to the left (adjust as needed)
  
  const animationDuration = 1; // 1-second animation
  let startTime = performance.now();

  function animateDoor() {
    const elapsedTime = (performance.now() - startTime) / 50000; // Time elapsed in seconds
    if (elapsedTime < animationDuration) {
      // Lerp (smooth transition) between current position and target position
      door.position.lerp(doorTargetPosition, elapsedTime / animationDuration);
      requestAnimationFrame(animateDoor);
    } else {
      // Ensure the door ends up at the final position
      door.position.copy(doorTargetPosition);
    }
  }

  animateDoor();

  // Play door open sound
  doorOpenSound.play();

  // Mark the key as used
  hasUsedKey = true;

  // Remove the key from the camera and scene
  if (keyObject) {
    camera.remove(keyObject); // Detach from the camera
    keyObject = null; // Fully remove the key reference
    const keyImageContainer = document.getElementById('key-image-container');
  if (keyImageContainer) {
    keyImageContainer.style.display = 'none';  // Hide the key image
  }
  }

  // Hide the inventory image
  hideKeyImage();
}


// Show the door prompt
function showDoorOpenNote() {
  const doorNote = document.getElementById('door-open-note');
  if (doorNote) {
    doorNote.style.display = 'block';  // Show the "Press E to open the door" note
  }
}

// Hide the door prompt
function hideDoorNote() {
  const doorNote = document.getElementById('door-open-note');
  if (doorNote) {
    doorNote.style.display = 'none';  // Hide the door prompt
  }
}

// Show the "no key" message
function showNoKeyNote() {
  const noKeyNote = document.getElementById('no-key-note');
  if (noKeyNote) {
    noKeyNote.style.display = 'block';  // Show "You need the key" note
  }
}
//================================================================
// Ceiling Light Setup (Completely Black)
//================================================================
// Ceiling Light Setup (Static, No Animation, No Effects)
let sparkceiling, material;

// Load the GLB model of the ceiling light
loader.load('/images/models/long_office_ceiling_light.glb', (gltf) => {
  sparkceiling = gltf.scene;
  sparkceiling.scale.set(17, 15, 15); // Set the scale of the ceiling light
  sparkceiling.position.set(34, 18.510, -14); // Set the position of the ceiling light
  
  // Rotate the ceiling light to face the opposite direction (downwards)
  sparkceiling.rotation.x = Math.PI; // Rotate 180 degrees around the X-axis
  sparkceiling.rotation.y = Math.PI/2; // Rotate 180 degrees around the X-axis
  sparkceiling.castShadow = true;  // Enable casting shadow
  sparkceiling.receiveShadow = true;  // Enable receiving shadow
  scene.add(sparkceiling);
});
// Import necessary Three.js components

import TWEEN from '@tweenjs/tween.js';

// Initialize audio elements for each action with max volume
const wrongPasswordSound = new Audio('/sounds/Sound effect WRONG ANSWER.mp3');
const correctPasswordSound = new Audio('/sounds/Correct answer Sound effect.mp3');
const typingSound = new Audio('/sounds/enter button on a keyboard sound effect (royalty free).mp3');
const deviceInteractionSound = new Audio('/sounds/90s PC boot sequence with sound HD.mp3');
const doorOpenSound1 = new Audio('/sounds/Faction Vault Door Open (Fortnite Sound) - Sound Effect for editing.mp3');  // Path to the door open sound effect

wrongPasswordSound.volume = 1.0;
correctPasswordSound.volume = 1.0;
typingSound.volume = 1.0;
deviceInteractionSound.volume = 1.0;
doorOpenSound1.volume = 1.0;  // Set volume to maximum

// Create the password door and device
let passwordDoor, passwordDevice;
let correctPassword = "1532";  // Correct password
let enteredPassword = "";  // Holds the player's input
let isInteracting = false;  // To check if the player is interacting
let interactionUI;  // UI elements for instructions
let inputDiv;  // Password input div
let playerPosition;  // Store player's position for distance check
let deviceInteracted = false;  // To track if the device has been interacted with already

const customDoorTexture = textureLoader.load('/images/texture/glass.jpg');  // Set your image path

// Set texture wrapping
customDoorTexture.wrapS = THREE.RepeatWrapping;  // Repeat the texture on the X-axis
customDoorTexture.wrapT = THREE.RepeatWrapping;  // Repeat the texture on the Y-axis

// Adjust the number of times the texture repeats
customDoorTexture.repeat.set(1, 1);  // Repeat the texture 1 time along X, 1 time along Y

// Create material with transparency and smoothness
const customDoorMaterial = new THREE.MeshStandardMaterial({
  map: customDoorTexture,        // Apply the texture
  transparent: true,             // Enable transparency
  opacity: 0.7,                  // Set semi-transparency (adjust 0 to 1 for desired effect)
  roughness: 0,                  // Make the material completely smooth
  side: THREE.DoubleSide         // Apply the texture to both sides
});

// Define geometry for the door
const customDoorGeometry = new THREE.BoxGeometry(1, 3, 0.2); // Width, height, depth of the door

// Create the door mesh
const texturedPasswordDoor = new THREE.Mesh(customDoorGeometry, customDoorMaterial);

// Position and scale the door
texturedPasswordDoor.position.set(16, 7, -42); // Same position as the original door
texturedPasswordDoor.rotation.y = Math.PI / 2;
texturedPasswordDoor.scale.set(16, 6, 4);  // Example scale (width, height, depth)

// Add the door to the scene
scene.add(texturedPasswordDoor);



const modelPath = '/images/models/simple_mini-atm.glb';  // Path to your .glb file

// Initialize passwordDevice as null initially
passwordDevice = null;

// Load the .glb model and add it to the scene
loader.load(modelPath, function (gltf) {
  passwordDevice = gltf.scene;
  passwordDevice.scale.set(0.0030, 0.0030, 0.0030); 
  passwordDevice.position.set(27, 6, -49.2); 
  passwordDevice.rotation.y = Math.PI / -2;
  scene.add(passwordDevice);
  console.log("Green device manager loaded");
}, undefined, function (error) {
  console.error("Error loading the GLTF model:", error);
});

// Create the UI instructions (hidden initially)
function createInteractionUI() {
  interactionUI = document.createElement('div');
  interactionUI.style.position = 'absolute';
  interactionUI.style.top = '10px';
  interactionUI.style.left = '50%';
  interactionUI.style.transform = 'translateX(-50%)';
  interactionUI.style.color = 'white';
  interactionUI.style.fontSize = '20px';
  interactionUI.style.fontFamily = 'Arial, sans-serif';
  interactionUI.innerHTML = ""; // Initially empty
  document.body.appendChild(interactionUI);
}
createInteractionUI();

// Handle key events for interaction
let typingTimeout;  // Timer for typing sound
function handleKeyPress(event) {
  if (event.key === 'e' && !isInteracting && !deviceInteracted) {
    if (isNearDevice()) {
      startPasswordInput();
      playDeviceInteractionSound();  // Play device interaction sound
    }
  } else if (event.key === 'q' && isInteracting) {
    quitInteraction();
    playDeviceInteractionSound();  // Play device interaction sound when closing
  } else if (isInteracting && event.key >= '0' && event.key <= '9') {
    enteredPassword += event.key;
    updatePasswordDisplay();
    playTypingSound();  // Play typing sound for entering password
    resetTypingSoundTimeout();  // Reset typing sound timeout to continue playing
  } else if (isInteracting && event.key === 'Enter') {
    validatePassword(enteredPassword);
  } else if (isInteracting && event.key === 'Backspace') {
    enteredPassword = enteredPassword.slice(0, -1);
    updatePasswordDisplay();
    playTypingSound();  // Play typing sound for backspace
    resetTypingSoundTimeout();  // Reset typing sound timeout to continue playing
  }
}
window.addEventListener('keydown', handleKeyPress);

// Handle mouse interaction (detect if player is looking at the device)
function onMouseMove(event) {
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([passwordDevice]);

  if (intersects.length > 0 && !isInteracting && isNearDevice() && !deviceInteracted) {
    interactionUI.innerHTML = "Press E to Interact with the Device Manager";  // Show instructions if near device
  } else if (intersects.length === 0 && !isInteracting) {
    interactionUI.innerHTML = "";  // Clear instructions when not near the device
  }
}


if (passwordDevice) {
  const intersects = raycaster.intersectObjects([passwordDevice]);

  if (intersects.length > 0 && !isInteracting && isNearDevice() && !deviceInteracted) {
    interactionUI.innerHTML = "Press E to Interact with the Device Manager";  // Show instructions if near device
  } else if (intersects.length === 0 && !isInteracting) {
    interactionUI.innerHTML = "";  // Clear instructions when not near the device
  }
} else {
  console.error("Password device is not defined!");
}




window.addEventListener('mousemove', onMouseMove);

// Check if player is near the device (within 15 tiles, assuming each tile is 1 unit in 3D space)
function isNearDevice() {
  if (!passwordDevice) return false;  // Make sure the device is loaded

  playerPosition = camera.position;
  const devicePosition = passwordDevice.position;
  const distance = playerPosition.distanceTo(devicePosition);
  console.log("Distance to device:", distance);  // Log the distance to the device
  return distance <= 8;  // 8 units distance check (adjust as needed)
}

// Start the password input process
function startPasswordInput() {
  isInteracting = true;
  playDeviceInteractionSound();  // Play sound for interaction
  interactionUI.innerHTML = "Enter Password:";

  inputDiv = document.createElement('div');
  inputDiv.style.position = 'absolute';
  inputDiv.style.top = '50%';
  inputDiv.style.left = '50%';
  inputDiv.style.transform = 'translate(-50%, -50%)';
  inputDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
  inputDiv.style.padding = '20px';
  inputDiv.style.borderRadius = '10px';
  inputDiv.style.color = 'white';
  inputDiv.style.fontFamily = 'fantasy';  // Set font to fantasy
  inputDiv.innerHTML = ` 
    <p style="font-size: 30px;">Entered Password: ${enteredPassword}</p>
    <p>Press Enter to Submit</p>
  `;
  document.body.appendChild(inputDiv);
}

// Update the password display (show the entered password)
function updatePasswordDisplay() {
  if (inputDiv) {
    inputDiv.innerHTML = ` 
      <p style="font-size: 30px; color: ${isCorrectPassword() ? 'green' : 'red'};">Entered Password: ${enteredPassword}</p>
      <p>Press Enter to Submit</p>
    `;
  }
}

// Validate the entered password
function validatePassword(password) {
  console.log("Entered Password:", password);  // Debugging the entered password
  if (password === correctPassword) {
    openPasswordDoor();
    showPasswordMessage(true);
    playCorrectPasswordSound();  // Play correct password sound
    setTimeout(() => quitInteraction(), 2000); // Delay before quitting interaction
    deviceInteracted = true;
  } else {
    showPasswordMessage(false);
    playWrongPasswordSound();  // Play wrong password sound
    enteredPassword = ""; // Reset password input to try again
  }
}

// Check if the entered password is correct
function isCorrectPassword() {
  return enteredPassword === correctPassword;
}

// Show password validation message with styling
function showPasswordMessage(isCorrect) {
  const messageDiv = document.createElement('div');
  messageDiv.style.position = 'absolute';
  messageDiv.style.top = '60%';
  messageDiv.style.left = '50%';
  messageDiv.style.transform = 'translateX(-50%)';
  messageDiv.style.color = isCorrect ? 'green' : 'red';
  messageDiv.style.fontFamily = 'fantasy';
  messageDiv.style.fontSize = '30px';
  messageDiv.style.textAlign = 'center';
  
  if (isCorrect) {
    messageDiv.innerHTML = "Correct! Password accepted. Door is open.";
  } else {
    messageDiv.innerHTML = "Wrong password! Try again.";
  }

  document.body.appendChild(messageDiv);

  // Remove the message after 3 seconds
  setTimeout(() => {
    document.body.removeChild(messageDiv);
  }, 3000);
}

// Open the password door (trigger animation or door movement)
// Open the password door (trigger animation or door movement)
function openPasswordDoor() {
  // Play the door sound only if it's not already playing
  if (doorOpenSound1.paused || doorOpenSound1.ended) {
    doorOpenSound1.play();
  }

  // Animate the door opening (slide the door very slightly upward on the y-axis)
  const openDoorAnimation = new TWEEN.Tween(texturedPasswordDoor.position)
    .to({ y: texturedPasswordDoor.position.y + 11 }, 6000)  // Slide the door by a very small amount on the y-axis
    .easing(TWEEN.Easing.Quadratic.Out)
    .start();

  // Ensure the sound plays for the duration of the door opening animation
  setTimeout(() => {
    // Stop the sound after the animation is complete
    doorOpenSound1.pause();
    doorOpenSound1.currentTime = 0;  // Reset sound to the beginning
  }, 6000); // Match this duration with the animation time (6000ms)
}


// Quit the interaction (if the player presses Q)
function quitInteraction() {
  isInteracting = false;
  enteredPassword = ""; // Reset password input
  interactionUI.innerHTML = "";  // Hide the interaction prompt
  
  // Stop the device interaction sound if it's playing
  if (!deviceInteractionSound.paused) {
    deviceInteractionSound.pause();
    deviceInteractionSound.currentTime = 0;  // Reset sound to the beginning
  }
  
  if (inputDiv) {
    document.body.removeChild(inputDiv);
  }
}

// Update the interaction UI based on proximity to the device
function updateInteractionUI() {
  if (passwordDevice && isNearDevice() && !isInteracting && !deviceInteracted) {
    interactionUI.innerHTML = "Press E to Interact with the Device Manager";  // Show message when near
  } else if (!isNearDevice() || deviceInteracted) {
    interactionUI.innerHTML = "";  // Hide message when not near or already interacted
  }
}

// Define sound functions outside the animate loop
function playWrongPasswordSound() {
  wrongPasswordSound.play();
}

function playCorrectPasswordSound() {
  correctPasswordSound.play();
}

function playTypingSound() {
  if (typingTimeout) clearTimeout(typingTimeout);  // Stop any previous typing sound
  typingSound.play();
}

function stopTypingSound() {
  typingSound.pause();
  typingSound.currentTime = 0;  // Reset sound to start
}

function resetTypingSoundTimeout() {
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(stopTypingSound, 1000);  // Stop sound if no typing happens in 1 second
}

function playDeviceInteractionSound() {
  deviceInteractionSound.play();
}






function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // Ensure pointer lock is engaged and controls are initialized
   // Ensure pointer lock is engaged and controls are initialized
   if (pointerLockControls && pointerLockControls.object) {
    console.log("PointerLockControls state:", pointerLockControls);
    console.log("PointerLockControls object:", pointerLockControls.object);

    if (pointerLockControls.isLocked) {
        // Update fpsControls when pointer is locked
        if (fpsControls) {
            fpsControls.update(delta); // Update first-person controls
        } else {
            console.error("FPSControls is not initialized.");
        }
    } else {
        console.log("Pointer is not locked; skipping controls update.");
        // Do not attempt to lock pointer if it's already locked
    }
}


  // Render the scene
  renderer.render(scene, camera);
}
console.log(pointerLockControls);  // Add this in your animate function
if (pointerLockControls && pointerLockControls.object) {
    console.log("PointerLockControls is correctly initialized");
} else {
    console.error("PointerLockControls issss not initialized correctly");
}


animate();