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
const CANVAS_WIDTH = 2048;
const CANVAS_HEIGHT = 2048;

// Sky Texture
const STARS_NUMBER = 1500; 
const MAX_STAR_RADIUS = 1.5;
const MIN_STAR_RADIUS = 0.8;
const SKYDOME_RADIUS = 125;
const SEGMENTS = 64;

// Floral Field Texture
const CIRCLES_NUMBER = 1500;
const MAX_CIRCLE_RADIUS = 6;
const MIN_CIRCLE_RADIUS = 3;
const PLANE_WIDTH = SKYDOME_RADIUS * 2;
const PLANE_HEIGHT = SKYDOME_RADIUS * 2;

// Moon
const MOON_RADIUS = 15;
const MOON_OFFSET_X = - SKYDOME_RADIUS * 0.4;
const MOON_OFFSET_Y = -SKYDOME_RADIUS / 2 + SKYDOME_RADIUS * 0.6 ;
const MOON_OFFSET_Z = - SKYDOME_RADIUS / 2 ;

// Terrain
//const PLANE_WIDTH = window.innerWidth / 4;
// const PLANE_HEIGHT = 10;
//const PLANE_HEIGHT = window.innerHeight / 5;

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

const loader = new THREE.TextureLoader();
const aspect = window.innerWidth / window.innerHeight;
const size = 70;
let scene, renderer, textureFloral, textureSky, skydome, moon, directionalLight; 
let moonMaterials = {
    lambert: new THREE.MeshLambertMaterial({ color: 0xFFFFFF, emissive: 0x222222 }),
    phong: new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 100, emissive: 0x222222 }),
    toon: new THREE.MeshToonMaterial({ color: 0xFFFFFF })
};
let camera, orthoCamera, perspectiveCamera;


/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#FFFFFF'); // White
    createCanvasTexture(CANVAS_WIDTH, CANVAS_HEIGHT);
    createSkydome(textureSky);
    // createTerrain(0, - PLANE_HEIGHT / 2, 0, textureFloral);
    createTerrain(0,  -SKYDOME_RADIUS / 2, 0, textureFloral);
    createMoon();
    createLight();
}

function createLight (){
    directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(50, 30, 80);
    scene.add(directionalLight);
    // const ambientLight = new THREE.AmbientLight(0xffffff, 2.5); // TODO: mudar luzes dps -> escolher uma 
    // scene.add(ambientLight);
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
    perspectiveCamera.position.set(50, 30, 80);
    perspectiveCamera.lookAt(scene.position);
    camera = perspectiveCamera;
}

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
    textureSky = new THREE.CanvasTexture(canvas);
    textureFloral = new THREE.CanvasTexture(canvas);
}

function randInt(min, max) {
    return Math.random() * (max - min) + min;
}

function createFieldTexture() {
    const canvas = textureFloral.image;
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

    textureFloral.needsUpdate = true;
}

function createSkyTexture() {
    const canvas = textureSky.image;
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

    textureSky.needsUpdate = true;
}

function createMoon() {
    const geometry = new THREE.SphereGeometry(MOON_RADIUS, SEGMENTS, SEGMENTS);
    moon = new THREE.Mesh(geometry, moonMaterials.lambert); 
    moon.position.set(MOON_OFFSET_X, MOON_OFFSET_Y, MOON_OFFSET_Z);
    scene.add(moon);
}

function createTerrain(x, y, z, texture) {
    const geometry = new THREE.CircleGeometry(SKYDOME_RADIUS, SEGMENTS)
    // const geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT, 64, 64);

    // TODO: mudar cenas para ficar mais abstrato
    const terrainTexture = loader.load( 'pictures/heightmap.png' );
    texture.colorSpace = THREE.SRGBColorSpace;      // este material precisa de luz!!
    const material = new THREE.MeshPhongMaterial({  // usar phong? antes usei standard q é mais accurate em termos de física, pior em termos de performance (mais pesado)
        map: texture,                               //TODO: ver wrapping / filtering das aulas teóricas
        aoMap: terrainTexture,
        aoMapIntensity: 0.75,
        displacementMap: terrainTexture,
        displacementScale: 25,
        side: THREE.DoubleSide,
    });
    const terrain = new THREE.Mesh(geometry, material);
    terrain.position.set(x, y, z);
    terrain.rotation.x = -Math.PI / 2; // rotate it to make it flat on the XZ plane
    terrain.rotation.z = Math.PI / 4;  //TODO: ver como é q deixamos rotações/posição
    scene.add(terrain);
}

function createSkydome(texture) {
    const geometrySky = new THREE.SphereGeometry(SKYDOME_RADIUS, SEGMENTS, SEGMENTS, 0, Math.PI * 2, 0, Math.PI / 2);
    const materialSky = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide // <- isto é importante para vermos por dentro
    });
    skydome = new THREE.Mesh(geometrySky, materialSky);
    skydome.position.set(0, -SKYDOME_RADIUS / 2, 0);
    scene.add(skydome);
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

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    // update();
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
        case '7':
            setPerspectiveView();
            break;
        case '8': // vai ser para tirar
            setFrontView();
            break;
        case '9': // vai ser para tirar
            setSideView();
            break;
        case '0': // vai ser para tirar
            setTopView();
            break;
        case 'q':
        case 'Q':
            moon.material = moonMaterials.lambert;
            break;
        case 'w':
        case 'W':
            moon.material = moonMaterials.phong;
            break;
        case 'e':
        case 'E':
            moon.material = moonMaterials.toon;
            break;
        case 'd':
        case 'D':
            if (directionalLight) {
                directionalLight.visible = !directionalLight.visible;
            }
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