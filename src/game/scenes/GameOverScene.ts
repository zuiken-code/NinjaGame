import Phaser from "phaser";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("gameover");
  }

  create(data: { score: number }) {
    const score = data.score || 0;
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // 暗い背景
    const bg = this.add.graphics();
    bg.fillStyle(0x3498db, 0.95);
    bg.fillRect(0, 0, this.scale.width, this.scale.height);

    // ゲームオーバーテキスト
    this.add
      .text(centerX, centerY - 100, "GAME OVER", {
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        fontSize: "48px",
        fontStyle: "bold",
        color: "#ff4444",
        stroke: "#000000",
        strokeThickness: 6,
        shadow: {
          offsetX: 3,
          offsetY: 3,
          color: "#000000",
          blur: 8,
          fill: true,
        },
      })
      .setOrigin(0.5);

    // スコア表示
    this.add
      .text(centerX, centerY - 20, `${score} m`, {
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        fontSize: "64px",
        fontStyle: "bold",
        color: "#ffd700",
        stroke: "#000000",
        strokeThickness: 5,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000000",
          blur: 6,
          fill: true,
        },
      })
      .setOrigin(0.5);

    // 高さラベル
    this.add
      .text(centerX, centerY + 40, "到達した高さ", {
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        fontSize: "18px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    // リトライ案内
    const retryText = this.add
      .text(centerX, centerY + 120, "タップしてリトライ", {
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        fontSize: "22px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // 点滅アニメーション
    this.tweens.add({
      targets: retryText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // タップでリスタート
    this.input.once("pointerdown", () => {
      this.scene.start("main");
    });
  }
}
