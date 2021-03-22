/// <reference path="./Three.d.ts" />
/// <reference path="./STLLoader.d.ts" />

const width  = window.innerWidth;
const height = window.innerHeight;
const near = 0.005;
const far  = 10000;


// Empty scene with just lights
const scene = new THREE.Scene();

[ [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1] ].forEach((p: number[]) => {
    let light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(...(p as [number, number, number]));
    scene.add(light);
});


// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.autoClearColor = false;
renderer.autoClearDepth = false;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera
const camera = new THREE.PerspectiveCamera(10, width/height, near, far);
camera.position.z = -20;
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Controls
const controls = new THREE.TrackballControls(camera, renderer.domElement);


function render() {
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(render);
}
render();


/// LOADING ///

const loader = new THREE.STLLoader();

const material = new THREE.MeshPhongMaterial({
    color: 0x000033,
    specular: 0x6699cc,
    shininess: 3,
});

function loadSTL(uri: string)
{
    loader.load(
        uri,
        (geometry: THREE.BufferGeometry) => {
            const model = new THREE.Mesh(geometry, material);
            scene.add(model);

            const boundingBox = new THREE.Box3().setFromObject(model);
            let center = boundingBox.getCenter(new THREE.Vector3());
            controls.target = center;
        },
        null,   // progress
        () => {
            console.error("Loading STL failed");
        }
    );
}


/// EVENTS ///

window.addEventListener('message', (msg) => {
    switch (msg.data.type) {
        case 'open':
            console.log(`Message: open('${msg.data.uri}')`);
            loadSTL(msg.data.uri);
            break;

        default:
            console.error(`Unknown message '${msg.data.type}'`);
    }
});

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});