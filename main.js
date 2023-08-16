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
let hearts = [];
let zombie; // Reference to the zombie sprite
let zombies = [];
let killcount = 0;
const numZombies = 3;

let moveYellowSquare = false; // Flag to control continuous movement of the yellow square
let bulletDirection; // Store the initial bullet direction
let bulletMoving = false; // Flag to indicate if the bullet is moving

let lastCursorKey; // Track the last cursor key pressed

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
  hearts.push(this.add.rectangle(25, 25, 10, 10, 0xff0000));
  hearts.push(this.add.rectangle(40, 25, 10, 10, 0xff0000));
  hearts.push(this.add.rectangle(55, 25, 10, 10, 0xff0000));

  // Create multiple zombie sprites and add them to the zombies array
  for (let i = 0; i < numZombies; i++) {
    const randomEdge = Math.floor(Math.random() * 4);
    let zombieX, zombieY;

    if (randomEdge === 0) {
      zombieX = Math.random() * config.width;
      zombieY = 0;
    } else if (randomEdge === 1) {
      zombieX = config.width;
      zombieY = Math.random() * config.height;
    } else if (randomEdge === 2) {
      zombieX = Math.random() * config.width;
      zombieY = config.height;
    } else {
      zombieX = 0;
      zombieY = Math.random() * config.height;
    }

    const newZombie = this.add.rectangle(zombieX, zombieY, 20, 20, 0x00ff00);
    zombies.push(newZombie);
  }

  // Create a text object to display the killcount
  this.killcountText = this.add.text(25, 50, `killcount: ${killcount}`, {
    fontFamily: "Arial",
    fontSize: 20,
    color: "#ffffff",
  });
}

function update() {
  // Check for arrow key input and move the player and bullet within the canvas
  const cursors = this.input.keyboard.createCursorKeys();
  const jKey = this.input.keyboard.addKey("J");

  const collisionOffset = -15;

  // Move the player and bullet relatively before pressing "J"
  if (!moveYellowSquare) {
    if (
      cursors.left.isDown &&
      player.x - player.width / 2 - collisionOffset > 100
    ) {
      player.x -= 5;
      bullet.x -= 5;
      lastCursorKey = "left";
    } else if (
      cursors.right.isDown &&
      player.x + player.width / 2 + collisionOffset < config.width - 125
    ) {
      player.x += 5;
      bullet.x += 5;
      lastCursorKey = "right";
    }

    if (
      cursors.up.isDown &&
      player.y - player.height / 2 - collisionOffset > 100
    ) {
      player.y -= 5;
      bullet.y -= 5;
      lastCursorKey = "up";
    } else if (
      cursors.down.isDown &&
      player.y + player.height / 2 + collisionOffset < config.height - 125
    ) {
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
      bullet.x -= 18;
    } else if (bulletDirection === "right" && bullet.x < config.width - 85) {
      bullet.x += 18;
    } else if (bulletDirection === "up" && bullet.y > 80) {
      bullet.y -= 18;
    } else if (bulletDirection === "down" && bullet.y < config.height - 85) {
      bullet.y += 18;
    } else {
      // Move the bullet back to the player's position
      bullet.x = player.x;
      bullet.y = player.y;
      moveYellowSquare = false;
      bulletMoving = false;
    }
  }

  // Move each zombie towards the player
  zombies.forEach((zombie) => {
    let zombieDirectionX = player.x - zombie.x;
    let zombieDirectionY = player.y - zombie.y;

    // Normalize the direction vector
    const length = Math.sqrt(
      zombieDirectionX * zombieDirectionX + zombieDirectionY * zombieDirectionY
    );
    zombieDirectionX /= length;
    zombieDirectionY /= length;

    // Move the zombie towards the player
    const zombieSpeed = 1; // Adjust the speed as needed

    zombie.x += zombieDirectionX * zombieSpeed;
    zombie.y += zombieDirectionY * zombieSpeed;

    // Check for collision between bullet and zombie
    if (checkCollision(bullet, zombie)) {
      respawnZombie(zombie);
    }

    // Check for collision between player and zombie
    if (checkCollision(player, zombie)) {
      respawnZombie(zombie);
      handleZombiePlayerCollision(zombie);
    }
  });
}

// Move each zombie towards the player
zombies.forEach((zombie) => {
  let zombieDirectionX = player.x - zombie.x;
  let zombieDirectionY = player.y - zombie.y;

  // Normalize the direction vector
  const length = Math.sqrt(
    zombieDirectionX * zombieDirectionX + zombieDirectionY * zombieDirectionY
  );
  zombieDirectionX /= length;
  zombieDirectionY /= length;

  // Move the zombie towards the player
  const zombieSpeed = 1; // Adjust the speed as needed

  zombie.x += zombieDirectionX * zombieSpeed;
  zombie.y += zombieDirectionY * zombieSpeed;
  // Check for collision between bullet and zombie
  if (checkCollision(bullet, zombie)) {
    respawnZombie(zombie);
    killcount++;
    this.killcountText.setText(`killcount: ${killcount}`);
  }

  // Check for collision between player and zombie
  if (checkCollision(player, zombie)) {
    respawnZombie();
    handleZombiePlayerCollision();
  }
});

// When a collision between the zombie and player occurs
function handleZombiePlayerCollision() {
  // Remove the last heart from the array and hide it
  const removedHeart = hearts.pop();
  if (removedHeart) {
    removedHeart.visible = false;
  }
}

function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function respawnZombie(zombieToRespawn) {
  const zombieIndex = zombies.indexOf(zombieToRespawn);
  if (zombieIndex !== -1) {
    const randomEdge = Math.floor(Math.random() * 4);
    let zombieX, zombieY;

    if (randomEdge === 0) {
      zombieX = Math.random() * config.width;
      zombieY = 0;
    } else if (randomEdge === 1) {
      zombieX = config.width;
      zombieY = Math.random() * config.height;
    } else if (randomEdge === 2) {
      zombieX = Math.random() * config.width;
      zombieY = config.height;
    } else {
      zombieX = 0;
      zombieY = Math.random() * config.height;
    }

    zombies[zombieIndex].setPosition(zombieX, zombieY);
  }
}
