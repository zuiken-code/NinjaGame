import Phaser from "phaser";
import MainScene from "./scenes/MainScene";

export const createGame = (parent: string) => {
  return new Phaser.Game({
    type: Phaser.AUTO,
    // width/height は「基準となる解像度」として設定
    width: 400,
    height: 700,
    parent,
    scale: {
      // 画面全体にフィットさせる設定
      mode: Phaser.Scale.FIT,
      // 画面の中央に配置
      autoCenter: Phaser.Scale.CENTER_BOTH,
      // 親要素（div）の幅に合わせる
      width: "100%",
      height: "100%",
    },
    backgroundColor: "#3498db",
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
