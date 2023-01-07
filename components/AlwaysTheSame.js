const AlwaysTheSame = (async () => {
  // RENDERER
  if (Detector.webgl) renderer = new THREE.WebGLRenderer({ antialias: true });
  else renderer = new THREE.CanvasRenderer();
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container = document.getElementById("ThreeJS");
  container.appendChild(renderer.domElement);
  // EVENTS
  THREEx.WindowResize(renderer, camera);
  THREEx.FullScreen.bindKey({ charCode: "m".charCodeAt(0) });
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

  var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight;

  return { renderer, SCREEN_WIDTH, SCREEN_HEIGHT };
})();
