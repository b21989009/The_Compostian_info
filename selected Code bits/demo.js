
/*** You are THE COMPOSTIAN.
 In this game, you need to vacuum Garbage Monsters who are attacking you, process them into Compost and feed it to Trees.

 By
 Eray Dindas
 Mehmet Giray Nacakci
 Umut Can Gunay
 Ayberk Aygun

 BBM412 Fall2021

 */


let scene, camera, renderer;

let coloredMeshes = [];
let vacuumGunMesh;
let playerMesh;
let garbageTruckMesh;

// monsters
let monsters = [];
let monsters_andTheirPaths = new Map();
let monsters_andTheirFrameCounters = new Map();
let garbageMonsterMesh;

// vacuuming the monsters
let key_V_isPressed = false;
let monstersBeingVacuumed = [];
let monsters_beingVacuumed_frameCounters = new Map();
let monsters_vacuuming_startingLocation = new Map();

let key_G_isPressed = false;

// growing trees
let key_F_is_pressed = false;
let treesInsideTheTown = [];
let trees_andTheirInitialScales = new Map();
let trees_andTheirFrameCounters = new Map();
let treesCurrentlyGrowing = [];
let trees_andTheCompostTheyAreEating = new Map();

let garbageTexture;
let garbageMesh;
let garbageMeshes = [];
let grassTexture;
let meshFloor;
let floorMeshes = [];

// earthquake
let earthquakeEnabled = false;
let allEarthquakeMaterials = [];
let key_5_is_pressed = false;

// light animation
let allPhongMaterials = [];
let ambientDaylightIntensity = 0.99;
let time = Math.PI / 2;

// spotlight
let key_7_is_pressed = false;
let spotlightBrightness = 0.75;
let isSpotlightEnabled = false;
let spotlightPosition = {
	x: 0.0,
	y: 20.0,
	z: 0.0
};

// Spotlight Rotation
let zeta = degreeToRadian(-90.0);
let epsilon = degreeToRadian(0);

// camera rotation
let theta = degreeToRadian(-90);
let phi = degreeToRadian(15);
const mouseMovementSpeedCoefficient = Math.PI / 180.0 / 5;

// camera Roll
let beta = Math.PI / 2;
let gama = 0;
let rollCoefficient = Math.PI / 180;
let latestRollDirection = 0;

// zoom
let cameraDistanceCoefficient = 1;
let initialCameraRadius;
let onlyUseOnce = 1;

// pointer lock API
let p_key_is_pressed = false;
let cameraRotationEnabled = false;

// walking directions
let forward = 1;
let backward = 2;
let toLeft = 3;
let toRight = 4;

let keyboard = {};
let player = {
	height: 1.8,
	speed: 0.2,
	turnSpeed: Math.PI * 0.02 * 0.35
};

let textureLoader;
let garbageMonsterTexture;
let vacuumGunTexture;
let compostTexture;
let compostMesh;
let compostMeshesAtPickup = [];
let composts_beingFed_toTrees = [];


let loadingScreen = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 100),
	box: new THREE.Mesh(
		new THREE.BoxGeometry(0.5, 0.5, 0.5),
		basicColored_PHONG_Material(0.26, 0.26, 1.0)
	)
};
let loadingManager = null;
let RESOURCES_LOADED = false;

// Create the camera
camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 10000);

// Create the audio listener
const listener = new THREE.AudioListener();
camera.add(listener);

