const BIRD_KEY = "red_bird";
const SKY_KEY = "sky";
const PIPE_KEY = "pipe";
const GAME_OVER_KEY = "game_over";
const MESSAGE_KEY = "message";
const COUNTDOWN_KEY = "countdown";

const speed = 3;

class GameScene extends Phaser.Scene {
  constructor() {
    super("game-scene");
  }

  preload() {
    this.load.image(SKY_KEY, "assets/background-day.png");
    this.load.spritesheet(BIRD_KEY, "assets/redbird.png", {
      frameWidth: 34,
      frameHeight: 24,
    });

    this.load.image(PIPE_KEY, "assets/pipe-green.png");

    this.load.image(GAME_OVER_KEY, "assets/gameover.png");

    this.load.image(MESSAGE_KEY, "assets/message.png");

    this.load.spritesheet(COUNTDOWN_KEY, "assets/countdown.png", {
      frameWidth: 36,
      frameHeight: 24,
    });
  }

  create() {
    this.pipePassed = 0;
    this.isLost = true;
    this.startGame = this.startGame.bind(this);
    this.background = this.add.tileSprite(
      0,
      0,
      config.width,
      config.height,
      SKY_KEY
    );
    this.background.setOrigin(0, 0);
    this.scoreLabel = this.createScoreLabel(16, 16, 0);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.bird = this.createBird();

    this.pipes = this.physics.add.group();

    this.createPipe();
    this.createPipe();
    this.createPipe();
    this.createPipe();

    this.physics.add.overlap(
      this.bird,
      this.pipes,
      this.collisionPipe,
      null,
      this
    );

    this.anims.create({
      key: "countdown_animation",
      frames: this.anims.generateFrameNumbers(COUNTDOWN_KEY),
      frameRate: 1,
      repeat: 0,
      hideOnComplete: true,
    });

    this.message = this.add.sprite(
      config.width / 2,
      config.height / 2,
      MESSAGE_KEY
    );
    this.message.setInteractive();

    this.input.on("gameobjectdown", this.startGame);
  }

  startGame(pointer, gameObject) {
    gameObject.setTexture(COUNTDOWN_KEY);
    gameObject.play("countdown_animation");
    gameObject.angle = 90;

    gameObject.on("animationcomplete", (animation) => {
      if (animation.key === "countdown_animation") {
        this.isLost = false;
        this.physics.resume();
      }
    });
  }

  collisionPipe() {
    this.isLost = true;
    this.displayGameOver();
  }

  displayGameOver() {
    this.add.image(
      config.width / 2,
      config.height / 2,
      GAME_OVER_KEY
    ).depth = 2;
  }

  createPipe() {
    const lastPipe =
      this.pipes.getChildren()[this.pipes.getChildren().length - 1];
    const randomX = Phaser.Math.Between(150, 250);
    const pipeX = lastPipe ? lastPipe.x + randomX : 600;
    const randomPipeTopY = Phaser.Math.Between(500, 600);
    const pipeTop = this.physics.add.sprite(pipeX, randomPipeTopY, PIPE_KEY);

    this.pipes.add(pipeTop);
    pipeTop.key = "top";
    pipeTop.body.allowGravity = false;

    const randomPipeDownY = Phaser.Math.Between(0, 100);
    const pipeDown = this.physics.add.sprite(pipeX, randomPipeDownY, PIPE_KEY);
    this.pipes.add(pipeDown);
    pipeDown.body.allowGravity = false;
    pipeDown.angle = 180;
  }

  createBird() {
    const bird = this.physics.add.sprite(
      config.width / 2,
      config.height / 2,
      BIRD_KEY
    );

    this.anims.create({
      key: "move",
      frames: this.anims.generateFrameNumbers(BIRD_KEY),
      frameRate: 5,
      repeat: -1,
    });

    bird.setBounce(0.2);
    bird.setCollideWorldBounds(true);

    bird.play("move");

    return bird;
  }

  update() {
    if (this.isLost) {
      this.physics.pause();
      this.bird.setFrame(1);
      return;
    }

    if (this.cursors.space.isDown) {
      this.bird.setVelocityY(-200);
    }

    this.pipes.getChildren().forEach((pipe, index) => {
      if (this.bird.x > pipe.x && !pipe.scored && pipe.key === "top") {
        pipe.scored = true;
        this.scoreLabel.add(1);
      }

      if (pipe.x < -pipe.width ) {
      }
      pipe.x -= speed;
    });

    if (
      config.width -
        this.pipes.getChildren()[this.pipes.getChildren().length - 1].x >
      100
    ) {
      this.createPipe();
    }

    if (this.bird.y >= config.height - this.bird.height) {
      this.isLost = true;
      this.displayGameOver();
    }

    this.background.tilePositionX += speed;
  }

  createScoreLabel(x, y, score) {
    const style = { fontSize: "32px", fill: "#000" };
    const label = new ScoreLabel(this, x, y, score, style);
    label.depth = 1;

    this.add.existing(label);

    return label;
  }
}
