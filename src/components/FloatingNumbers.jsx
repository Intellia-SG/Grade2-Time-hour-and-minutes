import { useMemo } from 'react';

const COUNT = 16;
const SYMBOLS = ['🕒', '🕕', '🕘', '12:00', '30', '15', '45', 'a.m.', 'p.m.', '⏱️', '⌛'];

export default function FloatingNumbers() {
  const elements = useMemo(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      value: SYMBOLS[i % SYMBOLS.length],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 20}s`,
      duration: `${15 + Math.random() * 15}s`,
      size: `${1.5 + Math.random() * 2.5}rem`,
    })), []);

  return (
    <div className="floating-numbers">
      {elements.map((n, i) => (
        <span key={i} className="floating-number" style={{
          left: n.left,
          animationDelay: n.delay,
          animationDuration: n.duration,
          fontSize: n.size,
        }}>
          {n.value}
        </span>
      ))}
    </div>
  );
}