function init() {

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x8fe0ff);

	// Sound: Background Music
	const sound = new THREE.Audio(listener);
	const audioLoader = new THREE.AudioLoader();

	audioLoader.load('sounds/aguaribay-9002.mp3', function (buffer) {
		sound.setBuffer(buffer);
		sound.setLoop(true);
		sound.setVolume(0.5);
		sound.play();
	});


	loadingScreen.box.position.set(0, 0, 5);
	loadingScreen.camera.lookAt(loadingScreen.box.position);
	loadingScreen.scene.add(loadingScreen.box);

	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function (item, loaded, total) {
		//console.log(item, loaded, total);
	};
	loadingManager.onLoad = function () {
		console.log("loaded all resources");
		RESOURCES_LOADED = true;
		onResourcesLoaded();
	};


	textureLoader = new THREE.TextureLoader(loadingManager);


	compostTexture = textureLoader.load("viewmodel/dirt.jpg", function () {}, undefined, function () {
		console.log("error here")
	});
	compostMesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 2, 1),
		basicTextured_PHONG_Material(compostTexture));

	garbageTexture = textureLoader.load("viewmodel/garbage.jpg", function () {}, undefined, function () {
		console.log("error here")
	});
	garbageMesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		basicTextured_PHONG_Material(garbageTexture)
	);
	garbageMesh.position.y += 1;

	for (let x = 0; x < 5; x++) {
		for (let i = -5 + x; i < 5 - x; i++) {
			for (let j = -5 + x; j < 5 - x; j++) {
				let mesh1 = garbageMesh.clone();
				mesh1.position.set(i - 28 - x / 2, x / 2, j - 25 - x / 2);
				mesh1.scale.set(1, 1, 1);
				mesh1.rotation.y = 1.571 * Math.floor(Math.random() * 4);
				mesh1.rotation.x = 1.571 * Math.floor(Math.random() * 4);
				garbageMeshes.push(mesh1);
				scene.add(mesh1);

			}

		}
	}

	let mesh2 = garbageMesh.clone();
	mesh2.position.set(-19, 0, -28);
	mesh2.scale.set(1, 1, 1);
	garbageMeshes.push(mesh2);
	scene.add(mesh2);

	let mesh3 = garbageMesh.clone();
	mesh3.position.set(-20, 0.5, -28);
	mesh3.scale.set(1, 1, 1);
	garbageMeshes.push(mesh3);
	scene.add(mesh3);

	grassTexture = textureLoader.load("viewmodel/dirt2.jpg", function () {}, undefined, function () {
		console.log("error here")
	});
	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(10, 10, 10, 10),
		basicTextured_PHONG_Material(grassTexture)
	);

	meshFloor.rotation.x -= Math.PI / 2;

	for (let i = -52; i <= 52; i++) {
		for (let j = -52; j <= 52; j++) {
			let mesh1 = meshFloor.clone();
			mesh1.position.set(i * 10 - 0.5, 0, j * 10 - 0.5);
			floorMeshes.push(mesh1);
			scene.add(mesh1);

		}
	}

	crates();



	// Load models
	// REMEMBER: Loading in Javascript is asynchronous, so you need
	// to wrap the code in a function and pass it the index. If you
	// don't, then the index '_key' can change while the model is being
	// downloaded, and so the wrong model will be matched with the wrong
	// index key.
	for (let _key in modelsobjmtl) {
		(function (key) {

			let mtlLoader = new THREE.MTLLoader(loadingManager);
			mtlLoader.load(modelsobjmtl[key].mtl, function (materials) {
				materials.preload();

				let objLoader = new THREE.OBJLoader(loadingManager);

				objLoader.setMaterials(materials);
				objLoader.load(modelsobjmtl[key].obj, function (mesh) {

					mesh.traverse(function (node) {});
					modelsobjmtl[key].mesh = mesh;

				});
			});

		})(_key);
	}
	for (let _key in modelsobj) {
		(function (key) {

			let objLoader = new THREE.OBJLoader(loadingManager);

			//objLoader.setMaterials(materials);
			objLoader.load(modelsobj[key].obj, function (mesh) {

				mesh.traverse(function (node) {});
				modelsobj[key].mesh = mesh;

			});

		})(_key);
	}


	camera.position.set(3 * 2, player.height * 3 * 2, -6 * 2);
	camera.lookAt(new THREE.Vector3(-3, 0, 0));
	camera.up = new THREE.Vector3(0, 1, 0);

	renderer = new THREE.WebGLRenderer({
		antialias: true
	}); // with antialias shapes look smoother
	renderer.setSize(window.innerWidth, window.innerHeight);

	/*** Makes resolution look better. but might be performance hungry. */
	//renderer.setPixelRatio(window.devicePixelRatio);


	skyboxCreator();

	createFloorTileGraph();

	document.body.appendChild(renderer.domElement);

	animate();


}




// Runs when all resources are loaded
function animate() {

	// Play the loading screen until resources are loaded.
	if (RESOURCES_LOADED === false) {
		requestAnimationFrame(animate);

		loadingScreen.box.position.x -= 0.05;
		if (loadingScreen.box.position.x < -10) loadingScreen.box.position.x = 10;
		loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);

		renderer.render(loadingScreen.scene, loadingScreen.camera);
		return;
	}


	if (onlyUseOnce === 1){  // Some things to do only once, but cannot do in "init()" since resources were not loaded yet.
		randomTreesOutsideTheFence();
		initialCameraRadius = calculateCameraRadius();
		playerLatestTileIndices = findTileIndex_fromLocation(playerAndGun.position.x, playerAndGun.position.z);
		onlyUseOnce = 0;
	}


	monsterSpawn_periodically();

	timeIsPassing_andDaylightIsChanging();

	ifPlayer_movedOnto_anotherTile();

	moveGarbageMonsters_towardsPlayer();

	nearMonsters_reduceOurHealth();

	monsters_vacuum_animation();

	treeGrowthAnimation();

	facilitySwallows_garbageWeDropped_toTheDropArea();
	compostingProcedure();

	buttonControls();

	keyboardControls();

	rotateCameraAroundPlayer();

	resizeWindow();

	requestAnimationFrame(animate);


	renderer.render(scene, camera);



}



