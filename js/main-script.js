import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

///////////////
/* CONSTANTS */
///////////////

// ── Robot ────────────────────────────────────────────────────────────────────

// Robot starting position
const ROBOT_X = -20;
const ROBOT_Y = 20;
const ROBOT_Z = 30;

// Torso
const TORSO_WIDTH = 30;
const TORSO_HEIGHT = 16;
const TORSO_DEPTH = 15;
const TORSO_OFFSET_X = 0;
const TORSO_OFFSET_Y = 0;
const TORSO_OFFSET_Z = 0;

// Head (relative to torso center)
const HEAD_SIZE = 10;
const HEAD_OFFSET_X = 0;
const HEAD_OFFSET_Y = TORSO_HEIGHT / 2 + HEAD_SIZE / 2;
const HEAD_OFFSET_Z = -(TORSO_DEPTH - HEAD_SIZE) / 2;

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
const ARM_WIDTH = 7;
const ARM_LENGTH = TORSO_HEIGHT;
const FOREARM_LENGTH = TORSO_DEPTH + ARM_WIDTH
const ARM_OFFSET_Y = TORSO_HEIGHT / 2 - ARM_LENGTH / 2;
const ARM_OFFSET_X = TORSO_WIDTH / 2 + ARM_WIDTH / 2;
const ARM_OFFSET_Z = - TORSO_DEPTH / 2 + ARM_WIDTH / 2;

// Abdomen (relative to torso center)
const ABDOMEN_WIDTH  = TORSO_WIDTH - 2 * ARM_WIDTH;
const ABDOMEN_HEIGHT = ARM_WIDTH + HEAD_SIZE / 4;
const ABDOMEN_DEPTH  = 8;
const ABDOMEN_OFFSET_X = 0;
const ABDOMEN_OFFSET_Y = -TORSO_HEIGHT / 2 - ABDOMEN_HEIGHT / 2;
const ABDOMEN_OFFSET_Z = 0;

// Waist (relative to torso center)
const WAIST_WIDTH  = 19;
const WAIST_HEIGHT = 8.5;
const WAIST_DEPTH  = 10;
const WAIST_OFFSET_X = 0;
const WAIST_OFFSET_Y = ABDOMEN_OFFSET_Y - ABDOMEN_HEIGHT / 2 - WAIST_HEIGHT / 2;
const WAIST_OFFSET_Z = 0;

// Pipes
const PIPE_RADIUS = 1.5;
const PIPE_HEIGHT = 15;
const PIPE_OFFSET_X = ARM_WIDTH / 2 + PIPE_RADIUS;
const PIPE_OFFSET_Y = ARM_LENGTH / 2;
const PIPE_OFFSET_Z = 0;

// Thighs (offset relative to waist)
const THIGH_WIDTH = 5;
const THIGH_HEIGHT = 10;
const THIGH_OFFSET_Y = -WAIST_HEIGHT / 2 - THIGH_HEIGHT / 2;

// Calves (offset relative to thigh)
const CALF_WIDTH = WAIST_HEIGHT;
const CALF_HEIGHT = 20;
const CALF_SPACING = 2;
const CALF_OFFSET_Y = -THIGH_HEIGHT / 2 - CALF_HEIGHT / 2;
const THIGH_OFFSET_X = CALF_WIDTH / 2 + CALF_SPACING / 2;

// Feet (offset relative to calf)
const FOOT_WIDTH = CALF_WIDTH;
const FOOT_HEIGHT = CALF_WIDTH;
const FOOT_DEPTH = 12;
const FOOT_OFFSET_Y = - CALF_HEIGHT / 2 - FOOT_HEIGHT / 2;

// Wheels (offset relative to calf)
const WHEEL_RADIUS = HEAD_SIZE / 2;
const WHEEL_HEIGHT = 5;
const LEG_WHEELS_OFFSET_X = CALF_WIDTH / 2 + WHEEL_HEIGHT / 2;
const LEG_WHEELS_OFFSET_Y = - FOOT_HEIGHT / 2;
const LEG_WHEELS_SPACING = WHEEL_RADIUS *1.2;
const WAIST_WHEEL_OFFSET_X = WAIST_WIDTH / 2 + WHEEL_HEIGHT / 2;

