import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { generateSessionQuestions } from '../utils/questionBank';
import { narrate, stopNarration, sounds, speak } from '../utils/audio';
import { playWorldIntro, playReadQuestion, playCorrectNarration, playWrongNarration, playWorldComplete } from '../utils/narration';
import QuestionRenderer from './QuestionRenderer';
import PopupModal from './PopupModal';

const WORLDS = [
  { id: 0, name: 'Hour Castle', icon: '🕒', color: '#ff4081', desc: 'Questions 1–10: O\'clock' },
  { id: 1, name: 'Half-Past Meadow', icon: '🌿', color: '#4caf50', desc: 'Questions 11–20: Half-Past' },
  { id: 2, name: 'Quarter Forest', icon: '🌲', color: '#03a9f4', desc: 'Questions 21–30: Quarters' },
  { id: 3, name: 'Minute Maze', icon: '🌀', color: '#00bcd4', desc: 'Questions 31–40: Counting by 5s' },
  { id: 4, name: 'Digital Dunes', icon: '🏜️', color: '#ff5722', desc: 'Questions 41–50: Digital Match' },
  { id: 5, name: 'AM/PM Skyway', icon: '☁️', color: '#673ab7', desc: 'Questions 51–60: Day & Night' },
  { id: 6, name: 'Time Flow', icon: '🌊', color: '#e91e63', desc: 'Questions 61–70: Elapsed Time' },
  { id: 7, name: 'Routine River', icon: '🛶', color: '#9c27b0', desc: 'Questions 71–80: Word Problems' },
  { id: 8, name: 'Challenge Cave', icon: '🐉', color: '#ffeb3b', desc: 'Questions 81–90: Challenge Mixed' },
  { id: 9, name: 'Chrono Palace', icon: '🏰', color: '#ff9800', desc: 'Questions 91–100: Final Palace' },
];

function calcXP(attempt, streak) {
  const base = attempt === 1 ? 15 : 8;
  return base + (streak >= 5 ? 10 : streak >= 3 ? 5 : 0);
}

function calcStars(correct, total) {
  const pct = correct / total;
  if (pct >= 0.85) return 3;
  if (pct >= 0.65) return 2;
  if (pct >= 0.4) return 1;
  return 0;
}

