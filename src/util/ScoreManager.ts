export class ScoreManager {
  private static readonly STORAGE_KEY = 'my_game_scores';

  // 1. 全てのスコアを取得する (数列として取り出す)
  static getScores(): number[] {
    const rawData = localStorage.getItem(ScoreManager.STORAGE_KEY);
    if (!rawData) return [];
    
    try {
      return JSON.parse(rawData) as number[];
    } catch (e) {
      console.error("データのパースに失敗しました", e);
      return [];
    }
  }

  // 2. 新しいスコアを追加する (数列にaddする)
  static addScore(newScore: number): void {
    const scores = ScoreManager.getScores();
    scores.push(newScore);
    localStorage.setItem(ScoreManager.STORAGE_KEY, JSON.stringify(scores));
  }

  // 3. ベストスコア（上位N件）を取得する
  static getBestScores(limit: number = 5): number[] {
    const scores = ScoreManager.getScores();
    // 降順（大きい順）にソートして、指定件数を切り出す
    return scores.sort((a, b) => b - a).slice(0, limit);
  }

  // 4. 単一の最高スコアを取得する
  static getHighScore(): number {
    const scores = ScoreManager.getScores();
    return scores.length > 0 ? Math.max(...scores) : 0;
  }
}