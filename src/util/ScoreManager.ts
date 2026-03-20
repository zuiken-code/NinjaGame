import { supabase } from '../lib/supabase';

export class ScoreManager {
  private static readonly STORAGE_KEY = 'my_game_scores';
  
  // 不正防止のため、ローカルストレージではなくメモリ上に直近のスコアを保持する
  private static latestScore: number | null = null;
  
  static setLatestScore(score: number): void {
    this.latestScore = score;
  }
  
  static clearLatestScore(): void {
    this.latestScore = null;
  }

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

  // 5. Supabaseのランキングにスコアを登録する (latestScoreを利用して不正送信を防止)
  static async registerRanking(name: string, isGuest: boolean, userId?: string | null): Promise<{success: boolean, message?: string}> {
    if (this.latestScore === null) {
      return { success: false, message: 'スコア情報が見つかりません。もう一度プレイしてください。' }; 
    }

    try {
      const payload: any = {
        name,
        score: Math.min(this.latestScore, 10000),
        is_guest: isGuest,
      };

      if (!isGuest && userId) {
        payload.user_id = userId;
      }

      const { error } = await supabase.from('scores').insert(payload);
      
      if (error) {
        console.error('Failed to register score to Supabase:', error);
        return { success: false, message: error.message };
      }
      
      // 登録成功したら値を消して二重登録を防ぐ
      this.clearLatestScore();
      return { success: true };
    } catch (e: any) {
      console.error('Error in registerRanking:', e);
      return { success: false, message: e.message || '不明なエラーが発生しました' };
    }
  }

  // 6. Supabaseからランキング上位10件を取得する
  static async getLeaderboard(limit: number = 10): Promise<{ name: string, score: number }[]> {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch leaderboard:', error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error('Error fetching leaderboard:', e);
      return [];
    }
  }
}