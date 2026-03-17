import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;

  constructor() {
    super("main");
  }

  preload() {
    this.load.image("player", "/player.png");
    this.load.image("rock", "/rock.png");
  }

  create() {
    this.player = this.physics.add.sprite(200, 600, "player");

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < this.scale.width / 2) {
        this.jumpLeft();
      } else {
        this.jumpRight();
      }
    });
  }

  jumpLeft() {
    this.player.setVelocity(-150, -500);
  }

  jumpRight() {
    this.player.setVelocity(150, -500);
  }
}
