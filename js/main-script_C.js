import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

// DÚVIDAS

// Aqui tal como no caso das câmaras, também é boa prática termos só um objeto textura e depois esse objeto vai só tendo os seus parâmetros atualizados?

///////////////
/* CONSTANTS */
///////////////

// Canvas
const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 256;

// Floral Field Texture
const CIRCLES_NUMBER = 500;
const MAX_CIRCLE_RADIUS = 3;
const MIN_CIRCLE_RADIUS = 1;

// Sky Texture
const STARS_NUMBER = 800; 
const MAX_STAR_RADIUS = 0.8;
const MIN_STAR_RADIUS = 0.3;

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let camera, orthoCamera, perspectiveCamera;
const aspect = window.innerWidth / window.innerHeight;
const size = 60;
let scene, renderer, texture;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#FFFFFF'); // White
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

// function setSideView() {
//     orthoCamera.left = -size * aspect;
//     orthoCamera.right = size * aspect;
//     orthoCamera.top = size;
//     orthoCamera.bottom = -size;
//     orthoCamera.updateProjectionMatrix();

//     orthoCamera.position.set(100, 0, 0);
//     orthoCamera.lookAt(scene.position);

//     camera = orthoCamera;
// }

// function setTopView() {
//     orthoCamera.left = -size * aspect;
//     orthoCamera.right = size * aspect;
//     orthoCamera.top = size;
//     orthoCamera.bottom = -size;
//     orthoCamera.updateProjectionMatrix();

//     orthoCamera.position.set(0, 100, 0);
//     orthoCamera.lookAt(scene.position);

//     camera = orthoCamera;
// }

// function setPerspectiveView() {
//     perspectiveCamera.position.set(50, 50, 80);
//     perspectiveCamera.lookAt(scene.position);

//     camera = perspectiveCamera;
// }

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createCanvasTexture(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    texture = new THREE.CanvasTexture(canvas);
}

function randInt(min, max) {
    return Math.random() * (max - min) + min;
}

function createFieldTexture() {
    const canvas = texture.image;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#CAFFC4';   // Light green
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Standard CSS-recognized color names
    const colors = ['white', 'khaki', 'violet', 'lightblue'];

    for (let i = 0; i < CIRCLES_NUMBER; i++) {
        ctx.beginPath();
        const x = randInt(0, CANVAS_WIDTH);
        const y = randInt(0, CANVAS_HEIGHT);
        const radius = randInt(MIN_CIRCLE_RADIUS, MAX_CIRCLE_RADIUS);
        ctx.fillStyle = colors[Math.floor(randInt(0, colors.length))];
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    texture.needsUpdate = true;
}

function createSkyTexture() {
    const canvas = texture.image;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0b1441');  // Dark Blue
    gradient.addColorStop(1, '#3b0f70');  // Dark Violet

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < STARS_NUMBER; i++) {
        ctx.beginPath();
        const x = randInt(0, CANVAS_WIDTH);
        const y = randInt(0, CANVAS_HEIGHT);
        const radius = randInt(MIN_STAR_RADIUS, MAX_STAR_RADIUS);
        ctx.fillStyle = 'white';
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    texture.needsUpdate = true;
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////


///////////////////////
/* HANDLE COLLISIONS */
///////////////////////


////////////
/* UPDATE */
////////////

function update() {

}

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
    createCanvasTexture(CANVAS_WIDTH, CANVAS_HEIGHT);

    // Estas 4 linhas é só código aleatório para podermos visualizar a textura, no passo 3 já vamos actually aplicar ao objeto certo
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

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
        case '1':
            createFieldTexture();
            break;
        case '2':
            createSkyTexture();
            break;
            
            
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