function timeIsPassing_andDaylightIsChanging() {


	time += 0.0013;

	ambientDaylightIntensity = (Math.sin(time) + 1.0) / 2.0;

	if (ambientDaylightIntensity < 0.03)
		ambientDaylightIntensity = 0.03;

	for (let aMaterial of allPhongMaterials) {
		aMaterial.uniforms.ambientDaylight.value = ambientDaylightIntensity;
	}
	skyboxMaterial.uniforms.ambientDaylight.value = ambientDaylightIntensity;

	for (let aMaterial of allEarthquakeMaterials) {
		aMaterial.uniforms.time.value += 0.15;
	}

}




function disableEarthquake_updateMaterials() {


	for (let aMesh of coloredMeshes) {

		for (let i = 0; i < aMesh.children.length; i++) {


			if (Array.isArray(aMesh.children[i].material)) {

				for (let j = 0; j < aMesh.children[i].material.length; j++) {

					let colors = aMesh.children[i].material[j].uniforms.objectColor.value;
					aMesh.children[i].material[j] = basicColored_PHONG_Material(colors.x, colors.y, colors.z);

				}
			} else { // if single material

				let colors = aMesh.children[i].material.uniforms.objectColor.value;
				aMesh.children[i].material = basicColored_PHONG_Material(colors.x, colors.y, colors.z);

			}

		}
	}


	for (let aMonster of monsters) {
		for (let i = 0; i < aMonster.children.length; i++) {
			aMonster.children[i].material = basicTextured_PHONG_Material(garbageMonsterTexture);
		}
	}

	for (let i = 0; i < vacuumGunMesh.children.length; i++) {
		vacuumGunMesh.children[i].material = basicTextured_PHONG_Material(vacuumGunTexture);
	}

	for (let singleMesh of floorMeshes) {
		singleMesh.material = basicTextured_PHONG_Material(grassTexture);
	}

	for (let singleMesh of garbageMeshes) {
		singleMesh.material = basicTextured_PHONG_Material(garbageTexture);
	}

}

function enableEarthquake_updateMaterials() {


	for (let aMesh of coloredMeshes) {

		for (let i = 0; i < aMesh.children.length; i++) {

			if (Array.isArray(aMesh.children[i].material)) { // if mesh has more than one material

				for (let j = 0; j < aMesh.children[i].material.length; j++) {

					let colors = aMesh.children[i].material[j].uniforms.objectColor.value;
					aMesh.children[i].material[j] = earthquakeShaderMaterial_withColor(colors.x, colors.y, colors.z);

				}
			} else { // if single material

				let colors = aMesh.children[i].material.uniforms.objectColor.value;
				aMesh.children[i].material = earthquakeShaderMaterial_withColor(colors.x, colors.y, colors.z);

			}

		}
	}


	for (let aMonster of monsters) {
		for (let i = 0; i < aMonster.children.length; i++) {
			aMonster.children[i].material = earthquakeShaderMaterial_withTexture(garbageMonsterTexture);
		}
	}

	for (let i = 0; i < vacuumGunMesh.children.length; i++) {
		vacuumGunMesh.children[i].material = earthquakeShaderMaterial_withTexture(vacuumGunTexture);
	}

	for (let singleMesh of floorMeshes) {
		singleMesh.material = earthquakeResistantMaterial(grassTexture);
	}

	for (let singleMesh of garbageMeshes) {
		singleMesh.material = earthquakeShaderMaterial_withTexture(garbageTexture);
	}

}