const ROBOT_HEIGHT = HEAD_SIZE + TORSO_HEIGHT + ABDOMEN_HEIGHT + WAIST_HEIGHT + THIGH_HEIGHT + CALF_HEIGHT;
const ROTATION_SPEED = 2;

const materials = {
    darkBlue: new THREE.MeshBasicMaterial({ color: 0x26428B, wireframe: false }), // dark navy blue
    darkRed:  new THREE.MeshBasicMaterial({ color: 0x8b0000, wireframe: false }), // dark red
    silver:   new THREE.MeshBasicMaterial({ color: 0xC0C0C0, wireframe: false }), // silver
    black:    new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false }), // black
};

// ── Trailer ──────────────────────────────────────────────────────────────────

// Trailer Body (container)
const TRAILER_WIDTH  = 30;
const TRAILER_HEIGHT = 30;
const TRAILER_LENGTH = 50;
const TRAILER_OFFSET_X = 0;
const TRAILER_OFFSET_Y = 0;
const TRAILER_OFFSET_Z = 0;

// Trailer Base
const TRAILER_BASE_WIDTH  = TRAILER_WIDTH;
const TRAILER_BASE_HEIGHT = 4;
const TRAILER_BASE_LENGTH = TRAILER_LENGTH;
const TRAILER_BASE_OFFSET_X = TRAILER_OFFSET_X;
const TRAILER_BASE_OFFSET_Y = TRAILER_OFFSET_Y -TRAILER_HEIGHT / 2 - TRAILER_BASE_HEIGHT / 2;
const TRAILER_BASE_OFFSET_Z = TRAILER_OFFSET_Z;

// Wheels (relative to trailer center)
const TRAILER_WHEEL_INSET_RATIO = 0.15; // 15% of the trailer length
const TRAILER_WHEEL_INSET_Z = TRAILER_LENGTH * TRAILER_WHEEL_INSET_RATIO;
const TRAILER_WHEEL_RADIUS = WHEEL_RADIUS;
const TRAILER_WHEEL_WIDTH  = WHEEL_HEIGHT;
const TRAILER_WHEEL_OFFSET_X = TRAILER_WIDTH / 2 + TRAILER_WHEEL_WIDTH / 2;
const TRAILER_WHEEL_OFFSET_Y = -TRAILER_HEIGHT / 2;
const TRAILER_WHEEL_OFFSET_Z = TRAILER_LENGTH / 2 - TRAILER_WHEEL_INSET_Z;

// Trailer starting position
const TRAILER_X = ROBOT_X + TORSO_WIDTH * 1.7;
const TRAILER_Y = ROBOT_Y + WAIST_OFFSET_Y + TRAILER_HEIGHT / 2;
const TRAILER_Z = ROBOT_Z - (TORSO_DEPTH + TRAILER_LENGTH) * 0.8;
const TRAILER_SPEED = 15;

// Hitch piece (relative to trailer center)
const HITCH_WIDTH  = CALF_SPACING;
const HITCH_HEIGHT = TRAILER_BASE_HEIGHT;
const HITCH_LENGTH = 7;
const HITCH_OFFSET_X = 0;
const HITCH_OFFSET_Y = TRAILER_BASE_OFFSET_Y;
const HITCH_OFFSET_Z = TRAILER_LENGTH / 2 + HITCH_LENGTH / 2;

// Coupler
const COUPLER_RADIUS = CALF_SPACING / 2;
const COUPLER_HEIGHT = 12;
const COUPLER_OFFSET_X = HITCH_OFFSET_X;
const COUPLER_OFFSET_Y = HITCH_OFFSET_Y;
const COUPLER_OFFSET_Z = HITCH_OFFSET_Z + HITCH_LENGTH / 2;

