/*** Our custom "Modified Depth-First-Search with Target Direction" Algorithm
 is used for moving Garbage Monsters towards the player. */

let playerLatestTileIndices;
let monsterSpawn_frameCounter = 0;
let monsterSpawn_period = 260;
let destroyedCreature = 0;

let floorTiles = []; // 2d array

// Tile Object (like a Java class, but JS does not have "class")
function Tile(isNotOccupied, center_x, center_z) {
    this.isNotOccupied = isNotOccupied;

    this.center_x = center_x;
    this.center_z = center_z;

}

function createFloorTileGraph() {

    for (let x_ = 0; x_ < 87; x_++) { // x range of Town is from -44 to 43, 87 tiles fit

        floorTiles.push([]); // creating another row on 2D dynamic array

        for (let z_ = 0; z_ < 88; z_++) { // z range is of Town from -45 to 43, 88 tiles fit

            // corner order does not matter
            let corner1 = {
                x: -44.0 + x_,
                z: -45.0 + z_
            };
            let corner2 = {
                x: -44.0 + x_,
                z: -44.0 + z_
            };
            let corner3 = {
                x: -43.0 + x_,
                z: -45.0 + z_
            };
            let corner4 = {
                x: -43.0 + x_,
                z: -44.0 + z_
            };

            let center_x = (corner1.x + corner2.x + corner3.x + corner4.x) / 4;
            let center_z = (corner1.z + corner2.z + corner3.z + corner4.z) / 4;

            // Bounding box intersection test
            let isNotOccupied = isNotRestricted(corner1.x, corner1.z) && isNotRestricted(corner2.x, corner2.z) &&
                isNotRestricted(corner3.x, corner3.z) && isNotRestricted(corner4.x, corner4.z);

            floorTiles[x_][z_] = new Tile(isNotOccupied, center_x, center_z);

        }

    }

}


function findTileIndex_fromLocation(x_, z_) {

    let i = Math.floor(x_) - (-44);
    let j = Math.floor(z_) - (-45);

    return {
        x: i,
        z: j
    };

}


/*** Our custom "Modified Depth-First-Search with Target Direction" Algorithm */
function findPath_towardsPlayer(monsterOfInterest) {

    let path = [];
    const tiles_isVisited = new Map();

    let startTileIndices = findTileIndex_fromLocation(monsterOfInterest.position.x, monsterOfInterest.position.z);

    let startTile = floorTiles[startTileIndices.x][startTileIndices.z];

    return recursiveFindPath(startTile, path, tiles_isVisited);

}