function keyboardControls() {


	// EARTHQUAKE

	if (!(key_5_is_pressed)) { // Disables the repetition of same event, until key is released.

		if (keyboard[53]) { // digit key 5

			key_5_is_pressed = true;

			if (earthquakeEnabled) {
				earthquakeEnabled = false;
				disableEarthquake_updateMaterials();
			} else {
				earthquakeEnabled = true;
				enableEarthquake_updateMaterials();
			}

		}

	}




	if (keyboard[87]) { // W key
		walk_and_let_camera_follow_you(forward);
	}
	if (keyboard[83]) { // S key
		walk_and_let_camera_follow_you(backward);
	}
	if (keyboard[65]) { // A key
		walk_and_let_camera_follow_you(toLeft);
	}

	if (keyboard[68]) { // D key
		walk_and_let_camera_follow_you(toRight);
	}



	/* Press V to vacuum a monster. */
	if (!(key_V_isPressed)){
		if (keyboard[86]){
			key_V_isPressed = true;

			// Sound: Vacuum
			const sound = new THREE.Audio(listener);
			const audioLoader = new THREE.AudioLoader();

			audioLoader.load('sounds/344666__daymonjlong__vacuuming.mp3', function (buffer) {
				sound.setBuffer(buffer);
				sound.setLoop(false);
				sound.setVolume(0.5);
				if (key_V_isPressed){
					sound.play();
				}
				else{
					sound.stop();
				}
			});

			vacuum_a_monster();

		}
	}



	// F key to feed tree with compost
	if (!(key_F_is_pressed)){
		if(keyboard[70]){
			key_F_is_pressed = true;

			// Sound: Leaf
			const sound = new THREE.Audio(listener);
			const audioLoader = new THREE.AudioLoader();

			audioLoader.load('sounds/204029__duckduckpony__tumbleweed-impact-002.mp3', function (buffer) {
				sound.setBuffer(buffer);
				sound.setLoop(false);
				sound.setVolume(0.5);
				sound.play();
			});

			dropCompost_nextTo_aTree();
		}
	}


	/* DROP garbage to drop area, PICKUP compost from pickup area  */
	if (!(key_G_isPressed)) {

		if (keyboard[71]) { // G key
			key_G_isPressed = true;

			if (playerAndGun.position.x > -6 && playerAndGun.position.x < 6 &&
				playerAndGun.position.z > -6 && playerAndGun.position.z < 6) {
				newTrashDropToTheCenter();

			} else if (playerAndGun.position.x > -12 && playerAndGun.position.x < -7 &&
				playerAndGun.position.z > 8 && playerAndGun.position.z < 14) {
				pickUpCompostFromTheGround_atTheOutputDoorOfFacility();

			}
			keyboard[71] = false;

		}

	}


	/* An extra degree of freedom : Camera Roll */
	if (keyboard[82] || keyboard[84] || keyboard[89]) { // R T Y
		rotate_UpVector_aroundCamera();
	}



	// Enable - disable Pointer Lock API for Camera Rotation

	if (!(p_key_is_pressed)) { // Disables the repetition of same event, until key is released.

		if (cameraRotationEnabled) {
			// DISABLE pointer-lock-api  by pressing  letter P , or pressing  Esc  twice.
			if (keyboard[27] || keyboard[80]) {
				p_key_is_pressed = true; // needed. We do not want to fire same event again in the case of continuing to pressing the key

				document.exitPointerLock();
				cameraRotationEnabled = false;
			}
		} else {
			// ENABLE pointer-lock-api by pressing P
			if (keyboard[80]) {
				p_key_is_pressed = true;

				document.getElementById('pointer-lock').requestPointerLock();
				cameraRotationEnabled = true;

			}
		}

	}




	/* SPOTLIGHT  on-off and intensity */

	if (!earthquakeEnabled) { // There is no Spotlight in Earthquake mode.

		if (!(key_7_is_pressed)) { // Disables the repetition of same event, until key is released.

			if (keyboard[55]) { // digit key 7

				key_7_is_pressed = true;

				if (isSpotlightEnabled) {
					// Disable spotlight
					for (let aMaterial of allPhongMaterials) {
						aMaterial.uniforms.isSpotlightEnabled.value = 0.0;
					}
					isSpotlightEnabled = false;
				} else {
					// Enable spotlight
					for (let aMaterial of allPhongMaterials) {
						aMaterial.uniforms.isSpotlightEnabled.value = spotlightBrightness;
					}
					isSpotlightEnabled = true;
				}
			}
		}

		if (isSpotlightEnabled) {

			// Decrease Spotlight intensity
			if (keyboard[56]) { // digit key 8

				spotlightBrightness -= 0.01;
				if (spotlightBrightness < 0.09) {
					spotlightBrightness = 0.09;
					for (let aMaterial of allPhongMaterials) {
						aMaterial.uniforms.isSpotlightEnabled.value = 0.09;
					}
				} else {
					for (let aMaterial of allPhongMaterials) {
						aMaterial.uniforms.isSpotlightEnabled.value -= 0.01;
					}
				}
			}

			// Increase spotlight intensity
			if (keyboard[57]) { // digit key 9

				spotlightBrightness += 0.01;
				if (spotlightBrightness > 0.99) {
					spotlightBrightness = 0.99;
					for (let aMaterial of allPhongMaterials) {
						aMaterial.uniforms.isSpotlightEnabled.value = 0.99;
					}
				} else {
					for (let aMaterial of allPhongMaterials) {
						aMaterial.uniforms.isSpotlightEnabled.value += 0.01;
					}
				}

			}



			if (!selectMode) { // Object select mode  uses same translation keys

				/* SPOTLIGHT Translation  :  U H J K , pageup pagedown  */
				if (keyboard[85] || keyboard[72] || keyboard[74] || keyboard[75] || keyboard[33] || keyboard[34]) {
					translateSpotlight();
				}
			}

			/* SPOTLIGHT Rotation : Arrow keys */
			if (keyboard[37] || keyboard[38] || keyboard[39] || keyboard[40]) {
				rotateSpotlightDirection();
			}

		}

	}




	// Move and Rotate the selected object

	if (selectMode) {

		/* Translation  :  U H J K , pageup pagedown  */
		if (keyboard[85] || keyboard[72] || keyboard[74] || keyboard[75] || keyboard[33] || keyboard[34])
			translateSelectedObject();

		/* Rotation :  Z X C  */
		if (keyboard[90] || keyboard[88] || keyboard[67])
			rotateSelectedObject();

	}


}