const COUPLER_BASE_RADIUS = 4;
const COUPLER_BASE_HEIGHT = 1;

const COUPLER_TOP_RADIUS = 3;
const COUPLER_TOP_HEIGHT = COUPLER_BASE_HEIGHT;

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let camera, orthoCamera, perspectiveCamera;
const aspect = window.innerWidth / window.innerHeight;
const size = 50;
let scene, renderer;
let headGroup, waistGroup, torso, rightArm, leftArm;
let robot, trailer;
const clock = new THREE.Clock();

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#e8fcff');
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

    addWheel(waistGroup, WAIST_WHEEL_OFFSET_X, 0, 0, materials.black);
    addWheel(waistGroup, - WAIST_WHEEL_OFFSET_X, 0, 0, materials.black);
    addLegs(waistGroup, THIGH_OFFSET_X, THIGH_OFFSET_Y, 0, material);
    obj.add(waistGroup);
}

function addHead(obj, x, y, z, material) {
    const headPivot = new THREE.Object3D(); // Pivot for rotation
    headPivot.position.set(x, TORSO_HEIGHT / 2, - TORSO_DEPTH / 2); // TODO: como organizamos os offsets com isto do pivot?

    headGroup = new THREE.Group();

    const geometry = new THREE.BoxGeometry(HEAD_SIZE, HEAD_SIZE, HEAD_SIZE);
    const headMesh = new THREE.Mesh(geometry, material);
    headGroup.position.set(x, HEAD_SIZE / 2, HEAD_SIZE / 2);
    headGroup.add(headMesh);

    addEyes(headGroup, EYE_OFFSET_X, EYE_OFFSET_Y, EYE_OFFSET_Z, materials.black);
    addAntennas(headGroup, ANTENNA_OFFSET_X, ANTENNA_OFFSET_Y, ANTENNA_OFFSET_Z, materials.darkBlue)

    headPivot.add(headGroup); // Add the whole head to the pivot
    obj.add(headPivot);
    robot.headPivot = headPivot; // Save reference for animation later

    // Store rotation data
    headPivot.userData = {
        angle: 0,
        rotateForward: false,
        rotateBackward: false,
        minAngle: -Math.PI,
        maxAngle: 0,
        speed: ROTATION_SPEED
    };
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

function addPipe(obj, x, y, z, material) {
    const geometry = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, PIPE_HEIGHT);
    const pipe = new THREE.Mesh(geometry, material);
    pipe.position.set(x, y, z);

    obj.add(pipe);
}

function addForearm(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(ARM_WIDTH, ARM_WIDTH, FOREARM_LENGTH); 
    const forearm = new THREE.Mesh(geometry, material);
    forearm.position.set(x, y, z);

    obj.add(forearm);
}

