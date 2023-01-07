// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
// custom global variables
var cube;

// plane
var updatePlaneFunction;
var planeState = { state: "start" };
var readyToFlight = true;
var thePlane;
var theStartPoint;

// collisions
var collidableMeshList = [];

// FUNCTIONS
async function init() {
  // SCENE
  scene = new THREE.Scene();
  // CAMERA
  var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight;
  var VIEW_ANGLE = 45,
    ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
    NEAR = 0.1,
    FAR = 20000;
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);
  camera.position.set(0, 150, 400);
  camera.lookAt(scene.position);
  // RENDERER
  if (Detector.webgl) renderer = new THREE.WebGLRenderer({ antialias: true });
  else renderer = new THREE.CanvasRenderer();
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container = document.getElementById("ThreeJS");
  container.appendChild(renderer.domElement);
  // EVENTS
  THREEx.WindowResize(renderer, camera);
  THREEx.FullScreen.bindKey({ charCode: "m".charCodeAt(0) });
  // CONTROLS
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  // STATS
  stats = new Stats();
  stats.domElement.style.position = "absolute";
  stats.domElement.style.bottom = "0px";
  stats.domElement.style.zIndex = 100;
  container.appendChild(stats.domElement);
  // LIGHT
  var light = new THREE.PointLight(0xffffff);
  light.position.set(0, 250, 0);
  scene.add(light);

  ////////////
  // CUSTOM //
  ////////////

  // axes
  var axes = new THREE.AxisHelper(100);
  scene.add(axes);

  const { skyboxFloor, skyBox } = await Skybox;
  // scene.add(skyboxFloor);
  scene.add(skyBox);

  const { graphulusFloor, graphMesh, startPoint } = await Graphulus;
  // scene.add(graphulusFloor);
  scene.add(graphMesh);
  collidableMeshList.push(graphMesh);
  theStartPoint = new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z);

  const { plane, updatePlane } = await Plane(planeState);
  updatePlaneFunction = updatePlane;
  plane.position = startPoint;
  scene.add(plane);
  thePlane = plane;

  alert(`Samolot: \ninstrukcja: \nruch: WASD, \npowrót do ustawienia początkowego: Z\nrozpoczęcie ruchu: SPACJA\n
  mapa tworzona z mapy bitowej znajdującej się w pliku 'maps/map1.png'`);
}

function animate() {
  requestAnimationFrame(animate);
  render();
  update();
}

function update() {
  /* collisiton detection */

  // collision detection:
  //   determines if any of the rays from the cube's origin to each vertex
  //		intersects any face of a mesh in the array of target meshes
  //   for increased collision accuracy, add more vertices to the cube;
  //		for example, new THREE.CubeGeometry( 64, 64, 64, 8, 8, 8, wireMaterial )
  //   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
  var originPoint = thePlane.position.clone();

  for (
    var vertexIndex = 0;
    vertexIndex < thePlane.geometry.vertices.length;
    vertexIndex++
  ) {
    var localVertex = thePlane.geometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4(thePlane.matrix);
    var directionVector = globalVertex.sub(thePlane.position);

    var ray = new THREE.Raycaster(
      originPoint,
      directionVector.clone().normalize()
    );
    var collisionResults = ray.intersectObjects(collidableMeshList);
    if (
      collisionResults.length > 0 &&
      collisionResults[0].distance < directionVector.length()
    )
      planeState.state = "end";
  }
  /* /collisiton detection */

  if (
    keyboard.pressed("z") ||
    thePlane.position.x > 2500 ||
    thePlane.position.x < -2500 ||
    thePlane.position.y > 2500 ||
    thePlane.position.y < -2500 ||
    thePlane.position.z > 2500 ||
    thePlane.position.z < -2500
  ) {
    // do something
    thePlane.position.x = theStartPoint.x;
    thePlane.position.y = theStartPoint.y;
    thePlane.position.z = theStartPoint.z;
    planeState.state = "start";
  }
  if (!keyboard.pressed("space")) {
    readyToFlight = true;
  }
  if (keyboard.pressed("space")) {
    planeState.state = "flight";
  }
  controls.update();
  updatePlaneFunction(camera);
  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

async function main() {
  await init();
  await animate();
}
main();