function translateSpotlight() {

	if (keyboard[85]) { // U
		spotlightPosition.z += 0.6;
	}
	if (keyboard[72]) { // H
		spotlightPosition.x += 0.6;
	}
	if (keyboard[74]) { // J
		spotlightPosition.z -= 0.6;
	}
	if (keyboard[75]) { // K
		spotlightPosition.x -= 0.6;
	}
	if (keyboard[33]) { // PageUP
		spotlightPosition.y += 0.6;
	}
	if (keyboard[34]) { // PageDown
		spotlightPosition.y -= 0.6;
	}

	for (let aMaterial of allPhongMaterials) {
		aMaterial.uniforms.spotlightPosition.value = new THREE.Vector3(spotlightPosition.x, spotlightPosition.y, spotlightPosition.z);
	}

}



function rotateSpotlightDirection() {

	// Zeta is the vertical angle from  z-x plane to y-axis.
	// Epsilon is the horizontal angle from  z-axis  to  x-axis.

	if (keyboard[37]) { // left arrow key
		epsilon += player.turnSpeed;
	}
	if (keyboard[38]) { // up arrow key
		zeta -= player.turnSpeed;

		if (zeta < degreeToRadian(-179))
			zeta = degreeToRadian(-179);
	}
	if (keyboard[39]) { // right arrow key
		epsilon -= player.turnSpeed;
	}
	if (keyboard[40]) { // down arrow key
		zeta += player.turnSpeed;

		if (zeta > degreeToRadian(-1))
			zeta = degreeToRadian(-1);

	}

	// spherical coordinates
	let spotlightDirection_x = Math.cos(zeta) * Math.sin(epsilon);
	let spotlightDirection_y = Math.sin(zeta);
	let spotlightDirection_z = Math.cos(zeta) * Math.cos(epsilon);

	for (let aMaterial of allPhongMaterials) {
		aMaterial.uniforms.spotlightDirection.value = new THREE.Vector3(spotlightDirection_x, spotlightDirection_y, spotlightDirection_z);
	}

}


function rotate_UpVector_aroundCamera() {

	// Beta is the  vertical   angle from z-x plane to y-axis.
	// Gama is the  horizontal angle from  z-axis  to x-axis.

	if (keyboard[82]) { // R key
		// Roll Camera CounterClockwise

		if (beta > 89.8 * Math.PI / 180) {
			gama = theta - Math.PI / 2;
			latestRollDirection = 1;
		}

		if (latestRollDirection < 0) { // cw roll was recent
			beta += rollCoefficient;
		} else {
			beta -= rollCoefficient;
			latestRollDirection = 1;
		}
	}

	if (keyboard[84]) { // T key
		// Reset Camera Roll

		beta = Math.PI / 2;
		gama = 0;
		latestRollDirection = 0;
	}

	if (keyboard[89]) { // Y key
		// Roll Camera Clockwise

		if (beta > 89.8 * Math.PI / 180) {
			gama = theta + Math.PI / 2;
			latestRollDirection = -1;
		}

		if (latestRollDirection > 0) { // ccw roll was recent
			beta += rollCoefficient;
		} else {
			beta -= rollCoefficient;
			latestRollDirection = -1;
		}

	}

	if (beta < 0)
		beta = 0;
	if (beta > Math.PI / 2)
		beta = Math.PI / 2;

	// spherical coordinates
	let up_vector_x = Math.cos(beta) * Math.sin(gama);
	let up_vector_y = Math.sin(beta);
	let up_vector_z = Math.cos(beta) * Math.cos(gama);

	camera.up = new THREE.Vector3(up_vector_x, up_vector_y, up_vector_z);

}



