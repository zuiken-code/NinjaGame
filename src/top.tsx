import { Link } from 'react-router-dom';
import './top.css';

function Top() {
  return (
    <div className="top-container">
      <div className="top-content">
        <h1 className="game-title">忍者蹴り</h1>
        
        <div className="game-info">
          <p className="description">
            天空を目指し、ひたすら蹴り上がれ！<br />
            迫りくる手裏剣を避け、どこまで高く登れるか挑戦しよう。
          </p>

          <div className="controls">
            <h2>【 操作方法 】</h2>
            <ul>
              <li>画面左側をタップ: 左へジャンプ</li>
              <li>画面右側をタップ: 右へジャンプ</li>
            </ul>
          </div>
        </div>

        <Link to="/game" className="play-button">
          ゲームスタート
        </Link>
      </div>
    </div>
  );
}

export default Top;