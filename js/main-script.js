import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

///////////////
/* CONSTANTS */
///////////////

// Torso
const TORSO_WIDTH = 30;
const TORSO_HEIGHT = 16;
const TORSO_DEPTH = 15;
const TORSO_OFFSET_X = 0;
const TORSO_OFFSET_Y = 0;
const TORSO_OFFSET_Z = 0;

// Abdomen (relative to torso center)
const ABDOMEN_WIDTH  = 14;
const ABDOMEN_HEIGHT = 4;
const ABDOMEN_DEPTH  = 8;
const ABDOMEN_OFFSET_X = 0;
const ABDOMEN_OFFSET_Y = -TORSO_HEIGHT / 2 - ABDOMEN_HEIGHT / 2;
const ABDOMEN_OFFSET_Z = 0;

// Waist (relative to torso center)
const WAIST_WIDTH  = 20;
const WAIST_HEIGHT = 8;
const WAIST_DEPTH  = 10;
const WAIST_OFFSET_X = 0;
const WAIST_OFFSET_Y = ABDOMEN_OFFSET_Y - ABDOMEN_HEIGHT / 2 - WAIST_HEIGHT / 2;
const WAIST_OFFSET_Z = 0;

// Head (relative to torso center)
const HEAD_SIZE = 10;
const HEAD_OFFSET_X = 0;
const HEAD_OFFSET_Y = TORSO_HEIGHT / 2 + HEAD_SIZE / 2;
const HEAD_OFFSET_Z = 0;

// Eyes (relative to head center)
const EYE_SIZE = 0.9;
const EYE_OFFSET_X = HEAD_SIZE / 5;
const EYE_OFFSET_Y = HEAD_SIZE / 8;
const EYE_OFFSET_Z = HEAD_SIZE / 2 + EYE_SIZE / 2;

// Antennas (relative to head center)
const ANTENNA_RADIUS = 0.7;
const ANTENNA_HEIGHT = 9;
const ANTENNA_OFFSET_X = HEAD_SIZE / 2 + ANTENNA_RADIUS;
const ANTENNA_OFFSET_Y = HEAD_SIZE / 2.5;
const ANTENNA_OFFSET_Z = 0;

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

const materials = {
    torso:    new THREE.MeshBasicMaterial({ color: 0x8b0000, wireframe: false }), // dark red
    abdomen:  new THREE.MeshBasicMaterial({ color: 0x26428B, wireframe: false }), // dark navy blue
    waist:    new THREE.MeshBasicMaterial({ color: 0x8b0000, wireframe: false }), // dark red
    head:     new THREE.MeshBasicMaterial({ color: 0x26428B, wireframe: false }), // dark navy blue
    eyes:     new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false }), // black
    antennas: new THREE.MeshBasicMaterial({ color: 0x26428B, wireframe: false })  // dark navy blue
};

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let camera, frontCamera, sideCamera, topCamera, perspectiveCamera;
let scene, renderer;
let headGroup, waistGroup, torso;
let robot;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#e8fcff');
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

function addTorso(obj, x, y, z, material) {
    torso = new THREE.Object3D();

    const geometry = new THREE.BoxGeometry(TORSO_WIDTH, TORSO_HEIGHT, TORSO_DEPTH);
    const torsoMesh = new THREE.Mesh(geometry, material);

    torso.add(torsoMesh);
    obj.add(torso);
}

function addAbdomen(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(ABDOMEN_WIDTH, ABDOMEN_HEIGHT, ABDOMEN_DEPTH);
    const abdomenMesh = new THREE.Mesh(geometry, material);
    abdomenMesh.position.set(x, y, z);
    obj.add(abdomenMesh);
}

function addWaist(obj, x, y, z, material) {
    waistGroup = new THREE.Group();

    const geometry = new THREE.BoxGeometry(WAIST_WIDTH, WAIST_HEIGHT, WAIST_DEPTH);
    const waistMesh = new THREE.Mesh(geometry, material);
    waistGroup.position.set(x, y, z);
    waistGroup.add(waistMesh);

    // TODO

    obj.add(waistGroup);
}

function addHead(obj, x, y, z, material) {
    headGroup = new THREE.Group();

    const geometry = new THREE.BoxGeometry(HEAD_SIZE, HEAD_SIZE, HEAD_SIZE);
    const headMesh = new THREE.Mesh(geometry, material);
    headGroup.position.set(x, y, z);
    headGroup.add(headMesh);

    addEyes(headGroup, EYE_OFFSET_X, EYE_OFFSET_Y, EYE_OFFSET_Z, materials.eyes);
    addAntennas(headGroup, ANTENNA_OFFSET_X, ANTENNA_OFFSET_Y, ANTENNA_OFFSET_Z, materials.antennas)

    obj.add(headGroup);
}

function addEyes(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(EYE_SIZE, EYE_SIZE, EYE_SIZE);

    const leftEye = new THREE.Mesh(geometry, material);
    leftEye.position.set(x, y, z);
    obj.add(leftEye);

    const rightEye = new THREE.Mesh(geometry, material);
    rightEye.position.set(-x, y, z);
    obj.add(rightEye);
}

function addAntennas(obj, x, y, z, material) {
    const geometry = new THREE.CylinderGeometry(ANTENNA_RADIUS, ANTENNA_RADIUS, ANTENNA_HEIGHT);

    const leftAntenna = new THREE.Mesh(geometry, material);
    leftAntenna.position.set(x, y, z);
    obj.add(leftAntenna);

    const rightAntenna = new THREE.Mesh(geometry, material);
    rightAntenna.position.set(-x, y, z);
    obj.add(rightAntenna);
}

function createRobot(x, y, z) {
    robot = new THREE.Object3D();

    addTorso(robot,TORSO_OFFSET_X, TORSO_OFFSET_Y, TORSO_OFFSET_Z, materials.torso);
    addAbdomen(robot, ABDOMEN_OFFSET_X, ABDOMEN_OFFSET_Y, ABDOMEN_OFFSET_Z,  materials.abdomen);
    addWaist(robot, WAIST_OFFSET_X, WAIST_OFFSET_Y, WAIST_OFFSET_Z,  materials.waist);
    addHead(torso, HEAD_OFFSET_X, HEAD_OFFSET_Y, HEAD_OFFSET_Z,  materials.head);

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

//////////////head//////////////////
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