function rotateCameraAroundPlayer() {

	let cameraRadius = cameraDistanceCoefficient * initialCameraRadius; // length between camera and player.

	// Theta is the  horizontal angle from  z-axis  to x-axis.
	// Phi is the  vertical   angle from z-x plane to y-axis.

	// spherical coordinates
	camera.position.x = playerAndGun.position.x + (cameraRadius * Math.cos(phi) * Math.sin(theta));
	camera.position.y = playerAndGun.position.y + (cameraRadius * Math.sin(phi));
	camera.position.z = playerAndGun.position.z + (cameraRadius * Math.cos(phi) * Math.cos(theta));

	camera.lookAt(new THREE.Vector3(playerAndGun.position.x, playerAndGun.position.y, playerAndGun.position.z));

}


function calculateCameraRadius() {

	let x_distance = camera.position.x - playerAndGun.position.x;
	let y_distance = camera.position.y - playerAndGun.position.y;
	let z_distance = camera.position.z - playerAndGun.position.z;

	return Math.sqrt(Math.pow(x_distance, 2) + Math.pow(y_distance, 2) + Math.pow(z_distance, 2));
}




// player should move with WASD not fixed but relative directions just like shooter games.
function walk_and_let_camera_follow_you(direction) {

	// Horizontal forward vector from camera to player
	let x_component = playerAndGun.position.x - camera.position.x;
	let z_component = playerAndGun.position.z - camera.position.z;

	let lengthForNormalization = Math.sqrt(Math.pow(x_component, 2) + Math.pow(z_component, 2));
	x_component = x_component / lengthForNormalization;
	z_component = z_component / lengthForNormalization;

	let translationCoefficient = 0.15;
	x_component *= translationCoefficient;
	z_component *= translationCoefficient;


	/* Turn the Face of Player to the direction of walking */
	let forwardWalkingAngle = theta + Math.PI; // theta is towards camera, theta + 180 is looking forward
	let walkingAngle;


	if (direction === forward) {

		if (player_is_in_theRangeOfTown()) {
			// add forward vector

			if (isNotRestricted(playerAndGun.position.x + x_component, playerAndGun.position.z)) {
				playerAndGun.position.x += x_component;
				camera.position.x += x_component;
			}

			if (isNotRestricted(playerAndGun.position.x, playerAndGun.position.z + z_component)) {
				playerAndGun.position.z += z_component;
				camera.position.z += z_component;
			}

		}

		// After translation, Revert if out of range now
		if (!(player_is_in_theRangeOfTown())) {
			playerAndGun.position.x -= x_component;
			camera.position.x -= x_component;
			playerAndGun.position.z -= z_component;
			camera.position.z -= z_component;
		}

		walkingAngle = forwardWalkingAngle;
	}


	if (direction === backward) {

		if (player_is_in_theRangeOfTown()) {
			// add reverse of forward vector

			if (isNotRestricted(playerAndGun.position.x - x_component, playerAndGun.position.z)) {
				playerAndGun.position.x -= x_component;
				camera.position.x -= x_component;
			}

			if (isNotRestricted(playerAndGun.position.x, playerAndGun.position.z - z_component)) {
				playerAndGun.position.z -= z_component;
				camera.position.z -= z_component;
			}

		}

		// After translation, Revert if out of range now
		if (!(player_is_in_theRangeOfTown())) {
			playerAndGun.position.x += x_component;
			camera.position.x += x_component;
			playerAndGun.position.z += z_component;
			camera.position.z += z_component;
		}

		walkingAngle = forwardWalkingAngle - Math.PI;
	}


	if (direction === toLeft) {

		if (player_is_in_theRangeOfTown()) {
			// add 90 degree rotated (around y) version of forward vector.

			if (isNotRestricted(playerAndGun.position.x + z_component, playerAndGun.position.z)) {
				playerAndGun.position.x += z_component;
				camera.position.x += z_component;
			}

			if (isNotRestricted(playerAndGun.position.x, playerAndGun.position.z - x_component)) {
				playerAndGun.position.z += -1 * x_component;
				camera.position.z += -1 * x_component;
			}

		}

		// After translation, Revert if out of range now
		if (!(player_is_in_theRangeOfTown())) {
			playerAndGun.position.x -= z_component;
			camera.position.x -= z_component;
			playerAndGun.position.z -= -1 * x_component;
			camera.position.z -= -1 * x_component;
		}


		// Turn the player's body towards walking direction
		if (keyboard[87]) { // forward and left
			walkingAngle = forwardWalkingAngle + Math.PI / 4;
		} else if (keyboard[83]) { // backward and left
			walkingAngle = forwardWalkingAngle + (Math.PI * 3 / 4);
		} else { // just left
			walkingAngle = forwardWalkingAngle + Math.PI / 2;
		}

	}


	if (direction === toRight) {

		if (player_is_in_theRangeOfTown()) {
			// add -90 degree rotated (around y) version of that vector.

			if (isNotRestricted(playerAndGun.position.x - z_component, playerAndGun.position.z)) {
				playerAndGun.position.x += -1 * z_component;
				camera.position.x += -1 * z_component;
			}

			if (isNotRestricted(playerAndGun.position.x, playerAndGun.position.z + x_component)) {
				playerAndGun.position.z += x_component;
				camera.position.z += x_component;
			}

		}

		// After translation, Revert if out of range now
		if (!(player_is_in_theRangeOfTown())) {
			playerAndGun.position.x -= -1 * z_component;
			camera.position.x -= -1 * z_component;
			playerAndGun.position.z -= x_component;
			camera.position.z -= x_component;
		}


		// Turn the player's body towards walking direction
		if (keyboard[87]) { // forward and right
			walkingAngle = forwardWalkingAngle - Math.PI / 4;
		} else if (keyboard[83]) { // backward and right
			walkingAngle = forwardWalkingAngle - (Math.PI * 3 / 4);
		} else { // just right
			walkingAngle = forwardWalkingAngle - Math.PI / 2;
		}

	}
	//console.log("x: "+playerAndGun.position.x);
	//console.log("z: "+playerAndGun.position.z);
	playerAndGun.rotation.y = walkingAngle;

}


