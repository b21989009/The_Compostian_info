
let vacuumedMonstersInTheGun = 0;
let droppedGarbageMeshes = [];
let garbageDroppingToFacility_frameCounters = [];
let compost_readyToPickup_onTheGround = 0;
let compostRecycledCount = 0;
let compostsInProgress_FrameCounts = [];
let compostInInventory = 0;


// called by pressing G
function newTrashDropToTheCenter() {

    if (vacuumedMonstersInTheGun > 0) {
        vacuumedMonstersInTheGun--;

        /* Drop garbage */
        let droppedGarbage = garbageMesh.clone();
        droppedGarbage.position.set(0, 1.7, 1);
        scene.add(droppedGarbage);
        droppedGarbageMeshes.push(droppedGarbage);
        garbageDroppingToFacility_frameCounters.push(1);

        /* Composting procedure starts. */
        document.getElementById("destroyedCreature").innerHTML = "Composting has started. Wait a few seconds. \n" + vacuumedMonstersInTheGun + " garbages remaining in the gun.";
        compostsInProgress_FrameCounts.push(1);

    } else {
        document.getElementById("destroyedCreature").innerHTML = "You have no vacuumed garbage in the Gun to make Compost.";
    }

}



function facilitySwallows_garbageWeDropped_toTheDropArea() {

    for (let c = 0; c < garbageDroppingToFacility_frameCounters.length; c++) {

        if (garbageDroppingToFacility_frameCounters[c] === 0)
            continue;

        garbageDroppingToFacility_frameCounters[c] += 1;
        if (garbageDroppingToFacility_frameCounters[c] > 100) {
            garbageDroppingToFacility_frameCounters[c] = 0; // not deleting but making 0. since we are iterating over the array, this is safer.

            /*** REMOVE GARBAGE MESH FROM PICKUP AREA */

            scene.remove(droppedGarbageMeshes.pop());


        }

    }


}


// called each frame
function compostingProcedure() {

    for (let c = 0; c < compostsInProgress_FrameCounts.length; c++) {

        if (compostsInProgress_FrameCounts[c] === 0)
            continue;

        compostsInProgress_FrameCounts[c] += 1;
        if (compostsInProgress_FrameCounts[c] > 500) {
            compost_readyToPickup_onTheGround++;
            compostRecycledCount++;
            compostsInProgress_FrameCounts[c] = 0; // not deleting but making 0. since we are iterating over the array, this is safer.

            document.getElementById("destroyedCreature").innerHTML = "Compost is ready. Come pick it up!\nYou have processed " + compostRecycledCount + " composts so far.";
            let compost_readyToPickup = compostMesh.clone();
            compost_readyToPickup.position.set(-10, 0.5, 11);
            compostMeshesAtPickup.push(compost_readyToPickup);
            scene.add(compost_readyToPickup);
        }

    }

}



function pickUpCompostFromTheGround_atTheOutputDoorOfFacility() {

    if (compost_readyToPickup_onTheGround > 0) {
        compost_readyToPickup_onTheGround--;
        scene.remove(compostMeshesAtPickup.pop());

        compostInInventory++;
        document.getElementById("destroyedCreature").innerHTML = "New Compost is in inventory. Now you have " + compostInInventory + " Composts in inventory\nThere are still " + compost_readyToPickup_onTheGround + " composts ready to be picked up.";
    } else {
        document.getElementById("destroyedCreature").innerHTML = "There is no compost ready to pick up.";
    }

}





function dropCompost_nextTo_aTree() {

    if (compostInInventory < 1) {
        document.getElementById("destroyedCreature").innerHTML = "No compost in inventory to fertilize Trees. Collect some compost.";
        return;
    }

    for (let aTree of treesInsideTheTown) {

        let dx = Math.pow((playerAndGun.position.x - aTree.position.x), 2);
        let dz = Math.pow((playerAndGun.position.z - aTree.position.z), 2);
        let distanceToTree = Math.sqrt(dx + dz);
        if (distanceToTree <= 6.0) {

            if (trees_andTheirFrameCounters.get(aTree) !== undefined) {
                document.getElementById("destroyedCreature").innerHTML = "This tree is already fertilized.";
            } else { // drop a compost

                let droppedCompost = compostMesh.clone();
                let middleOf_player_and_tree_x = (aTree.position.x + playerAndGun.position.x) / 2;
                let middleOf_player_and_tree_z = (aTree.position.z + playerAndGun.position.z) / 2;
                droppedCompost.position.set(middleOf_player_and_tree_x, 0, middleOf_player_and_tree_z);
                composts_beingFed_toTrees.push(droppedCompost);
                scene.add(droppedCompost);
                compostInInventory--;
                document.getElementById("destroyedCreature").innerHTML = "You just fertilized a tree!";

                // starts treeGrowthAnimation
                treesCurrentlyGrowing.push(aTree);
                trees_andTheirFrameCounters.set(aTree, 0);
                trees_andTheCompostTheyAreEating.set(aTree, droppedCompost);

                break; // We only drop one compost to one tree.
            }
        }

    }
}



// called each frame
function treeGrowthAnimation() {

    let treesThatWillStopGrowing = [];

    for (let aTree of treesCurrentlyGrowing) {

        let frameCounter = trees_andTheirFrameCounters.get(aTree);
        // frame counter ++
        trees_andTheirFrameCounters.set(aTree, frameCounter + 1);

        /* scaling up the tree */
        let initialScale = trees_andTheirInitialScales.get(aTree);
        let scalingFactor = 1 + ((4 - 1) * frameCounter / 1000); // In 1000 frames, we go from scale 1 to scale 4
        aTree.scale.set(initialScale.x * scalingFactor, initialScale.y * scalingFactor, initialScale.z * scalingFactor);

        /* tree is eating the Compost (scaling down) */
        let aCompost = trees_andTheCompostTheyAreEating.get(aTree);
        let scaling = 1 + ((-1) * frameCounter / 1000);
        aCompost.scale.set(scaling, scaling, scaling);
        if (scaling < 0.05) {
            scene.remove(aCompost);
            composts_beingFed_toTrees.splice(composts_beingFed_toTrees.indexOf(aCompost), 1);
        }

        /* Tree growth restores our Health. */
        let health = document.getElementById("health");
        health.value += 0.06;


        if (frameCounter > 1000) {
            document.getElementById("destroyedCreature").innerHTML = "Wow, you filled the town with oxygen!";

            // No need to grow the tree anymore.
            treesThatWillStopGrowing.push(aTree);
        }

    }

    for (let aTree of treesThatWillStopGrowing) {
        treesCurrentlyGrowing.splice(treesCurrentlyGrowing.indexOf(aTree), 1);
    }

}
