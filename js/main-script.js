import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

///////////////
/* CONSTANTS */
///////////////

// Head
const HEAD_SIZE = 10;
const HEAD_OFFSET_X = 0;
const HEAD_OFFSET_Y = 8;
const HEAD_OFFSET_Z = 0;

// Eyes (relative to head center)
const EYE_SIZE = 0.8;
const EYE_OFFSET_X = HEAD_SIZE * 0.25;
const EYE_OFFSET_Y = HEAD_SIZE * 0.95;
const EYE_OFFSET_Z = HEAD_SIZE * 0.55;

// Torso
const TORSO_WIDTH = 10;
const TORSO_HEIGHT = 12;
const TORSO_DEPTH = 5;

// Arms
const ARM_WIDTH = 2;
const ARM_LENGTH = 5;
const ARM_OFFSET_Y = 2;
const ARM_OFFSET_X = TORSO_WIDTH / 2 + ARM_WIDTH / 2;

// Legs
const LEG_WIDTH = 2;
const LEG_HEIGHT = 4;
const LEG_OFFSET_Y = -TORSO_HEIGHT / 2 - LEG_HEIGHT / 2;

// Feet
const FOOT_WIDTH = 2.5;
const FOOT_HEIGHT = 1;
const FOOT_DEPTH = 3;
const FOOT_OFFSET_Y = LEG_OFFSET_Y - LEG_HEIGHT / 2 - FOOT_HEIGHT / 2;


//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let camera, frontCamera, sideCamera, topCamera, perspectiveCamera;
let scene, renderer;
let head;
let robot;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#e8fcff');
    //scene.add(new THREE.AxesHelper(10)); //?
    createRobot(0, 0, 0);
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

function addEyes(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(EYE_SIZE, EYE_SIZE, EYE_SIZE);

    const leftEye = new THREE.Mesh(geometry, material);
    leftEye.position.set(x, y, z);
    obj.add(leftEye);

    const rightEye = new THREE.Mesh(geometry, material);
    rightEye.position.set(-x, y, z);
    obj.add(rightEye);
}

function addHead(obj, x, y, z, material) {
    const headGroup = new THREE.Group();

    const geometry = new THREE.BoxGeometry(HEAD_SIZE, HEAD_SIZE, HEAD_SIZE);
    const head = new THREE.Mesh(geometry, material);
    head.position.set(x, y, z);
    headGroup.add(head);

    addEyes(headGroup, EYE_OFFSET_X, EYE_OFFSET_Y, EYE_OFFSET_Z, material);

    obj.add(headGroup);
}

function createRobot(x, y, z) {
    robot = new THREE.Object3D();

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    addHead(robot, HEAD_OFFSET_X, HEAD_OFFSET_Y, HEAD_OFFSET_Z, material);

    scene.add(robot);

    robot.position.set(x, y, z);
}

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