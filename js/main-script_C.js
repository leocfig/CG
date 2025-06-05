import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

// DÚVIDAS

// Que câmara é colocada como default?
// Ter as posições das árvores num array dentro da função de ScatterTrees?

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

// Trees
const NUMBER_TREES = 10;
const TRUNK_RADIUS = 1;
const BRANCH_RADIUS = 0.5;
const DEBARKED_HEIGHT = 4;
const BARKED_HEIGHT = 8;
const TREE_HEIGHT = DEBARKED_HEIGHT + BARKED_HEIGHT;
const BRANCH_HEIGHT = TREE_HEIGHT / 1.5;
const FOLIAGE_RADIUS = 4;
const edgeMargin = TREE_HEIGHT * 0.5;
const foliageY = TREE_HEIGHT * 1.1;

// Moon
const MOON_RADIUS = 10;
const MOON_OFFSET_X = - SKYDOME_RADIUS * 0.4;
const MOON_OFFSET_Y = -SKYDOME_RADIUS / 2 + SKYDOME_RADIUS * 0.65;
const MOON_OFFSET_Z = - SKYDOME_RADIUS / 2 ;

// Terrain
//const PLANE_WIDTH = window.innerWidth / 4;
//const PLANE_HEIGHT = 10;
//const PLANE_HEIGHT = window.innerHeight / 5;
//const HEIGHTMAP_WIDTH = 505;
//const HEIGHTMAP_HEIGHT = 505;
const MAX_TERRAIN_HEIGHT = 25;

// Ovni
const OVNI_RADIUS = 8;
const OVNI_OFFSET_X = 0;
const OVNI_OFFSET_Y = 0;
const OVNI_OFFSET_Z = 0;
const OVNI_SCALE_Y = 0.3;
const OVNI_HEIGHT = OVNI_SCALE_Y * OVNI_RADIUS;
const OVNI_COCKPIT_RADIUS = OVNI_RADIUS / 2;
const OVNI_BASE_HEIGHT = 3;
const OVNI_NUM_LIGHTS = 12;
const OVNI_LIGHTS_RADIUS = OVNI_RADIUS * 0.65;
const OVNI_SPEED = 15;
const OVNI_ROTATION_SPEED = 0.5;
const MAX_OVNI_RADIUS = Math.sqrt(SKYDOME_RADIUS*SKYDOME_RADIUS - SKYDOME_RADIUS*SKYDOME_RADIUS*0.5*0.5) - OVNI_RADIUS;  // margin valid movement

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

const loader = new THREE.TextureLoader();
const aspect = window.innerWidth / window.innerHeight;
const size = 150;
let scene, renderer, textureFloral, textureSky, skydome, moon, directionalLight, ovni;

const materialLibrary = {
    lambert: {
        moon: new THREE.MeshLambertMaterial({ color: 0xFFFFFF, emissive: 0x444444 }),
        ovniBody: new THREE.MeshLambertMaterial({ color: 0xbf0453, emissive: 0x222222 }),
        ovniCockpit: new THREE.MeshLambertMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.7,
            emissive: 0x222222,
            side: THREE.DoubleSide
        }),
        ovniLights: new THREE.MeshLambertMaterial({ color: 0xFFFFAA, emissive: 0xFFFFAA }),
    },
    phong: {
        moon: new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 100, emissive: 0x222222 }),
        ovniBody: new THREE.MeshPhongMaterial({ color: 0xbf0453, shininess: 100, emissive: 0x222222 }),
        ovniCockpit: new THREE.MeshPhongMaterial({
            color: 0x88ccff,
            shininess: 5,
            emissive: 0x222222,
            transparent: true,
            opacity: 0.7,
            specular: 0xffffaa,
            side: THREE.DoubleSide
        }),
        ovniLights: new THREE.MeshPhongMaterial({ color: 0xFFFFAA, shininess: 100, emissive: 0xFFFFAA }),
    },
    toon: {
        moon: new THREE.MeshToonMaterial({ color: 0xFFFFFF }),
        ovniBody: new THREE.MeshToonMaterial({ color: 0xbf0453 }),
        ovniCockpit: new THREE.MeshToonMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        }),
        ovniLights: new THREE.MeshToonMaterial({ color: 0xFFFFAA, emissive: 0xFFFFAA }),
    }
};

const materialTargets = {};

