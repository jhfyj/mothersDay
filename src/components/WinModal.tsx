import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PHOTO_BASE_URL } from '../game/photos';
import { Trophy } from '../assets/icons/Trophy';

const momPhoto = `${PHOTO_BASE_URL}/photo1.jpg`;

const CONFETTI_COLORS = [
  '#ff6b9d',
  '#ffc857',
  '#a78bfa',
  '#7dd3fc',
  '#86efac',
  '#FF2D2D',
];

type Props = {
  onRestart: () => void;
  onDownload: () => void;
};

export function WinModal({ onRestart, onDownload }: Props) {
  useEffect(() => {
    // Center burst.
    confetti({
      particleCount: 160,
      spread: 110,
      startVelocity: 45,
      origin: { y: 0.55 },
      colors: CONFETTI_COLORS,
    });
    // Side cannons just after, for a longer celebration.
    const sideCannons = setTimeout(() => {
      confetti({
        particleCount: 90,
        angle: 60,
        spread: 70,
        startVelocity: 50,
        origin: { x: 0, y: 0.65 },
        colors: CONFETTI_COLORS,
      });
      confetti({
        particleCount: 90,
        angle: 120,
        spread: 70,
        startVelocity: 50,
        origin: { x: 1, y: 0.65 },
        colors: CONFETTI_COLORS,
      });
    }, 280);
    return () => clearTimeout(sideCannons);
  }, []);

  return (
    <div className="win-backdrop">
      <div className="win-modal">
        <section className="win-card win-card--top">
          <div className="hearts-row">
            <img src="/heart.svg" alt="" className="heart" />
            <img src="/heart.svg" alt="" className="heart" />
            <img src="/heart.svg" alt="" className="heart" />
          </div>
          <h2 className="win-title">母亲节快乐！</h2>
          <p className="win-subtitle">
            祝妈天天开心，身体健康，开心消消乐一次通关！
          </p>
          <div className="win-actions">
            <button
              type="button"
              className="win-button win-button--primary"
              onClick={onRestart}
            >
              再来一遍
            </button>
            <button
              type="button"
              className="win-button win-button--secondary"
              onClick={onDownload}
            >
              下载图片
            </button>
          </div>
        </section>

        <section className="win-card">
          <h3 className="rank-title">母亲排名</h3>
          <div className="rank-row">
            <Trophy size={22} className="rank-trophy" />
            <img src={momPhoto} alt="" className="rank-avatar" />
            <span className="rank-name">妈</span>
            <span className="rank-score">10000</span>
          </div>
        </section>
      </div>
    </div>
  );
}