function recursiveFindPath(currentTile, path, tiles_isVisited) {

    path.push(currentTile);
    tiles_isVisited.set(currentTile, true);

    let i_and_j_indices = findTileIndex_fromLocation(currentTile.center_x, currentTile.center_z);
    let i = i_and_j_indices.x;
    let j = i_and_j_indices.z;


    /*** vectorTowardsTileOfPlayer*/
    let playerTileIndices = findTileIndex_fromLocation(playerAndGun.position.x, playerAndGun.position.z);
    let vector_i = playerTileIndices.x - i;
    let vector_j = playerTileIndices.z - j;


    /*** ALGORITHM REACHED THE TARGET (PLAYER). We found a Path.  */
    if (vector_i === 0 && vector_j === 0) {
        return path;
    }

    /*** choose the neighbour Tile that vectorTowardsTileOfPlayer points to. */

    /* Normalizing the vector ensures that tip of it will reside in a neighbour tile (start point of vector is currentTileCenter). */
    let lengthOfVector = Math.sqrt((vector_i * vector_i) + (vector_j * vector_j));
    let normalized_i = vector_i / lengthOfVector;
    let normalized_j = vector_j / lengthOfVector;

    /* In which Tile the tip of this vector resides */
    let preferredTileIndices = findTileIndex_fromLocation(currentTile.center_x + normalized_i, currentTile.center_z + normalized_j);
    let preferredTile = floorTiles[preferredTileIndices.x][preferredTileIndices.z];

    /*** If available, add to path */
    if (preferredTile.isNotOccupied) {

        let notVisited = tiles_isVisited.get(preferredTile) === undefined;
        if (notVisited) {

            recursiveFindPath(preferredTile, path, tiles_isVisited);
        }
    } else {
        /*** Otherwise, try other neighbors */

        /* Find all 8 neighbours in range of 2D Array */
        let neighbours = [];

        // We have to check if array indices are out of bounds
        if (i >= 0 && i < 87) {
            if (j - 1 >= 0 && j - 1 < 88)
                neighbours.push(floorTiles[i][j - 1]); // North
            if (j + 1 >= 0 && j + 1 < 88)
                neighbours.push(floorTiles[i][j + 1]); // South
        }
        if (i - 1 >= 0 && i - 1 < 87) {
            if (j >= 0 && j < 88)
                neighbours.push(floorTiles[i - 1][j]); // West
            if (j - 1 >= 0 && j - 1 < 88)
                neighbours.push(floorTiles[i - 1][j - 1]); // NorthWest
            if (j + 1 >= 0 && j + 1 < 88)
                neighbours.push(floorTiles[i - 1][j + 1]); // SouthWest
        }
        if (i + 1 >= 0 && i + 1 < 87) {
            if (j >= 0 && j < 88)
                neighbours.push(floorTiles[i + 1][j]); // East
            if (j - 1 >= 0 && j - 1 < 88)
                neighbours.push(floorTiles[i + 1][j - 1]); // NorthEast
            if (j + 1 >= 0 && j + 1 < 88)
                neighbours.push(floorTiles[i + 1][j + 1]); // SouthEast
        }

        let isThereAnyAvailableNeighbour = false;
        for (let neighbor of neighbours) {

            if (neighbor.isNotOccupied && (tiles_isVisited.get(neighbor) === undefined)) {

                isThereAnyAvailableNeighbour = true;

                recursiveFindPath(neighbor, path, tiles_isVisited);
            }
        }
        if (!isThereAnyAvailableNeighbour) {
            /*** STEP BACK */
            path.pop();

            // Almost impossible scenario: We stepped back the whole graph. No possible path. */
            if (path.length === 0) {
                return path;
            } else {
                let previousCurrentTile = path[path.length - 1];
                recursiveFindPath(previousCurrentTile, path, tiles_isVisited);
            }
        }

    }

    return path;

}



let spawnLocations = [
    // make sure x and z coordinates are like .5, since 0.5 is the center of a tile.
    {
        x: -22.5,
        z: -16.5
    },
    {
        x: 22.5,
        z: -32.5
    },
    {
        x: 40.5,
        z: 0.5
    },
    {
        x: 40.5,
        z: 40.5
    },
    {
        x: -40.5,
        z: 20.5
    },
    {
        x: -40.5,
        z: 40.5
    }
];



function monsterSpawn_periodically() {
    monsterSpawn_frameCounter += 1;

    if (monsterSpawn_frameCounter > monsterSpawn_period) {
        monsterSpawn();
        monsterSpawn_frameCounter = 0;

        /* Gets more frequent as the game continues */
        if (monsterSpawn_period > 40)
            monsterSpawn_period -= 5;
    }
}


function monsterSpawn() {

    // Spawn one monster every call, at one of the predetermined locations.

    // randomly choose one of the locations
    let spawnLocation = spawnLocations[Math.floor(Math.random() * spawnLocations.length)];

    let newMonster = garbageMonsterMesh.clone();
    newMonster.position.set(spawnLocation.x, 1, spawnLocation.z);
    monsters.push(newMonster);
    scene.add(newMonster);

    calculate_path_ofMonster(newMonster);

}


function calculate_path_ofMonster(monster) {

    let path = findPath_towardsPlayer(monster);

    let monsterPath = [];

    for (let t = 1; t < path.length; t++) {
        monsterPath.push({
            x: path[t].center_x,
            z: path[t].center_z
        });
    }

    monsters_andTheirPaths.set(monster, monsterPath);
    monsters_andTheirFrameCounters.set(monster, 0);

}