let camera, orthoCamera, perspectiveCamera;
let heightData, img;
let heightmapWidth, heightmapHeight;
let currentMaterial;
const clock = new THREE.Clock();

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#FFFFFF'); // White
    currentMaterial = "lambert";
    createCanvasTexture(CANVAS_WIDTH, CANVAS_HEIGHT);
    createFieldTexture();
    createSkyTexture();
    createSkydome(textureSky);
    createTerrain(0, -SKYDOME_RADIUS / 2, 0, textureFloral, 'pictures/heightmap.png');
    createMoon(MOON_OFFSET_X, MOON_OFFSET_Y, MOON_OFFSET_Z);
    createLight(MOON_OFFSET_X + MOON_RADIUS, MOON_OFFSET_Y, MOON_OFFSET_Z + MOON_RADIUS);
    createOvni(OVNI_OFFSET_X, OVNI_OFFSET_Y, OVNI_OFFSET_Z);
}

function createLight (x, y, z) {
    directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(x, y, z);
    directionalLight.castShadow = true;

    const lightMarkerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const lightMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // amarelo
    const lightMarker = new THREE.Mesh(lightMarkerGeometry, lightMarkerMaterial);

    // Mesma posição da luz
    lightMarker.position.copy(directionalLight.position);
    scene.add(lightMarker);

    const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5); // 5 = tamanho
    scene.add(dirLightHelper);

    directionalLight.lightOn = true;
    scene.add(directionalLight);
    // const ambientLight = new THREE.AmbientLight(0xffffff, 2.5); // TODO: mudar luzes dps -> escolher uma 
    // scene.add(ambientLight);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

function createCamera() {
    // FIXME: depois tirar a câmara ortogonal
    orthoCamera = new THREE.OrthographicCamera(
        -size * aspect, size * aspect,
        size, -size,
        1, 1000
    );
    //perspectiveCamera = new THREE.PerspectiveCamera(70, aspect, 1, 1000);

    setFixedPerspectiveView();
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

function setFixedPerspectiveView() {
    // FIXME
    perspectiveCamera = new THREE.PerspectiveCamera(70, aspect, 1, 1000);
    perspectiveCamera.position.set(100, 100, 100);
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
    const canvasSky = document.createElement('canvas');
    canvasSky.width = width;
    canvasSky.height = height;
    textureSky = new THREE.CanvasTexture(canvasSky);

    const canvasFloral = document.createElement('canvas');
    canvasFloral.width = width;
    canvasFloral.height = height;
    textureFloral = new THREE.CanvasTexture(canvasFloral);
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

function createMoon(x, y, z) {
    const geometry = new THREE.SphereGeometry(MOON_RADIUS, SEGMENTS, SEGMENTS);
    moon = new THREE.Mesh(geometry, materialLibrary.lambert.moon); 
    moon.position.set(x, y, z);
    scene.add(moon);

    // Register to global target
    materialTargets.moon = moon;
}

function createTerrain(x, y, z, texture, heightmap) {
    const geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT, 64, 64);

    const terrainTexture = loader.load(heightmap);
    texture.colorSpace = THREE.SRGBColorSpace;      // este material precisa de luz!!
    const material = new THREE.MeshPhongMaterial({  // usar phong? antes usei standard q é mais accurate em termos de física, pior em termos de performance (mais pesado)
        map: texture,                               //TODO: ver wrapping / filtering das aulas teóricas
        aoMap: terrainTexture,
        aoMapIntensity: 0.75,
        displacementMap: terrainTexture,
        displacementScale: MAX_TERRAIN_HEIGHT,
        side: THREE.DoubleSide,
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.position.set(x, y, z);
    terrain.rotation.x = -Math.PI / 2; // rotate it to make it flat on the XZ plane
    //terrain.rotation.z = Math.PI / 4;  //TODO: ver como é q deixamos rotações/posição

    // TENTATIVA SPOTLIGHT TIRAR DEPOIS
    terrain.receiveShadow = true;
    scene.add(terrain);
    
    img = new Image();
    img.src = heightmap;
    img.onload = () => {
        heightmapWidth = img.naturalWidth;
        heightmapHeight = img.naturalHeight;
        heightData = getHeightData(img, heightmapWidth, heightmapHeight);
        scatterTrees(NUMBER_TREES);
    };
}

function createSkydome(texture) {
    const geometrySky = new THREE.SphereGeometry(SKYDOME_RADIUS, SEGMENTS, SEGMENTS, 0, Math.PI * 2, 0, Math.PI / 2);
    const materialSky = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide // <- isto é importante para vermos por dentro, depois tirar quando estivermos lá dentro?
    });
    skydome = new THREE.Mesh(geometrySky, materialSky);
    skydome.position.set(0, -SKYDOME_RADIUS / 2, 0);
    scene.add(skydome);
}

function getHeightData(img, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, width, height);

    const imageData = context.getImageData(0, 0, width, height).data;
    const data = new Float32Array(width * height);

    let i = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = imageData[index];
            const g = imageData[index + 1];
            const b = imageData[index + 2];
            const brightness = (r + g + b) / 3;
            data[i++] = brightness / 255; // normalized between 0 and 1
        }
    }
    return data;
}

