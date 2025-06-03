import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

// DÚVIDAS

// Que câmara é colocada como default?

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
const OVNI_SCALE_Y = 0.3;
const OVNI_HEIGHT = OVNI_SCALE_Y * OVNI_RADIUS;
const OVNI_COCKPIT_RADIUS = OVNI_RADIUS / 2;
const OVNI_SPOTLIGHT_HEIGHT = 3;
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
const size = 70;
let scene, renderer, textureFloral, textureSky, skydome, moon, directionalLight, ovni, ovniSpotLight; 
let moonMaterials = {
    lambert: new THREE.MeshLambertMaterial({ color: 0xFFFFFF, emissive: 0x222222 }),
    phong: new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 100, emissive: 0x222222 }),
    toon: new THREE.MeshToonMaterial({ color: 0xFFFFFF })
};
const ovniMaterials = {
    lambert: {
        body: new THREE.MeshLambertMaterial({ color: 0xbf0453, emissive: 0x222222 }),
        cockpit: new THREE.MeshLambertMaterial({ color: 0xfae1fd, emissive: 0x222222 })
    },
    phong: {
        body: new THREE.MeshPhongMaterial({ color: 0xbf0453, shininess: 100, emissive: 0x222222 }),
        cockpit: new THREE.MeshPhongMaterial({ color: 0xfae1fd, shininess: 100, emissive: 0x222222 })
    },
    toon: {
        body: new THREE.MeshToonMaterial({ color: 0xbf0453 }),
        cockpit: new THREE.MeshToonMaterial({ color: 0xfae1fd })
    }
};
let camera, orthoCamera, perspectiveCamera;
let heightData, img;
let heightmapWidth, heightmapHeight;
//let useStereo, stereoCamera;
const clock = new THREE.Clock();

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
    //scatterTrees(NUMBER_TREES);
    createMoon();
    createLight();
    createOvni(0, 0, 0)
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

    // stereoCamera = new THREE.StereoCamera();
    // stereoCamera.aspect = 0.5;
    // useStereo = false;

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

function setFixedPerspectiveView() {
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
    //const geometry = new THREE.CircleGeometry(SKYDOME_RADIUS, SEGMENTS)
    const geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT, 64, 64);

    // TODO: mudar cenas para ficar mais abstrato
    const terrainTexture = loader.load( 'pictures/heightmap.png' );
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
    scene.add(terrain);
    
    img = new Image();
    img.src = 'pictures/heightmap.png';
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
        side: THREE.BackSide // <- isto é importante para vermos por dentro
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
            data[i++] = brightness / 255; // normalizado entre 0 e 1
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
    const height = heightData[index]; // entre 0 e 1

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
    foliage1.scale.set(1.2, 0.8, 1.0);
    foliage1.position.set(-Math.sin(trunkGroup.rotation.z) * TREE_HEIGHT, foliageY, 0);
    tree.add(foliage1);

    // Additional canopy ellipsoid
    const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(FOLIAGE_RADIUS *0.8), foliageMaterial);
    foliage2.scale.set(1.1, 0.7, 1.0);
    foliage2.position.set(-Math.sin(branch.rotation.z), foliageY * 0.9, 0);
    tree.add(foliage2);

    tree.position.set(x, y, z);
    scene.add(tree);
}

function scatterTrees(count) {
    for (let i = 0; i < count; i++) {
        const x = randInt(-PLANE_WIDTH / 2 + edgeMargin, PLANE_WIDTH / 2 - edgeMargin);
        const z = randInt(-PLANE_HEIGHT / 2 + edgeMargin, PLANE_HEIGHT / 2 - edgeMargin);
        const y = getHeightAt(x, z, heightData, heightmapWidth, heightmapHeight, PLANE_WIDTH, MAX_TERRAIN_HEIGHT);
        createTree(x, y -SKYDOME_RADIUS / 2, z);
    }
}

