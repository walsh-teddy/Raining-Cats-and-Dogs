// http://paulbourke.net/miscellaneous/interpolation/

// we use this to interpolate the ship towards the mouse position
function lerp(start, end, amt) {
    return start * (1 - amt) + amt * end;
}

// we didn't use this one
function cosineInterpolate(y1, y2, amt) {
    let amt2 = (1 - Math.cos(amt * Math.PI)) / 2;
    return (y1 * (1 - amt2)) + (y2 * amt2);
}

// we use this to keep the ship on the screen
function clamp(val, min, max) {
    return val < min ? min : (val > max ? max : val);
}

// bounding box collision detection - it compares PIXI.Rectangles
function rectsIntersect(a, b) {
    var ab = a.getBounds();
    var bb = b.getBounds();
    return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
}

// these 2 helpers are used by classes.js
function getRandomUnitVector() {
    let x = getRandom(-1, 1);
    let y = getRandom(-1, 1);
    let length = Math.sqrt(x * x + y * y);
    if (length == 0) { // very unlikely
        x = 1; // point right
        y = 0;
        length = 1;
    } else {
        x /= length;
        y /= length;
    }

    return { x: x, y: y };
}

// Create a vector that is the difference of a target and a start
function getPointingVector(startingPosition, targetPosition) {
    // Calculate X and Y
    let x = targetPosition.x - startingPosition.x;
    let y = targetPosition.y - startingPosition.y;

    // Calculate Length
    let length = Math.sqrt(x * x + y * y);

    if (length == 0) // Only possible if the 2 things are perfectly overlapping
    {
        // Point it up
        x = 0;
        y = 1;
        length = 1;
    }

    // Normalize everything
    x /= length;
    y /= length;

    // Return the final vector
    return { x: x, y: y };
}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

// Returns an intiger between 1 and the max
// Gotten from https://www.w3schools.com/JS/js_random.asp
function getRandomInt(max) {
    return Math.floor(Math.random() * max) + 1;
}