function getHeightAt(x, z, heightData, heightmapWidth, heightmapHeight, planeSize, maxHeight) {
    const halfSize = planeSize / 2;

    const imgX = Math.floor((x + halfSize) / planeSize * heightmapWidth);
    const imgZ = Math.floor((z + halfSize) / planeSize * heightmapHeight);

    const clampedX = Math.max(0, Math.min(heightmapWidth - 1, imgX));
    const clampedZ = Math.max(0, Math.min(heightmapHeight - 1, imgZ));

    const index = clampedZ * heightmapWidth + clampedX;
    const height = heightData[index]; // between 0 and 1

    return height * maxHeight;
}

function createTree(x, y, z) {
    const tree = new THREE.Group();

    const trunkGroup = new THREE.Group();

    const debarkedGeometry = new THREE.CylinderGeometry(TRUNK_RADIUS * 0.8, TRUNK_RADIUS * 0.8, DEBARKED_HEIGHT);
    const debarkedMaterial = new THREE.MeshStandardMaterial({ color: '#a64500' }); // Dark-orange
    const debarked = new THREE.Mesh(debarkedGeometry, debarkedMaterial);
    debarked.position.y = DEBARKED_HEIGHT / 2;
    trunkGroup.add(debarked);

    const barkedGeometry = new THREE.CylinderGeometry(TRUNK_RADIUS, TRUNK_RADIUS, BARKED_HEIGHT);
    const barkedMaterial = new THREE.MeshStandardMaterial({ color: '#5e3c1a' }); // Dark brown
    const barked = new THREE.Mesh(barkedGeometry, barkedMaterial);
    barked.position.y = DEBARKED_HEIGHT + BARKED_HEIGHT / 2;
    trunkGroup.add(barked);

    const maxTilt = Math.PI / 6;
    trunkGroup.rotation.z = Math.random() * maxTilt; // slight tilt
    tree.add(trunkGroup);

    // Secondary branch
    const tilt = -trunkGroup.rotation.z;
    const branchY = (Math.cos(tilt) * BRANCH_HEIGHT + Math.cos(-tilt) * TREE_HEIGHT) / 2;

    const branchGeometry = new THREE.CylinderGeometry(BRANCH_RADIUS, BRANCH_RADIUS, BRANCH_HEIGHT);
    const branch = new THREE.Mesh(branchGeometry, barkedMaterial);
    branch.position.set(0, branchY, 0);
    branch.rotation.z = tilt;     // opposite tilt
    tree.add(branch);

    // Canopy
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: '#0f3d0f' }); // Dark green

    const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(FOLIAGE_RADIUS), foliageMaterial);
    foliage1.scale.set(1.2, 0.8, 1.0);  // flatten in y
    foliage1.position.set(-Math.sin(trunkGroup.rotation.z) * TREE_HEIGHT, foliageY, 0);
    tree.add(foliage1);

    // Additional canopy ellipsoid
    const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(FOLIAGE_RADIUS *0.8), foliageMaterial);
    foliage2.scale.set(1.1, 0.7, 1.0);  // flatten in y
    foliage2.position.set(-Math.sin(branch.rotation.z), foliageY * 0.9, 0);
    tree.add(foliage2);

    tree.position.set(x, y, z);
    tree.receiveShadow = true;
    scene.add(tree);
}

