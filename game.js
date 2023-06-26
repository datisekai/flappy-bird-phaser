var config = {
  width: 800,
  height: 600,
  type: Phaser.AUTO,
  scene: [GameScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 800 },
    },
  },
};

var game = new Phaser.Game(config);
