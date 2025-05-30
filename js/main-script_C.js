import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let camera, orthoCamera, perspectiveCamera;
const aspect = window.innerWidth / window.innerHeight;
const size = 60;
let scene, renderer;
let headGroup, waistGroup, torso, rightArm, leftArm;
let robot, trailer;
const clock = new THREE.Clock();

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#e8fcff'); // Light blue
    createRobot(ROBOT_X, ROBOT_Y, ROBOT_Z);
    createTrailer(TRAILER_X, TRAILER_Y, TRAILER_Z);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

function createCamera() {
    orthoCamera = new THREE.OrthographicCamera(
        -size * aspect, size * aspect,
        size, -size,
        1, 1000
    );
    perspectiveCamera = new THREE.PerspectiveCamera(70, aspect, 1, 1000);

    setFrontView(); // Default to front view
}

function setFrontView() {
    orthoCamera.left = -size * aspect;
    orthoCamera.right = size * aspect;
    orthoCamera.top = size;
    orthoCamera.bottom = -size;
    orthoCamera.updateProjectionMatrix();

    orthoCamera.position.set(0, 0, 100);
    orthoCamera.lookAt(scene.position);

    camera = orthoCamera;
}

function setSideView() {
    orthoCamera.left = -size * aspect;
    orthoCamera.right = size * aspect;
    orthoCamera.top = size;
    orthoCamera.bottom = -size;
    orthoCamera.updateProjectionMatrix();

    orthoCamera.position.set(100, 0, 0);
    orthoCamera.lookAt(scene.position);

    camera = orthoCamera;
}

function setTopView() {
    orthoCamera.left = -size * aspect;
    orthoCamera.right = size * aspect;
    orthoCamera.top = size;
    orthoCamera.bottom = -size;
    orthoCamera.updateProjectionMatrix();

    orthoCamera.position.set(0, 100, 0);
    orthoCamera.lookAt(scene.position);

    camera = orthoCamera;
}

function setPerspectiveView() {
    perspectiveCamera.position.set(50, 50, 80);
    perspectiveCamera.lookAt(scene.position);

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


///////////////////////
/* HANDLE COLLISIONS */
///////////////////////


////////////
/* UPDATE */
////////////


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
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    update();
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
    switch(e.key) {
 
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    switch(e.key) {

    }
}

init();
animate();