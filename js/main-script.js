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
const ROBOT_Y = 10;
const ROBOT_Z = 40;

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
// const FOOT_HEIGHT = 5;
const FOOT_HEIGHT = CALF_WIDTH; // chunky feet
const FOOT_DEPTH = 12;
const FOOT_OFFSET_Y = - CALF_HEIGHT / 2 - FOOT_HEIGHT / 2;
const FOOT_OFFSET_Z = FOOT_DEPTH / 2 - CALF_WIDTH / 2;

// Wheels (offset relative to calf)
const WHEEL_RADIUS = HEAD_SIZE / 2;
const WHEEL_HEIGHT = 5;
const LEG_WHEELS_OFFSET_X = CALF_WIDTH / 2 + WHEEL_HEIGHT / 2;
const LEG_WHEELS_OFFSET_Y = - FOOT_HEIGHT / 2;
const LEG_WHEELS_SPACING = WHEEL_RADIUS *1.2;
const WAIST_WHEEL_OFFSET_X = WAIST_WIDTH / 2 + WHEEL_HEIGHT / 2;

const ROBOT_HEIGHT = HEAD_SIZE + TORSO_HEIGHT + ABDOMEN_HEIGHT + WAIST_HEIGHT + THIGH_HEIGHT + CALF_HEIGHT;

const robotMaterials = {
    torso:    new THREE.MeshBasicMaterial({ color: 0x8b0000, wireframe: false }), // dark red
    abdomen:  new THREE.MeshBasicMaterial({ color: 0x26428B, wireframe: false }), // dark navy blue
    waist:    new THREE.MeshBasicMaterial({ color: 0xC0C0C0, wireframe: false }), // silver
    head:     new THREE.MeshBasicMaterial({ color: 0x26428B, wireframe: false }), // dark navy blue
    eyes:     new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false }), // black
    antennas: new THREE.MeshBasicMaterial({ color: 0x26428B, wireframe: false }), // dark navy blue
    arm:      new THREE.MeshBasicMaterial({ color: 0x26428B, wireframe: false }), // dark navy blue
    forearm:  new THREE.MeshBasicMaterial({ color: 0x8b0000, wireframe: false }), // dark navy blue
    pipe:     new THREE.MeshBasicMaterial({ color: 0xC0C0C0, wireframe: false }), // silver
    thighs:   new THREE.MeshBasicMaterial({ color: 0xC0C0C0, wireframe: false }), // silver
    calves:   new THREE.MeshBasicMaterial({ color: 0x26428B, wireframe: false }), // dark navy blue
    feet:     new THREE.MeshBasicMaterial({ color: 0x26428B, wireframe: false }), // dark navy blue
    wheels:   new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false }), // black
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
const TRAILER_BASE_OFFSET_X = 0;
const TRAILER_BASE_OFFSET_Y = -TRAILER_HEIGHT / 2 + TRAILER_BASE_HEIGHT / 2;
const TRAILER_BASE_OFFSET_Z = 0;

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
const TRAILER_Z = ROBOT_Z - (TORSO_DEPTH + TRAILER_LENGTH) * 0.9;
const TRAILER_SPEED = 0.5;

// Hitch piece (relative to trailer center)
const HITCH_WIDTH  = CALF_SPACING;
const HITCH_HEIGHT = TRAILER_BASE_HEIGHT;
const HITCH_LENGTH = 10;
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

const trailerMaterials = {
    body:     new THREE.MeshBasicMaterial({ color: 0x26428B, wireframe: false }), // dark navy blue
    base:     new THREE.MeshBasicMaterial({ color: 0xC0C0C0, wireframe: false }), // silver
    wheels:   new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false }), // black
    hitch:    new THREE.MeshBasicMaterial({ color: 0xC0C0C0, wireframe: false }), // silver
    coupler:  new THREE.MeshBasicMaterial({ color: 0xC0C0C0, wireframe: false })  // silver
};

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let camera, frontCamera, sideCamera, topCamera, perspectiveCamera;
let scene, renderer;
let headGroup, waistGroup, torso, rightArm, leftArm;
let robot, trailer;

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
    perspectiveCamera.position.set(50, 50, 80);
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

    addWheel(waistGroup, WAIST_WHEEL_OFFSET_X, 0, 0, robotMaterials.wheels.clone());
    addWheel(waistGroup, - WAIST_WHEEL_OFFSET_X, 0, 0, robotMaterials.wheels.clone());
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

    addEyes(headGroup, EYE_OFFSET_X, EYE_OFFSET_Y, EYE_OFFSET_Z, robotMaterials.eyes.clone());
    addAntennas(headGroup, ANTENNA_OFFSET_X, ANTENNA_OFFSET_Y, ANTENNA_OFFSET_Z, robotMaterials.antennas)

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
        speed: 0.02
    };
}

