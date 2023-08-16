import Phaser from "phaser";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

let player; // Reference to the blue player sprite
let bullet; // Reference to the bullet sprite

function create() {
  // Create a black background for the canvas
  this.add.rectangle(0, 0, config.width, config.height, 0x000000);

  // Draw the red border around the inside section
  const graphics = this.add.graphics();
  graphics.lineStyle(5, 0xff0000, 1); // Red color, line thickness 5
  graphics.strokeRect(75, 75, config.width - 150, config.height - 150);

  // Create the blue player sprite
  player = this.add.rectangle(400, 300, 25, 25, 0x0000ff); // Blue color
  bullet = this.add.rectangle(player.x, player.y, 10, 10, 0xffff00); // Yellow color
}

// ... (your previous code)

let moveYellowSquare = false; // Flag to control continuous movement of the yellow square
let bulletDirection; // Store the initial bullet direction
let bulletMoving = false; // Flag to indicate if the bullet is moving

let lastCursorKey; // Track the last cursor key pressed

function update() {
  // Check for arrow key input and move the player and bullet within the canvas
  const cursors = this.input.keyboard.createCursorKeys();
  const jKey = this.input.keyboard.addKey("J");

  // Move the player and bullet relatively before pressing "J"
  if (!moveYellowSquare) {
    if (cursors.left.isDown && player.x > 100) {
      player.x -= 5;
      bullet.x -= 5;
      lastCursorKey = "left";
    } else if (cursors.right.isDown && player.x < config.width - 125) {
      player.x += 5;
      bullet.x += 5;
      lastCursorKey = "right";
    }

    if (cursors.up.isDown && player.y > 100) {
      player.y -= 5;
      bullet.y -= 5;
      lastCursorKey = "up";
    } else if (cursors.down.isDown && player.y < config.height - 125) {
      player.y += 5;
      bullet.y += 5;
      lastCursorKey = "down";
    }
  }

  // Check if "J" key is pressed and start moving the bullet
  if (jKey.isDown && lastCursorKey && !moveYellowSquare && !bulletMoving) {
    moveYellowSquare = true;
    bulletDirection = lastCursorKey;
  }

  // Move the bullet independently after pressing "J"
  if (moveYellowSquare) {
    if (cursors.left.isDown && player.x > 100) {
      player.x -= 5;
    } else if (cursors.right.isDown && player.x < config.width - 125) {
      player.x += 5;
    }

    if (cursors.up.isDown && player.y > 100) {
      player.y -= 5;
    } else if (cursors.down.isDown && player.y < config.height - 125) {
      player.y += 5;
    }

    bulletMoving = true;

    if (bulletDirection === "left" && bullet.x > 80) {
      bullet.x -= 5;
    } else if (bulletDirection === "right" && bullet.x < config.width - 85) {
      bullet.x += 5;
    } else if (bulletDirection === "up" && bullet.y > 80) {
      bullet.y -= 5;
    } else if (bulletDirection === "down" && bullet.y < config.height - 85) {
      bullet.y += 5;
    } else {
      bulletMoving = false;
    }
  }
}
