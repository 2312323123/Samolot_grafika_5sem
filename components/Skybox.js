const Skybox = (async () => {
  // FLOOR
  var floorTexture = new THREE.ImageUtils.loadTexture(
    "images/checkerboard.jpg"
  );
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(10, 10);
  var floorMaterial = new THREE.MeshBasicMaterial({
    map: floorTexture,
    side: THREE.DoubleSide,
  });
  var floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
  var skyboxFloor = new THREE.Mesh(floorGeometry, floorMaterial);
  skyboxFloor.position.y = -0.5;
  skyboxFloor.rotation.x = Math.PI / 2;

  var imagePrefix = "images/moondust-";
  var directions = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
  var imageSuffix = ".png";
  var skyGeometry = new THREE.CubeGeometry(5000, 5000, 5000);

  var materialArray = [];
  for (var i = 0; i < 6; i++)
    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture(
          imagePrefix + directions[i] + imageSuffix
        ),
        side: THREE.BackSide,
      })
    );
  var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
  var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
  // skyBox.rotation.x = Math.PI / 2;

  return { skyboxFloor, skyBox };
})();

// return { skyboxFloor, skyBox };