export default function PlayPhase({ onComplete, audioEnabled }) {
  const [currentWorld, setCurrentWorld] = useState(-1);
  const [is20Mode, setIs20Mode] = useState(false);
  const [worldResults, setWorldResults] = useState({});
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(5);
  const [feedback, setFeedback] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [xpPopup, setXpPopup] = useState(null);
  const [worldComplete, setWorldComplete] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const narrationRef = useRef(null);
  const [worldQuestions, setWorldQuestions] = useState([]);

  const q = worldQuestions[qIndex];

  // Voice narration for each question
  useEffect(() => {
    if (audioEnabled && q && !worldComplete && !feedback && currentWorld >= 0) {
      const timer = setTimeout(() => {
        speak(q.questionText, true);
      }, 300);
      return () => {
        clearTimeout(timer);
        stopNarration();
      };
    }
  }, [qIndex, audioEnabled, q, worldComplete, feedback, currentWorld]);

  // Launch 20 Questions Sprint (2 questions per world x 10 worlds = 20 questions)
  const start20QuestionsJourney = useCallback(() => {
    const bank = generateSessionQuestions();
    const selected20 = [];
    for (let w = 0; w < 10; w++) {
      const worldQ = bank.filter(item => item.world === w);
      selected20.push(worldQ[0], worldQ[1]);
    }
    setWorldQuestions(selected20);
    setIs20Mode(true);
    setCurrentWorld(0);
    setQIndex(0);
    setScore(0);
    setLives(5);
    setStreak(0);
    setWorldComplete(false);
    setFeedback(null);
    setAnswered(false);

    if (audioEnabled) {
      speak("Welcome to the 20 Question Time Master Journey! Let's solve all 20 challenges!", true);
    }
  }, [audioEnabled]);

  const startWorld = useCallback((worldId) => {
    const bank = generateSessionQuestions();
    const filtered = bank.filter(q => q.world === worldId);
    setWorldQuestions(filtered);
    setIs20Mode(false);
    setCurrentWorld(worldId);
    setQIndex(0);
    setScore(0);
    setLives(3);
    setStreak(0);
    setWorldComplete(false);
    setFeedback(null);
    setAnswered(false);
    narrationRef.current?.cancel();

    if (audioEnabled) {
      narrationRef.current = narrate(playWorldIntro(WORLDS[worldId].name), true);
    }
  }, [audioEnabled]);

  const finishWorld = useCallback(() => {
    const w = WORLDS[currentWorld] || { name: '20-Question Challenge' };
    const stars = calcStars(score, worldQuestions.length);
    sounds.badge();
    setWorldResults(prev => ({ ...prev, [currentWorld]: { score, total: worldQuestions.length, stars } }));
    setWorldComplete(true);

    if (audioEnabled) {
      speak(`Congratulations! You completed ${is20Mode ? 'the 20 Question Challenge' : w.name}! You scored ${score} out of ${worldQuestions.length}. Fantastic Work!`, true);
    }
  }, [currentWorld, score, worldQuestions.length, audioEnabled, is20Mode]);

  const backToMap = useCallback(() => {
    stopNarration();
    setCurrentWorld(-1);
    setIs20Mode(false);
    setWorldComplete(false);
    setFeedback(null);
  }, []);

  const handleAllComplete = useCallback(() => {
    stopNarration();
    onComplete({
      score,
      xp: totalXP,
      maxStreak,
      totalAnswered: worldQuestions.length,
      worldResults
    });
  }, [worldResults, score, totalXP, maxStreak, worldQuestions, onComplete]);

  const advance = useCallback(() => {
    setFeedback(null);
    setAnswered(false);
    if (qIndex + 1 < worldQuestions.length && lives > 0) {
      setQIndex(i => i + 1);
    } else {
      finishWorld();
    }
  }, [qIndex, worldQuestions.length, lives, finishWorld]);

  const handleAnswer = useCallback((isCorrect, attemptNum) => {
    setAnswered(true);
    stopNarration();

    if (isCorrect) {
      const ns = streak + 1;
      const earned = calcXP(attemptNum, ns);
      setScore(s => s + 1);
      setStreak(ns);
      setMaxStreak(ms => Math.max(ms, ns));
      setTotalXP(x => x + earned);
      sounds.correct();

      const messages = ["Excellent! 🌟", "Fantastic Work! 🎉", "Super Star! ✨", "Spot On! 🎯", "Brilliant! 🚀"];
      const randMsg = messages[Math.floor(Math.random() * messages.length)];

      setXpPopup(`+${earned} XP`);
      setTimeout(() => setXpPopup(null), 1500);

      setFeedback({
        type: 'success',
        title: ns >= 5 ? `🔥 ${ns} Question Streak!` : randMsg,
        message: q.explanation || "That's the correct time!",
      });

      if (audioEnabled) {
        speak(`${randMsg} ${q.explanation || ''}`, true);
      }

      setTimeout(advance, 2200);
    } else {
      setStreak(0);
      sounds.wrong();

      if (attemptNum >= 2) {
        // Lost a life after 2 failed attempts
        setLives(l => l - 1);
        setFeedback({
          type: 'error',
          title: 'Not quite right!',
          message: `The correct answer is ${q.correctAnswer}. ${q.explanation || ''}`,
        });

        if (audioEnabled) {
          speak(`The correct answer is ${q.correctAnswer}. ${q.explanation || ''}`, true);
        }

        if (lives - 1 <= 0) setTimeout(finishWorld, 2500);
        else setTimeout(advance, 2500);
      } else {
        // First failed attempt: show retry hint feedback
        setFeedback({
          type: 'hint',
          title: 'Try again! 💡',
          message: `${q.hint1 || 'Look carefully at the clock hands!'}`,
        });

        if (audioEnabled) {
          speak(`Try again! ${q.hint1 || ''}`, true);
        }

        setTimeout(() => {
          setFeedback(null);
          setAnswered(false);
        }, 2200);
      }
    }
  }, [streak, q, advance, lives, finishWorld, audioEnabled]);

  // World / Challenge Selection Map
  if (currentWorld < 0) {
    const allDone = WORLDS.every((_, i) => worldResults[i]);

    return (
      <div className="play-phase">
        <div className="play-header">
          <h2 className="play-title">🎮 <strong>Interactive Time Challenges</strong></h2>
          <p className="play-subtitle">Solve <strong>20+ interactive questions</strong> and master telling time!</p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={start20QuestionsJourney}
              style={{ boxShadow: '0 0 25px rgba(255,193,7,0.5)', animation: 'pulse 2s infinite' }}
            >
              🚀 <strong>Start 20-Question Journey!</strong>
            </button>
          </div>

          {totalXP > 0 && <div className="play-xp-badge">⭐ <strong>{totalXP} XP Earned</strong></div>}
        </div>

        {/* Individual World Map */}
        <h3 style={{ color: 'var(--gold)', margin: '20px 0 12px', fontSize: '1.3rem' }}>
          <strong>Or Select a Specific World (10 Questions Each):</strong>
        </h3>

        <div className="world-map">
          {WORLDS.map((w, i) => {
            const unlocked = i === 0 || worldResults[i - 1];
            const completed = worldResults[i];

            return (
              <div
                key={w.id}
                className={`world-card ${unlocked ? 'unlocked' : 'locked'} ${completed ? 'completed' : ''}`}
                onClick={() => unlocked && startWorld(i)}
                style={{ '--world-color': w.color }}
              >
                {!unlocked && <div className="world-lock">🔒</div>}
                <div className="world-icon">{w.icon}</div>
                <div className="world-name"><strong>{w.name}</strong></div>
                <div className="world-desc">{w.desc}</div>
                {completed && (
                  <div className="world-stars">
                    {[1, 2, 3].map(s => (<span key={s} style={{ opacity: s <= completed.stars ? 1 : 0.2 }}>⭐</span>))}
                    <span className="world-score"><strong>{completed.score}/{completed.total}</strong></span>
                  </div>
                )}
                {unlocked && !completed && <div className="world-play-btn" style={{ background: w.color }}>▶ <strong>PLAY</strong></div>}
              </div>
            );
          })}
        </div>

        {allDone && (
          <button className="btn btn-green btn-lg" onClick={handleAllComplete} style={{ marginTop: 24, animation: 'bounceIn 0.5s ease' }}>
            🏆 <strong>Complete Module Challenge!</strong>
          </button>
        )}
      </div>
    );
  }

  // World / Challenge Complete View
  if (worldComplete) {
    const w = WORLDS[currentWorld] || { name: '20-Question Challenge', icon: '🏆' };
    const stars = calcStars(score, worldQuestions.length);

    return (
      <div className="play-phase">
        <div className="world-complete-card">
          <div className="world-complete-icon">{w.icon || '🏆'}</div>
          <h2 className="world-complete-title"><strong>{is20Mode ? '20-Question Journey Complete!' : `${w.name} Complete!`}</strong></h2>
          <div className="world-complete-score"><strong>{score} / {worldQuestions.length} Correct</strong></div>

          <div className="world-complete-stars">
            {[1, 2, 3].map(s => (
              <span key={s} className={`world-star ${s <= stars ? 'earned' : ''}`} style={{ animationDelay: `${s * 0.2}s` }}>⭐</span>
            ))}
          </div>

          <div className="world-complete-xp">⭐ <strong>+{totalXP} XP Earned</strong></div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-outline btn-sm" onClick={backToMap}>← <strong>All Worlds</strong></button>
            <button className="btn btn-green btn-sm" onClick={handleAllComplete}>🏆 <strong>Finish & Reflect</strong></button>
          </div>
        </div>
      </div>
    );
  }

  // Active Question View
  if (!q) return null;
  const w = WORLDS[currentWorld] || { name: '20-Question Journey', icon: '🏆', color: 'var(--gold)' };
  const pct = Math.round((qIndex / worldQuestions.length) * 100);

  return (
    <div className="play-phase">
      {/* Header Badge */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setShowExitConfirm(true)}
          style={{ padding: '4px 12px', fontSize: '0.85rem' }}
        >
          ← Exit
        </button>
        <div className="play-world-badge" style={{ background: w.color, margin: 0 }}>
          {w.icon} <strong>{is20Mode ? `Question ${qIndex + 1} of 20` : w.name}</strong>
        </div>
      </div>

      {/* HUD Stats */}
      <div className="hud">
        <div className="hud-item">⭐ <strong>{totalXP} XP</strong></div>
        <div className="hearts">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ opacity: i < lives ? 1 : 0.2, transition: '0.3s' }}>❤️</span>
          ))}
        </div>
        <div className={`hud-item ${streak >= 3 ? 'streak-fire' : ''}`}>🔥 <strong>{streak}x</strong></div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', maxWidth: 700, marginBottom: 16 }}>
        <div className="progress-bar-container">
          <div className="progress-bar-label">
            <span><strong>Question {qIndex + 1} of {worldQuestions.length}</strong></span>
            <span><strong>{pct}%</strong></span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="question-card" style={{ animation: 'slideUp 0.3s ease' }}>
        <QuestionRenderer
          question={q}
          onAnswer={handleAnswer}
          disabled={answered}
          audioEnabled={audioEnabled}
        />
      </div>

      {/* XP Animation Popup */}
      {xpPopup && <div className="xp-popup">{xpPopup}</div>}

      {/* Feedback Popup Modal */}
      {feedback && (
        <PopupModal
          isOpen={true}
          onClose={() => setFeedback(null)}
          type={feedback.type}
          title={feedback.title}
          primaryAction={{
            label: 'Continue',
            onClick: () => { setFeedback(null); }
          }}
        >
          <p style={{ fontSize: '1.2rem', color: 'var(--white)', fontWeight: 600 }}>
            {feedback.message}
          </p>
        </PopupModal>
      )}

      {/* Exit Confirmation Modal */}
      <PopupModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        type="confirm"
        title="Exit Challenge?"
        icon="🚪"
        primaryAction={{
          label: 'Yes, Exit',
          onClick: () => {
            setShowExitConfirm(false);
            backToMap();
          }
        }}
        secondaryAction={{
          label: 'Keep Playing',
          onClick: () => setShowExitConfirm(false)
        }}
      >
        <p style={{ fontSize: '1.15rem', color: 'var(--white)' }}>
          Are you sure you want to exit? Your progress in this session will be saved.
        </p>
      </PopupModal>
    </div>
  );
}