function addArms(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(ARM_WIDTH, ARM_LENGTH, ARM_WIDTH);
    // Right arm
    rightArm = new THREE.Mesh(geometry, material);
    rightArm.position.set(x, y, z);

    addPipe(rightArm, PIPE_OFFSET_X, PIPE_OFFSET_Y, PIPE_OFFSET_Z, materials.silver);
    addForearm(rightArm, 0 , - ARM_LENGTH / 2 - ARM_WIDTH / 2, FOREARM_LENGTH / 2 - ARM_WIDTH / 2, materials.darkBlue);

    obj.add(rightArm);

    // Left arm
    leftArm = new THREE.Mesh(geometry, material);
    leftArm.position.set(-x, y, z);

    addPipe(leftArm, - PIPE_OFFSET_X, PIPE_OFFSET_Y, PIPE_OFFSET_Z, materials.silver);
    addForearm(leftArm, 0 , - ARM_LENGTH / 2 - ARM_WIDTH / 2, FOREARM_LENGTH / 2 - ARM_WIDTH / 2, materials.darkBlue);

    obj.add(leftArm);

    robot.arms = {
        placeArmsIn: false,
        placeArmsOut: false,
        step: ARM_WIDTH,
        left: {
            minX: -x,
            maxX: ARM_WIDTH - x,
            minZ: z - ARM_WIDTH,
            maxZ: z,
        },
        right: {
            minX: x - ARM_WIDTH,
            maxX: x,
            minZ: z - ARM_WIDTH,
            maxZ: z,
        },
    };
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
        materials.silver
    );
    thigh.position.set(x*xSign, y, z);

    const calf = new THREE.Mesh(
        new THREE.BoxGeometry(CALF_WIDTH, CALF_HEIGHT, CALF_WIDTH),
        materials.darkBlue
    );
    calf.position.y = CALF_OFFSET_Y;

    addWheel(calf, LEG_WHEELS_OFFSET_X*xSign, LEG_WHEELS_OFFSET_Y - LEG_WHEELS_SPACING, 0, materials.black);
    addWheel(calf, LEG_WHEELS_OFFSET_X*xSign, LEG_WHEELS_OFFSET_Y + LEG_WHEELS_SPACING, 0, materials.black);
    thigh.add(calf);

    // Foot pivot
    const footPivot = new THREE.Object3D();
    footPivot.position.set(0, FOOT_OFFSET_Y, - CALF_WIDTH / 2 + FOOT_HEIGHT / 2);

    const foot = new THREE.Mesh(
        new THREE.BoxGeometry(FOOT_WIDTH, FOOT_HEIGHT, FOOT_DEPTH),
        materials.darkBlue
    );
    foot.position.set(0, 0, - FOOT_HEIGHT / 2 + FOOT_DEPTH / 2);

    footPivot.add(foot);
    calf.add(footPivot);

    // Save reference to pivot
    if (side === "left") {
        robot.leftFootPivot = footPivot;
    } else {
        robot.rightFootPivot = footPivot;
    }

    // Init pivot rotation data
    footPivot.userData = {
        angle: 0,
        rotateForward: false,
        rotateBackward: false,
        minAngle: 0,
        maxAngle: Math.PI / 2,
        speed: ROTATION_SPEED
    };

    legGroup.add(thigh);
    obj.add(legGroup);
}

function addLegs(obj, x, y, z, material) {
    const legsGroup = new THREE.Group();

    addLeg(legsGroup, "left",  x, y, z, material);
    addLeg(legsGroup, "right", x, y, z, material);

    const legsPivot = new THREE.Object3D(); // Pivot for legs rotation
    legsPivot.position.set(0, 0, 0);
    legsPivot.add(legsGroup);
    obj.add(legsPivot);
    robot.legsPivot = legsPivot;            // Save reference for animation later

    // Store rotation data
    legsPivot.userData = {
        angle: 0,
        rotateForward: false,
        rotateBackward: false,
        minAngle:  0,
        maxAngle:  Math.PI / 2,
        speed: ROTATION_SPEED
    }   
}

function createRobot(x, y, z) {
    robot = new THREE.Object3D();

    addTorso(robot,TORSO_OFFSET_X, TORSO_OFFSET_Y, TORSO_OFFSET_Z, materials.darkRed);
    addAbdomen(robot, ABDOMEN_OFFSET_X, ABDOMEN_OFFSET_Y, ABDOMEN_OFFSET_Z,  materials.darkBlue);
    addWaist(robot, WAIST_OFFSET_X, WAIST_OFFSET_Y, WAIST_OFFSET_Z,  materials.silver);
    addHead(torso, HEAD_OFFSET_X, HEAD_OFFSET_Y, HEAD_OFFSET_Z,  materials.darkBlue);
    addArms(torso, ARM_OFFSET_X, ARM_OFFSET_Y, ARM_OFFSET_Z, materials.darkBlue);

    scene.add(robot);
    robot.position.set(x, y, z);

    robot.aabb = {
        min: new THREE.Vector3(),
        max: new THREE.Vector3()
    };
}

function addTrailerBody(obj, x, y, z, material) {
    const trailerBody = new THREE.Mesh(
      new THREE.BoxGeometry(TRAILER_WIDTH, TRAILER_HEIGHT, TRAILER_LENGTH),
      material
    );
    trailerBody.position.set(x, y, z);
    obj.add(trailerBody);
}

