import * as THREE from 'three';

export class FPSControls {
  constructor(camera, scene, pointerLockControls) {
    this.camera = camera;
    this.scene = scene;
    this.pointerLockControls = pointerLockControls;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(100, 0, 100); // Adjust speed as needed
    this.deceleration = new THREE.Vector3(-10, -55, -10); // WeaffollowPlayerker gravity
    this.move = { forward: false, backward: false, left: false, right: false };
    this.isStanding = true;
    this.isEditMode = false; // Track whether we are in edit mode

    // Add event listeners for key events
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
          this.velocity.y += 30; // Adjust jump height as needed
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
      case 'Space': this.move.up = false; break;
      case 'ShiftLeft': this.move.down = false; break;
    }
  }
  update(delta) {
    // Boost the speed when in Edit Mode (Flying mode)
    const speedMultiplier = this.isEditMode ? 10 : 1; // Adjust this multiplier for desired speed increase
    
    const frameDeceleration = new THREE.Vector3(
      this.velocity.x * this.deceleration.x,
      this.deceleration.y,
      this.velocity.z * this.deceleration.z
    );
    frameDeceleration.multiplyScalar(delta);
    this.velocity.add(frameDeceleration);
    
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction); // Get the camera's forward direction
    
    // Normalize the camera's forward and right vectors
    const forward = new THREE.Vector3(direction.x, 0, direction.z).normalize();
    const right = new THREE.Vector3().crossVectors(this.camera.up, forward).normalize();
    const up = this.camera.up; // Up direction for flying (vertical movement)
    
    // Handle movement in 6 directions (forward, backward, left, right, up, down)
    if (this.move.forward) this.velocity.addScaledVector(forward, this.acceleration.z * delta * speedMultiplier);
    if (this.move.backward) this.velocity.addScaledVector(forward, -this.acceleration.z * delta * speedMultiplier);
    if (this.move.left) this.velocity.addScaledVector(right, this.acceleration.x * delta * speedMultiplier);
    if (this.move.right) this.velocity.addScaledVector(right, -this.acceleration.x * delta * speedMultiplier);
    
    // Allow moving up and down in edit mode (flying)
    if (this.move.up) this.velocity.addScaledVector(up, this.acceleration.y * delta * speedMultiplier);
    if (this.move.down) this.velocity.addScaledVector(up, -this.acceleration.y * delta * speedMultiplier);
    
    const position = this.pointerLockControls.getObject().position;
    
    // Raycasting to detect walls or models with a larger buffer zone (e.g., 1.5 units buffer)
    const bufferDistance = 1.5;  // Increase this value to create more space between player and objects
    const raycaster = new THREE.Raycaster(position, forward, 0, bufferDistance); // Adjust ray distance
    const intersects = raycaster.intersectObjects(this.scene.children, true); // Check for intersections with all objects in the scene
    
    // In Edit Mode (Flying), reset vertical velocity to prevent falling
    if (this.isEditMode) {
      this.velocity.y = 0; // Disable gravity effect
      position.addScaledVector(this.velocity, delta);
    } else {
      // In first-person mode, apply gravity and collision
      position.addScaledVector(this.velocity, delta);
      if (position.y < 5) {
        this.velocity.y = 0;
        position.y = 5;
        this.isStanding = true;
      }
  
      // Position clamping to prevent getting inside walls or models with buffer
      if (intersects.length > 0) {
        // If an object is in front, clamp the position to avoid getting too close
        position.sub(this.velocity.clone().multiplyScalar(delta));
        this.velocity.set(0, this.velocity.y, 0); // Stop movement along the collision axis
      }
      
      if (this.move.forward || this.move.backward || this.move.left || this.move.right) {
        // Create a subtle bump effect
        position.y += Math.sin(Date.now() / 200) * 0.1; // Adjust 0.1 for bump height and the frequency with Date.now()
    }
}
    
  }
  
}  