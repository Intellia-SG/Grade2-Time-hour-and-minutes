import React, { useState, useEffect, useRef, useCallback } from 'react';
import { narrate, stopNarration, sounds } from '../utils/audio';
import { reflectIntroNarration, reflectCorrectNarration, reflectWrongNarration, reflectConfidenceNarration, reflectCertificateNarration } from '../utils/narration';

const REFLECT_QUESTIONS = [
  {
    question: "Where does the hour hand point at half past 6?",
    options: [
      { text: "Exactly at 6", isCorrect: false },
      { text: "Halfway between 6 and 7", isCorrect: true },
      { text: "Pointing at 12", isCorrect: false }
    ],
    explanation: "At half past 6, the hour hand has moved halfway to the next hour (7)."
  },
  {
    question: "How many minutes have passed when the minute hand points to 9?",
    options: [
      { text: "9 minutes", isCorrect: false },
      { text: "15 minutes", isCorrect: false },
      { text: "45 minutes", isCorrect: true }
    ],
    explanation: "Each number stands for 5 minutes. 9 times 5 is 45 minutes!"
  },
  {
    question: "If you are sleeping in your bed at night, what time is it likely to be?",
    options: [
      { text: "9:00 p.m.", isCorrect: true },
      { text: "9:00 a.m.", isCorrect: false },
      { text: "12:00 noon", isCorrect: false }
    ],
    explanation: "Nighttime hours are p.m. Breakfast and morning hours are a.m."
  }
];

const CONFIDENCE_LEVELS = [
  { label: 'Needs Work', emoji: '😕', desc: 'I need a bit more practice.', color: '#ff7043' },
  { label: 'Okay', emoji: '🙂', desc: 'I understand it now.', color: '#ffc107' },
  { label: 'Mastered', emoji: '😎', desc: 'I can tell time easily!', color: '#4caf50' }
];

