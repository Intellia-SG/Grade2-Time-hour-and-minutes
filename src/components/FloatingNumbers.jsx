import React, { useMemo } from 'react';

const COUNT = 30;
const SYMBOLS = [
  '12:00', '3:30', '6:15', '9:45', '60', '30', '15', '45',
  '12', '6', '3', '9', 'a.m.', 'p.m.', '7:30', '4:15',
  '8:30', '5:45', '10:00', '2:00', '🕒', '⏱️', '⌛', '⏰'
];

export default function FloatingNumbers() {
  const elements = useMemo(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      value: SYMBOLS[i % SYMBOLS.length],
      left: `${(i * 3.3 + Math.random() * 2) % 96}%`,
      top: `${(i * 7 + Math.random() * 10) % 90}%`,
      delay: `${-(Math.random() * 20)}s`,
      duration: `${18 + (i % 5) * 4}s`,
      size: `${2.2 + (i % 4) * 0.9}rem`,
      opacity: 0.08 + (i % 3) * 0.04,
      rotation: `${-25 + (i % 6) * 10}deg`,
    })), []);

  return (
    <div className="floating-numbers" aria-hidden="true">
      {elements.map((n) => (
        <span
          key={n.id}
          className="floating-number"
          style={{
            left: n.left,
            top: n.top,
            animationDelay: n.delay,
            animationDuration: n.duration,
            fontSize: n.size,
            opacity: n.opacity,
            transform: `rotate(${n.rotation})`,
          }}
        >
          {n.value}
        </span>
      ))}
    </div>
  );
}
