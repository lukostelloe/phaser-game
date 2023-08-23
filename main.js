import Phaser from "phaser";

const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 800,
  scene: {
    create: create,
    update: update,
    preload: preload,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);

let scene;
let player;
let bullet;
let hearts = [];
let zombies = [];
let superZombies = [];
let superZombieHits = 0;
let killcountText;
let killcount = 0;
let numZombies = 3;
let numSuperZombies = 1;
let heartPickup;
let moveYellowSquare = false; // Flag to control continuous movement of the yellow square
let bulletDirection; // Store the initial bullet direction
let bulletMoving = false; // Flag to indicate if the bullet is moving
let lastCursorKey; // Track the last cursor key pressed

const numColumns = 4; // Number of columns in your sprite sheet
const numRows = 3; // Number of rows in your sprite sheet
const numFrames = numColumns * numRows;

function preload() {
  this.load.spritesheet("zombieSheet", "images/zombie_sheet.png", {
    frameWidth: 20, // Width of each frame in pixels
    frameHeight: 60, // Height of each frame in pixels
  });
  console.log("preload called");
}

// Function to toggle the color of the circle between black and orange
function toggleCircleColor(circle) {
  if (circle.fillColor === 0xffa500) {
    circle.fillColor = 0x000000; // Set to black
  } else {
    circle.fillColor = 0xffa500; // Set to orange
  }
}

function create() {
  scene = this;
  // Create a black background for the canvas
  this.add.rectangle(0, 0, config.width, config.height, 0x000000);

  // Draw the red border around the inside section
  const graphics = this.add.graphics();
  graphics.lineStyle(5, 0xff0000, 1); // Red color, line thickness 5
  graphics.strokeRect(75, 75, config.width - 150, config.height - 150);

  // Create the blue player sprite
  player = this.add.rectangle(400, 300, 25, 25, 0x0000ff); // Blue color
  bullet = this.add.rectangle(player.x, player.y, 10, 10, 0xffff00); // Yellow color

  //add hearts to the display and array
  const heart1 = this.add.rectangle(25, 25, 10, 10, 0xff0000);
  const heart2 = this.add.rectangle(40, 25, 10, 10, 0xff0000);
  const heart3 = this.add.rectangle(55, 25, 10, 10, 0xff0000);
  const heart4 = this.add.rectangle(70, 25, 10, 10, 0xff0000);
  const heart5 = this.add.rectangle(85, 25, 10, 10, 0xff0000);

  hearts.push(heart1);
  hearts.push(heart2);
  hearts.push(heart3);
  hearts.push(heart4);
  hearts.push(heart5);

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

    const randomFrameIndex = Math.floor(Math.random() * numFrames); // Choose a random frame index
    const newZombie = scene.add.sprite(
      zombieX,
      zombieY,
      "zombieSheet",
      randomFrameIndex
    );
    newZombie.setScale(2); // Adjust the scale as needed
    zombies.push(newZombie);
  }

  // Create mulitple superZombie sprites and add them to the zombies array
  for (let i = 0; i < numSuperZombies; i++) {
    const randomEdge = Math.floor(Math.random() * 4);
    let superZombieX, superZombieY;

    if (randomEdge === 0) {
      superZombieX = Math.random() * config.width;
      superZombieY = 0;
    } else if (randomEdge === 1) {
      superZombieX = config.width;
      superZombieY = Math.random() * config.height;
    } else if (randomEdge === 2) {
      superZombieX = Math.random() * config.width;
      superZombieY = config.height;
    } else {
      superZombieX = 0;
      superZombieY = Math.random() * config.height;
    }

    const newSuperZombie = this.add.rectangle(
      superZombieX,
      superZombieY,
      40,
      40,
      0xffa500
    );
    superZombies.push(newSuperZombie);
  }

  // Create a text object to display the killcount
  killcountText = this.add.text(25, 50, `killcount: ${killcount}`, {
    fontFamily: "Arial",
    fontSize: 20,
    color: "#ffffff",
  });

  // Delay for 5 seconds (5000 milliseconds)
  const delayDuration = 3000;
  this.time.delayedCall(delayDuration, () => {
    const minX = 100;
    const maxX = config.width - 150;
    const minY = 100;
    const maxY = config.height - 150;

    const randomX = Phaser.Math.Between(minX, maxX);
    const randomY = Phaser.Math.Between(minY, maxY);
    // Create the heart pickup and red square as a group
    heartPickup = this.add.group();

    // Create the initial orange circle in the middle of the canvas
    const orangeCircle = this.add.circle(
      randomX,
      randomY,
      15, // Radius of the circle
      0xffa500 // Fill color in hexadecimal
    );

    // Set up the circle to flash between black and orange
    const flashInterval = 200; // 200 milliseconds between each color change
    this.time.addEvent({
      delay: flashInterval,
      loop: true,
      callback: () => {
        toggleCircleColor(orangeCircle);
      },
    });

    // Create a red square in the middle of the orange circle
    const redSquare = this.add.rectangle(
      orangeCircle.x,
      orangeCircle.y,
      10, // Width of the square
      10, // Height of the square
      0xff0000 // Red color
    );

    // Add both the circle and square as children of the heartPickup group
    heartPickup.add(orangeCircle);
    heartPickup.add(redSquare);
  });
}

