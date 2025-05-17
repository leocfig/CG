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
const WAIST_WIDTH  = 19;
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
const EYE_RADIUS = 0.6;
const EYE_HEIGHT = 0.6;
const EYE_OFFSET_X = HEAD_SIZE / 5;
const EYE_OFFSET_Y = HEAD_SIZE / 8;
const EYE_OFFSET_Z = HEAD_SIZE / 2 + EYE_HEIGHT / 2;

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

// Thighs (offset relative to waist)
const THIGH_WIDTH = 5;
const THIGH_HEIGHT = 10;
const THIGH_OFFSET_Y = -WAIST_HEIGHT / 2 - THIGH_HEIGHT / 2;

// Calves (offset relative to thigh)
const CALF_WIDTH = 8.5;
const CALF_HEIGHT = 20;
const CALF_SPACING = 2;
const CALF_OFFSET_Y = -THIGH_HEIGHT / 2 - CALF_HEIGHT / 2;
const THIGH_OFFSET_X = CALF_WIDTH / 2 + CALF_SPACING / 2;

// Feet (offset relative to calf)
const FOOT_WIDTH = CALF_WIDTH;
const FOOT_HEIGHT = 4.5;
const FOOT_DEPTH = 12;
const FOOT_OFFSET_Y = - CALF_HEIGHT / 2 - FOOT_HEIGHT / 2;
const FOOT_OFFSET_Z = FOOT_DEPTH / 2 - CALF_WIDTH / 2;

// Wheels (offset relative to calf)
const WHEEL_RADIUS = HEAD_SIZE / 2;
const WHEEL_HEIGHT = 5;
const LEG_WHEEL_OFFSET_X = CALF_WIDTH / 2 + WHEEL_HEIGHT / 2;
const LEG_WHEELS_OFFSET_Y = - FOOT_HEIGHT / 2;
const LEG_WHEELS_SPACING = WHEEL_RADIUS *1.2;

const materials = {
    torso:    new THREE.MeshBasicMaterial({ color: 0x8b0000, wireframe: false }), // dark red
    abdomen:  new THREE.MeshBasicMaterial({ color: 0x26428B, wireframe: false }), // dark navy blue
    waist:    new THREE.MeshBasicMaterial({ color: 0xC0C0C0, wireframe: false }), // dark red
    head:     new THREE.MeshBasicMaterial({ color: 0x26428B, wireframe: false }), // dark navy blue
    eyes:     new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false }), // black
    antennas: new THREE.MeshBasicMaterial({ color: 0x26428B, wireframe: false }), // dark navy blue
    thighs:   new THREE.MeshBasicMaterial({ color: 0xC0C0C0, wireframe: false }), // silver
    calves:   new THREE.MeshBasicMaterial({ color: 0x26428B, wireframe: false }), // dark navy blue
    feet:     new THREE.MeshBasicMaterial({ color: 0x26428B, wireframe: false }), // dark navy blue
    wheels:   new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false }), // black
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
    createRobot(0, 10, 0);
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

    addLegs(waistGroup, THIGH_OFFSET_X, THIGH_OFFSET_Y, 0, material);
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
    const geometry = new THREE.CylinderGeometry(EYE_RADIUS, EYE_RADIUS, EYE_HEIGHT);

    // Rotate so the cylinder faces forward instead of pointing up
    geometry.rotateX(Math.PI / 2);

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

function addWheel(obj, x, y, z, material) {
    const geometry = new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_HEIGHT);
    const wheel = new THREE.Mesh(geometry, material);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    obj.add(wheel);
}

function addLeg(obj, side, x, y, z, material) {
    const xSign = (side === "left" ? 1 : -1);

    const legGroup = new THREE.Group();
    const thigh = new THREE.Mesh(
        new THREE.BoxGeometry(THIGH_WIDTH, THIGH_HEIGHT, THIGH_WIDTH),
        materials.thighs
    );
    thigh.position.set(x*xSign, y, z);

    const calf = new THREE.Mesh(
        new THREE.BoxGeometry(CALF_WIDTH, CALF_HEIGHT, CALF_WIDTH),
        materials.calves
    );
    calf.position.y = CALF_OFFSET_Y;

    addWheel(calf, LEG_WHEEL_OFFSET_X*xSign, LEG_WHEELS_OFFSET_Y - LEG_WHEELS_SPACING, 0, materials.wheels);
    addWheel(calf, LEG_WHEEL_OFFSET_X*xSign, LEG_WHEELS_OFFSET_Y + LEG_WHEELS_SPACING, 0, materials.wheels);
    thigh.add(calf);

    const foot = new THREE.Mesh(
        new THREE.BoxGeometry(FOOT_WIDTH, FOOT_HEIGHT, FOOT_DEPTH),
        materials.feet
    );
    foot.position.set(0, FOOT_OFFSET_Y, FOOT_OFFSET_Z);
    calf.add(foot);

    legGroup.add(thigh);
    obj.add(legGroup);
}

function addLegs(obj, x, y, z, material) {
    const legsGroup = new THREE.Group();

    addLeg(legsGroup, "left",  x, y, z, material);
    addLeg(legsGroup, "right", x, y, z, material);

    obj.add(legsGroup);
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