function addTrailerBase(obj, x, y, z, material) {
    const trailerBase = new THREE.Mesh(
        new THREE.BoxGeometry(TRAILER_BASE_WIDTH, TRAILER_BASE_HEIGHT, TRAILER_BASE_LENGTH),
        material
    );
    trailerBase.position.set(x, y, z);
    obj.add(trailerBase);
}

function addTrailerHitch(obj, x, y, z, material) {
    const trailerHitch = new THREE.Mesh(
        new THREE.BoxGeometry(HITCH_WIDTH, HITCH_HEIGHT, HITCH_LENGTH),
        material
    );
    trailerHitch.position.set(x, y, z);
    obj.add(trailerHitch);
}

function addCoupler(obj, x, y, z, material) {
    const coupler = new THREE.Mesh(
        new THREE.CylinderGeometry(
        COUPLER_RADIUS,
        COUPLER_RADIUS,
        COUPLER_HEIGHT),
        material
    );
    coupler.position.set(x, y, z);
    obj.add(coupler);

    const baseCoupler = new THREE.Mesh(
        new THREE.CylinderGeometry(
        COUPLER_BASE_RADIUS,
        COUPLER_BASE_RADIUS,
        COUPLER_BASE_HEIGHT),
        material
    );
    baseCoupler.position.set(x, y - COUPLER_HEIGHT / 2, z);
    obj.add(baseCoupler);

    const topCoupler = new THREE.Mesh(
        new THREE.CylinderGeometry(
        COUPLER_TOP_RADIUS,
        COUPLER_TOP_RADIUS,
        COUPLER_TOP_HEIGHT),
        material
    );
    topCoupler.position.set(x, y + COUPLER_HEIGHT / 2, z);
    obj.add(topCoupler);
}

function addTrailerWheels(obj, material) {
    const wheelGeometry = new THREE.CylinderGeometry(
      TRAILER_WHEEL_RADIUS,
      TRAILER_WHEEL_RADIUS,
      TRAILER_WHEEL_WIDTH
    );
    // lay wheels horizontally
    wheelGeometry.rotateZ(Math.PI / 2);
  
    // four wheels (left/right, front/rear)
    const positions = [
      [-TRAILER_WHEEL_OFFSET_X, TRAILER_WHEEL_OFFSET_Y, -TRAILER_WHEEL_OFFSET_Z],
      [ TRAILER_WHEEL_OFFSET_X, TRAILER_WHEEL_OFFSET_Y, -TRAILER_WHEEL_OFFSET_Z],
      [-TRAILER_WHEEL_OFFSET_X, TRAILER_WHEEL_OFFSET_Y, -TRAILER_WHEEL_OFFSET_Z + TRAILER_LENGTH/4],
      [ TRAILER_WHEEL_OFFSET_X, TRAILER_WHEEL_OFFSET_Y, -TRAILER_WHEEL_OFFSET_Z + TRAILER_LENGTH/4]
    ];
  
    positions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeometry, material);
      wheel.position.set(x, y, z);
      obj.add(wheel);
    });
}

function createTrailer(x, y, z) {
    trailer = new THREE.Object3D();

    addTrailerBody(trailer, TRAILER_OFFSET_X, TRAILER_OFFSET_Y, TRAILER_OFFSET_Z, materials.darkBlue);
    addTrailerBase(trailer, TRAILER_BASE_OFFSET_X, TRAILER_BASE_OFFSET_Y, TRAILER_BASE_OFFSET_Z, materials.silver);
    addTrailerWheels(trailer, materials.black);
    addTrailerHitch(trailer, HITCH_OFFSET_X, HITCH_OFFSET_Y, HITCH_OFFSET_Z, materials.silver);
    addCoupler(trailer, COUPLER_OFFSET_X, COUPLER_OFFSET_Y, COUPLER_OFFSET_Z, materials.silver);

    scene.add(trailer);
    trailer.position.set(x, y, z);

    trailer.movementVector = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
    };

    trailer.aabb = {
        min: new THREE.Vector3(),
        max: new THREE.Vector3()
    };
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {
    updateAABB(robot);
    updateAABB(trailer);

    if (checkAABBIntersection(robot.aabb, trailer.aabb)) {
        handleCollisions();
    }
}

