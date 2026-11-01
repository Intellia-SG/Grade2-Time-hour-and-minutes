import React from 'react';
import { stopNarration } from '../utils/audio';

const HOME_JOURNEY_CARDS = [
  { icon: '🔍', title: 'Wonder', sub: 'A clock mystery!' },
  { icon: '📖', title: 'Story', sub: "Pip's clock hands" },
  { icon: '🧪', title: 'Simulate', sub: 'Set & read clock' },
  { icon: '🎮', title: 'Play', sub: '20+ challenges' },
  { icon: '📓', title: 'Reflect', sub: 'Quiz & review' },
];

export default function IntroScreen({ onStart }) {
  const handleStart = () => {
    stopNarration();
    onStart();
  };

  return (
    <div className="home-screen">
      {/* Top Badge */}
      <div className="home-badge">
        ✨ <strong>Grade 2 Math</strong>
      </div>

      {/* Main Title */}
      <h1 className="home-title">
        <span style={{ color: 'var(--gold)' }}>Time</span> — <span style={{ color: 'var(--coral)' }}>Hours & Minutes</span>
      </h1>

      {/* Subtitle */}
      <p className="home-subtitle">
        <strong>Reading Analog & Digital Clocks!</strong>
      </p>

      {/* Description Box */}
      <div className="home-desc-box">
        Let's master reading <strong>hour and minute hands</strong>, counting by <strong>5s</strong>, matching <strong>analog & digital clocks</strong>, and using <strong>a.m. & p.m.</strong>! 🕒
      </div>

      {/* 5 Journey Cards Row */}
      <div className="home-cards-row">
        {HOME_JOURNEY_CARDS.map((card, i) => (
          <div key={i} className="home-card">
            <div className="home-card-icon">{card.icon}</div>
            <div className="home-card-title"><strong>{card.title}</strong></div>
            <div className="home-card-sub">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Primary CTA Button */}
      <button className="btn btn-primary btn-lg home-start-btn" onClick={handleStart} id="start-journey-btn">
        🚀 <strong>Begin Your Journey!</strong>
      </button>

      {/* Bottom Feature Badges */}
      <div className="home-bottom-badges">
        <div className="home-bottom-badge">
          🎯 <strong>20+ Questions</strong>
        </div>
        <div className="home-bottom-badge">
          🕒 <strong>Hours & Minutes</strong>
        </div>
        <div className="home-bottom-badge">
          🏆 <strong>Badges & XP</strong>
        </div>
      </div>
    </div>
  );
}