function player_is_in_theRangeOfTown() {
	return is_in_theRangeOfTown(playerAndGun.position.x, playerAndGun.position.z);
}


function is_in_theRangeOfTown(pos_x, pos_z) {

	let in_range_in_z_direction = (pos_z < 43) && (pos_z > -45);
	let in_range_in_x_direction = (pos_x < 43) && (pos_x > -44);

	return in_range_in_x_direction && in_range_in_z_direction;

}


function randomTreesOutsideTheFence() {

	for (let i = 0; i < 500; i++) {

		let x = randomNumberInRange(45, 11 * 45);
		let z = randomNumberInRange(45, 11 * 45);
		let s = (Math.random() + 0.1) * 8;

		let newTree = modelsobjmtl.tree.mesh.clone();

		newTree.position.set(x, 0, z);
		newTree.scale.set(s, s, s);

		coloredMeshes.push(newTree);
		scene.add(newTree);
	}

}

function randomNumberInRange(min, max) {
	let randomNumber = Math.random() * (max - min) + min;
	let randomSign = Math.sign(Math.random() - 0.5);
	return randomNumber * randomSign;
}


function keyDown(event) {
	keyboard[event.keyCode] = true;
}

function keyUp(event) {
	keyboard[event.keyCode] = false;

	if (event.keyCode === 80)
		p_key_is_pressed = false;
	if (event.keyCode === 55)
		key_7_is_pressed = false;
	if (event.keyCode === 53)
		key_5_is_pressed = false;
	if (event.keyCode === 71)
		key_G_isPressed = false;
	if (event.keyCode === 86)
		key_V_isPressed = false;
	if (event.keyCode === 70)
		key_F_is_pressed = false;


	// related to rotation of a selected object
	if (event.keyCode === 90)
		reverseDirectionFor_z *= -1.0;
	if (event.keyCode === 88)
		reverseDirectionFor_x *= -1.0;
	if (event.keyCode === 67)
		reverseDirectionFor_y *= -1.0;

}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;



function degreeToRadian(degree) {

	return degree * Math.PI / 180;
}


// camera rotation
document.addEventListener('mousemove', function (event) {

	if (cameraRotationEnabled) {

		// Theta is the  horizontal angle from  z-axis  to x-axis.
		// Phi is the  vertical   angle from z-x plane to y-axis.

		// Horizontal movement of the mouse will rotate the camera horizontally around player's y-axis.
		theta += -event.movementX * mouseMovementSpeedCoefficient;
		// Vertical movement of the mouse will rotate the camera vertically around the player.
		phi += event.movementY * mouseMovementSpeedCoefficient;


		// do not flip yourself on the sky like an airplane
		if (phi > degreeToRadian(89))
			phi = degreeToRadian(89);

		// do not go underground
		if (phi < degreeToRadian(1))
			phi = degreeToRadian(1);
	}

});