function checkAABBIntersection(a, b) {
    return (
        a.min.x <= b.max.x && a.max.x >= b.min.x &&
        a.min.y <= b.max.y && a.max.y >= b.min.y &&
        a.min.z <= b.max.z && a.max.z >= b.min.z
    );
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {
    if (!isInTruckMode()) return;

    // trailer.userData.engaged = true;

    // // Calcula ponto de acoplamento com base no robot
    // const couplingPoint = new THREE.Vector3();
    // couplingPoint.setFromMatrixPosition(robot.matrixWorld);
    // couplingPoint.x += 50; // ou o valor exato para o ponto de encaixe
    // couplingPoint.y = trailer.position.y;
    // couplingPoint.z = trailer.position.z;

    // Move o trailer suavemente para o ponto de acoplamento
    trailer.position.lerp(couplingPoint, 0.2);
}

////////////
/* UPDATE */
////////////

function update() {
    const delta = clock.getDelta();

    updatePivotRotation(robot.headPivot, delta);
    updatePivotRotation(robot.legsPivot, delta);
    updatePivotRotation(robot.leftFootPivot, delta);
    updatePivotRotation(robot.rightFootPivot, delta);
    updateArms(delta);
    updateTrailer(delta);
    checkCollisions();
}

function updatePivotRotation(pivot, delta) {
    const data = pivot.userData;

    if (data.rotateForward && data.angle < data.maxAngle) {
        data.angle += data.speed * delta;
        data.angle = Math.min(data.angle, data.maxAngle);
    }
    if (data.rotateBackward && data.angle > data.minAngle) {
        data.angle -= data.speed * delta;
        data.angle = Math.max(data.angle, data.minAngle);
    }

    pivot.rotation.x = data.angle;
}

function updateArms(delta) {
    var step = robot.arms.step * delta;
    const leftDelta = new THREE.Vector3(0, 0, 0);
    const rightDelta = new THREE.Vector3(0, 0, 0);
    if (robot.arms.placeArmsIn) {
        if (leftArm.position.z > robot.arms.left.minZ && rightArm.position.z > robot.arms.right.minZ) {
            // Prevent overshooting: clamp step to reach target Z exactly
            step = Math.min(step, leftArm.position.z - robot.arms.left.minZ)
            leftDelta.z -= step;
            rightDelta.z -= step;
        }           
        else if (leftArm.position.x < robot.arms.left.maxX && rightArm.position.x > robot.arms.right.minX) {
            // Prevent overshooting: clamp step to reach target X exactly
            step = Math.min(step, robot.arms.left.maxX - leftArm.position.x);
            leftDelta.x += step;
            rightDelta.x -= step; 
        }   
    }
    if (robot.arms.placeArmsOut) {
        if (leftArm.position.x > robot.arms.left.minX && rightArm.position.x < robot.arms.right.maxX) {
            // Prevent overshooting: clamp step to reach target X exactly
            step = Math.min(step, leftArm.position.x - robot.arms.left.minX);
            leftDelta.x -= step;
            rightDelta.x += step;
        }           
        else if (leftArm.position.z < robot.arms.left.maxZ && rightArm.position.z < robot.arms.right.maxZ) {
            // Prevent overshooting: clamp step to reach target Z exactly
            step = Math.min(step, robot.arms.left.maxZ - leftArm.position.z);
            leftDelta.z += step;
            rightDelta.z += step;
        }   
    }
    leftArm.position.add(leftDelta);
    rightArm.position.add(rightDelta);
}

function updateTrailer(delta){
    const movement = new THREE.Vector3(0, 0, 0);

    if (trailer.movementVector['ArrowUp'])      movement.z -= TRAILER_SPEED * delta;
    if (trailer.movementVector['ArrowDown'])    movement.z += TRAILER_SPEED * delta;
    if (trailer.movementVector['ArrowLeft'])    movement.x -= TRAILER_SPEED * delta;
    if (trailer.movementVector['ArrowRight'])   movement.x += TRAILER_SPEED * delta;

    trailer.position.add(movement);
}

function updateAABB(obj) {
    const box = new THREE.Box3().setFromObject(obj);
    obj.aabb.min.copy(box.min);
    obj.aabb.max.copy(box.max);
}

function approxEqual(a, b, epsilon = 0.01) {
    return Math.abs(a - b) < epsilon;
}

function isInTruckMode() {

    // // Small tolerance value used for safe floating point comparisons
    const EPSILON = 0.02;
    const headOK = Math.abs(robot.headPivot.rotation.x + Math.PI) < EPSILON;
    const legOK = Math.abs(robot.legsPivot.rotation.x - Math.PI / 2) < EPSILON;
    const feetOK = Math.abs(robot.leftFootPivot.rotation.x - Math.PI / 2) < EPSILON;

    const leftArmOK = (
        Math.abs(leftArm.position.z - robot.arms.left.minZ) < EPSILON &&
        Math.abs(leftArm.position.x - robot.arms.left.maxX) < EPSILON
    );
    const rightArmOK = (
        Math.abs(rightArm.position.z - robot.arms.right.minZ) < EPSILON &&
        Math.abs(rightArm.position.x - robot.arms.right.minX) < EPSILON
    );

    return headOK && legOK && feetOK && leftArmOK && rightArmOK;
}

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
            setFrontView();
            break;
        case '2':
            setSideView();
            break;
        case '3':
            setTopView();
            break;
        case '4':
            setPerspectiveView();
            break;
        case '7':
            for (let key in materials) {
                materials[key].wireframe = !materials[key].wireframe;
            }
            break;
        case 'r':
        case 'R':
            robot.headPivot.userData.rotateBackward = true;
            break;
        case 'f':
        case 'F':
            robot.headPivot.userData.rotateForward = true;
            break;
        case 'w':
        case 'W':
            robot.legsPivot.userData.rotateBackward = true;
            break;
        case 's':
        case 'S':
            robot.legsPivot.userData.rotateForward = true;
            break;
        case 'q':
        case 'Q':
            robot.leftFootPivot.userData.rotateBackward = true;
            robot.rightFootPivot.userData.rotateBackward = true;
            break;
        case 'a':
        case 'A':
            robot.leftFootPivot.userData.rotateForward = true;
            robot.rightFootPivot.userData.rotateForward = true;
            break;
        case 'e':
        case 'E':
            robot.arms.placeArmsIn = true;
            break;
        case 'd':
        case 'D':
            robot.arms.placeArmsOut = true;
            break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            trailer.movementVector[e.key] = true;
            break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    switch(e.key) {
        case 'r':
        case 'R':
            robot.headPivot.userData.rotateBackward = false;
            break;
        case 'f':
        case 'F':
            robot.headPivot.userData.rotateForward = false;
            break;
        case 'w':
        case 'W':
            robot.legsPivot.userData.rotateBackward = false;
            break;
        case 's':
        case 'S':
            robot.legsPivot.userData.rotateForward = false;
            break;
        case 'q':
        case 'Q':
            robot.leftFootPivot.userData.rotateBackward = false;
            robot.rightFootPivot.userData.rotateBackward = false;
            break;
        case 'a':
        case 'A':
            robot.leftFootPivot.userData.rotateForward = false;
            robot.rightFootPivot.userData.rotateForward = false;
            break;
        case 'e':
        case 'E':
            robot.arms.placeArmsIn = false;
            break;
        case 'd':
        case 'D':
            robot.arms.placeArmsOut = false;
            break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            trailer.movementVector[e.key] = false;
            break;
    }
}

init();
animate();