function createOvni(x, y, z){
    ovni = new THREE.Group();
    scene.add(ovni);
    console.log(ovni.position)
    
    // Body 
    const geometryOvniBody = new THREE.SphereGeometry(OVNI_RADIUS, SEGMENTS, SEGMENTS);
    geometryOvniBody.scale(1, OVNI_SCALE_Y, 1); // achatar em Y
    const bodyOvni = new THREE.Mesh(geometryOvniBody, ovniMaterials.lambert.body);
    ovni.add(bodyOvni);

    // Cockpit ovni
    const geometryCockpit = new THREE.SphereGeometry(OVNI_COCKPIT_RADIUS, SEGMENTS, SEGMENTS, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpit = new THREE.Mesh(geometryCockpit, ovniMaterials.lambert.cockpit);
    cockpit.position.y = OVNI_HEIGHT / 2 ; 
    cockpit.name = 'ovni-cockpit'
    ovni.add(cockpit);

    // Spotlight
    const geometrySpotlightHolder = new THREE.CylinderGeometry(OVNI_COCKPIT_RADIUS, OVNI_COCKPIT_RADIUS, OVNI_SPOTLIGHT_HEIGHT, SEGMENTS);
    const spotlightHolder = new THREE.Mesh(geometrySpotlightHolder, ovniMaterials.lambert.body);
    spotlightHolder.position.y = -OVNI_HEIGHT / 2;
    ovni.add(spotlightHolder);

    // Small lights and center spotlight
    ovni.pointLights = createOvniLights(bodyOvni);
    ovniSpotLight = new THREE.SpotLight(0xFFFFFF, 1, 30, Math.PI / 6);
    ovniSpotLight.position.set(0, -1.5, 0);
    ovniSpotLight.target.position.set(0, -10, 0);
    ovni.add(ovniSpotLight);
    ovni.add(ovniSpotLight.target);

    ovni.movementVector = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
    };

    ovni.lightsOn = true;
}

function createOvniLights(bodyOvni){
    const pointLights = [];
    for (let i = 0; i < OVNI_NUM_LIGHTS; i++) {
        const angle = (i / OVNI_NUM_LIGHTS) * Math.PI * 2;
        const x = Math.cos(angle) * OVNI_LIGHTS_RADIUS;
        const z = Math.sin(angle) * OVNI_LIGHTS_RADIUS;
        
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);             // quando estao desligadas parece q a luz continua
        const material = new THREE.MeshStandardMaterial({ color: 0xFFFFAA, emissive: 0xFFFFAA });
        const bulb = new THREE.Mesh(geometry, material);
        bulb.position.set(x, - OVNI_HEIGHT * 0.65, z);
        bulb.name = 'ovni-bulb';
        bodyOvni.add(bulb);

        const light = new THREE.PointLight(0xffffff, 1, 10);
        light.position.copy(bulb.position);
        bodyOvni.add(light);
        pointLights.push(light);
    }

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
    // se calhar n faz sentido estar sempre a chamar isto constantemente no update?
    // updateLights(ovni.pointLights, ovni.lightsOn);
    // updateLights([directionalLight], directionalLight.lightOn);
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

function updateMaterials(currentShading) {
    moon.material = moonMaterials[currentShading];

    ovni.traverse((child) => {
        if (child.isMesh && child.name != 'ovni-bulb') { // only change material of non light objects
            if (child.name === 'ovni-cockpit')   child.material = ovniMaterials[currentShading].cockpit;
            else    child.material = ovniMaterials[currentShading].body;
        }
    });

    // Adiciona os restantes objetos 
}

/////////////
/* DISPLAY */
/////////////
function render() {
    renderer.render(scene, camera);
}

// function renderStereo() {
//     stereoCamera.update(camera);
//     renderer.setScissorTest(true);

//     const width = window.innerWidth / 2;
//     const height = window.innerHeight;

//     // Olho esquerdo
//     renderer.setScissor(0, 0, width, height);
//     renderer.setViewport(0, 0, width, height);
//     renderer.render(scene, stereoCamera.cameraL);

//     // Olho direito
//     renderer.setScissor(width, 0, width, height);
//     renderer.setViewport(width, 0, width, height);
//     renderer.render(scene, stereoCamera.cameraR);

//     renderer.setScissorTest(false);
// }

////////////////////////////////
/*           VR Mode          */
////////////////////////////////

function allowVRmode() {
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));
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
    allowVRmode();

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

function startXRLoop() {
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
            setFixedPerspectiveView();
            //useStereo = true;
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
            updateMaterials("lambert");
            break;
        case 'w':
        case 'W':
            updateMaterials("phong");
            break;
        case 'e':
        case 'E':
            updateMaterials("toon");
            break;
        case 'd':
        case 'D':   // é necessário o if?
            if (directionalLight) { // NOTA: será boa ideia fazer diretamente aqui?
                // directionalLight.visible = !directionalLight.visible;
                updateLights([directionalLight], !directionalLight.visible); // ALTERNATIVA
            }
            break;
        case 'p':
        case 'P':
            ovni.lightsOn = true;
            console.log('p pressed');
            updateLights(ovni.pointLights, ovni.lightsOn);
            // updateLights(ovni.pointLights, true); // ALTERNATIVA
            break;
        case 's':
        case 'S':
            ovni.lightsOn = false;
            console.log('s pressed');
            updateLights(ovni.pointLights, ovni.lightsOn);
            // updateLights(ovni.pointLights, false); // ALTERNATIVA
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