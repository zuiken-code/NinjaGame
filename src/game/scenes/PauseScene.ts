import Phaser from "phaser";

const GAME_WIDTH = 400;
const GAME_HEIGHT = 700;

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super("pause");
  }

  create() {
    // 半透明の暗いオーバーレイ
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 「一時停止中」テキスト
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, "⏸ 一時停止中", {
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        fontSize: "36px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000000",
          blur: 6,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setDepth(210);

    // 「▶ 再開」ボタン
    const resumeBtn = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, "▶ 再開", {
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        backgroundColor: "#2ecc71",
        padding: { x: 30, y: 12 },
      })
      .setOrigin(0.5)
      .setDepth(210)
      .setInteractive({ useHandCursor: true });

    // ボタンホバーアニメーション
    resumeBtn.on("pointerover", () => {
      resumeBtn.setScale(1.05);
    });
    resumeBtn.on("pointerout", () => {
      resumeBtn.setScale(1.0);
    });

    // 再開処理
    resumeBtn.on("pointerdown", () => {
      this.scene.resume("main");
      this.scene.stop();
    });

    // ボタンの上下アニメーション
    this.tweens.add({
      targets: resumeBtn,
      y: "+=4",
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
