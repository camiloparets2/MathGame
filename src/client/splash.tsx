import { requestExpandedMode, context } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { getDayIndex, generateProblems, getTodaysMission } from '../shared/problems';

const dayIndex = getDayIndex();
const sampleProblems = generateProblems(dayIndex, 'medium');
// Pick a latex problem for the hero — fallback to first
const sample = sampleProblems.find(p => p.latex) ?? sampleProblems[0]!;
const mission = getTodaysMission(dayIndex);
const username = context.username ?? 'Challenger';

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const MathHero = ({ tex }: { tex: string }) => {
  try {
    const html = katex.renderToString(tex, { throwOnError: false, displayMode: true, output: 'html' });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <span style={{ whiteSpace: 'pre-line' }}>{tex}</span>;
  }
};

const Splash = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '100vh',
    background: '#050508',
    fontFamily: FONT,
    padding: '16px 20px', textAlign: 'center', userSelect: 'none',
    position: 'relative', overflow: 'hidden',
  }}>
    <style>{`
      @keyframes neonShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      @keyframes neonPulse {
        0%,100% { box-shadow: 0 0 20px rgba(0,229,255,0.35), 0 0 50px rgba(0,229,255,0.12); transform: scale(1); }
        50%     { box-shadow: 0 0 30px rgba(0,229,255,0.55), 0 0 70px rgba(0,229,255,0.2), 0 0 120px rgba(0,229,255,0.08); transform: scale(1.02); }
      }
      @keyframes typeReveal { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
      @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
      @keyframes cursorBlink { 0%,100% { border-right-color: #00e5ff; } 50% { border-right-color: transparent; } }
      @keyframes gradeGlow { 0%,100% { text-shadow: 0 0 6px currentColor; } 50% { text-shadow: 0 0 14px currentColor, 0 0 30px currentColor; } }
      @keyframes btnGlow {
        0%,100% { box-shadow: 0 4px 30px rgba(0,229,255,0.4), inset 0 1px 0 rgba(255,255,255,0.15); }
        50%     { box-shadow: 0 6px 40px rgba(0,229,255,0.55), 0 0 60px rgba(0,229,255,0.15), inset 0 1px 0 rgba(255,255,255,0.2); }
      }
      @keyframes orbit1 { 0% { transform: rotate(0deg) translateX(120px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); } }
      @keyframes orbit2 { 0% { transform: rotate(180deg) translateX(90px) rotate(-180deg); } 100% { transform: rotate(540deg) translateX(90px) rotate(-540deg); } }
      .play-btn { transition: transform 0.15s ease; }
      .play-btn:hover { transform: scale(1.05) !important; }
      .play-btn:active { transform: scale(0.97) !important; }
      .hero-eq .katex { font-size: clamp(1.3em, 6.5vw, 2em) !important; color: #f0f4ff !important; }
      .hero-eq .katex-display { margin: 0 !important; }
      .hero-eq .katex-html { white-space: normal !important; word-break: break-word; }
    `}</style>

    {/* Subtle scanline overlay for arcade texture */}
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
      background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px)',
    }} />

    {/* Neon gradient mesh — cyan + pink, NOT purple */}
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 25% 15%, rgba(0,229,255,0.07) 0%, transparent 50%), radial-gradient(ellipse at 75% 85%, rgba(255,51,102,0.05) 0%, transparent 50%)',
    }} />

    {/* Orbiting math symbols — neon colors */}
    <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', animation: 'orbit1 18s linear infinite', fontSize: '16px', opacity: 0.15, color: '#00e5ff' }}>&#x03C0;</div>
      <div style={{ position: 'absolute', animation: 'orbit2 14s linear infinite', fontSize: '20px', opacity: 0.12, color: '#ffea00' }}>&#x221A;</div>
    </div>

    {/* ── Username hook — first thing they see ── */}
    <div style={{ animation: 'fadeUp 0.4s ease', marginBottom: '6px', zIndex: 2 }}>
      <div style={{
        fontSize: '12px', fontWeight: 700, color: '#00e5ff', letterSpacing: '1px',
      }}>
        u/{username}
      </div>
      <div style={{ fontSize: '10px', color: '#3a3d55', marginTop: '2px', letterSpacing: '1px' }}>
        vs thousands of players &middot; Day #{dayIndex}
      </div>
    </div>

    {/* ── Title — electric arcade palette ── */}
    <h1 style={{
      fontSize: 'clamp(26px, 7.5vw, 36px)', fontWeight: 900, letterSpacing: '5px',
      margin: '2px 0 8px',
      background: 'linear-gradient(135deg, #00e5ff 0%, #ffea00 45%, #ff3366 100%)',
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      animation: 'neonShimmer 3s linear infinite, fadeUp 0.4s ease 0.08s both',
      lineHeight: 1, zIndex: 2,
    }}>MATHY BLITZ</h1>

    {/* ── HERO EQUATION — the billboard centerpiece ── */}
    <div className="hero-eq" style={{
      background: 'rgba(0,229,255,0.03)',
      border: '1px solid rgba(0,229,255,0.12)',
      borderRadius: '20px', padding: '16px 22px',
      margin: '4px 0 10px', maxWidth: '340px', width: '100%',
      position: 'relative', overflow: 'hidden', zIndex: 2,
      animation: 'fadeUp 0.4s ease 0.16s both, neonPulse 3s ease-in-out infinite 1.2s',
    }}>
      {/* Accent line at top */}
      <div style={{
        position: 'absolute', top: 0, left: '15%', right: '15%', height: '2px',
        background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
        opacity: 0.5,
      }} />
      <div style={{
        fontSize: '8px', color: '#00e5ff', letterSpacing: '4px', fontWeight: 700,
        marginBottom: '10px',
      }}>
        CAN YOU SOLVE THIS?
      </div>
      <div style={{
        color: '#f0f4ff', fontWeight: 800, lineHeight: 1.5,
        overflow: 'hidden', wordBreak: 'break-word' as const,
        animation: 'typeReveal 1s ease 0.7s both',
        borderRight: '2px solid transparent',
      }}>
        {sample.latex
          ? <MathHero tex={sample.question.split('\n')[0]!} />
          : <div style={{ fontSize: 'clamp(22px, 6vw, 32px)' }}>{sample.question.split('\n')[0]}</div>
        }
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
        <span style={{ fontSize: '9px', color: '#00e5ff', letterSpacing: '1px', fontWeight: 600, opacity: 0.7 }}>
          {sample.category}
        </span>
        <span style={{ fontSize: '9px', color: '#3a3d55' }}>&middot;</span>
        <span style={{ fontSize: '9px', color: '#4a4e6a', letterSpacing: '1px' }}>
          4 choices &middot; timed
        </span>
      </div>
    </div>

    {/* ── Grade scale teaser — F through S ── */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: '3px',
      marginBottom: '8px', zIndex: 2,
      animation: 'fadeUp 0.4s ease 0.28s both',
    }}>
      {[
        { g: 'F', c: '#ef4444' }, { g: 'D', c: '#f97316' }, { g: 'C', c: '#fbbf24' },
        { g: 'B', c: '#38bdf8' }, { g: 'A', c: '#10b981' }, { g: 'S', c: '#ffea00' },
      ].map(({ g, c }, i) => (
        <span key={g} style={{ display: 'inline-flex', alignItems: 'center' }}>
          {i > 0 && <span style={{ color: '#1a1a2a', fontSize: '8px', margin: '0 2px' }}>&rarr;</span>}
          <span style={{
            fontSize: g === 'S' ? '15px' : '11px', fontWeight: 800, color: c,
            animation: g === 'S' ? 'gradeGlow 2s ease infinite' : 'none',
          }}>{g}</span>
        </span>
      ))}
      <span style={{ fontSize: '9px', color: '#3a3d55', marginLeft: '8px', fontWeight: 600 }}>
        What&apos;s your rank?
      </span>
    </div>

    {/* ── Today's Mission — compact pill ── */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '7px 14px', borderRadius: '12px',
      background: `${mission.color}08`, border: `1px solid ${mission.color}18`,
      marginBottom: '10px', maxWidth: '300px', zIndex: 2,
      animation: 'fadeUp 0.4s ease 0.34s both',
    }}>
      <span style={{ fontSize: '18px' }} dangerouslySetInnerHTML={{ __html: mission.emoji }} />
      <div style={{ textAlign: 'left', flex: 1 }}>
        <div style={{ fontSize: '7px', color: mission.color, letterSpacing: '2px', fontWeight: 700, opacity: 0.7 }}>TODAY&apos;S MISSION</div>
        <div style={{ fontSize: '12px', fontWeight: 800, color: mission.color }}>{mission.name}</div>
      </div>
      {mission.scoreMultiplier !== 1 && (
        <span style={{
          fontSize: '9px', padding: '2px 7px', borderRadius: '8px',
          background: `${mission.color}12`, color: mission.color, fontWeight: 800,
        }}>{mission.scoreMultiplier}x</span>
      )}
    </div>

    {/* ── PLAY BUTTON — big, neon cyan, pulsing ── */}
    <button
      className="play-btn"
      onClick={e => requestExpandedMode(e.nativeEvent, 'game')}
      style={{
        padding: '18px 64px', minHeight: '52px',
        background: 'linear-gradient(135deg, #00e5ff, #00b8d4)',
        color: '#050510', border: 'none', borderRadius: '16px',
        fontSize: '15px', fontWeight: 900, letterSpacing: '5px',
        cursor: 'pointer', fontFamily: FONT,
        animation: 'fadeUp 0.4s ease 0.42s both, btnGlow 2.5s ease-in-out infinite 1.5s',
        position: 'relative', zIndex: 2,
      }}
    >
      &#x25B6; PLAY NOW
    </button>

    {/* ── Bottom line — urgency + features ── */}
    <div style={{
      fontSize: '9px', color: '#2a2d40', marginTop: '10px', letterSpacing: '2px', zIndex: 2,
      animation: 'fadeUp 0.4s ease 0.5s both',
    }}>
      New mission every 24h &middot; 11 modes &middot; Streak rewards
    </div>
  </div>
);

createRoot(document.getElementById('root')!).render(<StrictMode><Splash /></StrictMode>);
