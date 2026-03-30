import Phaser from "phaser";

const GAME_WIDTH = 400;
const GAME_HEIGHT = 700;

// ゲーム設定
const SHURIKEN_INTERVAL_Y = 64 * 3;    // 手裏剣の間隔(px)
const JUMP_VELOCITY_X = 100;        // 横方向ジャンプ速度
const JUMP_VELOCITY_Y = -500;       // 縦方向ジャンプ速度
const PIXELS_PER_METER = 50;        // 1メートルあたりのpx
const GENERATE_AHEAD = 2000;        // カメラの上方向にこの分だけ先に生成(px)
const BETWEEN_X = (GAME_WIDTH - 50) / 7; // 手裏剣の横方向の間隔(px)

export default class MainScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  shurikens!: Phaser.Physics.Arcade.StaticGroup;
  scoreText!: Phaser.GameObjects.Text;
  highestY!: number;
  score!: number;
  generatedUpTo!: number;
  startY!: number;
  isGameOver!: boolean;
  hasStarted!: boolean;
  isPaused!: boolean;

  constructor() {
    super("main");
  }

  preload() {
    // プログラムで忍者スプライトを生成
    this.createNinjaTexture();
    // プログラムで手裏剣スプライトを生成
    this.createShurikenTexture();
  }

  createNinjaTexture() {
    const size = 48;
    const gfx = this.add.graphics();

    // 体 — 暗い紺色
    gfx.fillStyle(0x1a1a4a, 1);
    gfx.fillRoundedRect(12, 16, 24, 24, 4);

    // 頭
    gfx.fillStyle(0x2a2a5a, 1);
    gfx.fillCircle(24, 14, 11);

    // マスク
    gfx.fillStyle(0x1a1a3a, 1);
    gfx.fillRect(13, 8, 22, 8);

    // 目（光る）
    gfx.fillStyle(0xff4444, 1);
    gfx.fillCircle(19, 12, 2.5);
    gfx.fillCircle(29, 12, 2.5);

    // 目の光
    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(20, 11, 1);
    gfx.fillCircle(30, 11, 1);

    // スカーフ（なびく）
    gfx.fillStyle(0xcc3333, 1);
    gfx.fillTriangle(35, 8, 46, 4, 40, 16);

    // 脚
    gfx.fillStyle(0x1a1a4a, 1);
    gfx.fillRect(14, 38, 7, 10);
    gfx.fillRect(27, 38, 7, 10);

    // 足
    gfx.fillStyle(0x2a2a3a, 1);
    gfx.fillRoundedRect(12, 45, 10, 4, 2);
    gfx.fillRoundedRect(26, 45, 10, 4, 2);

    // テクスチャとして生成
    gfx.generateTexture("ninja", size, size);
    gfx.destroy();
  }

  createShurikenTexture() {
    const size = 64; // ここを32から64に変更
    const cx = size / 2;
    const cy = size / 2;
    // 比率（スケール）を計算
    const s = size / 32; 

    const gfx = this.add.graphics();

    gfx.fillStyle(0xc0c0c0, 1);
    
    // 各座標に「s」を掛けることで比率を維持します
    // 上
    gfx.fillTriangle(cx, cy - 14 * s, cx + 4 * s, cy - 3 * s, cx - 4 * s, cy - 3 * s);
    // 右
    gfx.fillTriangle(cx + 14 * s, cy, cx + 3 * s, cy + 4 * s, cx + 3 * s, cy - 4 * s);
    // 下
    gfx.fillTriangle(cx, cy + 14 * s, cx - 4 * s, cy + 3 * s, cx + 4 * s, cy + 3 * s);
    // 左
    gfx.fillTriangle(cx - 14 * s, cy, cx - 3 * s, cy - 4 * s, cx - 3 * s, cy + 4 * s);

    // 中心
    gfx.fillStyle(0x808080, 1);
    gfx.fillCircle(cx, cy, 4 * s);

    // ハイライト
    gfx.fillStyle(0xe0e0e0, 1);
    gfx.fillCircle(cx - 1 * s, cy - 1 * s, 2 * s);

    gfx.generateTexture("shuriken", size, size);
    gfx.destroy();
}

  create() {
    this.isGameOver = false;
    this.hasStarted = false;
    this.isPaused = false;

    // 背景
    this.createBackground();

    // ワールドバウンド — 左右だけ制限、上下は無限
    this.physics.world.setBounds(0, -1000000, GAME_WIDTH, 2000000);

    // 足場グループ
    this.platforms = this.physics.add.staticGroup();

    // 手裏剣グループ
    this.shurikens = this.physics.add.staticGroup();

    // 初期足場（地面）
    this.startY = GAME_HEIGHT - 80;
    this.createGroundPlatform(this.startY);

    // プレイヤー
    this.player = this.physics.add.sprite(GAME_WIDTH / 2, this.startY - 35, "ninja");
    this.player.setScale(1.3);
    this.player.refreshBody();
    // 当たり判定
    this.player.body!.setSize(30, 38);
    this.player.body!.setOffset(9, 8);
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    // 衝突設定
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.shurikens, this.hitShuriken, undefined, this);

    // カメラ設定 — Y軸のみ追跡
    this.cameras.main.startFollow(this.player, false, 0, 0.15);
    this.cameras.main.setFollowOffset(0, 50);

    // スコア初期化
    this.highestY = this.startY;
    this.score = 0;
    this.generatedUpTo = this.startY;

    // スコアテキスト（UI — カメラに固定）
    this.scoreText = this.add
      .text(GAME_WIDTH / 2, 20, "0 m", {
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000000",
          blur: 4,
          fill: true,
        },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100);

    // 一時停止ボタン
    const pauseBtn = this.add
      .text(GAME_WIDTH - 15, 15, "⏸", {
        fontSize: "32px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        shadow: {
          offsetX: 1,
          offsetY: 1,
          color: "#000000",
          blur: 4,
          fill: true,
        },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(200)
      .setInteractive({ useHandCursor: true });

    pauseBtn.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      if (this.isGameOver || this.isPaused) return;
      this.isPaused = true;
      this.scene.pause();
      this.scene.launch("pause");
    });

    // PauseSceneから復帰した時のリスナー
    this.events.on("resume", () => {
      this.isPaused = false;
    });

    // スタートメッセージ
    const startMsg = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, "タップでジャンプ!", {
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);

    // 点滅
    this.tweens.add({
      targets: startMsg,
      alpha: 0.3,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    // タップ入力
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver || this.isPaused) return;

      if (!this.hasStarted) {
        this.hasStarted = true;
        startMsg.destroy();
      }

      if (pointer.x < this.scale.width / 2) {
        this.jumpLeft();
      } else {
        this.jumpRight();
      }
    });

    // 手裏剣障害物のみ生成（足場はスタート地点のみ）
    this.generateShurikens();
  }

  update() {
    if (this.isGameOver) return;

    // カメラのX座標を常に固定
    this.cameras.main.scrollX = 0;

    // スコア更新
    if (this.player.y < this.highestY) {
      this.highestY = this.player.y;
      this.score = Math.floor((this.startY - this.highestY) / PIXELS_PER_METER);
      this.scoreText.setText(`${this.score} m`);
    }

    // 手裏剣の動的生成
    const cameraTop = this.cameras.main.scrollY;
    if (cameraTop - GENERATE_AHEAD < this.generatedUpTo) {
      this.spawnShurikensUpTo(this.generatedUpTo - GENERATE_AHEAD);
    }

    // カメラ下部よりも落下したらゲームオーバー
    const cameraBottom = this.cameras.main.scrollY + GAME_HEIGHT;
    if (this.hasStarted && this.player.y > cameraBottom + 50) {
      this.gameOver();
    }

    // 古いオブジェクトをクリーンアップ
    this.cleanupOffscreen(cameraBottom + 500);
  }

  jumpLeft() {
    this.player.setVelocity(-JUMP_VELOCITY_X, JUMP_VELOCITY_Y);
    this.player.setFlipX(true);
  }

  jumpRight() {
    this.player.setVelocity(JUMP_VELOCITY_X, JUMP_VELOCITY_Y);
    this.player.setFlipX(false);
  }

  createGroundPlatform(y: number) {
    const ground = this.add.graphics();
    ground.fillStyle(0x8B4513, 1);
    ground.fillRoundedRect(20, y, GAME_WIDTH - 40, 18, 6);
    ground.lineStyle(2, 0xA0522D, 1);
    ground.strokeRoundedRect(20, y, GAME_WIDTH - 40, 18, 6);

    const zone = this.add.zone(GAME_WIDTH / 2, y + 9, GAME_WIDTH - 40, 18);
    this.platforms.add(zone);
    (zone.body as Phaser.Physics.Arcade.StaticBody).setSize(GAME_WIDTH - 40, 18);
    (zone.body as Phaser.Physics.Arcade.StaticBody).checkCollision.down = false;
    (zone.body as Phaser.Physics.Arcade.StaticBody).checkCollision.left = false;
    (zone.body as Phaser.Physics.Arcade.StaticBody).checkCollision.right = false;
  }

  createShuriken(x: number, y: number) {
    const shuriken = this.shurikens.create(x, y, "shuriken") as Phaser.Physics.Arcade.Sprite;
    shuriken.setScale(1.2);
    shuriken.refreshBody();
    // 当たり判定を小さめに
    (shuriken.body as Phaser.Physics.Arcade.Body).setCircle(30);
    (shuriken.body as Phaser.Physics.Arcade.Body).setOffset(6, 6);

    // 回転アニメーション
    this.tweens.add({
      targets: shuriken,
      angle: 360,
      duration: 1200,
      repeat: -1,
      ease: "Linear",
    });
  }

  generateShurikens() {
    // 初期エリアの手裏剣をまとめて生成
    this.spawnShurikensUpTo(this.startY - GENERATE_AHEAD);
  }

  spawnShurikensUpTo(targetY: number) {
    let y = this.generatedUpTo - SHURIKEN_INTERVAL_Y;
    // generatedUpToからの行番号を追跡するため、行インデックスを計算
    // startYから何行目かを求める（0始まり）
    let rowIndex = Math.round((this.startY - (this.generatedUpTo)) / SHURIKEN_INTERVAL_Y);

    while (y > targetY) {
      const heightFromStart = this.startY - y;
      rowIndex++;
      const isOddRow = rowIndex % 2 === 1; // 奇数行目(A) か 偶数行目(B) か

      let pieces = 0;

      if (heightFromStart <= 6 * PIXELS_PER_METER) {
        // 6m以下: 0個
        pieces = 0;
      } else if (heightFromStart <= 150 * PIXELS_PER_METER) {
        // 0〜150m: A=0or1, B=1
        pieces = isOddRow ? Phaser.Math.Between(0, 1) : 1;
      } else if (heightFromStart <= 300 * PIXELS_PER_METER) {
        // 150〜300m: A=2, B=0or1
        pieces = isOddRow ? 2 : Phaser.Math.Between(0, 1);
      } else if (heightFromStart <= 650 * PIXELS_PER_METER) {
        // 300〜650m: A=2or3, B=1
        pieces = isOddRow ? Phaser.Math.Between(2, 3) : 1;
      } else {
        // 650m〜: A=3, B=1
        pieces = isOddRow ? 3 : 1;
      }

      for (let i = 0; i < pieces; i++) {
        const shurikenXrow = Phaser.Math.Between(0, 6);
        const shurikenX = 50 + BETWEEN_X * shurikenXrow;
        this.createShuriken(shurikenX, y);
      }

      y -= SHURIKEN_INTERVAL_Y;
    }

    this.generatedUpTo = y + SHURIKEN_INTERVAL_Y;
  }

  cleanupOffscreen(belowY: number) {
    const shurikenChildren = [...this.shurikens.getChildren()];
    for (const child of shurikenChildren) {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      if (sprite.y > belowY) {
        sprite.destroy();
      }
    }
  }

  hitShuriken() {
    this.gameOver();
  }

  gameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.player.setTint(0xff0000);
    this.player.setVelocity(0, 0);
    (this.player.body as Phaser.Physics.Arcade.Body).enable = false;

    this.cameras.main.shake(300, 0.01);

    this.time.delayedCall(800, () => {
      this.scene.start("gameover", { score: this.score });
    });
  }

  createBackground() {
    // 水色の空背景（元の色 #3498db に合わせる）
    const bg = this.add.graphics();
    bg.setScrollFactor(0);
    bg.setDepth(-10);
    bg.fillStyle(0x3498db, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }
}
