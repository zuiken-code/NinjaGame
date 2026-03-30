import Phaser from "phaser";
import { ScoreManager } from "../../util/ScoreManager";

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

    // スコア保存
    ScoreManager.addScore(score);
    ScoreManager.setLatestScore(score);

    // 高さラベル
    this.add
      .text(centerX, centerY + 40, "到達した高さ", {
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        fontSize: "18px",
        color: "#ffffffff",
      })
      .setOrigin(0.5);

    // Bestスコア表示
    this.add
      .text(centerX, centerY + 80, "BEST", {
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        fontSize: "25px",
        color: "#1eff00ff",
      })
      .setOrigin(0.5);

      const bestScore = ScoreManager.getBestScores(3);
      
      bestScore.forEach((score, index) => {
        this.add
        .text(centerX, centerY + 120 + (index * 40), `${score} m`, {
          fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
          fontSize: "30px",
          fontStyle: "bold",
          color: "#ffffffff",
        })
        .setOrigin(0.5);
      });

    // ランキング登録ボタン
    const rankingText = this.add
      .text(centerX, centerY + 210, "🏆 ランキング登録", {
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        fontSize: "24px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        backgroundColor: "#f39c12",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (!navigator.onLine) {
          // オフラインメッセージを表示
          const offlineMsg = this.add
            .text(centerX, centerY + 170, "📡 現在オフラインです", {
              fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
              fontSize: "16px",
              color: "#ff6b6b",
              stroke: "#000000",
              strokeThickness: 2,
            })
            .setOrigin(0.5);
          this.time.delayedCall(2500, () => offlineMsg.destroy());
          return;
        }
        window.dispatchEvent(new CustomEvent("show-ranking", {
          detail: { score }
        }));
      });

    // もう一度プレイボタン
    const retryText = this.add
      .text(centerX, centerY + 260, "▶ もう一度プレイ", {
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        backgroundColor: "#2ecc71",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.scene.start("main");
        window.gtag("event", "retry_game");
      });

    // トップへ戻るボタン
    const topText = this.add
      .text(centerX, centerY + 320, "トップに戻る", {
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        fontSize: "20px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        backgroundColor: "#e74c3c",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        window.location.hash = "#/";
        window.gtag("event", "return_top");
      });

    // アニメーション (ボタンを少しだけ上下に動かす)
    this.tweens.add({
      targets: [rankingText, retryText, topText],
      y: "+=5",
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
