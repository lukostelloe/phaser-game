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

let square; // Reference to the red square sprite

function create() {
  const graphics = this.add.graphics();

  graphics.fillStyle(0xff0000, 1); // Red color, alpha 1 (fully opaque)
  square = graphics.fillRect(300, 200, 50, 50); // Store the reference to the red square sprite
}

function update() {
  // Check for arrow key input and move the square accordingly
  const cursors = this.input.keyboard.createCursorKeys();

  if (cursors.left.isDown) {
    square.x -= 5;
  } else if (cursors.right.isDown) {
    square.x += 5;
  }

  if (cursors.up.isDown) {
    square.y -= 5;
  } else if (cursors.down.isDown) {
    square.y += 5;
  }
}
