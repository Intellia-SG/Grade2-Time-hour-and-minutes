import { useState, useEffect, useCallback, useRef } from 'react';
import { narrate, stopNarration, preloadNarration } from '../utils/audio';
import { getStoryNarration } from '../utils/narration';

const STORY_SLIDES = [
  {
    image: '/images/story_strawberries.png',
    title: "Mia's Strawberries",
    text: 'Mia has twelve strawberries. She wants to put the same number on every plate. Can she do it? How many strawberries will go on each plate?',
    highlight: '"Can we share them equally?"',
    mascotText: "Let's find out what equal groups means! 🍓",
  },
  {
    image: '/images/story_hawker.png',
    title: "At the Hawker Centre",
    text: 'Wei Ming visits the hawker centre with his family. There are three tables. Each table has four bowls of noodles. Every table gets the same number of bowls. That is what we call equal groups!',
    highlight: '"Same number in each group = Equal groups!"',
    mascotText: "Equal means the same! 🍜",
  },
  {
    image: '/images/story_counting.png',
    title: "Counting by Groups",
    text: 'Three groups of four. Count with me: four, eight, twelve. Altogether equals twelve! When every group has the same number, we call them equal groups.',
    highlight: '"4 + 4 + 4 = 12"',
    mascotText: "That is repeated addition! ➕",
  },
  {
    image: '/images/story_sharing.png',
    title: "Fair Sharing",
    text: "Now Wei Ming's family shares ten apples equally into five bags. Each bag gets two apples. Fair sharing means equal groups!",
    highlight: '"10 shared into 5 groups = 2 each"',
    mascotText: "Equal sharing is division! ➗",
  },
  {
    image: '/images/story_multiply.png',
    title: "Multiply & Divide",
    text: 'Equal groups help us multiply. Three groups of four means four plus four plus four. That is called repeated addition! And when we share equally, that is the start of division!',
    highlight: '"Repeated addition → Multiplication!"',
    mascotText: "You are learning so fast! 🚀",
  },
  {
    image: '/images/story_practice.png',
    title: "Your Turn!",
    text: 'Now you know what equal groups are! When every group has the same number, we can count them quickly with equal groups. Let us practice making equal groups ourselves!',
    highlight: '"Equal groups — here we go!"',
    mascotText: "Ready to explore! ✨",
  },
];

export default function StoryPhase({ onComplete, audioEnabled }) {
  const [slide, setSlide] = useState(0);
  const [anim, setAnim] = useState(false);
  const [textVis, setTextVis] = useState(false);
  const [hlVis, setHlVis] = useState(false);
  const narrationRef = useRef(null);
  const s = STORY_SLIDES[slide];
  const isLast = slide === STORY_SLIDES.length - 1;
  const pct = ((slide + 1) / STORY_SLIDES.length) * 100;

  // Preload audio
  useEffect(() => {
    if (audioEnabled) {
      preloadNarration(getStoryNarration(slide));
      if (slide + 1 < STORY_SLIDES.length) {
        preloadNarration(getStoryNarration(slide + 1));
      }
    }
  }, [slide, audioEnabled]);

  useEffect(() => {
    setTextVis(false); setHlVis(false);
    const t1 = setTimeout(() => setTextVis(true), 100);
    const t2 = setTimeout(() => setHlVis(true), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [slide]);

  useEffect(() => {
    if (textVis && audioEnabled) {
      narrationRef.current?.cancel();
      narrationRef.current = narrate(getStoryNarration(slide), true);
    }
    return () => { narrationRef.current?.cancel(); };
  }, [textVis, slide, audioEnabled]);

  const goNext = useCallback(() => {
    if (anim) return;
    narrationRef.current?.cancel();
    stopNarration();
    setAnim(true);
    setTimeout(() => { isLast ? onComplete() : setSlide(i => i + 1); setAnim(false); }, 400);
  }, [anim, isLast, onComplete]);

  const goPrev = useCallback(() => {
    if (anim || slide === 0) return;
    narrationRef.current?.cancel();
    stopNarration();
    setAnim(true);
    setTimeout(() => { setSlide(i => i - 1); setAnim(false); }, 400);
  }, [anim, slide]);

  return (
    <div className="story-phase">
      <div className="story-progress">
        <div className="story-progress-bar"><div className="story-progress-fill" style={{ width: `${pct}%` }} /></div>
        <span className="story-progress-label">{slide + 1} / {STORY_SLIDES.length}</span>
      </div>
      <div className={`story-card ${anim ? 'flipping' : ''}`}>
        <div className="story-image-section">
          <img src={s.image} alt={s.title} className="story-image" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="story-image-overlay" />
        </div>
        <div className="story-text-section">
          <h2 className="story-title">{s.title}</h2>
          <p className={`story-text ${textVis ? 'revealed' : ''}`}>{s.text}</p>
          <div className={`story-highlight ${hlVis ? 'visible' : ''}`}>
            <span>✨</span><span className="story-highlight-text">{s.highlight}</span><span>✨</span>
          </div>
          <div className="story-mascot">
            <div className="mascot" style={{ width: 50, height: 50, fontSize: '1.4rem' }}>🤖</div>
            <div className="speech-bubble" style={{ fontSize: '0.8rem', padding: '8px 14px', maxWidth: 180 }}>{s.mascotText}</div>
          </div>
        </div>
      </div>
      <div className="story-nav">
        <button className="btn btn-outline btn-sm" onClick={goPrev} disabled={slide === 0} style={{ opacity: slide === 0 ? 0.3 : 1 }}>← Back</button>
        <div className="story-dots">
          {STORY_SLIDES.map((_, i) => (<div key={i} className={`story-dot ${i === slide ? 'active' : i < slide ? 'completed' : ''}`} />))}
        </div>
        <button className={`btn ${isLast ? 'btn-green' : 'btn-primary'} btn-sm`} onClick={goNext}>
          {isLast ? "🚀 Let's Explore!" : 'Next →'}
        </button>
      </div>
    </div>
  );
}