// mouse wheel zoom in/out
window.addEventListener("wheel", function (event) {

	cameraDistanceCoefficient += Math.sign(event.deltaY) / 5;

	if (cameraDistanceCoefficient < 0.05)
		cameraDistanceCoefficient = 0.06;

	if (cameraDistanceCoefficient > 20)
		cameraDistanceCoefficient = 20;


});



function resizeWindow() {

	window.addEventListener('resize', function () {

		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;

	}, false);

}



function restartGame(){

	document.getElementById('logoAndMenu').style.visibility = 'visible';
	document.getElementById("health").value = 100;

	/* Reassign the initial values of global variables.
	No need to call init, we will continue animation */

	for (let aMonster of monsters)
		scene.remove(aMonster);
	for (let aMonster of monstersBeingVacuumed)
		scene.remove(aMonster);
	monsters = [];
	monsters_andTheirPaths = new Map();
	monsters_andTheirFrameCounters = new Map();
	monsterSpawn_frameCounter = 0;
	monstersBeingVacuumed = [];
	monsters_beingVacuumed_frameCounters = new Map();
	monsters_vacuuming_startingLocation = new Map();

	let trees_andTheirInitialScales = new Map();
	for (let aTree of treesInsideTheTown){

		let resetScale = {x: 0.5, y: 0.5*(Math.floor(Math.random()*2)+1) , z: 0.5};
		aTree.scale.set(resetScale.x, resetScale.y, resetScale.z);
		trees_andTheirInitialScales.set(aTree, resetScale);
	}
	trees_andTheirFrameCounters = new Map();
	treesCurrentlyGrowing = [];
	trees_andTheCompostTheyAreEating = new Map();

	for (let aCompost of compostMeshesAtPickup)
		scene.remove(aCompost);
	for (let aCompost of composts_beingFed_toTrees)
		scene.remove(aCompost);
	for (let aGarbage of droppedGarbageMeshes)
		scene.remove(aGarbage);
	compostMeshesAtPickup = [];
	composts_beingFed_toTrees = [];
	droppedGarbageMeshes = [];

	vacuumedMonstersInTheGun = 0;
	garbageDroppingToFacility_frameCounters = [];
	compost_readyToPickup_onTheGround = 0;
	compostRecycledCount = 0;
	compostsInProgress_FrameCounts = [];
	compostInInventory = 0;

	key_G_isPressed = false;
	key_V_isPressed = false;
	earthquakeEnabled = false;
	disableEarthquake_updateMaterials();

	key_5_is_pressed = false;
	ambientDaylightIntensity = 0.99;
	time = Math.PI / 2;
	key_7_is_pressed = false;
	spotlightBrightness = 0.75;
	isSpotlightEnabled = false;
	spotlightPosition = {
		x: 0.0,
		y: 20.0,
		z: 0.0
	};
	for (let aMaterial of allPhongMaterials) {
		aMaterial.uniforms.isSpotlightEnabled.value = 0.0;
	}

	zeta = degreeToRadian(-90.0);
	epsilon = degreeToRadian(0);
	theta = degreeToRadian(-90);
	phi = degreeToRadian(15);
	beta = Math.PI / 2;
	gama = 0;
	rollCoefficient = Math.PI / 180;
	latestRollDirection = 0;
	cameraDistanceCoefficient = 1;
	p_key_is_pressed = false;
	cameraRotationEnabled = false;
	keyboard = {};

	camera.position.set(3 * 2, player.height * 3 * 2, -6 * 2);
	camera.lookAt(new THREE.Vector3(-3, 0, 0));
	camera.up = new THREE.Vector3(0, 1, 0);

	selectMode = false;
	playerMesh.position.set(0, 0, 0);
	playerMesh.rotation.set(0,0,0);
	vacuumGunMesh.rotation.set(-Math.PI/16, 0 , -Math.PI/32);
	vacuumGunMesh.position.set(-0.6,0.3,0.3);
	garbageTruckMesh.position.set(-21, 0, -24);
	garbageTruckMesh.scale.set(2,1.5,2);
	playerAndGun.position.set(1, 0, -5);
	playerAndGun.rotation.y = - Math.PI / 2;

	initialCameraRadius = calculateCameraRadius();
	playerLatestTileIndices = findTileIndex_fromLocation(playerAndGun.position.x, playerAndGun.position.z);

}
