import React, { useEffect, useState } from 'react';
import { ScoreManager } from '../util/ScoreManager';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import './RankingModal.css';

export default function RankingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [remainingCount, setRemainingCount] = useState(5);
  const isOnline = useOnlineStatus();



  useEffect(() => {
    const handleShowRanking = (event: CustomEvent<{ score: number }>) => {
      setScore(event.detail.score);
      setIsOpen(true);
      setMessage('');

      const today = new Date().toLocaleDateString('ja-JP');
      const stored = localStorage.getItem('ranking_registration_data');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.date !== today) {
            setRemainingCount(5);
            localStorage.setItem('ranking_registration_data', JSON.stringify({ date: today, count: 0 }));
          } else {
            setRemainingCount(Math.max(0, 5 - data.count));
          }
        } catch (e) {
          setRemainingCount(5);
        }
      } else {
        setRemainingCount(5);
      }
    };

    window.addEventListener('show-ranking', handleShowRanking as EventListener);
    return () => {
      window.removeEventListener('show-ranking', handleShowRanking as EventListener);
    };
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOnline) {
      setMessage('📡 現在オフラインです。ランキング登録にはインターネット接続が必要です。');
      return;
    }
    
    if (remainingCount <= 0) {
      setMessage('本日の登録上限（5回）に達しました。また明日挑戦してください！');
      return;
    }
    
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
      const today = new Date().toLocaleDateString('ja-JP');
      const stored = localStorage.getItem('ranking_registration_data');
      let currentCount = 0;
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.date === today) {
            currentCount = data.count;
          }
        } catch (e) {}
      }
      const newCount = currentCount + 1;
      localStorage.setItem('ranking_registration_data', JSON.stringify({ date: today, count: newCount }));
      setRemainingCount(Math.max(0, 5 - newCount));

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
        <p className="daily-limit-info">
          ※1日5回まで登録できます（本日残り: <span className={remainingCount === 0 ? "limit-reached" : ""}>{remainingCount}</span>回）
        </p>

        {!isOnline && (
          <p className="offline-message">📡 現在オフラインです。ランキング登録にはインターネット接続が必要です。</p>
        )}

        <form onSubmit={handleSubmit} className="ranking-form">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="ニックネーム (最大10文字)"
            maxLength={10}
            disabled={isSubmitting || remainingCount <= 0 || !isOnline}
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
              disabled={isSubmitting || !nickname.trim() || remainingCount <= 0 || !isOnline}
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
