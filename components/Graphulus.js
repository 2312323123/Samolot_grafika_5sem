const Graphulus = (async () => {
  async function loadImageData(url) {
    return new Promise((resolve, reject) => {
      let img = new window.Image();
      img.crossOrigin = `Anonymous`;
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        data = imgData.data;

        let redValues = [];
        for (let i = 0; i < data.length - 3; i += 4) {
          redValues.push(data[i]);
        }
        const result = {
          width: canvas.width,
          height: canvas.height,
          points: redValues,
        };
        canvas.remove();
        resolve(result);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
    });
  }

  var graphGeometry;
  var wireMaterial;
  var graphMesh;
  var segments = 40;
  let startPoint = new THREE.Vector3(0, 0, 0);

  /* graphulusFloor */
  // wireframe for xy-plane
  var wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x000088,
    wireframe: true,
    side: THREE.DoubleSide,
  });
  var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
  var graphulusFloor = new THREE.Mesh(floorGeometry, wireframeMaterial);
  graphulusFloor.position.z = -0.01;
  graphulusFloor.rotation.x = Math.PI / 2;
  /* /graphulusFloor */

  meshFunction = function (x, y) {
    return new THREE.Vector3(x, y, x + y);
  };

  // true => sensible image tile repeat...
  graphGeometry = new THREE.ParametricGeometry(
    meshFunction,
    segments,
    segments,
    true
  );

  let mapFirstDimensionSizeCopy;

  try {
    let { width, height, points } = await loadImageData("./maps/map1.png");
    // do something with the img element
    segments = width;

    const mapFirstDimensionSize = 2000;
    mapFirstDimensionSizeCopy = mapFirstDimensionSize;
    const maxHeightToWidthRatio = 0.75;

    const maxY = mapFirstDimensionSize * maxHeightToWidthRatio;

    const xScale = mapFirstDimensionSize / width;
    const yScale = (height / width) * xScale;

    const xOffset = -mapFirstDimensionSize / 2;
    const yOffset = -((height / width) * mapFirstDimensionSize) / 2;

    const vertices = [];
    const faces = [];

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        let x = i * xScale + xOffset;
        let y = j * yScale + yOffset;
        let z = points[i * width + j] * (maxY / 255);

        if (z > startPoint.z) {
          startPoint = new THREE.Vector3(x, y, z);
        }

        vertices.push(new THREE.Vector3(x, y, z));
      }
    }

    for (let i = 0; i < width - 1; i++) {
      for (let j = 0; j < height - 1; j++) {
        faces.push(
          new THREE.Face3(j * width + i, j * width + i + 1, (j + 1) * width + i)
        );

        faces.push(
          new THREE.Face3(
            j * width + i + 1,
            (j + 1) * width + i,
            (j + 1) * width + i + 1
          )
        );
      }
    }

    graphGeometry.vertices = vertices;
    graphGeometry.faces = faces;
  } catch (error) {
    console.error(error);
  }

  ///////////////////////////////////////////////
  // calculate vertex colors based on Z values //
  ///////////////////////////////////////////////
  graphGeometry.computeBoundingBox();
  zMin = graphGeometry.boundingBox.min.z;
  zMax = graphGeometry.boundingBox.max.z;
  zRange = zMax - zMin;
  var color, point, face, numberOfSides, vertexIndex;
  // faces are indexed using characters
  var faceIndices = ["a", "b", "c", "d"];
  // first, assign colors to vertices as desired
  for (var i = 0; i < graphGeometry.vertices.length; i++) {
    point = graphGeometry.vertices[i];
    color = new THREE.Color(0x0000ff);
    color.setHSL((0.7 * (zMax - point.z)) / zRange, 1, 0.5);
    graphGeometry.colors[i] = color; // use this array for convenience
  }
  // copy the colors as necessary to the face's vertexColors array.
  for (var i = 0; i < graphGeometry.faces.length; i++) {
    face = graphGeometry.faces[i];
    numberOfSides = face instanceof THREE.Face3 ? 3 : 4;
    for (var j = 0; j < numberOfSides; j++) {
      vertexIndex = face[faceIndices[j]];
      face.vertexColors[j] = graphGeometry.colors[vertexIndex];
    }
  }
  ///////////////////////
  // end vertex colors //
  ///////////////////////

  // "wireframe texture"
  var wireTexture = new THREE.ImageUtils.loadTexture("images/square.png");
  wireTexture.wrapS = wireTexture.wrapT = THREE.RepeatWrapping;
  wireTexture.repeat.set(40, 40);
  wireMaterial = new THREE.MeshBasicMaterial({
    map: wireTexture,
    vertexColors: THREE.VertexColors,
    side: THREE.DoubleSide,
    color: 0xffffff,
  });

  wireMaterial.map.repeat.set(segments, segments);

  graphMesh = new THREE.Mesh(graphGeometry, wireMaterial);
  graphMesh.doubleSided = true;
  graphMesh.rotation.x = -Math.PI / 2;
  graphMesh.translateZ(-zMax * 0.4);

  // inny uklad wspolrzednych
  // chcialem zrobic lewo>prawo - os x, tyl>przod - os y, dol>gora - os z
  // ale w koncu robie lewo>prawo - x, przod>tyl - z, dol>gora - y
  // czyli przechodzac z normalnych na te y musi sie stac -z, z musi sie stac y
  startPoint = new THREE.Vector3(
    startPoint.x,
    startPoint.z - zMax * 0.4 + mapFirstDimensionSizeCopy / 20, // magic number
    -startPoint.y
  );

  return { graphulusFloor, graphMesh, startPoint };
})();

// return { graphulusFloor, graphMesh, startPoint };
