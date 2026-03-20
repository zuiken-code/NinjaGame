import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScoreManager } from '../util/ScoreManager';
import './RankingPage.css';

export default function RankingPage() {
  const [leaderboard, setLeaderboard] = useState<{ name: string, score: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanking() {
      const data = await ScoreManager.getLeaderboard(10);
      setLeaderboard(data);
      setLoading(false);
    }
    fetchRanking();
  }, []);

  return (
    <div className="ranking-page-container">
      <div className="ranking-content">
        <h1 className="ranking-title">🏆 ランキング 🏆</h1>
        
        {loading ? (
          <p className="loading-text">読み込み中...</p>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.length === 0 ? (
              <p className="no-data">まだスコアがありません。最初の挑戦者になろう！</p>
            ) : (
              leaderboard.map((entry, index) => (
                <div key={index} className="leaderboard-item">
                  <span className="rank-number">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </span>
                  <span className="player-name">{entry.name}</span>
                  <span className="player-score">{entry.score} m</span>
                </div>
              ))
            )}
          </div>
        )}

        <Link to="/" className="back-button">
          トップに戻る
        </Link>
      </div>
    </div>
  );
}
