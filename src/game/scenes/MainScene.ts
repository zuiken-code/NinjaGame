import Phaser from "phaser";

const GAME_WIDTH = 400;
const GAME_HEIGHT = 700;

// ゲーム設定
const PLATFORM_INTERVAL_Y = 130;    // 足場の間隔(px)
const SHURIKEN_INTERVAL_Y = 400;    // 手裏剣の間隔(px)
const JUMP_VELOCITY_X = 180;        // 横方向ジャンプ速度
const JUMP_VELOCITY_Y = -500;       // 縦方向ジャンプ速度
const PIXELS_PER_METER = 50;        // 1メートルあたりのpx
const GENERATE_AHEAD = 2000;        // カメラの上方向にこの分だけ先に生成(px)

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
    const size = 32;
    const cx = size / 2;
    const cy = size / 2;
    const gfx = this.add.graphics();

    // 手裏剣の4つの刃
    gfx.fillStyle(0xc0c0c0, 1);
    const points = [
      // 上の刃
      { x: cx, y: cy - 14 }, { x: cx + 4, y: cy - 3 }, { x: cx - 4, y: cy - 3 },
    ];
    gfx.fillTriangle(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y);

    // 右の刃
    gfx.fillTriangle(cx + 14, cy, cx + 3, cy + 4, cx + 3, cy - 4);

    // 下の刃
    gfx.fillTriangle(cx, cy + 14, cx - 4, cy + 3, cx + 4, cy + 3);

    // 左の刃
    gfx.fillTriangle(cx - 14, cy, cx - 3, cy - 4, cx - 3, cy + 4);

    // 中心の円
    gfx.fillStyle(0x808080, 1);
    gfx.fillCircle(cx, cy, 4);

    // 中心のハイライト
    gfx.fillStyle(0xe0e0e0, 1);
    gfx.fillCircle(cx - 1, cy - 1, 2);

    gfx.generateTexture("shuriken", size, size);
    gfx.destroy();
  }

  create() {
    this.isGameOver = false;
    this.hasStarted = false;

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
      if (this.isGameOver) return;

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

    // 初期の足場・障害物を生成
    this.generateContentUpTo(this.startY - GENERATE_AHEAD);
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

    // コンテンツの動的生成
    const cameraTop = this.cameras.main.scrollY;
    if (cameraTop - GENERATE_AHEAD < this.generatedUpTo) {
      this.generateContentUpTo(this.generatedUpTo - GENERATE_AHEAD);
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
    ground.fillStyle(0x2a1a4a, 1);
    ground.fillRoundedRect(20, y, GAME_WIDTH - 40, 18, 6);
    ground.lineStyle(2, 0x7b4fae, 1);
    ground.strokeRoundedRect(20, y, GAME_WIDTH - 40, 18, 6);

    const zone = this.add.zone(GAME_WIDTH / 2, y + 9, GAME_WIDTH - 40, 18);
    this.platforms.add(zone);
    (zone.body as Phaser.Physics.Arcade.StaticBody).setSize(GAME_WIDTH - 40, 18);
    (zone.body as Phaser.Physics.Arcade.StaticBody).checkCollision.down = false;
    (zone.body as Phaser.Physics.Arcade.StaticBody).checkCollision.left = false;
    (zone.body as Phaser.Physics.Arcade.StaticBody).checkCollision.right = false;
  }

  createPlatform(x: number, y: number) {
    const platWidth = Phaser.Math.Between(60, 100);
    const platHeight = 12;

    const gfx = this.add.graphics();
    gfx.fillStyle(0x2a1a4a, 1);
    gfx.fillRoundedRect(x - platWidth / 2, y, platWidth, platHeight, 4);
    gfx.lineStyle(1.5, 0x7b4fae, 0.8);
    gfx.strokeRoundedRect(x - platWidth / 2, y, platWidth, platHeight, 4);

    const zone = this.add.zone(x, y + platHeight / 2, platWidth, platHeight);
    this.platforms.add(zone);
    (zone.body as Phaser.Physics.Arcade.StaticBody).setSize(platWidth, platHeight);
    (zone.body as Phaser.Physics.Arcade.StaticBody).checkCollision.down = false;
    (zone.body as Phaser.Physics.Arcade.StaticBody).checkCollision.left = false;
    (zone.body as Phaser.Physics.Arcade.StaticBody).checkCollision.right = false;

    (zone as any)._gfx = gfx;
  }

  createShuriken(x: number, y: number) {
    const shuriken = this.shurikens.create(x, y, "shuriken") as Phaser.Physics.Arcade.Sprite;
    shuriken.setScale(1.2);
    shuriken.refreshBody();
    // 当たり判定を小さめに
    (shuriken.body as Phaser.Physics.Arcade.StaticBody).setSize(20, 20);
    (shuriken.body as Phaser.Physics.Arcade.StaticBody).setOffset(6, 6);

    // 回転アニメーション
    this.tweens.add({
      targets: shuriken,
      angle: 360,
      duration: 1200,
      repeat: -1,
      ease: "Linear",
    });
  }

  generateContentUpTo(targetY: number) {
    let y = this.generatedUpTo - PLATFORM_INTERVAL_Y;

    while (y > targetY) {
      const x = Phaser.Math.Between(60, GAME_WIDTH - 60);
      this.createPlatform(x, y);

      // 手裏剣は序盤は出さない
      const heightFromStart = this.startY - y;
      if (
        heightFromStart > 500 &&
        heightFromStart % SHURIKEN_INTERVAL_Y < PLATFORM_INTERVAL_Y
      ) {
        let shurikenX = Phaser.Math.Between(50, GAME_WIDTH - 50);
        while (Math.abs(shurikenX - x) < 40) {
          shurikenX = Phaser.Math.Between(50, GAME_WIDTH - 50);
        }
        const shurikenY = y - Phaser.Math.Between(40, 90);
        this.createShuriken(shurikenX, shurikenY);
      }

      y -= PLATFORM_INTERVAL_Y;
    }

    this.generatedUpTo = y + PLATFORM_INTERVAL_Y;
  }

  cleanupOffscreen(belowY: number) {
    const platformChildren = [...this.platforms.getChildren()];
    for (const child of platformChildren) {
      const zone = child as Phaser.GameObjects.Zone;
      if (zone.y > belowY) {
        if ((zone as any)._gfx) {
          (zone as any)._gfx.destroy();
        }
        zone.destroy();
      }
    }

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
    const bg = this.add.graphics();
    bg.setScrollFactor(0);
    bg.setDepth(-10);
    bg.fillGradientStyle(0x0a0a2e, 0x0a0a2e, 0x1a0a3e, 0x1a0a3e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const stars = this.add.graphics();
    stars.setScrollFactor(0.02);
    stars.setDepth(-9);
    for (let i = 0; i < 80; i++) {
      const sx = Phaser.Math.Between(0, GAME_WIDTH);
      const sy = Phaser.Math.Between(-10000, GAME_HEIGHT);
      const size = Phaser.Math.FloatBetween(0.5, 2);
      const alpha = Phaser.Math.FloatBetween(0.15, 0.6);
      stars.fillStyle(0xffffff, alpha);
      stars.fillCircle(sx, sy, size);
    }
  }
}