function addEyes(obj, x, y, z, material) {
    const geometry = new THREE.CylinderGeometry(EYE_RADIUS, EYE_RADIUS, EYE_HEIGHT);

    // Rotate so the cylinder faces forward instead of pointing up
    geometry.rotateX(Math.PI / 2);

    const leftEye = new THREE.Mesh(geometry, material.clone());
    leftEye.position.set(x, y, z);
    obj.add(leftEye);

    const rightEye = new THREE.Mesh(geometry, material.clone());
    rightEye.position.set(-x, y, z);
    obj.add(rightEye);
}

function addAntennas(obj, x, y, z, material) {
    const geometry = new THREE.CylinderGeometry(ANTENNA_RADIUS, ANTENNA_RADIUS, ANTENNA_HEIGHT);

    const leftAntenna = new THREE.Mesh(geometry, material.clone());
    leftAntenna.position.set(x, y, z);
    obj.add(leftAntenna);

    const rightAntenna = new THREE.Mesh(geometry, material.clone());
    rightAntenna.position.set(-x, y, z);
    obj.add(rightAntenna);
}

function addPipe(obj, x, y, z, material) {
    const geometry = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, PIPE_HEIGHT);  2212323
    const pipe = new THREE.Mesh(geometry, material.clone());
    pipe.position.set(x, y, z);

    obj.add(pipe);
}

function addForearm(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(ARM_WIDTH, ARM_WIDTH, FOREARM_LENGTH); 
    const forearm = new THREE.Mesh(geometry, material.clone());
    forearm.position.set(x, y, z);

    obj.add(forearm);
}

function addArms(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(ARM_WIDTH, ARM_LENGTH, ARM_WIDTH);
    // Right arm
    rightArm = new THREE.Mesh(geometry, material.clone());
    rightArm.position.set(x, y, z);

    addPipe(rightArm, PIPE_OFFSET_X, PIPE_OFFSET_Y, PIPE_OFFSET_Z, robotMaterials.pipe);
    addForearm(rightArm, 0 , - ARM_LENGTH / 2 - ARM_WIDTH / 2, FOREARM_LENGTH / 2 - ARM_WIDTH / 2, robotMaterials.forearm);

    obj.add(rightArm);

    // Left arm
    leftArm = new THREE.Mesh(geometry, material.clone());
    leftArm.position.set(-x, y, z);

    addPipe(leftArm, - PIPE_OFFSET_X, PIPE_OFFSET_Y, PIPE_OFFSET_Z, robotMaterials.pipe);
    addForearm(leftArm, 0 , - ARM_LENGTH / 2 - ARM_WIDTH / 2, FOREARM_LENGTH / 2 - ARM_WIDTH / 2, robotMaterials.forearm);

    obj.add(leftArm);

    robot.arms = {
        placeArmsIn: false,
        placeArmsOut: false,
        step: ARM_WIDTH / 100,
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
        } 
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
        robotMaterials.thighs.clone()
    );
    thigh.position.set(x*xSign, y, z);

    const calf = new THREE.Mesh(
        new THREE.BoxGeometry(CALF_WIDTH, CALF_HEIGHT, CALF_WIDTH),
        robotMaterials.calves.clone()
    );
    calf.position.y = CALF_OFFSET_Y;

    addWheel(calf, LEG_WHEELS_OFFSET_X*xSign, LEG_WHEELS_OFFSET_Y - LEG_WHEELS_SPACING, 0, robotMaterials.wheels.clone());
    addWheel(calf, LEG_WHEELS_OFFSET_X*xSign, LEG_WHEELS_OFFSET_Y + LEG_WHEELS_SPACING, 0, robotMaterials.wheels.clone());
    thigh.add(calf);

    // Foot pivot
    const footPivot = new THREE.Object3D();
    // footPivot.position.set(0, FOOT_OFFSET_Y, 0); // chunky feet
    footPivot.position.set(0, FOOT_OFFSET_Y, - CALF_WIDTH / 2 + FOOT_HEIGHT / 2); // regular feet

    const foot = new THREE.Mesh(
        new THREE.BoxGeometry(FOOT_WIDTH, FOOT_HEIGHT, FOOT_DEPTH),
        robotMaterials.feet.clone()
    );
    // foot.position.set(0, 0, FOOT_OFFSET_Z); // chunky feet
    foot.position.set(0, 0, - FOOT_HEIGHT / 2 + FOOT_DEPTH / 2); // regular feet

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
        speed: 0.02
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
        speed: 0.02
    }   
}