function scatterTrees(count) {

    // Fixed x and z coordinates for the trees
    const positions = [
        { x: -50, z: -30 }, { x: -10, z: 0 }, { x: 15, z: 15 }, { x: -50, z: 15 }, { x: -50, z: -50 },
        { x: -100, z: -20 }, { x: -60, z: -10 }, { x: 0, z: -15 }, { x: 30, z: 45 }, { x: -80, z: -40 },
        { x: -30, z: 10 }, { x: -70, z: 25 }, { x: -20, z: -35 }, { x: 10, z: -10 }, { x: 5, z: 30 },
        { x: -90, z: 0 }, { x: -40, z: 40 }, { x: 35, z: -25 }, { x: -25, z: 50 }, { x: -25, z: 100 },
        { x: -5, z: -50 }, { x: 50, z: -60 }, { x: 75, z: 30 }, { x: 60, z: 70 }, { x: -85, z: 60 },
        { x: 20, z: -70 }, { x: -15, z: 80 }, { x: 90, z: -10 }, { x: 40, z: 90 }, { x: -65, z: 85 },
        { x: 0, z: 100 }, { x: 100, z: 0 }, { x: 70, z: -40 }, { x: -100, z: 40 }, { x: 45, z: -90 },
        { x: 85, z: -80 }
    ];

    for (const pos of positions) {
        const y = getHeightAt(pos.x, pos.z, heightData, heightmapWidth, heightmapHeight, PLANE_WIDTH, MAX_TERRAIN_HEIGHT);
        createTree(pos.x, y - SKYDOME_RADIUS / 2, pos.z);
    }
}

function createOvni(x, y, z) {
    ovni = new THREE.Group();
    
    // Body 
    const bodyGeometry = new THREE.SphereGeometry(OVNI_RADIUS, SEGMENTS, SEGMENTS);
    bodyGeometry.scale(1, OVNI_SCALE_Y, 1); // flatten in y
    const body = new THREE.Mesh(bodyGeometry, materialLibrary.lambert.ovniBody);
    ovni.add(body);

    // Cockpit ovni
    const cockpitGeometry = new THREE.SphereGeometry(OVNI_COCKPIT_RADIUS, SEGMENTS, SEGMENTS, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpit = new THREE.Mesh(cockpitGeometry, materialLibrary.lambert.ovniCockpit);
    cockpit.position.y = OVNI_HEIGHT / 2 ;
    ovni.add(cockpit);

    // Spotlight
    const baseGeometry = new THREE.CylinderGeometry(OVNI_COCKPIT_RADIUS, OVNI_COCKPIT_RADIUS, OVNI_BASE_HEIGHT, SEGMENTS);
    const base = new THREE.Mesh(baseGeometry, materialLibrary.lambert.ovniBody);
    base.position.y = - OVNI_HEIGHT / 2;
    ovni.add(base);

    // Register to global target
    materialTargets.ovni = {
        body: body,
        cockpit: cockpit,
        base: base
    }

    ovni.position.set(x, y, z);
    scene.add(ovni);

    // Small lights and center spotlight
    ovni.pointLights = createOvniLights(-OVNI_HEIGHT * 0.65, body);
    // Create a spotlight to shine down from the base
    const spotlight = new THREE.SpotLight(0xffffff, 5, SKYDOME_RADIUS / 2, Math.PI / 6, 0.5, 0);
    spotlight.position.set(0, -OVNI_BASE_HEIGHT/2, 0);

    // Set the target of the spotlight (you can move this target if needed)
    const target = new THREE.Object3D();
    target.position.set(0, -SKYDOME_RADIUS / 2, 0); // Downward in local space mudar para n tar hardcoded
    spotlight.target = target;

    // Add spotlight to the UFO group
    base.add(spotlight);
    base.add(spotlight.target);
    ovni.spotLight = spotlight;

    // TENTATIVA SPOTLIGHT TIRAR DEPOIS
    //spotlight.castShadow = true;
    // ovni.castShadow = true;
    // body.castShadow = true;
    // body.receiveShadow = true;
    // base.castShadow = true;
    // base.receiveShadow = true;

    ovni.lightsOn = true;
    ovni.movementVector = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
    };
}

