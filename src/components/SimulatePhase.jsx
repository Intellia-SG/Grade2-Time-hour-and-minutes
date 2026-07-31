import React, { useState, useCallback, useEffect, useRef } from 'react';
import { narrate, stopNarration, sounds } from '../utils/audio';
import { celebrate, cheer } from '../utils/audio';
import AnalogClock from './AnalogClock';
import { formatDigital, formatSpeechTime } from '../utils/questionBank';
import { simulateStation1Intro, simulateStation2Intro, simulateStation3Intro } from '../utils/narration';

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const STATIONS = [
  { id: 0, title: 'Set the Clock', subtitle: 'Interactive Hands', icon: '🕒' },
  { id: 1, title: 'Spot the Time', subtitle: 'Digital Matching', icon: '👁️' },
  { id: 2, title: 'Type the Digital', subtitle: 'Number Sentence', icon: '📝' },
];

const PRESETS = [
  { h: 3, m: 0 },
  { h: 6, m: 30 },
  { h: 9, m: 15 },
  { h: 12, m: 45 },
  { h: 4, m: 30 },
  { h: 10, m: 0 },
  { h: 1, m: 15 },
  { h: 7, m: 45 },
];

// ═══════════════════════════════════════════════════
// STATION 1: Set the Clock (Interactive)
// ═══════════════════════════════════════════════════
function Station1({ audioEnabled, onNext }) {
  const [targetTime, setTargetTime] = useState({ h: 12, m: 0 });
  const [currentHour, setCurrentHour] = useState(12);
  const [currentMin, setCurrentMin] = useState(0);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const narRef = useRef(null);

  useEffect(() => {
    const preset = PRESETS[randInt(0, PRESETS.length - 1)];
    setTargetTime(preset);
    let sh = (preset.h + 4) % 12 || 12;
    let sm = (preset.m + 25) % 60;
    setCurrentHour(sh);
    setCurrentMin(sm);
    setDone(false);
    setShowHint(false);
  }, [round]);

  useEffect(() => {
    if (audioEnabled && targetTime.h > 0) {
      narRef.current = narrate(simulateStation1Intro(), true);
    }
    return () => { narRef.current?.cancel(); };
  }, [targetTime, audioEnabled]);

  const checkMatch = (h, m) => {
    if (h === targetTime.h && m === targetTime.m) {
      setDone(true);
      sounds.correct();
      narRef.current?.cancel();
      if (audioEnabled) {
        narRef.current = narrate([
          celebrate(`Fantastic! You set the clock to ${formatSpeechTime(targetTime.h, targetTime.m)}!`),
          cheer("Way to go!")
        ], true);
      }
    }
  };

  const handleClockChange = (h, m) => {
    if (done) return;
    setCurrentHour(h);
    setCurrentMin(m);
    checkMatch(h, m);
  };

  const adjustHour = (amt) => {
    if (done) return;
    sounds.click();
    let newH = currentHour + amt;
    if (newH > 12) newH = 1;
    if (newH < 1) newH = 12;
    setCurrentHour(newH);
    checkMatch(newH, currentMin);
  };

  const adjustMin = (amt) => {
    if (done) return;
    sounds.click();
    let newM = currentMin + amt;
    if (newM >= 60) newM = 0;
    if (newM < 0) newM = 55;
    setCurrentMin(newM);
    checkMatch(currentHour, newM);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>🕒 <strong>Set the Clock</strong></h2></div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        Set the analog clock to: <strong style={{ color: 'var(--gold)', fontSize: '1.3rem' }}>{formatDigital(targetTime.h, targetTime.m)}</strong> (<strong>{formatSpeechTime(targetTime.h, targetTime.m)}</strong>)
      </p>

      {/* Interactive Clock */}
      <div style={{ margin: '20px 0' }}>
        <AnalogClock
          hour={currentHour}
          minute={currentMin}
          mode="interactive"
          onChange={handleClockChange}
          size={220}
          snapTo5Min={true}
        />
      </div>

      {/* Adjuster controls */}
      {!done && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={() => adjustHour(-1)}><strong>Hour -</strong></button>
          <button className="btn btn-outline btn-sm" onClick={() => adjustHour(1)}><strong>Hour +</strong></button>
          <button className="btn btn-outline btn-sm" onClick={() => adjustMin(-5)}><strong>Min -5</strong></button>
          <button className="btn btn-outline btn-sm" onClick={() => adjustMin(5)}><strong>Min +5</strong></button>
          <button className="btn btn-outline btn-sm" onClick={() => setShowHint(!showHint)}>💡 <strong>Hint</strong></button>
        </div>
      )}

      {showHint && !done && (
        <div className="simulate-tip" style={{ maxWidth: 450, margin: '0 auto 16px' }}>
          💡 Point short hand to <strong>{targetTime.h}</strong> and long hand to <strong>{targetTime.m === 0 ? '12 (00 min)' : targetTime.m / 5 + ' (' + targetTime.m + ' min)'}</strong>.
        </div>
      )}

      <div style={{ fontSize: '1.15rem', marginBottom: 16 }}>
        Your clock says: <strong style={{ color: done ? 'var(--green-light)' : 'var(--coral)' }}>{formatDigital(currentHour, currentMin)}</strong>
      </div>

      {done && (
        <div style={{ animation: 'bounceIn 0.5s', marginTop: 12 }}>
          <div className="group-diagram-label" style={{ color: 'var(--green-light)', fontSize: '1.25rem', fontWeight: 'bold' }}>
            🎉 <strong>Correct! Clock is matched!</strong>
          </div>
          <button className={`btn ${round < 2 ? 'btn-outline' : 'btn-primary'}`} style={{ marginTop: 16 }} onClick={() => round < 2 ? setRound(r => r + 1) : onNext()}>
            <strong>{round < 2 ? 'Try Another →' : 'Next Station →'}</strong>
          </button>
        </div>
      )}
      <div style={{ marginTop: 16, fontSize: '0.85rem', color: 'var(--text-muted)' }}><strong>Round {Math.min(round + 1, 3)} / 3</strong></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// STATION 2: Spot the Time (Pictorial Match)
// ═══════════════════════════════════════════════════
function Station2({ audioEnabled, onNext }) {
  const [targetTime, setTargetTime] = useState({ h: 12, m: 0 });
  const [options, setOptions] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [round, setRound] = useState(0);
  const narRef = useRef(null);

  useEffect(() => {
    const preset = PRESETS[randInt(0, PRESETS.length - 1)];
    setTargetTime(preset);
    
    // Distractors
    const correctStr = formatDigital(preset.h, preset.m);
    const d1 = formatDigital(preset.h === 12 ? 1 : preset.h + 1, preset.m);
    const d2 = formatDigital(preset.h, (preset.m + 30) % 60);
    const d3 = formatDigital(preset.h === 1 ? 12 : preset.h - 1, preset.m === 0 ? 30 : 0);
    
    const rawOptions = [correctStr, d1, d2, d3];
    // Remove duplicates if any
    const uniqueOptions = Array.from(new Set(rawOptions));
    while (uniqueOptions.length < 4) {
      const rh = randInt(1, 12);
      const rm = pick([0, 15, 30, 45]);
      uniqueOptions.push(formatDigital(rh, rm));
    }
    
    // Shuffle
    const shuffled = [...uniqueOptions].sort(() => Math.random() - 0.5);
    setOptions(shuffled);
    setAnswered(false);
    setSelectedIdx(null);
  }, [round]);

  useEffect(() => {
    if (audioEnabled && targetTime.h > 0) {
      narRef.current = narrate(simulateStation2Intro(), true);
    }
    return () => { narRef.current?.cancel(); };
  }, [targetTime, audioEnabled]);

  const handleSelect = (idx, opt) => {
    if (answered) return;
    setSelectedIdx(idx);
    setAnswered(true);
    
    const correctStr = formatDigital(targetTime.h, targetTime.m);
    if (opt === correctStr) {
      sounds.correct();
      narRef.current?.cancel();
      if (audioEnabled) {
        narRef.current = narrate([cheer("Excellent! That matches the clock!")], true);
      }
    } else {
      sounds.wrong();
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>👁️ Spot the Time</h2></div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        What digital time matches this analog clock? Tap to choose!
      </p>

      <div style={{ margin: '24px 0' }}>
        <AnalogClock hour={targetTime.h} minute={targetTime.m} mode="display" size={200} />
      </div>

      <div className="options-grid" style={{ maxWidth: 450, margin: '0 auto' }}>
        {options.map((opt, idx) => {
          const correctStr = formatDigital(targetTime.h, targetTime.m);
          let cls = 'option-btn';
          if (answered) {
            if (opt === correctStr) cls += ' correct';
            else if (idx === selectedIdx) cls += ' wrong';
            else cls += ' disabled';
          }
          return (
            <button key={idx} className={cls} onClick={() => handleSelect(idx, opt)} disabled={answered}>
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div style={{ marginTop: 20, animation: 'bounceIn 0.5s' }}>
          <button className={`btn ${round < 2 ? 'btn-outline' : 'btn-primary'}`} onClick={() => round < 2 ? setRound(r => r + 1) : onNext()}>
            {round < 2 ? 'Try Another →' : 'Next Station →'}
          </button>
        </div>
      )}
      <div style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Round {Math.min(round + 1, 3)} / 3</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// STATION 3: Type the Digital (Numeric Entry)
// ═══════════════════════════════════════════════════
function Station3({ audioEnabled, onComplete }) {
  const [targetTime, setTargetTime] = useState({ h: 12, m: 0 });
  const [focusedField, setFocusedField] = useState('hour'); // 'hour' | 'minute'
  const [hourInput, setHourInput] = useState('');
  const [minInput, setMinInput] = useState('');
  const [round, setRound] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const narRef = useRef(null);

  useEffect(() => {
    const preset = PRESETS[randInt(0, PRESETS.length - 1)];
    setTargetTime(preset);
    setHourInput('');
    setMinInput('');
    setFocusedField('hour');
    setShowHint(false);
    setDone(false);
  }, [round]);

  useEffect(() => {
    if (audioEnabled && targetTime.h > 0) {
      narRef.current = narrate(simulateStation3Intro(), true);
    }
    return () => { narRef.current?.cancel(); };
  }, [targetTime, audioEnabled]);

  const handleNumClick = (val) => {
    if (done) return;
    sounds.click();

    if (focusedField === 'hour') {
      const nextHour = hourInput + val;
      if (nextHour.length <= 2) {
        setHourInput(nextHour);
        // Auto-switch to minutes if they typed a valid 2-digit hour or typed the single-digit 3-9
        if (nextHour.length === 2 || parseInt(nextHour) > 1) {
          setFocusedField('minute');
        }
      }
    } else {
      const nextMin = minInput + val;
      if (nextMin.length <= 2) {
        setMinInput(nextMin);
        if (nextMin.length === 2) {
          // Both fields entered, auto-verify
          verifyTime(hourInput, nextMin);
        }
      }
    }
  };

  const handleBackspace = () => {
    sounds.click();
    if (focusedField === 'minute') {
      if (minInput.length > 0) {
        setMinInput(minInput.slice(0, -1));
      } else {
        setFocusedField('hour');
        if (hourInput.length > 0) {
          setHourInput(hourInput.slice(0, -1));
        }
      }
    } else {
      if (hourInput.length > 0) {
        setHourInput(hourInput.slice(0, -1));
      }
    }
  };

  const verifyTime = (hStr, mStr) => {
    const h = parseInt(hStr);
    const m = parseInt(mStr);
    
    if (h === targetTime.h && m === targetTime.m) {
      setDone(true);
      sounds.correct();
      narRef.current?.cancel();
      if (audioEnabled) {
        narRef.current = narrate([celebrate(`Perfect! ${formatDigital(targetTime.h, targetTime.m)} matches exactly.`)], true);
      }
    } else {
      sounds.wrong();
      // Clear inputs with brief delay
      setTimeout(() => {
        setHourInput('');
        setMinInput('');
        setFocusedField('hour');
      }, 800);
    }
  };

  const handleComplete = () => {
    narRef.current?.cancel();
    stopNarration();
    onComplete();
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>📝 Type the Digital</h2></div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        Look at the clock face. Type the digital hours and minutes!
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
        <AnalogClock hour={targetTime.h} minute={targetTime.m} mode="display" size={180} />
        
        {/* Digital Input Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            onClick={() => !done && setFocusedField('hour')}
            className={`blank-input ${focusedField === 'hour' ? 'active' : ''} ${done ? 'correct' : hourInput ? 'filled' : ''}`}
            style={{ cursor: done ? 'default' : 'pointer', borderStyle: focusedField === 'hour' && !done ? 'solid' : 'dashed' }}
          >
            {hourInput || (done ? targetTime.h : '?')}
          </div>
          <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--gold)' }}>:</span>
          <div
            onClick={() => !done && setFocusedField('minute')}
            className={`blank-input ${focusedField === 'minute' ? 'active' : ''} ${done ? 'correct' : minInput ? 'filled' : ''}`}
            style={{ cursor: done ? 'default' : 'pointer', borderStyle: focusedField === 'minute' && !done ? 'solid' : 'dashed' }}
          >
            {minInput || (done ? String(targetTime.m).padStart(2, '0') : '??')}
          </div>
        </div>
      </div>

      <button className="btn btn-sm btn-outline" onClick={() => setShowHint(!showHint)} style={{ marginBottom: 16 }}>
        {showHint ? 'Hide Hint' : 'Show Hint 💡'}
      </button>

      {showHint && (
        <div className="simulate-tip" style={{ maxWidth: 400, margin: '0 auto 16px' }}>
          💡 The hour hand points to <strong>{targetTime.h}</strong>. The minute hand at <strong>{targetTime.m === 0 ? '12' : targetTime.m / 5}</strong> is <strong>{targetTime.m}</strong> minutes!
        </div>
      )}

      {/* Number Pad */}
      {!done && (
        <div className="number-pad">
          {[1,2,3,4,5,6,7,8,9,0].map(n => (
            <button key={n} className="num-pad-btn" onClick={() => handleNumClick(String(n))}>
              {n}
            </button>
          ))}
          <button className="num-pad-btn" onClick={handleBackspace} style={{ gridColumn: 'span 2' }}>⌫ Back</button>
        </div>
      )}

      {done && (
        <div style={{ marginTop: 24, animation: 'bounceIn 0.5s' }}>
          {round < 2 ? (
            <button className="btn btn-outline" onClick={() => setRound(r => r + 1)}>Try Another →</button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleComplete}>🎉 Complete Simulation!</button>
          )}
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Round {Math.min(round + 1, 3)} / 3</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Main SimulatePhase Component
// ═══════════════════════════════════════════════════
export default function SimulatePhase({ onComplete, audioEnabled }) {
  const [station, setStation] = useState(0);
  const nextStation = useCallback(() => { if (station < 2) setStation(s => s + 1); }, [station]);

  return (
    <div className="simulate-phase">
      <div className="simulate-header">
        <h3 className="simulate-label">🧪 Simulate</h3>
        <p className="simulate-sublabel">Explore and practice — no wrong answers!</p>
      </div>
      <div className="progress-dots">
        {STATIONS.map((s, i) => (
          <div key={i} className="simulate-dot-wrapper">
            <div className={`progress-dot ${i === station ? 'active' : i < station ? 'completed' : ''}`} />
            <span className="simulate-dot-label">{s.icon}</span>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ maxWidth: 800, width: '100%', animation: 'slideUp 0.4s ease' }}>
        {station === 0 && <Station1 audioEnabled={audioEnabled} onNext={nextStation} />}
        {station === 1 && <Station2 audioEnabled={audioEnabled} onNext={nextStation} />}
        {station === 2 && <Station3 audioEnabled={audioEnabled} onComplete={onComplete} />}
      </div>
    </div>
  );
}
