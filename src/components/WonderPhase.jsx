import { useState, useEffect, useCallback, useRef } from 'react';
import { narrate, stopNarration } from '../utils/audio';
import { wonderNarration, wonderDiscoverNarration } from '../utils/narration';

const WONDER_QUESTIONS = [
  {
    question: "Why does a clock have a short hand and a long hand? How do they work together to show the exact time?",
    subtext: "One hand moves slowly for hours, the other ticks quickly for minutes!",
    emoji: "🕒",
    bgEmojis: ["🕒", "🕒", "✨", "🔢"],
  },
  {
    question: "If the short hand is between 4 and 5, and the long hand points straight down to 6, what time is it?",
    subtext: "It is halfway past 4! We write this as 4:30.",
    emoji: "⏰",
    bgEmojis: ["⏰", "30", "🔢", "💡"],
  },
  {
    question: "We do different things in the morning and at night. How does a clock tell us if it is a.m. or p.m.?",
    subtext: "The day has 24 hours, but our clocks only go up to 12. Let's find out why!",
    emoji: "☀️",
    bgEmojis: ["☀️", "🌙", "⏰", "✨"],
  },
  {
    question: "The minute hand goes all the way around the clock face in one hour. How many minutes are in one full turn?",
    subtext: "There are 60 minutes in a whole hour, and 5 minutes between each number!",
    emoji: "⏱️",
    bgEmojis: ["⏱️", "60", "🎯", "🔢"],
  },
  {
    question: "How do we write the time in numbers? What is the secret link between analog and digital clocks?",
    subtext: "Digital clocks show the hours first, then the minutes after a colon!",
    emoji: "📟",
    bgEmojis: ["📟", "➕", "🕒", "🌟"],
  },
];

export default function WonderPhase({ onComplete, audioEnabled }) {
  const [wonder] = useState(() => WONDER_QUESTIONS[Math.floor(Math.random() * WONDER_QUESTIONS.length)]);
  const [stage, setStage] = useState(0);
  const [particles, setParticles] = useState([]);
  const narrationRef = useRef(null);

  useEffect(() => {
    const p = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: wonder.bgEmojis[i % wonder.bgEmojis.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 12,
      size: 1.2 + Math.random() * 1.5,
    }));
    setParticles(p);
  }, [wonder]);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 300);
    const t2 = setTimeout(() => setStage(2), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (stage === 1 && audioEnabled) {
      narrationRef.current = narrate(
        wonderNarration(wonder.question, wonder.subtext),
        true
      );
    }
    return () => {
      narrationRef.current?.cancel();
    };
  }, [stage, wonder.question, wonder.subtext, audioEnabled]);

  const handleDiscover = useCallback(() => {
    narrationRef.current?.cancel();
    stopNarration();
    if (audioEnabled) {
      const n = narrate(wonderDiscoverNarration(), true);
      n.promise.then(() => onComplete());
      setTimeout(() => onComplete(), 3000);
    } else {
      setTimeout(() => onComplete(), 600);
    }
  }, [onComplete, audioEnabled]);

  return (
    <div className="wonder-phase">
      <div className="wonder-particles">
        {particles.map(p => (
          <span key={p.id} className="wonder-particle" style={{
            left: `${p.x}%`, top: `${p.y}%`,
            animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`,
            fontSize: `${p.size}rem`,
          }}>{p.emoji}</span>
        ))}
      </div>
      <div className="wonder-content">
        <div className={`wonder-qmark ${stage >= 1 ? 'revealed' : ''}`}>
          <span className="wonder-qmark-icon">?</span>
          <div className="wonder-qmark-glow" />
        </div>
        <div className={`wonder-mascot ${stage >= 1 ? 'visible' : ''}`}>
          <div className="mascot thinking">🤖</div>
          <div className="speech-bubble wonder-bubble">Hmm... I wonder... 🤔</div>
        </div>
        <div className={`wonder-question-card ${stage >= 1 ? 'visible' : ''}`}>
          <div className="wonder-emoji">{wonder.emoji}</div>
          <h2 className="wonder-question-text">{wonder.question}</h2>
          <p className="wonder-subtext">{wonder.subtext}</p>
        </div>
        <button className={`btn btn-wonder ${stage >= 2 ? 'visible' : ''}`} onClick={handleDiscover} id="discover-btn">
          <span className="wonder-btn-sparkle">✨</span>
          Let's Discover!
          <span className="wonder-btn-sparkle">✨</span>
        </button>
      </div>
    </div>
  );
}