// Called each frame
function moveGarbageMonsters_towardsPlayer() {

    for (let monster of monsters) {

        /* Monster will stop moving if it has reached very close to Player.  */
        let dx = Math.pow((playerAndGun.position.x - monster.position.x), 2);
        let dz = Math.pow((playerAndGun.position.z - monster.position.z), 2);
        let distanceFromPlayer = Math.sqrt(dx + dz);
        if (distanceFromPlayer <= 3.7) {
            monsters_andTheirPaths.set(monster, []);
        }

        /* If its path is completed, Do Not move this monster anymore */
        if (monsters_andTheirPaths.get(monster).length < 2)
            continue;

        let currentFrameCount = monsters_andTheirFrameCounters.get(monster);
        // frame ++
        monsters_andTheirFrameCounters.set(monster, currentFrameCount + 1);

        if (currentFrameCount > 10) { // Let the time for a monster to walk a tile be 10 frames.
            monsters_andTheirFrameCounters.set(monster, 0);
            monsters_andTheirPaths.get(monster).shift(); // remove first tile from path, we already reached there.
        }

        /* If its path is completed, Do Not move this monster anymore */
        if (monsters_andTheirPaths.get(monster).length < 2)
            continue;

        /* Move monster from tile to tile */
        let currentTile_position_x = monsters_andTheirPaths.get(monster)[0].x;
        let currentTile_position_z = monsters_andTheirPaths.get(monster)[0].z;
        let nextTile_position_x = monsters_andTheirPaths.get(monster)[1].x;
        let nextTile_position_z = monsters_andTheirPaths.get(monster)[1].z;
        let linearInterpolationAmount = monsters_andTheirFrameCounters.get(monster) / 10; // time for a monster to walk a tile is 10 frames.
        // move the monster in the scene.
        monster.position.x = currentTile_position_x + (nextTile_position_x - currentTile_position_x) * linearInterpolationAmount;
        monster.position.z = currentTile_position_z + (nextTile_position_z - currentTile_position_z) * linearInterpolationAmount;


        /* Monster will stop moving if it has reached very close to Player.  */
        dx = Math.pow((playerAndGun.position.x - monster.position.x), 2);
        dz = Math.pow((playerAndGun.position.z - monster.position.z), 2);
        distanceFromPlayer = Math.sqrt(dx + dz);
        if (distanceFromPlayer <= 3.7) {
            monsters_andTheirPaths.set(monster, []);
        }

    }

}



function ifPlayer_movedOnto_anotherTile() {

    let playerCurrentTileIndices = findTileIndex_fromLocation(playerAndGun.position.x, playerAndGun.position.z);

    if ((playerCurrentTileIndices.x !== playerLatestTileIndices.i) || (playerCurrentTileIndices.z !== playerLatestTileIndices.j)) {

        // Player moved into the area of another Tile.
        playerLatestTileIndices = {
            i: playerCurrentTileIndices.x,
            j: playerCurrentTileIndices.z
        };

        /* Recalculate paths of all monsters */

        for (let monster of monsters) {
            calculate_path_ofMonster(monster);
        }

    }

}



// called each frame
function nearMonsters_reduceOurHealth() {

    for (let aMonster of monsters) {

        let dx = Math.pow((playerAndGun.position.x - aMonster.position.x), 2);
        let dz = Math.pow((playerAndGun.position.z - aMonster.position.z), 2);
        let distanceFromPlayer = Math.sqrt(dx + dz);

        if (distanceFromPlayer <= 6.0) {

            /* Monsters attack the Player, reduce health. */
            let health = document.getElementById("health");
            health.value -= 0.05;

            if (health.value <= 0.5) {
                // Game Over. Restart menu.
                document.exitPointerLock();
                document.getElementById('restart').style.visibility = 'visible';

            }
        }

    }
}




