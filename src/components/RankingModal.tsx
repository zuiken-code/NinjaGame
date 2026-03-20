import React, { useEffect, useState } from 'react';
import { ScoreManager } from '../util/ScoreManager';
import './RankingModal.css';

export default function RankingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  


  useEffect(() => {
    const handleShowRanking = (event: CustomEvent<{ score: number }>) => {
      setScore(event.detail.score);
      setIsOpen(true);
      setMessage('');
    };

    window.addEventListener('show-ranking', handleShowRanking as EventListener);
    return () => {
      window.removeEventListener('show-ranking', handleShowRanking as EventListener);
    };
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      setMessage('ニックネームを入力してください');
      return;
    }
    
    if (nickname.length > 10) {
      setMessage('ニックネームは10文字以内で入力してください');
      return;
    }

    setIsSubmitting(true);
    setMessage('登録中...');

    const result = await ScoreManager.registerRanking(
      nickname,
      true, // 常にゲストとして登録
      null
    );

    setIsSubmitting(false);

    if (result.success) {
      setMessage('登録完了！トップページからランキングが見れます');
      setTimeout(() => setIsOpen(false), 2000);
    } else {
      setMessage(`登録失敗: ${result.message}`);
    }
  };

  return (
    <div className="ranking-modal-overlay">
      <div className="ranking-modal">
        <h2>ランキング登録</h2>
        <p className="ranking-score">スコア: {score} m</p>
        


        <form onSubmit={handleSubmit} className="ranking-form">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="ニックネーム (最大10文字)"
            maxLength={10}
            disabled={isSubmitting}
            className="nickname-input"
          />
          
          <div className="ranking-buttons">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cancel-button"
              disabled={isSubmitting}
            >
              閉じる
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting || !nickname.trim()}
            >
              登録する
            </button>
          </div>
          
          {message && <p className="status-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}
