
var controls;
var camera, renderer, light;
var mainScene;

init();

function init() {

    var container = document.createElement('div');
    document.body.appendChild(container);

    // get user settings
    var settings = JSON.parse(document.getElementById('vscode-3dviewer-data').getAttribute('data-settings'));

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, settings.near, settings.far);

    mainScene = new THREE.Scene();


    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.autoClearColor = false;
    renderer.autoClearDepth = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // controls, camera
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0, 0, 0);
    camera.position = new THREE.Vector3(0, -1, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    controls.update();

    // model
    var fileToLoad = settings.fileToLoad;
    var ext = fileToLoad.split('.').pop();
    var folder = fileToLoad.substring(0, fileToLoad.lastIndexOf('/') + 1);

    if (ext.toLowerCase() != 'stl') {
        // Display error
    }

    var loader = new THREE.STLLoader();
    loader.load(fileToLoad, function (file) {
        var object = new THREE.Mesh(file);
        mainScene.add(object);

        var bbox = new THREE.BoxHelper(object, new THREE.Color(0xffff00));

        if (bbox.geometry) {
            bbox.geometry.computeBoundingSphere();
            if (bbox.geometry.boundingSphere) {
                let center = bbox.geometry.boundingSphere.center;
                let radius = bbox.geometry.boundingSphere.radius;
                controls.target = center;
                camera.position.set(center.x, center.y - 1.2*radius, center.z);
                camera.updateProjectionMatrix();
                controls.update();
            }
        }

    });

    window.addEventListener('resize', onWindowResize, false);


    // Lights
    [ [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1] ].forEach((p) => {
        document.writeln(p);
        light = new THREE.DirectionalLight(0xffffff, 1.0);
        light.position.set(...p);
        mainScene.add(light);
    });


    // material
    mainScene.overrideMaterial = new THREE.MeshPhongMaterial({
        color: 0xcc0000,
        specular: 0x6699cc,
        shininess: 3,
        vertexColors: THREE.VertexColors,
    });

    animate();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(mainScene, camera);
}