function createRobot(x, y, z) {
    robot = new THREE.Object3D();

    addTorso(robot,TORSO_OFFSET_X, TORSO_OFFSET_Y, TORSO_OFFSET_Z, robotMaterials.torso);
    addAbdomen(robot, ABDOMEN_OFFSET_X, ABDOMEN_OFFSET_Y, ABDOMEN_OFFSET_Z,  robotMaterials.abdomen);
    addWaist(robot, WAIST_OFFSET_X, WAIST_OFFSET_Y, WAIST_OFFSET_Z,  robotMaterials.waist);
    addHead(torso, HEAD_OFFSET_X, HEAD_OFFSET_Y, HEAD_OFFSET_Z,  robotMaterials.head);
    addArms(torso, ARM_OFFSET_X, ARM_OFFSET_Y, ARM_OFFSET_Z, robotMaterials.arm);

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
      const wheel = new THREE.Mesh(wheelGeometry, material.clone());
      wheel.position.set(x, y, z);
      obj.add(wheel);
    });
}

function createTrailer(x, y, z) {
    trailer = new THREE.Object3D();

    addTrailerBody(trailer, TRAILER_OFFSET_X, TRAILER_OFFSET_Y, TRAILER_OFFSET_Z, trailerMaterials.body);
    addTrailerBase(trailer, TRAILER_BASE_OFFSET_X, TRAILER_BASE_OFFSET_Y, TRAILER_BASE_OFFSET_Z, trailerMaterials.base);
    addTrailerWheels(trailer, trailerMaterials.wheels);
    addTrailerHitch(trailer, HITCH_OFFSET_X, HITCH_OFFSET_Y, HITCH_OFFSET_Z, trailerMaterials.hitch);
    addCoupler(trailer, COUPLER_OFFSET_X, COUPLER_OFFSET_Y, COUPLER_OFFSET_Z, trailerMaterials.coupler);

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
function checkCollisions() {}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {}

////////////
/* UPDATE */
////////////

function update() {
    updatePivotRotation(robot.headPivot);
    updatePivotRotation(robot.legsPivot);
    updatePivotRotation(robot.leftFootPivot);
    updatePivotRotation(robot.rightFootPivot);
    updateArms();
    updateTrailer();
}

function updatePivotRotation(pivot) {
    const data = pivot.userData;

    if (data.rotateForward && data.angle < data.maxAngle) {
        data.angle += data.speed;
        data.angle = Math.min(data.angle, data.maxAngle);
    }
    if (data.rotateBackward && data.angle > data.minAngle) {
        data.angle -= data.speed;
        data.angle = Math.max(data.angle, data.minAngle);
    }

    pivot.rotation.x = data.angle;
}

function updateArms() {
    const step = robot.arms.step;
    if (robot.arms.placeArmsIn) {
        if (leftArm.position.z > robot.arms.left.minZ)
            leftArm.position.z -= step; // MUDAR
        else if (leftArm.position.x < robot.arms.left.maxX)
            leftArm.position.x += step;

        if (rightArm.position.z > robot.arms.right.minZ)
            rightArm.position.z -= step;
        else if (rightArm.position.x > robot.arms.right.minX)
            rightArm.position.x -= step;
    }
    if (robot.arms.placeArmsOut) {
        if (leftArm.position.x > robot.arms.left.minX)
            leftArm.position.x -= step;
        else if (leftArm.position.z < robot.arms.left.maxZ)
            leftArm.position.z += step;

        if (rightArm.position.x < robot.arms.right.maxX)
            rightArm.position.x += step;
        else if (rightArm.position.z < robot.arms.right.maxZ)
            rightArm.position.z += step;
    }
}

function updateTrailer(){
    const movement = new THREE.Vector3(0, 0, 0);

    if (trailer.movementVector['ArrowUp'])      movement.z -= TRAILER_SPEED;
    if (trailer.movementVector['ArrowDown'])    movement.z += TRAILER_SPEED;
    if (trailer.movementVector['ArrowLeft'])    movement.x -= TRAILER_SPEED;
    if (trailer.movementVector['ArrowRight'])   movement.x += TRAILER_SPEED;

    trailer.position.x += movement.x;
    trailer.position.z += movement.z;
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
            camera = frontCamera;
            break;
        case '2':
            camera = sideCamera;
            break;
        case '3':
            camera = topCamera;
            break;
        case '4':
            camera = perspectiveCamera;
            break;
        case '7':
            robot.traverse((child) => {
                if (child.isMesh) {
                    child.material.wireframe = !child.material.wireframe;
                }
            });
            trailer.traverse((child) => {
                if (child.isMesh) {
                    child.material.wireframe = !child.material.wireframe;
                }
            });
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