function update() {
  // Check for arrow key input and move the player and bullet within the canvas
  const cursors = this.input.keyboard.createCursorKeys();
  const jKey = this.input.keyboard.addKey("J");

  const collisionOffset = -15;

  scene.cameras.main.scrollX = player.x - scene.cameras.main.width / 2;
  scene.cameras.main.scrollY = player.y - scene.cameras.main.height / 2;

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
    const zombieSpeed = 0.8; // Adjust the speed as needed

    if (!zombie.isFrozen) {
      zombie.x += zombieDirectionX * zombieSpeed;
      zombie.y += zombieDirectionY * zombieSpeed;
    }

    // Check for collision between bullet and zombie
    if (checkCollision(bullet, zombie)) {
      // Stop zombie movement temporarily
      zombie.isFrozen = true;

      // Delay for a brief moment (in milliseconds)
      const delayDuration = 800; // 1 second delay
      this.time.delayedCall(delayDuration, () => {
        // After the delay, respawn the zombie and resume movement
        respawnZombie(zombie);
        zombie.isFrozen = false;
      });

      // Increment the killcount and update the text
      killcount++;
      killcountText.setText(`killcount: ${killcount}`);
      checkZombieKillCount();
    }

    // Check for collision between player and zombie
    if (checkCollision(player, zombie)) {
      respawnZombie(zombie);
      handleZombiePlayerCollision(zombie);
    }
  });

  // Move each superZombie towards the player
  superZombies.forEach((superZombie) => {
    let superZombieDirectionX = player.x - superZombie.x;
    let superZombieDirectionY = player.y - superZombie.y;

    // Normalize the direction vector
    const length = Math.sqrt(
      superZombieDirectionX * superZombieDirectionX +
        superZombieDirectionY * superZombieDirectionY
    );
    superZombieDirectionX /= length;
    superZombieDirectionY /= length;

    // Move the zombie towards the player
    const superZombieSpeed = 0.5; // Adjust the speed as needed

    if (!superZombie.isFrozen) {
      superZombie.x += superZombieDirectionX * superZombieSpeed;
      superZombie.y += superZombieDirectionY * superZombieSpeed;
    }

    // Check for collision between bullet and super zombie
    if (checkCollision(bullet, superZombie)) {
      // Stop zombie movement temporarily
      superZombie.isFrozen = true;
      superZombie.setFillStyle(0xff0000);

      // Delay for a brief moment (in milliseconds)
      const delayDuration = 800; // 1 second delay
      this.time.delayedCall(delayDuration, () => {
        // respawnSuperZombie(superZombie);
        superZombieHits++;
        if (superZombieHits > 9) {
          superZombie.destroy();
          superZombieHits = 0;
        }

        superZombie.isFrozen = false;
        superZombie.setFillStyle(0xffa500);
      });

      // Increment the killcount and update the text
      killcount++;
      killcountText.setText(`killcount: ${killcount}`);
    }

    // Check for collision between player and zombie
    if (checkCollision(player, superZombie)) {
      respawnSuperZombie(superZombie);
      handleZombiePlayerCollision(superZombie);
    }
  });

  // Check for collision between player and heart pickup
  if (heartPickup && heartPickup.getChildren().length > 0) {
    if (checkGroupCollision(player, heartPickup)) {
      if (hearts.length < 5) {
        // Add a new heart to the list of hearts
        const newHeart = this.add.rectangle(
          25 + hearts.length * 15,
          25,
          10,
          10,
          0xff0000
        );
        hearts.push(newHeart);

        // Remove the heart pickup group
        heartPickup.destroy(true);
        heartPickup = null;

        // Respawn the heart pickup after 5 seconds
        const respawnDelay = 5000; // 5 seconds in milliseconds
        this.time.delayedCall(respawnDelay, respawnHeartPickup, [], this);
      }
    }
  }
}

