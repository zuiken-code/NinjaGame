import Phaser from "phaser";
import MainScene from "./scenes/MainScene";

export const createGame = (parent: string) => {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: 400,
    height: 700,
    parent,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 800 },
        debug: false,
      },
    },
    scene: [MainScene],
  });
};