function vacuum_a_monster() {

    for (let aMonster of monsters) {

        let dx = Math.pow((playerAndGun.position.x - aMonster.position.x), 2);
        let dz = Math.pow((playerAndGun.position.z - aMonster.position.z), 2);
        let distanceFromPlayer = Math.sqrt(dx + dz);

        if (distanceFromPlayer <= 6.0) {

            vacuumedMonstersInTheGun += 1;
            destroyedCreature++;
            monstersBeingVacuumed.push(aMonster);
            if (destroyedCreature == 10) {
                document.getElementById("destroyedCreature").innerHTML = "Eliminated Monster " + destroyedCreature + "!!!\n" + "TEMA wants you.";
            } else if (destroyedCreature == 20) {
                document.getElementById("destroyedCreature").innerHTML = "Eliminated Monster " + destroyedCreature + "!!!\n" + "You really don't like garbage do you?";
            } else if (destroyedCreature == 30) {
                document.getElementById("destroyedCreature").innerHTML = "Eliminated Monster " + destroyedCreature + "!!!\n" + "Praise the garbage slayer!!!";
            } else if (destroyedCreature == 50) {
                document.getElementById("destroyedCreature").innerHTML = "Eliminated Monster " + destroyedCreature + "!!!\n" + "All Hail The King!";
            } else if (destroyedCreature == 100) {
                document.getElementById("destroyedCreature").innerHTML = "Eliminated Monster " + vacuumedMonstersInTheGun + "!!!\n" + "GOAT?";
            } else {
                document.getElementById("destroyedCreature").innerHTML = "Eliminated Monster " + destroyedCreature + "!!!";
            }
            monsters_beingVacuumed_frameCounters.set(aMonster, 0);
            monsters_vacuuming_startingLocation.set(aMonster, aMonster.position);

            monsters_andTheirPaths.delete(aMonster);
            monsters_andTheirFrameCounters.delete(aMonster);
            monsters.splice(monsters.indexOf(aMonster), 1);
            break; // Only vacuum one monster. To vacuum more monsters, press V again.
        }

    }

}



// called Each Frame
function monsters_vacuum_animation() {

    let monstersToBeDeleted = [];

    for (let aMonster of monstersBeingVacuumed) {

        let frameCounter = monsters_beingVacuumed_frameCounters.get(aMonster);
        // frame counter ++
        monsters_beingVacuumed_frameCounters.set(aMonster, frameCounter + 1);


        /* scaling : monster gets smaller since its parts are being vacuumed */
        if (frameCounter < 200) {
            if (aMonster.scale.x > 0.04 && aMonster.scale.y > 0.04 && aMonster.scale.z > 0.04) {
                aMonster.scale.x = 1 - (0.01 * frameCounter ** 1.5);
                aMonster.scale.y = 1 - (0.01 * frameCounter ** 1.5);
                aMonster.scale.z = 1 - (0.01 * frameCounter ** 1.5);
            }
        }

        /* position: monster gets sucked towards the vacuum gun */
        let vacuumingStartingPosition = monsters_vacuuming_startingLocation.get(aMonster);
        let linearInterpolationAmount = frameCounter / 240; // Vacuuming a monster takes 240 frames.
        aMonster.position.x = vacuumingStartingPosition.x + (playerAndGun.position.x - vacuumingStartingPosition.x) * linearInterpolationAmount;
        aMonster.position.z = vacuumingStartingPosition.z + (playerAndGun.position.z - vacuumingStartingPosition.z) * linearInterpolationAmount;
        aMonster.position.y = vacuumingStartingPosition.y + (0.3 - vacuumingStartingPosition.y) * linearInterpolationAmount;
        // eventually disappear
        if (frameCounter > 240) {
            scene.remove(aMonster);
            monstersToBeDeleted.push(aMonster);
            monsters_beingVacuumed_frameCounters.delete(aMonster);
        }
    }

    for (let aMonster of monstersToBeDeleted) {
        monstersBeingVacuumed.splice(monstersBeingVacuumed.indexOf(aMonster), 1);
    }

}