// When a collision between the zombie and player occurs
function handleZombiePlayerCollision() {
  // Remove the last heart from the array and hide it
  const removedHeart = hearts.pop();
  if (removedHeart) {
    removedHeart.visible = false;
  }
}

function checkGroupCollision(rectangle, group) {
  let collisionDetected = false;

  group.getChildren().forEach((child) => {
    if (checkCollision(rectangle, child)) {
      collisionDetected = true;
    }
  });

  return collisionDetected;
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

function respawnSuperZombie(superZombieToRespawn) {
  const superZombieIndex = superZombies.indexOf(superZombieToRespawn);
  if (superZombieIndex !== -1) {
    const randomEdge = Math.floor(Math.random() * 4);
    let superZombieX, superZombieY;

    if (randomEdge === 0) {
      superZombieX = Math.random() * config.width;
      superZombieY = 0;
    } else if (randomEdge === 1) {
      superZombieX = config.width;
      superZombieY = Math.random() * config.height;
    } else if (randomEdge === 2) {
      superZombieX = Math.random() * config.width;
      superZombieY = config.height;
    } else {
      superZombieX = 0;
      superZombieY = Math.random() * config.height;
    }

    superZombies[superZombieIndex].setPosition(superZombieX, superZombieY);
  }
}

function respawnHeartPickup() {
  const minX = 100;
  const maxX = config.width - 150;
  const minY = 100;
  const maxY = config.height - 150;

  const randomX = Phaser.Math.Between(minX, maxX);
  const randomY = Phaser.Math.Between(minY, maxY);
  // Create the heart pickup and red square as a group
  heartPickup = this.add.group();

  // Create the initial orange circle in the middle of the canvas
  const orangeCircle = this.add.circle(
    randomX,
    randomY,
    15, // Radius of the circle
    0xffa500 // Fill color in hexadecimal
  );

  // Set up the circle to flash between black and orange
  const flashInterval = 200; // 200 milliseconds between each color change
  this.time.addEvent({
    delay: flashInterval,
    loop: true,
    callback: () => {
      toggleCircleColor(orangeCircle);
    },
  });

  // Create a red square in the middle of the orange circle
  const redSquare = this.add.rectangle(
    orangeCircle.x,
    orangeCircle.y,
    10, // Width of the square
    10, // Height of the square
    0xff0000 // Red color
  );

  // Add both the circle and square as children of the heartPickup group
  heartPickup.add(orangeCircle);
  heartPickup.add(redSquare);
}

function checkZombieKillCount() {
  if (killcount % 10 === 0) {
    numZombies++;

    // Create the additional zombies based on the updated numZombies value
    const numNewZombies = numZombies - zombies.length;
    if (numNewZombies > 0) {
      for (let i = 0; i < numNewZombies; i++) {
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

        const newZombie = scene.add.image(zombieX, zombieY, "zombie");
        zombies.push(newZombie);
      }
    }
  }
}
