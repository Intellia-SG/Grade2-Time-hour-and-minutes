import React, { useState, useCallback, useEffect, useRef } from 'react';
import { narrate, stopNarration, sounds } from '../utils/audio';
import { celebrate, cheer, say } from '../utils/audio';
import EqualGroupDiagram from './EqualGroupDiagram';
import { simulateStation1Intro, simulateStation2Intro, simulateStation3Intro } from '../utils/narration';

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const STATIONS = [
  { id: 0, title: 'Build Groups', subtitle: 'Concrete Grouping', icon: '🍓' },
  { id: 1, title: 'Spot Equal', subtitle: 'Pictorial Recognition', icon: '👁️' },
  { id: 2, title: 'Number Sentence', subtitle: 'Abstract Math', icon: '📝' },
];

// ═══════════════════════════════════════════════════
// STATION 1: Build Equal Groups (Concrete)
// ═══════════════════════════════════════════════════
function Station1({ audioEnabled, onNext }) {
  const [numGroups, setNumGroups] = useState(0);
  const [groupSize, setGroupSize] = useState(0);
  const [groups, setGroups] = useState([]);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  const narRef = useRef(null);
  const emoji = '🍓';

  useEffect(() => {
    const ng = randInt(2, 4);
    const gs = randInt(2, 4);
    setNumGroups(ng);
    setGroupSize(gs);
    setGroups(Array(ng).fill(0));
    setDone(false);
  }, [round]);

  useEffect(() => {
    if (audioEnabled && numGroups > 0) {
      narRef.current = narrate(simulateStation1Intro(), true);
    }
    return () => { narRef.current?.cancel(); };
  }, [numGroups, audioEnabled]);

  const handleAddToGroup = (gi) => {
    if (done) return;
    if (groups[gi] >= groupSize) return;
    sounds.click();
    const newGroups = [...groups];
    newGroups[gi]++;
    setGroups(newGroups);

    // Check if all groups are full
    if (newGroups.every(g => g === groupSize)) {
      setDone(true);
      sounds.correct();
      narRef.current?.cancel();
      if (audioEnabled) {
        narRef.current = narrate([
          celebrate(`${numGroups} groups of ${groupSize} is ${numGroups * groupSize}!`),
          cheer("You made equal groups!")
        ], true);
      }
    }
  };

  const totalPlaced = groups.reduce((a, b) => a + b, 0);
  const totalNeeded = numGroups * groupSize;

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>🍓 Build Equal Groups</h2></div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        Put <strong style={{ color: 'var(--gold)' }}>{groupSize}</strong> {emoji} in each of the{' '}
        <strong style={{ color: 'var(--coral)' }}>{numGroups}</strong> groups. Tap a circle to add!
      </p>

      {/* Group Circles */}
      <div className="group-circles-area">
        {groups.map((count, gi) => (
          <div key={gi}
               className={`group-circle ${count < groupSize ? 'highlight' : 'complete'}`}
               onClick={() => handleAddToGroup(gi)}>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
              {Array(count).fill(0).map((_, i) => (
                <span key={i} style={{ fontSize: '1.4rem', animation: 'dotCountUp 0.3s ease' }}>{emoji}</span>
              ))}
            </div>
            <div className="group-circle-counter">{count}/{groupSize}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
        Placed: {totalPlaced} / {totalNeeded}
      </p>

      {done && (
        <div style={{ animation: 'bounceIn 0.5s' }}>
          <div className="group-diagram-label">
            {numGroups} groups of {groupSize} = {totalNeeded} 🎉
          </div>
          <div style={{ margin: '16px 0' }}>
            <EqualGroupDiagram numGroups={numGroups} groupSize={groupSize} objectEmoji={emoji} animated={true} size="small" />
          </div>
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
// STATION 2: Spot Equal Groups (Pictorial)
// ═══════════════════════════════════════════════════
function Station2({ audioEnabled, onNext }) {
  const [round, setRound] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const narRef = useRef(null);

  // Generate arrangements: one equal, others unequal
  const [arrangements, setArrangements] = useState([]);
  const [correctIdx, setCorrectIdx] = useState(0);

  useEffect(() => {
    const ng = randInt(2, 4);
    const gs = randInt(2, 5);
    // Equal arrangement
    const equalArr = { groups: Array(ng).fill(gs), label: `${ng} × ${gs}`, isEqual: true };
    // Unequal arrangements
    const unequalArrs = [
      { groups: Array.from({ length: ng }, (_, i) => i === 0 ? gs + 1 : gs), label: 'Unequal A', isEqual: false },
      { groups: Array.from({ length: ng }, (_, i) => i === ng - 1 ? gs - 1 : gs), label: 'Unequal B', isEqual: false },
      { groups: [...Array(ng - 1).fill(gs), gs + 2], label: 'Unequal C', isEqual: false },
    ];
    const shuffled = [equalArr, ...unequalArrs.slice(0, 3)].sort(() => Math.random() - 0.5);
    setArrangements(shuffled);
    setCorrectIdx(shuffled.findIndex(a => a.isEqual));
    setAnswered(false);
    setSelectedIdx(null);
  }, [round]);

  useEffect(() => {
    if (audioEnabled && arrangements.length > 0) {
      narRef.current = narrate(simulateStation2Intro(), true);
    }
    return () => { narRef.current?.cancel(); };
  }, [arrangements, audioEnabled]);

  const handleSelect = (idx) => {
    if (answered) return;
    setSelectedIdx(idx);
    setAnswered(true);
    if (idx === correctIdx) {
      sounds.correct();
      narRef.current?.cancel();
      if (audioEnabled) {
        narRef.current = narrate([celebrate("That is the equal group!")], true);
      }
    } else {
      sounds.wrong();
    }
  };

  const emoji = '⭐';

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>👁️ Spot the Equal Group</h2></div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        Which arrangement shows <strong style={{ color: 'var(--gold)' }}>equal groups</strong>? Tap to choose!
      </p>

      <div className="arrangement-grid">
        {arrangements.map((arr, idx) => (
          <div key={idx}
               className={`arrangement-card ${answered && idx === correctIdx ? 'correct-reveal' : ''} ${answered && idx === selectedIdx && idx !== correctIdx ? 'wrong-reveal' : ''} ${selectedIdx === idx && !answered ? 'selected' : ''}`}
               onClick={() => handleSelect(idx)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              {arr.groups.map((count, gi) => (
                <div key={gi} style={{ display: 'flex', gap: 4, padding: '4px 8px', background: 'rgba(255,255,255,0.08)', borderRadius: 8 }}>
                  {Array(count).fill(0).map((_, i) => (
                    <span key={i} style={{ fontSize: '1.1rem' }}>{emoji}</span>
                  ))}
                </div>
              ))}
            </div>
            {answered && idx === correctIdx && <div style={{ color: 'var(--green)', fontSize: '0.8rem', marginTop: 8, fontWeight: 700 }}>✅ Equal!</div>}
          </div>
        ))}
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
// STATION 3: Number Sentence (Abstract)
// ═══════════════════════════════════════════════════
function Station3({ audioEnabled, onComplete }) {
  const [numGroups, setNumGroups] = useState(0);
  const [groupSize, setGroupSize] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [round, setRound] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const narRef = useRef(null);

  useEffect(() => {
    const ng = randInt(2, 5);
    const gs = randInt(2, 5);
    setNumGroups(ng);
    setGroupSize(gs);
    setInputVal('');
    setShowHint(false);
    setDone(false);
  }, [round]);

  useEffect(() => {
    if (audioEnabled && numGroups > 0) {
      narRef.current = narrate(simulateStation3Intro(), true);
    }
    return () => { narRef.current?.cancel(); };
  }, [numGroups, audioEnabled]);

  const total = numGroups * groupSize;

  const handleNumClick = (n) => {
    if (done) return;
    const newVal = inputVal + n;
    setInputVal(newVal);
    sounds.click();

    if (parseInt(newVal) === total) {
      setDone(true);
      sounds.correct();
      narRef.current?.cancel();
      if (audioEnabled) {
        narRef.current = narrate([celebrate(`Yes! ${numGroups} groups of ${groupSize} equals ${total}!`)], true);
      }
    } else if (newVal.length >= String(total).length) {
      sounds.wrong();
      setTimeout(() => setInputVal(''), 500);
    }
  };

  const handleComplete = () => { narRef.current?.cancel(); stopNarration(); onComplete(); };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>📝 Number Sentence</h2></div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
        Fill in the blank! Use the number pad.
      </p>

      <div className="sentence-row">
        <span className="given-value">{numGroups}</span>
        <span className="sentence-label">groups of</span>
        <span className="given-value">{groupSize}</span>
        <span className="sentence-equals">=</span>
        <div className={`blank-input ${done ? 'correct' : inputVal ? 'filled' : ''}`}>
          {inputVal || (done ? total : '?')}
        </div>
      </div>

      <button className="btn btn-sm btn-outline" onClick={() => setShowHint(!showHint)} style={{ marginBottom: 24 }}>
        {showHint ? 'Hide Hint' : 'Show Hint 🍓'}
      </button>

      {showHint && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, animation: 'slideUp 0.3s' }}>
          <EqualGroupDiagram numGroups={numGroups} groupSize={groupSize} missingSlot="total" objectEmoji="🍓" animated={true} size="small" />
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
          <button className="num-pad-btn" onClick={() => setInputVal('')} style={{ gridColumn: 'span 2' }}>Clear</button>
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

      <div style={{ marginTop: 24, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Round {Math.min(round + 1, 3)} / 3</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Main SimulatePhase
// ═══════════════════════════════════════════════════
export default function SimulatePhase({ onComplete, audioEnabled }) {
  const [station, setStation] = useState(0);
  const nextStation = useCallback(() => { if (station < 2) setStation(s => s + 1); }, [station]);

  return (
    <div className="simulate-phase">
      <div className="simulate-header">
        <h3 className="simulate-label">🧪 Simulate</h3>
        <p className="simulate-sublabel">Explore and discover — no wrong answers!</p>
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
