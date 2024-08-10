class Gun extends PIXI.Graphics {
    constructor(screenWidth, screenHeight, color) {
        super();
        this.beginFill(color);
        this.drawRect(0, -5, 50, 10);
        this.endFill();

        // Variables
        this.position = { x: screenWidth / 2, y: screenHeight - 10 };
        this.direction = { x: 0, y: 1 };
    }

    updateDirection(mousePosition) {
        // Get the direction from the mouse position
        this.direction = getPointingVector(this.position, mousePosition);

        // Make it point in that direction (and manually fix it to point in the correct quadrent)
        if (this.direction.x > 0) // Its pointing right
        {
            this.rotation = Math.atan(this.direction.y / this.direction.x);
        }
        else // Its pointing towards the left
        {
            this.rotation = Math.atan(this.direction.y / this.direction.x) + Math.PI;
        }
    }
}

class Bullet extends PIXI.Graphics {
    constructor(direction, position, color) {
        super();
        this.beginFill(color);
        this.drawCircle(0, 0, 6);
        this.endFill();

        // Variables
        this.position = position;
        this.x = this.position.x;
        this.y = this.position.y;
        this.direction = direction;
        this.speed = 350;
        this.alive = true;
    }

    move(dt = 1 / 60) {
        // Update X
        this.position.x += this.direction.x * this.speed * dt;
        this.x = this.position.x;

        // Update Y
        this.position.y += this.direction.y * this.speed * dt;
        this.y = this.position.y;
    }

    hit() {
        // Mark it for death
        this.alive = false;

        // Remove it from the scene
        gameScreen.removeChild(this);

        // Playing the sound and giving points is in Animal.hit() so that we can call this hit() to remove it when it goes off screen
    }
}

class Animal extends PIXI.Sprite {
    constructor(isACat, isAnEnemy, spriteNumber) {
        // Give it a different sprite depending on if its a cat or a dog
        if (isACat) // it gets a cat sprite
        {
            super(app.loader.resources[`media/cat${spriteNumber}.png`].texture);
        }
        else // it gets a dog sprite
        {
            super(app.loader.resources[`media/dog${spriteNumber}.png`].texture);
        }
        this.anchor.set(0.5, 0.5); // All transforms are now from the center of the sprite
        this.scale.set(0.02);

        // Get a random X location at the top of the screen to start at (and save it as the position)
        let x = getRandomInt(screenWidth);
        this.position = { x: x, y: 0 };
        this.x = this.position.x;
        this.y = this.position.y;

        // Get a random direction to start at (always down though)
        this.direction = getRandomUnitVector();
        // Make sure the direction is down
        this.direction.y = Math.abs(this.direction.y); // Positive Y is downward
        // Have a minimum y speed
        this.direction.y = Math.max(this.direction.y, 0.4);

        // Variables
        this.isAnEnemy = isAnEnemy; // false = its a friend
        this.speed = 30;
        this.scoreValue = 1;
        this.alive = true;
    }

    move(dt = 1 / 60) {
        // Update X
        this.position.x += this.direction.x * this.speed * dt;
        this.x = this.position.x;

        // Update Y
        this.position.y += this.direction.y * this.speed * dt;
        this.y = this.position.y;
    }

    hit() {
        // Check if its a cat or not
        if (this.isAnEnemy) // it is an enemy (good)
        {
            // Add the points
            increaseScoreBy(this.scoreValue);

            // Play the funny sound
            hitSound.play();

            // Remove it from the scene
            gameScreen.removeChild(this);

            // Mark it for death
            this.alive = false;
        }
        else // It is a friend (bad)
        {
            // You loose idiot
            end();
        }
    }

    reachBottom() {
        // Check if its a cat or not
        if (this.isAnEnemy) // it is an enemy (bad)
        {
            // You loose idiot
            end();
        }
        else // It is a friend (good)
        {
            // Add points
            increaseScoreBy(this.scoreValue);

            // Remove it from the scene
            gameScreen.removeChild(this);

            // Mark it for death
            this.alive = false;
        }
    }

    // Bounce it in the oposite direction when it hits the side of the screen
    bounce(screenSide) {
        // Set it back to the side of the screen
        this.position.x = screenSide;

        // Reverse the X direction
        this.direction.x = -this.direction.x;
    }
}