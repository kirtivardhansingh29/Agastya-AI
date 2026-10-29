import React, { useState, useEffect, useRef } from 'react';

const DISPLAY_MS = 2600;   // how long the splash stays before exiting
const EXIT_MS = 650;       // exit fade duration (matches CSS)

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 61) % 100}%`,
  size: 3 + ((i * 7) % 5),
  delay: `${(i * 0.35) % 2.4}s`,
  duration: `${3.2 + ((i * 13) % 20) / 10}s`
}));

const WORD = 'AGASTYA AI'.split('');

export default function SplashScreen({ onDone }) {
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setLeaving(true);
    setTimeout(() => onDone && onDone(), EXIT_MS);
  };

  useEffect(() => {
    const t = setTimeout(finish, DISPLAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`agastya-splash ${leaving ? 'agastya-splash-exit' : ''}`}
      onClick={finish}
      role="presentation"
      aria-label="Agastya AI loading"
    >
      {/* ambient glows */}
      <div className="splash-glow splash-glow-top" />
      <div className="splash-glow splash-glow-bottom" />

      {/* rising ember particles */}
      <div className="splash-particles">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="splash-particle"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration
            }}
          />
        ))}
      </div>

      <div className="splash-core">
        <div className="splash-emblem-wrap">
          <div className="splash-emblem-ring" />
          <img src="/favicon.png" alt="Agastya AI" className="splash-emblem" />
        </div>

        <div className="splash-wordmark" aria-hidden="true">
          {WORD.map((ch, i) => (
            <span
              key={i}
              className="splash-letter"
              style={{ animationDelay: `${0.55 + i * 0.06}s` }}
            >
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </div>

        <div className="splash-tagline">Intelligence Beneath the Surface</div>

        <div className="splash-bar-track">
          <div className="splash-bar-fill" />
        </div>
        <div className="splash-hint">Click anywhere to skip</div>
      </div>
    </div>
  );
}