function createOvniLights(y, ovniBody) {
    const pointLights = [];
    const bulbMeshes = [];

    for (let i = 0; i < OVNI_NUM_LIGHTS; i++) {
        const angle = (i / OVNI_NUM_LIGHTS) * Math.PI * 2;
        const x = Math.cos(angle) * OVNI_LIGHTS_RADIUS;
        const z = Math.sin(angle) * OVNI_LIGHTS_RADIUS;
        
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const bulb = new THREE.Mesh(geometry, materialLibrary.lambert.ovniLights);
        bulb.position.set(x, y, z);
        ovniBody.add(bulb);
        bulbMeshes.push(bulb);

        const light = new THREE.PointLight(0xffffff, 1, 10);
        light.position.copy(bulb.position);
        ovniBody.add(light);
        pointLights.push(light);
    }

    if (!materialTargets.ovni) materialTargets.ovni = {};
    materialTargets.ovni.lights = bulbMeshes;

    return pointLights;
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
    const delta = clock.getDelta();
    updateOvni(delta);
    updateLights([directionalLight], directionalLight.lightOn);
    updateLights(ovni.pointLights, ovni.lightsOn);
    updateLights([ovni.spotLight], ovni.lightsOn);
    switchMaterial(currentMaterial);
}

function updateLights(lights, lightsOn) {
    for (const light of lights) {
        // if lightsOn is true, make the light visible
        light.visible = lightsOn;
    }
}

function updateOvni(delta){
    ovni.rotation.y += OVNI_ROTATION_SPEED * delta; // rotation 
    const movement = new THREE.Vector3(0, 0, 0);

    if (ovni.movementVector['ArrowUp'])      movement.z -= OVNI_SPEED * delta;
    if (ovni.movementVector['ArrowDown'])    movement.z += OVNI_SPEED * delta;
    if (ovni.movementVector['ArrowLeft'])    movement.x -= OVNI_SPEED * delta;
    if (ovni.movementVector['ArrowRight'])   movement.x += OVNI_SPEED * delta;

    const newX = ovni.position.x + movement.x;
    const newZ = ovni.position.z + movement.z;
    const distanceFromCenter = Math.sqrt(newX * newX + newZ * newZ);

    if (distanceFromCenter < MAX_OVNI_RADIUS)   ovni.position.add(movement);
}

function switchMaterial(type) {
    const materials = materialLibrary[type];

    if (!materials) {
        console.warn(`Material type "${type}" not found.`);
        return;
    }

    // Apply to moon
    if (materialTargets.moon) {
        materialTargets.moon.material = materials.moon;
    }

    // Apply to ovni parts
    const ovniParts = materialTargets.ovni;
    if (ovniParts) {
        ovniParts.body.material = materials.ovniBody;
        ovniParts.base.material = materials.ovniBody;
        ovniParts.cockpit.material = materials.ovniCockpit;
        ovniParts.lights.forEach(mesh => {
            mesh.material = materials.ovniLights;
        });
    }
}

/////////////
/* DISPLAY */
/////////////
function render() {
    renderer.render(scene, camera);
}

////////////////////////////////
/*           VR Mode          */
////////////////////////////////
function enableVRmode() {
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));
}

function disableVRmode() {
    renderer.xr.enabled = false;
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
    enableVRmode();

    // TENTATIVA SPOTLIGHT TIRAR DEPOIS
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    createScene();
    createCamera();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
//function animate() {
    // update();
    // if (useStereo) {
    //     renderStereo();
    // } else {
    // render();
    // }
    // requestAnimationFrame(animate);
//}

function startXRLoop() {                // TOASK -> então fica assim? É suposto não existir animate? Ou só depois de se clicar na tecla 7?
    renderer.setAnimationLoop(() => {
        update();
        render();
    });
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
            // Only disable VR mode if the user is currently in a VR session 
            if (renderer.xr.isPresenting) {
                disableVRmode();
            }
            setFixedPerspectiveView();
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
            currentMaterial = "lambert";
            break;
        case 'w':
        case 'W':
            currentMaterial = "phong";
            break;
        case 'e':
        case 'E':
            currentMaterial = "toon";
            break;
        case 'd':
        case 'D':
            directionalLight.lightOn = !directionalLight.visible;
            break;
        case 'p':
        case 'P':
            ovni.lightsOn = true;
            break;
        case 's':
        case 'S':
            ovni.lightsOn = false;
            break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            ovni.movementVector[e.key] = true;
            break;           
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    switch(e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            ovni.movementVector[e.key] = false;
            break;
    }
}

init();
//animate();
startXRLoop();