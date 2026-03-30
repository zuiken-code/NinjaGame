import Phaser from "phaser";
import MainScene from "./scenes/MainScene";
import GameOverScene from "./scenes/GameOverScene";
import PauseScene from "./scenes/PauseScene";

export const createGame = (parent: string) => {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: 400,
    height: 700,
    parent,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: "#3498db",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 900 },
        debug: false,
      },
    },
    scene: [MainScene, GameOverScene, PauseScene],
  });
};
