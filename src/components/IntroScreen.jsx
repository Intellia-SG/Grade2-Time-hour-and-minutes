import { useEffect, useRef } from 'react';
import { narrate, stopNarration } from '../utils/audio';
import { introNarration } from '../utils/narration';

const JOURNEY_PHASES = [
  { icon: '🔍', label: 'Wonder', desc: 'A mysterious clock question' },
  { icon: '📖', label: 'Story', desc: 'Pip the Robot\'s missing hands' },
  { icon: '🧪', label: 'Simulate', desc: 'Set and read the clock' },
  { icon: '🎮', label: 'Play', desc: '10-world time challenge' },
  { icon: '📓', label: 'Reflect', desc: 'Teach Pip what you learned' },
];

export default function IntroScreen({ onStart, audioEnabled }) {
  const narrationRef = useRef(null);

  useEffect(() => {
    if (audioEnabled) {
      const timer = setTimeout(() => {
        narrationRef.current = narrate(introNarration(), true);
      }, 200);
      return () => {
        clearTimeout(timer);
        narrationRef.current?.cancel();
        stopNarration();
      };
    }
  }, [audioEnabled]);

  const handleStart = () => {
    narrationRef.current?.cancel();
    stopNarration();
    onStart();
  };

  return (
    <div className="intro-screen">
      {/* Curriculum badge */}
      <div className="intro-badge">
        ✨  · Grade 2 Maths
      </div>

      {/* Title */}
      <h1 className="intro-title">
        <span style={{ color: 'var(--gold)' }}>Time</span>{' '}—{' '}
        <span style={{ color: 'var(--coral)' }}>Hours & Minutes</span>
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 4, fontFamily: 'var(--font-display)' }}>
        Lesson 5.1 · Reading Analog & Digital Clocks
      </p>

      {/* Mascot */}
      <div className="mascot-container">
        <div className="mascot">🤖</div>
        <div className="speech-bubble">
          Let's explore telling time! 🕒
        </div>
      </div>

      {/* Description */}
      <p className="intro-desc">
        Learn to read the <strong style={{ color: 'var(--gold)' }}>hour and minute hands</strong>, count by 5s, match analog and digital clocks, and understand a.m. and p.m. routinely!
      </p>

      {/* Journey map */}
      <div className="intro-journey-map">
        <h3 className="intro-journey-title">Your Learning Journey</h3>
        <div className="intro-journey-steps">
          {JOURNEY_PHASES.map((p, i) => (
            <div key={i} className="intro-journey-step">
              <div className="intro-journey-icon">{p.icon}</div>
              <div className="intro-journey-info">
                <div className="intro-journey-label">{p.label}</div>
                <div className="intro-journey-desc">{p.desc}</div>
              </div>
              {i < JOURNEY_PHASES.length - 1 && <div className="intro-journey-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button className="btn btn-primary btn-lg intro-start-btn" onClick={handleStart} id="start-journey-btn">
        🚀 Begin Your Journey!
      </button>

      {/* Feature cards */}
      <div className="feature-cards">
        <div className="feature-card">
          <div className="feature-card-icon">🎯</div>
          <div className="feature-card-label">100 Challenges</div>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon">🕒</div>
          <div className="feature-card-label">Interactive Clock</div>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon">✨</div>
          <div className="feature-card-label">Badges & XP</div>
        </div>
      </div>
    </div>
  );
}
