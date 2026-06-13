import { useRef, useState, useEffect } from 'react';

export default function AnalogClock({
  hour = 12,
  minute = 0,
  mode = 'display', // 'display' | 'interactive'
  onChange, // callback for interactive mode: (h, m) => {}
  size = 240,
  snapTo5Min = false
}) {
  const svgRef = useRef(null);
  const [activeHand, setActiveHand] = useState(null); // 'hour' | 'minute' | null

  // Calculate rotations
  const minAngle = minute * 6;
  // Hour hand includes fractional movement from minutes
  const hourAngle = ((hour % 12) * 30) + (minute * 0.5);

  const getAngleFromEvent = (e) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - cx;
    const dy = clientY - cy;

    // Angle in degrees from 12 o'clock
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;
    return angle;
  };

  const handleStart = (hand, e) => {
    if (mode !== 'interactive') return;
    e.preventDefault();
    setActiveHand(hand);
  };

  const handleMove = (e) => {
    if (!activeHand || mode !== 'interactive' || !onChange) return;
    const angle = getAngleFromEvent(e);

    if (activeHand === 'minute') {
      let newMin = Math.round(angle / 6);
      if (snapTo5Min) {
        newMin = Math.round(newMin / 5) * 5;
      }
      newMin = newMin % 60;
      onChange(hour, newMin);
    } else if (activeHand === 'hour') {
      // Calculate hour from angle
      let newHour = Math.round(angle / 30);
      newHour = newHour % 12 || 12;
      onChange(newHour, minute);
    }
  };

  const handleEnd = () => {
    setActiveHand(null);
  };

  useEffect(() => {
    if (activeHand) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [activeHand, hour, minute]);

  // Generate numbers layout coordinates around clock face
  const clockNumbers = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    const angle = (num * 30 * Math.PI) / 180;
    const r = 82; // radius of numbers circle
    const x = 100 + r * Math.sin(angle);
    const y = 100 - r * Math.cos(angle);
    return { num, x, y };
  });

  // Generate ticks around clock face
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i * 6 * Math.PI) / 180;
    const isMajor = i % 5 === 0;
    const rStart = isMajor ? 90 : 93;
    const rEnd = 97;
    const x1 = 100 + rStart * Math.sin(angle);
    const y1 = 100 - rStart * Math.cos(angle);
    const x2 = 100 + rEnd * Math.sin(angle);
    const y2 = 100 - rEnd * Math.cos(angle);
    return { x1, y1, x2, y2, isMajor };
  });

  return (
    <div className="clock-wrapper" style={{ display: 'inline-block', position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        width={size}
        height={size}
        style={{ overflow: 'visible', userSelect: 'none', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))' }}
      >
        {/* Glow behind clock */}
        <circle cx="100" cy="100" r="98" fill="rgba(63, 81, 181, 0.05)" />
        
        {/* Clock outer ring */}
        <circle
          cx="100"
          cy="100"
          r="97"
          fill="rgba(10, 10, 50, 0.8)"
          stroke="url(#clockBorderGrad)"
          strokeWidth="3.5"
        />

        {/* Ticks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.isMajor ? 'var(--gold)' : 'rgba(255,255,255,0.3)'}
            strokeWidth={t.isMajor ? 1.5 : 0.8}
          />
        ))}

        {/* Hour Numbers */}
        {clockNumbers.map(cn => (
          <text
            key={cn.num}
            x={cn.x}
            y={cn.y + 4.5} // visual center alignment
            textAnchor="middle"
            fill="var(--white)"
            fontFamily="var(--font-display)"
            fontSize="12.5"
            fontWeight="600"
            style={{ pointerEvents: 'none' }}
          >
            {cn.num}
          </text>
        ))}

        {/* Hour Hand */}
        <g transform={`rotate(${hourAngle} 100 100)`}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="45"
            stroke="var(--blue-bright)"
            strokeWidth="5.5"
            strokeLinecap="round"
            style={{ cursor: mode === 'interactive' ? 'pointer' : 'default' }}
            onMouseDown={(e) => handleStart('hour', e)}
            onTouchStart={(e) => handleStart('hour', e)}
          />
          {/* Hour hand cap/arrow */}
          <polygon
            points="100,38 97,45 103,45"
            fill="var(--blue-bright)"
            style={{ cursor: mode === 'interactive' ? 'pointer' : 'default' }}
            onMouseDown={(e) => handleStart('hour', e)}
            onTouchStart={(e) => handleStart('hour', e)}
          />
        </g>

        {/* Minute Hand */}
        <g transform={`rotate(${minAngle} 100 100)`}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="25"
            stroke="var(--coral)"
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{ cursor: mode === 'interactive' ? 'pointer' : 'default' }}
            onMouseDown={(e) => handleStart('minute', e)}
            onTouchStart={(e) => handleStart('minute', e)}
          />
          {/* Minute hand tip */}
          <circle
            cx="100"
            cy="24"
            r="3.5"
            fill="var(--coral)"
            style={{ cursor: mode === 'interactive' ? 'pointer' : 'default' }}
            onMouseDown={(e) => handleStart('minute', e)}
            onTouchStart={(e) => handleStart('minute', e)}
          />
        </g>

        {/* Center Pivot */}
        <circle cx="100" cy="100" r="6" fill="var(--white)" stroke="var(--bg-dark)" strokeWidth="2" />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="clockBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--gold)" />
            <stop offset="50%" stopColor="var(--purple-light)" />
            <stop offset="100%" stopColor="var(--coral)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Helper text overlay when interactive */}
      {mode === 'interactive' && (
        <div style={{
          position: 'absolute',
          top: -30,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          background: 'rgba(0,0,0,0.6)',
          padding: '4px 10px',
          borderRadius: 8,
          whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}>
          👈 Drag either hand directly! 👉
        </div>
      )}
    </div>
  );
}
