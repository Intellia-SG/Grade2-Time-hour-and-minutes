import { useState, useEffect, useCallback, useRef } from 'react';
import { narrate, stopNarration, preloadNarration } from '../utils/audio';
import { getStoryNarration } from '../utils/narration';

const STORY_SLIDES = [
  {
    title: "Clocktown Needs You!",
    text: "Meet Wei Ming! Wei Ming has a clock on his chest, but the hands are missing! Without them, Clocktown is frozen in time. Can you help Wei Ming restore the hands?",
    highlight: "Help Wei Ming restore the clock hands!",
    mascotText: "Let's find the missing clock hands! 🤖",
  },
  {
    title: "Meet the Hour Hand",
    text: "Wei Ming finds the short, blue hand. That is the hour hand! The hour hand is short and chubby. It points directly to the hours: one, two, three, all the way to twelve. It moves slowly!",
    highlight: "Short hand = Hour Hand",
    mascotText: "Hour hand moves slowly! 🕒",
  },
  {
    title: "Meet the Minute Hand",
    text: "Wei Ming finds the tall, red hand. That is the minute hand! The minute hand is tall and thin. It counts the minutes as they tick by. It moves faster than the hour hand!",
    highlight: "Long hand = Minute Hand",
    mascotText: "Minute hand moves fast! ⏱️",
  },
  {
    title: "Half-Past Times",
    text: "When the long minute hand points straight up at twelve, it is a brand new hour. But when it points straight down at six, it is half past the hour! That means thirty minutes have passed.",
    highlight: "Minute hand at 6 = Half Past (:30)",
    mascotText: "30 minutes have passed! ⏰",
  },
  {
    title: "Quarter Times",
    text: "We say quarter past when the minute hand points to three (fifteen minutes). When the minute hand points to nine, it is quarter to the next hour (forty-five minutes)!",
    highlight: "At 3: Quarter Past (:15) | At 9: Quarter To (:45)",
    mascotText: "Quarter past and quarter to! 🍰",
  },
  {
    title: "Ready to Go!",
    text: "Now you know the anatomy of the clock! You are ready to help Wei Ming restore Clocktown by simulating and building times yourself. Let's do it!",
    highlight: "Let's practice building times!",
    mascotText: "Ready to explore! 🚀",
  },
];

// Story images mapped by slide index (from public/images/)
const STORY_IMAGES = [
  '/images/story-1.png',
  '/images/story-2.png',
  '/images/story-3.png',
  '/images/story-4.png',
  '/images/story-5.png',
  '/images/story-6.png',
];

function StoryGraphic({ slideIndex }) {
  const src = STORY_IMAGES[slideIndex];
  return (
    <img
      src={src}
      alt={`Story slide ${slideIndex + 1}`}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '12px',
        display: 'block',
      }}
      onError={(e) => {
        e.target.style.display = 'none';
      }}
    />
  );
}

export default function StoryPhase({ onComplete, audioEnabled }) {
  const [slide, setSlide] = useState(0);
  const [anim, setAnim] = useState(false);
  const [textVis, setTextVis] = useState(false);
  const [hlVis, setHlVis] = useState(false);
  const narrationRef = useRef(null);
  const s = STORY_SLIDES[slide];
  const isLast = slide === STORY_SLIDES.length - 1;
  const pct = ((slide + 1) / STORY_SLIDES.length) * 100;

  // Preload audio segments
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
          <StoryGraphic slideIndex={slide} />
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
            <div className="speech-bubble" style={{ fontSize: '0.85rem', padding: '8px 14px', maxWidth: 180 }}>{s.mascotText}</div>
          </div>
        </div>
      </div>
      <div className="story-nav">
        <button className="btn btn-outline btn-sm" onClick={goPrev} disabled={slide === 0} style={{ opacity: slide === 0 ? 0.3 : 1 }}>← Back</button>
        <div className="story-dots">
          {STORY_SLIDES.map((_, i) => (<div key={i} className={`story-dot ${i === slide ? 'active' : i < slide ? 'completed' : ''}`} />))}
        </div>
        <button className={`btn ${isLast ? 'btn-green' : 'btn-primary'} btn-sm`} onClick={goNext} id="next-story-btn">
          {isLast ? "🚀 Let's Explore!" : 'Next →'}
        </button>
      </div>
    </div>
  );
}
