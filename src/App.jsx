import { useState, useCallback, useEffect } from 'react';
import { stopNarration } from './utils/audio';
import FloatingNumbers from './components/FloatingNumbers';
import IntroScreen from './components/IntroScreen';
import WonderPhase from './components/WonderPhase';
import StoryPhase from './components/StoryPhase';
import SimulatePhase from './components/SimulatePhase';
import PlayPhase from './components/PlayPhase';
import ReflectPhase from './components/ReflectPhase';
import PopupModal from './components/PopupModal';

const PHASES = ['intro', 'wonder', 'story', 'simulate', 'play', 'reflect'];
const JOURNEY_ITEMS = [
  { icon: '🔍', label: 'Wonder' },
  { icon: '📖', label: 'Story' },
  { icon: '🧪', label: 'Simulate' },
  { icon: '🎮', label: 'Play' },
  { icon: '📓', label: 'Reflect' },
];

export default function App() {
  const [phase, setPhase] = useState('intro');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [playStats, setPlayStats] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => {
      if (prev) stopNarration();
      return !prev;
    });
  }, []);

  const handleHomeClick = useCallback(() => {
    if (phase !== 'intro') {
      setShowExitConfirm(true);
    } else {
      stopNarration();
      setPhase('intro');
    }
  }, [phase]);

  const confirmGoHome = useCallback(() => {
    setShowExitConfirm(false);
    stopNarration();
    setPhase('intro');
    setPlayStats(null);
  }, []);

  const restart = useCallback(() => {
    stopNarration();
    setPhase('wonder');
    setPlayStats(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopNarration();
  }, []);

  const phaseIndex = PHASES.indexOf(phase);
  const showJourney = phase !== 'intro';

  return (
    <>
      <FloatingNumbers />
      <div className="app-container">
        {/* Sound / Audio Toggle */}
        <button
          className={`audio-toggle-btn ${phase === 'intro' ? 'home-speaker' : ''}`}
          onClick={toggleAudio}
          title={audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
          aria-label="Toggle Sound"
        >
          {audioEnabled ? '🔊' : '🔇'}
        </button>

        {/* Home Button */}
        {showJourney && (
          <button className="home-btn" onClick={handleHomeClick}>
            Home 🏠
          </button>
        )}

        {/* Journey Progress Bar */}
        {showJourney && (
          <div className="journey-bar">
            {JOURNEY_ITEMS.map((item, i) => {
              const stepPhaseIndex = i + 1; // wonder=1, story=2, etc.
              const isActive = phaseIndex === stepPhaseIndex;
              const isCompleted = phaseIndex > stepPhaseIndex;
              return (
                <div key={i} className="journey-step-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                  <div className={`journey-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                    <div className="journey-step-dot">{isCompleted ? '✓' : item.icon}</div>
                    <div className="journey-step-label"><strong>{item.label}</strong></div>
                  </div>
                  {i < JOURNEY_ITEMS.length - 1 && (
                    <div className={`journey-connector ${phaseIndex > stepPhaseIndex ? 'filled' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Phase Content */}
        {phase === 'intro' && (
          <IntroScreen
            onStart={() => setPhase('wonder')}
            audioEnabled={audioEnabled}
          />
        )}

        {phase === 'wonder' && (
          <WonderPhase
            onComplete={() => setPhase('story')}
            audioEnabled={audioEnabled}
          />
        )}

        {phase === 'story' && (
          <StoryPhase
            onComplete={() => setPhase('simulate')}
            audioEnabled={audioEnabled}
          />
        )}

        {phase === 'simulate' && (
          <SimulatePhase
            onComplete={() => setPhase('play')}
            audioEnabled={audioEnabled}
          />
        )}

        {phase === 'play' && (
          <PlayPhase
            onComplete={(stats) => { setPlayStats(stats); setPhase('reflect'); }}
            audioEnabled={audioEnabled}
          />
        )}

        {phase === 'reflect' && (
          <ReflectPhase
            results={playStats}
            onComplete={restart}
            audioEnabled={audioEnabled}
          />
        )}

        {/* Home / Exit Confirmation Popup Modal */}
        <PopupModal
          isOpen={showExitConfirm}
          onClose={() => setShowExitConfirm(false)}
          type="confirm"
          title="Return to Home?"
          icon="🏠"
          primaryAction={{
            label: 'Yes, Go Home',
            onClick: confirmGoHome
          }}
          secondaryAction={{
            label: 'Continue Journey',
            onClick: () => setShowExitConfirm(false)
          }}
        >
          <p style={{ fontSize: '1.15rem', color: 'var(--white)' }}>
            Are you sure you want to return to the Intro screen? Your current journey progress will be reset.
          </p>
        </PopupModal>
      </div>
    </>
  );
}