export default function ReflectPhase({ results = {}, onComplete, audioEnabled }) {
  const [stage, setStage] = useState('reflect'); // 'reflect' | 'confidence' | 'certificate'
  const [qIndex, setQIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [confVal, setConfVal] = useState(null);
  const [playerName, setPlayerName] = useState('Time Master');
  const narRef = useRef(null);

  const q = REFLECT_QUESTIONS[qIndex];

  useEffect(() => {
    if (audioEnabled) {
      if (stage === 'reflect' && qIndex === 0) {
        narRef.current = narrate(reflectIntroNarration(), true);
      } else if (stage === 'confidence') {
        narRef.current = narrate(reflectConfidenceNarration(), true);
      } else if (stage === 'certificate') {
        const total = results.totalAnswered || 100;
        const correct = results.score || 0;
        const pct = total > 0 ? (correct / total) * 100 : 80;
        narRef.current = narrate(reflectCertificateNarration(pct), true);
      }
    }
    return () => { narRef.current?.cancel(); };
  }, [stage, qIndex, audioEnabled, results]);

  const handleReflectSelect = (idx, isCorrect) => {
    if (answered) return;
    setSelectedIdx(idx);
    setAnswered(true);
    narRef.current?.cancel();
    
    if (isCorrect) {
      sounds.correct();
      if (audioEnabled) {
        narRef.current = narrate(reflectCorrectNarration(), true);
      }
    } else {
      sounds.wrong();
      if (audioEnabled) {
        narRef.current = narrate(reflectWrongNarration(), true);
      }
    }

    setTimeout(() => {
      setAnswered(false);
      setSelectedIdx(null);
      if (qIndex + 1 < REFLECT_QUESTIONS.length) {
        setQIndex(i => i + 1);
      } else {
        setStage('confidence');
      }
    }, 2500);
  };

  const handleConfSelect = (level) => {
    sounds.click();
    setConfVal(level);
    setTimeout(() => {
      setStage('certificate');
    }, 600);
  };

  // Certificate printing
  const handlePrint = () => {
    sounds.click();
    window.print();
  };

  if (stage === 'reflect') {
    return (
      <div className="reflect-phase">
        <div className="reflect-header">
          <h3 className="reflect-label">📓 Reflect</h3>
          <p className="reflect-sublabel">Teach <strong>Wei Ming</strong> what you learned today!</p>
        </div>
        <div className="reflect-card">
          <div className="reflect-mascot-row">
            <div className="mascot thinking">🤖</div>
            <div className="speech-bubble" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Can you help me understand this?
            </div>
          </div>
          <h2 className="reflect-card-title">{q.question}</h2>
          <div className="reflect-options">
            {q.options.map((opt, i) => {
              let cls = 'reflect-option';
              if (answered) {
                if (opt.isCorrect) cls += ' correct';
                else if (i === selectedIdx) cls += ' wrong';
                else cls += ' disabled';
              }
              return (
                <button
                   key={i}
                   className={cls}
                   onClick={() => handleReflectSelect(i, opt.isCorrect)}
                   disabled={answered}
                 >
                  <span className="reflect-option-emoji">{opt.isCorrect ? '✅' : '❓'}</span>
                  {opt.text}
                </button>
              );
            })}
          </div>
          {answered && (
            <div style={{ marginTop: 12, fontSize: '1.15rem', color: 'var(--gold)', fontWeight: 700, fontStyle: 'italic', animation: 'fadeIn 0.3s' }}>
              💡 {q.explanation}
            </div>
          )}
          <div className="reflect-progress">
            {REFLECT_QUESTIONS.map((_, i) => (
              <div key={i} className={`reflect-dot ${i === qIndex ? 'active' : i < qIndex ? 'done' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'confidence') {
    return (
      <div className="reflect-phase">
        <div className="reflect-header">
          <h3 className="reflect-label">📓 Confidence Check</h3>
          <p className="reflect-sublabel">How confident do you feel about telling time now?</p>
        </div>
        <div className="reflect-card" style={{ maxWidth: 450 }}>
          <div className="confidence-grid">
            {CONFIDENCE_LEVELS.map((c, i) => (
              <button
                key={i}
                className="confidence-btn"
                onClick={() => handleConfSelect(c.label)}
                style={{ '--conf-color': c.color }}
              >
                <span className="confidence-emoji">{c.emoji}</span>
                <div style={{ textAlign: 'left' }}>
                  <div className="confidence-label">{c.label}</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{c.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Certificate Stage
  const total = results.totalAnswered || 100;
  const correct = results.score || 0;
  const xp = results.xp || 0;
  const streak = results.maxStreak || 0;
  const starsEarned = Object.values(results.worldResults || {}).reduce((sum, w) => sum + (w.stars || 0), 0);

  return (
    <div className="reflect-phase">
      <div className="certificate-card">
        <div className="cert-badge">🏆</div>
        <h1 className="cert-title">Certificate of Excellence</h1>
        <p className="cert-subtitle">Tick Tock Academy graduate!</p>
        
        <div style={{ margin: '16px 0' }}>
          <label style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 800 }}>NAME</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.25)',
              borderRadius: '8px',
              padding: '10px 16px',
              color: 'white',
              textAlign: 'center',
              fontSize: '1.45rem',
              fontWeight: 800,
              width: '100%',
              maxWidth: 260,
              fontFamily: 'var(--font-display)'
            }}
          />
        </div>

        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', margin: '12px 0', fontWeight: 700 }}>
          Has successfully completed all worlds in the <strong style={{ color: 'var(--gold)' }}>Grade 2 Time Module</strong>.
        </p>

        <div className="cert-stats">
          <div className="cert-stat">
            <div className="cert-stat-value" style={{ color: 'var(--gold)' }}>{xp}</div>
            <div className="cert-stat-label">TOTAL XP</div>
          </div>
          <div className="cert-stat">
            <div className="cert-stat-value" style={{ color: 'var(--coral)' }}>{starsEarned} / 30</div>
            <div className="cert-stat-label">STARS</div>
          </div>
          <div className="cert-stat">
            <div className="cert-stat-value" style={{ color: '#00bcd4' }}>{streak}</div>
            <div className="cert-stat-label">MAX STREAK</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
          <button className="btn btn-outline btn-sm" onClick={handlePrint}>Print 🖨️</button>
          <button className="btn btn-primary btn-sm" onClick={onComplete} id="restart-journey-btn">Restart 🔄</button>
        </div>
      </div>
    </div>
  );
}
