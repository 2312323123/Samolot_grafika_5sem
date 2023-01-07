const Plane = async (stateObject, scale = 1) => {
  var plane;
  var xAngle = 0;
  var yAngle = 0;
  // var stage = "start"; // / "flight" / "end"

  /* GEOMETRY */
  var geometry = new THREE.Geometry();

  const vertices = [
    new THREE.Vector3(-10 * scale, 8 * scale, 0 * scale),
    new THREE.Vector3(-2 * scale, 6 * scale, 0 * scale),
    new THREE.Vector3(0 * scale, 0 * scale, 0 * scale),
    new THREE.Vector3(2 * scale, 6 * scale, 0 * scale),
    new THREE.Vector3(10 * scale, 8 * scale, 0 * scale),
    new THREE.Vector3(-10 * scale, 8 * scale, -2 * scale),
    new THREE.Vector3(10 * scale, 8 * scale, -2 * scale),
    new THREE.Vector3(-1 * scale, 6 * scale, -8 * scale), // this
    new THREE.Vector3(0 * scale, 1 * scale, -8 * scale),
    new THREE.Vector3(1 * scale, 6 * scale, -8 * scale), // and this
    new THREE.Vector3(0 * scale, 2 * scale, -28 * scale),
  ];
  // mozna bylo po prostu plane.scale.set(scale, scale, scale) na koncu

  const faces = [
    new THREE.Face3(1, 2, 10),
    new THREE.Face3(2, 3, 10),
    new THREE.Face4(0, 1, 5),
    new THREE.Face4(5, 1, 10),
    new THREE.Face3(3, 4, 6),
    new THREE.Face3(3, 6, 10),
    new THREE.Face3(5, 7, 10), // this
    new THREE.Face3(9, 6, 10), // and this
    new THREE.Face3(7, 8, 10),
    new THREE.Face3(8, 9, 10),
  ];
  geometry.vertices = vertices;
  geometry.faces = faces;

  geometry.faces[0].color = new THREE.Color("rgb(255, 0, 0)");
  geometry.vertexColors = THREE.FaceColors;

  /* MATERIAL */
  // this material causes a mesh to use colors assigned to vertices
  //   different colors at face vertices create gradient effect
  var material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: THREE.VertexColors,
    side: THREE.DoubleSide,
  });

  /* COLORING */
  const colors = [
    new THREE.Color(0xcccccc),
    new THREE.Color(0xdddddd),
    new THREE.Color(0xefefef),
    new THREE.Color(0xefefef),
    new THREE.Color(0xefefef),
    new THREE.Color(0xefefef),
    new THREE.Color(0xf8f8f8),
    new THREE.Color(0xf8f8f8),
    new THREE.Color(0xcfcfcf),
    new THREE.Color(0xdfdfdf),
  ];

  // faces are indexed using characters
  var faceIndices = ["a", "b", "c"];

  // randomly color cube
  for (var i = 0; i < geometry.faces.length; i++) {
    face = geometry.faces[i];
    for (var j = 0; j < 3; j++) {
      vertexIndex = face[faceIndices[j]];

      face.vertexColors[j] = colors[i];
    }
  }

  /* PLANE */
  plane = new THREE.Mesh(geometry, material);

  function updatePlane(camera) {
    var delta = clock.getDelta(); // seconds.
    var moveDistance = 400 * delta; // 200 pixels per second
    var rotateAngle = (Math.PI / 2) * delta; // pi/2 radians (90 degrees) per second

    // local transformations

    // move forwards/backwards/left/right
    if (keyboard.pressed("R")) plane.translateZ(-moveDistance);
    if (keyboard.pressed("F")) plane.translateZ(moveDistance);
    if (keyboard.pressed("Q")) plane.translateX(-moveDistance);
    if (keyboard.pressed("E")) plane.translateX(moveDistance);

    // rotate left/right/up/down
    if (stateObject.state !== "end") {
      if (keyboard.pressed("A")) {
        yAngle += rotateAngle;
        yAngle %= 2 * Math.PI;
      }
      if (keyboard.pressed("D")) {
        yAngle -= rotateAngle;
        yAngle %= 2 * Math.PI;
      }
      if (keyboard.pressed("W")) {
        if (xAngle + rotateAngle < Math.PI / 2 - 0.4) xAngle += rotateAngle;
      }
      if (keyboard.pressed("S")) {
        if (xAngle + rotateAngle > -Math.PI / 2 + 0.65) xAngle -= rotateAngle;
      }
    }

    if (stateObject.state === "flight") plane.translateZ(-moveDistance);

    plane.rotation.set(0, 0, 0);
    plane.rotateY(yAngle);
    plane.rotateX(xAngle);

    var relativeCameraOffset = new THREE.Vector3(0, 50, 100);

    var cameraOffset = relativeCameraOffset.applyMatrix4(plane.matrixWorld);

    camera.position.x = cameraOffset.x;
    camera.position.y = cameraOffset.y;
    camera.position.z = cameraOffset.z;
    camera.lookAt(plane.position);
  }

  return { plane, updatePlane };
};

// return { plane, updatePlane(camera) };
