import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let camera, frontCamera, sideCamera, topCamera, perspectiveCamera;
let scene, renderer;

// Temporário:
let table;

function addTableLeg(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(2, 6, 2);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y - 3, z);
    obj.add(mesh);
}
  
function addTableTop(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(60, 2, 20);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}
  
function createTable(x, y, z) {
    table = new THREE.Object3D();
  
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
  
    addTableTop(table, 0, 0, 0, material);
    addTableLeg(table, -25, -1, -8, material);
    addTableLeg(table, -25, -1, 8, material);
    addTableLeg(table, 25, -1, 8, material);
    addTableLeg(table, 25, -1, -8, material);
  
    scene.add(table);
  
    table.position.x = x;
    table.position.y = y;
    table.position.z = z;
}
//temporário end


/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#e8fcff');
    //scene.add(new THREE.AxesHelper(10)); //?
    createTable(0, 8, 0);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

function createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    const size = 50;

    // Orthographic Cameras: front, side, top
    frontCamera = new THREE.OrthographicCamera(-size * aspect, size * aspect, size, -size, 1, 1000);
    frontCamera.position.set(0, 0, 100);
    frontCamera.lookAt(scene.position);

    sideCamera = new THREE.OrthographicCamera(-size * aspect, size * aspect, size, -size, 1, 1000);
    sideCamera.position.set(100, 0, 0);
    sideCamera.lookAt(scene.position);

    topCamera = new THREE.OrthographicCamera(-size * aspect, size * aspect, size, -size, 1, 1000);
    topCamera.position.set(0, 100, 0);
    topCamera.lookAt(scene.position);

    // Perspective Camera
    perspectiveCamera = new THREE.PerspectiveCamera(70, aspect, 1, 1000);
    perspectiveCamera.position.set(50, 50, 50);
    perspectiveCamera.lookAt(scene.position);

    // Set default camera (perspective)
    camera = perspectiveCamera;
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {}

////////////
/* UPDATE */
////////////
function update() {}

/////////////
/* DISPLAY */
/////////////
function render() {
    renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCamera();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    render();

    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    switch (e.keyCode) {
        case 49: // '1'
          camera = frontCamera;
          break;
        case 50: // '2'
          camera = sideCamera;
          break;
        case 51: // '3'
          camera = topCamera;
          break;
        case 52: // '4'
          camera = perspectiveCamera;
          break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {}

init();
animate();