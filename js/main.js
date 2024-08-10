// MAIN FRAMEWORK USED FROM THE CIRCLE BLAST EXERCISE

"use strict";
const app = new PIXI.Application({
    width: 600,
    height: 600
});
document.body.appendChild(app.view);

// constants
const friendRate = 20; // Out of 100
const numOfSprites = 8;
const fontFamily = 'Zen Kurenaido';
const spawnNewAnimalsTimming = 120;
const highScoreKey = "tjw6911-project3-highScore"

// pre-load the images
app.loader.
    add([
        "media/dog1.png",
        "media/dog2.png",
        "media/dog3.png",
        "media/dog4.png",
        "media/dog5.png",
        "media/dog6.png",
        "media/dog7.png",
        "media/dog8.png",
        "media/cat1.png",
        "media/cat2.png",
        "media/cat3.png",
        "media/cat4.png",
        "media/cat5.png",
        "media/cat6.png",
        "media/cat7.png",
        "media/cat8.png",
        "media/crosshair.png"
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// Variables
let stage;
let startScreen, evilButtonStart, highScoreLabelStart;
let gameScreen, gun, scoreLabelGame, highScoreLabelGame, shootSound, hitSound, failSound, newWaveSound;
let endScreen, scoreLabelEnd, highScoreLabelEnd, evilButtonEnd;
let animals = [];
let bullets = [];
let score = 0;
let highScore = 0;
let difficulty = 1;
let paused = true;
let spawnNewAnimalsTimer = 0;
let catsAreEvil = true;
let newHighScore = false;

// Colors
let backgroundColor = 0xA5C9F9;
let textColor = 0x372104;
let bulletColor = 0xE02B07;
let complimentaryColor = 0xE8A246;

// Screen size info
const screenWidth = app.view.width;
const screenHeight = app.view.height;

// Load in the info from local storage if there is any
function loadInfo() {
    console.log("Testing for local storage");
    // Test if there is any info saved
    if (localStorage.getItem(highScoreKey)) // There is a highscore saved
    {
        console.log("Found something. Recording data");
        // Save the highscore
        highScore = localStorage.getItem(highScoreKey);
    }
}

function setup() {    
    // Before anything, load in the data from the previous sessions
    loadInfo();

    // Create the stage
    stage = app.stage;

    // Change backround color to nice blue
    app.renderer.backgroundColor = backgroundColor;

    // Create the start screen
    startScreen = new PIXI.Container();
    stage.addChild(startScreen);

    // Create the main game screen and make it invisible
    gameScreen = new PIXI.Container();
    gameScreen.visible = false;
    stage.addChild(gameScreen);

    // Create the end screen and make it invisible
    endScreen = new PIXI.Container();
    endScreen.visible = false;
    stage.addChild(endScreen);

    // Create labels for all 3 scenes
    CreateLabelsAndButtons();

    // Create the gun
    gun = new Gun(screenWidth, screenHeight, complimentaryColor);
    gameScreen.addChild(gun);

    // Load Sounds
    shootSound = new Howl({
        src: ['media/shoot.wav']
    });

    hitSound = new Howl({
        src: ['media/hit.wav']
    });

    failSound = new Howl({
        src: [`media/fail.wav`]
    });

    newWaveSound = new Howl({
        src: [`media/newWave.wav`]
    });

    // Start update loop
    app.ticker.add(gameLoop);
}

function CreateLabelsAndButtons() {

    // START SCREEN:

    let buttonStyle = new PIXI.TextStyle({
        fill: complimentaryColor,
        fontSize: 64,
        fontFamily: fontFamily,
        stroke: textColor,
        strokeThickness: 3
    });

    // Set up start scene
    let startLabel1 = new PIXI.Text("Raining Cats\n and Dogs!");
    startLabel1.style = new PIXI.TextStyle({
        fill: textColor,
        fontSize: 80,
        fontFamily: fontFamily,
        stroke: complimentaryColor,
        strokeThickness: 3
    });
    startLabel1.x = 80;
    startLabel1.y = 40;
    startScreen.addChild(startLabel1);

    // Make evil button in the start
    evilButtonStart = new PIXI.Text("Shoot down the cats but\ndon't hit a dog! (Click me)");
    evilButtonStart.style = new PIXI.TextStyle({
        fill: textColor,
        fontSize: 32,
        fontFamily: fontFamily,
        fontStyle: "italic",
    })
    evilButtonStart.x = 120;
    evilButtonStart.y = 250;
    evilButtonStart.interactive = true;
    evilButtonStart.buttonMode = true;
    evilButtonStart.on("pointerup", changeEnemy);
    evilButtonStart.on('pointerover', e => e.target.alpha = 0.7);
    evilButtonStart.on('pointerout', e => e.currentTarget.alpha = 1.0);
    startScreen.addChild(evilButtonStart);

    // Make the text style for the score texts at the begining and end of the game
    let scoreDisplayStyle = new PIXI.TextStyle({
        fill: textColor,
        fontSize: 40,
        fontFamily: fontFamily,
    })

    // Make the highscore displayer for the start screen
    highScoreLabelStart = new PIXI.Text(`High Score: ${highScore}`);
    highScoreLabelStart.style = scoreDisplayStyle;
    highScoreLabelStart.x = 150;
    highScoreLabelStart.y = 350;
    startScreen.addChild(highScoreLabelStart);

    // Make the start game button
    let startButton = new PIXI.Text("Play");
    startButton.style = buttonStyle;
    startButton.x = 230;
    startButton.y = 450;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on('pointerover', e => e.target.alpha = 0.7);
    startButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    startScreen.addChild(startButton);

    // GAME SCREEN:

    let textStyle = new PIXI.TextStyle({
        fill: textColor,
        fontSize: 25,
        fontFamily: fontFamily,
        fontStyle: "bold"
    });

    // Make the score labels

    // Score
    scoreLabelGame = new PIXI.Text();
    scoreLabelGame.style = textStyle;
    scoreLabelGame.x = 5;
    scoreLabelGame.y = 5;
    gameScreen.addChild(scoreLabelGame);

    // Highscore
    highScoreLabelGame = new PIXI.Text();
    highScoreLabelGame.style = textStyle;
    highScoreLabelGame.x = 5;
    highScoreLabelGame.y = 35;
    gameScreen.addChild(highScoreLabelGame);

    // END SCREEN:

    // Create the game over screen
    let gameOverText = new PIXI.Text("Game Over! :(");
    gameOverText.style = new PIXI.TextStyle(
        {
            fill: textColor,
            fontSize: 64,
            fontFamily: fontFamily,
            stroke: complimentaryColor,
            strokeThickness: 6
        });
    gameOverText.x = 100;
    gameOverText.y = 100;
    endScreen.addChild(gameOverText);

    // Create the game over score text
    scoreLabelEnd = new PIXI.Text(`Score: ${score}`);
    scoreLabelEnd.style = scoreDisplayStyle;
    scoreLabelEnd.x = 150;
    scoreLabelEnd.y = 250;
    endScreen.addChild(scoreLabelEnd);

    // Create the game over highscore text
    highScoreLabelEnd = new PIXI.Text(`High Score: ${highScore}`);
    highScoreLabelEnd.style = scoreDisplayStyle;
    highScoreLabelEnd.x = 150;
    highScoreLabelEnd.y = 300;
    endScreen.addChild(highScoreLabelEnd);

    // Make the end evil button
    evilButtonEnd = new PIXI.Text("Cats are evil! (Click me)");
    evilButtonEnd.style = new PIXI.TextStyle({
        fill: textColor,
        fontSize: 32,
        fontFamily: fontFamily,
        fontStyle: "italic",
    })
    evilButtonEnd.x = 130;
    evilButtonEnd.y = 400;
    evilButtonEnd.interactive = true;
    evilButtonEnd.buttonMode = true;
    evilButtonEnd.on("pointerup", changeEnemy);
    evilButtonEnd.on('pointerover', e => e.target.alpha = 0.7);
    evilButtonEnd.on('pointerout', e => e.currentTarget.alpha = 1.0);
    endScreen.addChild(evilButtonEnd);

    increaseScoreBy(0);

    // make "play again?" button
    let playAgainButton = new PIXI.Text("Play again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = screenHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame); // startGame is a function reference
    playAgainButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
    endScreen.addChild(playAgainButton);

    // Start listening for click events on the canvas
    app.view.onclick = shoot;
}

function startGame() {
    startScreen.visible = false;
    endScreen.visible = false;
    gameScreen.visible = true;
    newHighScore = false;
    score = 0;
    increaseScoreBy(0);
    difficulty = 1;
    paused = false;
    spawnAnimal();

    console.log("=+=+=+=+=+=+=+= - GAME START - =+=+=+=+=+=+=+=")
}

function increaseScoreBy(value) {
    // Increase the score
    score += value;

    // Update the highscore if its new
    if (score > highScore) // It is the new highScore
    {
        highScore = score;
        highScoreLabelGame.text = `High Score: This! :O`;
        highScoreLabelEnd.text = `High Score: This! :O`;
        newHighScore = true;
    }
    else // Its not a new highscore
    {
        highScoreLabelGame.text = `High Score: ${highScore}`;
        highScoreLabelEnd.text = `High Score: ${highScore}`;
    }

    // Update the text
    highScoreLabelStart.text = `High Score: ${highScore}`;
    scoreLabelGame.text = `Score: ${score}`;
    scoreLabelEnd.text = `Score: ${score}`;
}

function gameLoop() {
    // Don't run the game if its paused
    if (paused) {
        // Bail out of the function
        return;
    }

    // Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;

    // Record the mouse position (to aim the gun)
    let mousePosition = app.renderer.plugins.interaction.mouse.global;

    // Point the gun at the mouse
    gun.updateDirection(mousePosition);

    // Test for a new wave if nescesary
    newWave();

    // Move the bullets
    for (let bullet of bullets) {
        bullet.move(dt);
    }

    // Move animals
    for (let animal of animals) {
        animal.move();
    }

    // Check collisions
    //Loop through all bullets
    for (let bullet of bullets) {
        // Check if any cat was hit by this bullet
        for (let animal of animals) {
            if (rectsIntersect(bullet, animal)) { // They collided
                // Call both of their hit() functions
                animal.hit();
                bullet.hit();
            }
        }
    }

    // Check if something is out of bounds
    // Check if each bullet is offscreen
    for (let bullet of bullets) {
        // Check if its off screen
        if (bullet.position.x > screenWidth || // Right
            bullet.position.x < 0 || // Left
            bullet.position.y > screenHeight || // Bottom (y=0 is at the top)
            bullet.position.y < 0 // Top
        ) // It is offscreen
        {
            bullet.hit();
        }
    }

    // Check if each animal is offscreen
    for (let animal of animals) {
        // Bounce it when it reaches the side
        if (animal.position.x > screenWidth) // Off the right side
        {
            // Bounce it off the right side of the screen
            animal.bounce(screenWidth);
        }
        else if (animal.position.x < 0) // Off the left side
        {
            // Bounce it off the left side of the screen
            animal.bounce(0);
        }

        // Mark it as reaching the bottom
        if (animal.position.y > screenHeight) // It reached the bottom
        {
            animal.reachBottom();
        }
    }

    // Clear the dead things from the lists

    // Get rid of dead bullets
    bullets = bullets.filter(bullet => bullet.alive);

    // Get rid of dead animals
    animals = animals.filter(animal => animal.alive);
}

function end() {
    console.log("=+=+=+=+=+=+=+= - GAME END - =+=+=+=+=+=+=+=");

    failSound.play();

    // Save the highscore if its a new one
    if (newHighScore) {
        localStorage.setItem(highScoreKey, highScore);
    }

    // Pause the game
    paused = true;

    // clear out level
    animals.forEach(animal => gameScreen.removeChild(animal));
    animals = [];
    bullets.forEach(bullet => gameScreen.removeChild(bullet));
    bullets = [];

    startScreen.visible = false;
    gameScreen.visible = false;
    endScreen.visible = true;
}

function shoot() {
    // Don't do anything if the game is paused
    if (paused) {
        // bail out
        return;
    }

    // Calculate where the bullet will spawn (at the end of the gun's barrel, not from its center)
    let x = gun.position.x + gun.direction.x * 50;
    let y = gun.position.y + gun.direction.y * 50;

    // Create the bullet
    let bullet = new Bullet(gun.direction, { x: x, y: y }, bulletColor);

    // Add it to the list of bullets and the game scene
    bullets.push(bullet);
    gameScreen.addChild(bullet);

    // Play the shoot sound
    shootSound.play();
}

function spawnAnimal() {
    // Do nothing if the game is paused
    if (paused) {
        return;
    }

    // Determine if its a friend or an enemy
    let isAnEnemy = (getRandomInt(101) > friendRate);

    let isACat;

    // Determine if its a cat or a dog
    if (catsAreEvil) // cats are evil being a cat and being evil should have the same boolian value (either both true or both false)
    {
        isACat = isAnEnemy;
    }
    else // Dogs are evil and they should have different boolian values
    {
        isACat = !isAnEnemy;
    }

    // Choose its random sprite
    let spriteNumber = getRandomInt(numOfSprites);

    // Create the animal
    let animal = new Animal(isACat, isAnEnemy, spriteNumber);

    // Add it to the list of animals and the game scene
    animals.push(animal);
    gameScreen.addChild(animal);
}

function changeEnemy() {
    // Switch the truth
    catsAreEvil = !catsAreEvil;

    // Update text
    if (catsAreEvil) // Cats are evil
    {
        evilButtonStart.text = "Shoot down the cats but\ndon't hit a dog! (Click me)";
        evilButtonEnd.text = "Cats are evil! (Click me)";
    }
    else // Dogs are evil
    {
        evilButtonStart.text = `Shoot down the dogs but\ndon't hit a cat! (Click me)`;
        evilButtonEnd.text = "Dogs are evil! (Click me)";
    }
}

// Checks if a new wave is nescesary, manages the timer, and spawns it when its needed
function newWave() {
    // Start the timer if there are no animals left (and its not already started)
    if (animals.length == 0 && spawnNewAnimalsTimer == 0) // It does need to start a new round
    {
        // Itterate the difficulty up one
        difficulty += 1;

        // Start the timer
        spawnNewAnimalsTimer = spawnNewAnimalsTimming + 1; // 1 extra because it ends at 1, not 0 as it counts down

    }

    // Tick the timer if its started
    if (spawnNewAnimalsTimer > 0) {
        spawnNewAnimalsTimer -= 1;
    }

    // Spawn a new wave if it should
    if (spawnNewAnimalsTimer == 1) {
        // Play the funny sound
        newWaveSound.play();

        // Reset the timer
        spawnNewAnimalsTimer = 0;

        // Spawn an animal per level of difficulty
        for (let i = 0; i < difficulty; i++) {
            spawnAnimal();
        }
    }
}