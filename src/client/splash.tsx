import { requestExpandedMode, context } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { getDayIndex, generateProblems, getTodaysMission } from '../shared/problems';

const dayIndex = getDayIndex();
const sample = generateProblems(dayIndex, 'medium')[0]!;
const mission = getTodaysMission(dayIndex);

const MathInline = ({ tex }: { tex: string }) => {
  try {
    const html = katex.renderToString(tex, { throwOnError: false, displayMode: false, output: 'html' });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <span>{tex}</span>;
  }
};

const Splash = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '100vh',
    background: '#07070f',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: '20px', textAlign: 'center', userSelect: 'none',
    position: 'relative', overflow: 'hidden',
  }}>
    <style>{`
      @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
      @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      @keyframes orbit1 { 0% { transform: rotate(0deg) translateX(130px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(130px) rotate(-360deg); } }
      @keyframes orbit2 { 0% { transform: rotate(120deg) translateX(100px) rotate(-120deg); } 100% { transform: rotate(480deg) translateX(100px) rotate(-480deg); } }
      @keyframes orbit3 { 0% { transform: rotate(240deg) translateX(160px) rotate(-240deg); } 100% { transform: rotate(600deg) translateX(160px) rotate(-600deg); } }
      @keyframes drift { 0%,100% { transform: translate(0,0) scale(1); opacity:0.06; } 50% { transform: translate(20px,-15px) scale(1.2); opacity:0.12; } }
      @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 20px rgba(139,92,246,0.3), 0 0 60px rgba(139,92,246,0.1); } 50% { box-shadow: 0 0 30px rgba(139,92,246,0.5), 0 0 80px rgba(139,92,246,0.2); } }
      @keyframes scaleIn { from { transform: scale(0.8); opacity:0; } to { transform: scale(1); opacity:1; } }
      @keyframes missionPulse { 0%,100% { opacity: 0.8; } 50% { opacity: 1; } }
      .play-btn { transition: transform 0.2s, box-shadow 0.2s; }
      .play-btn:hover { transform: scale(1.04); }
      .play-btn:active { transform: scale(0.97); }
      .katex { font-size: clamp(0.7em, 2.8vw, 0.95em) !important; }
      .katex-html { white-space: normal !important; word-break: break-word; }
    `}</style>

    {/* Animated gradient mesh background */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(236,72,153,0.05) 0%, transparent 50%)',
      pointerEvents: 'none',
    }} />

    {/* Floating math symbols */}
    <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', animation: 'orbit1 20s linear infinite', fontSize: '18px', opacity: 0.12, color: '#8b5cf6' }}>&#x00D7;</div>
      <div style={{ position: 'absolute', animation: 'orbit2 15s linear infinite', fontSize: '22px', opacity: 0.1, color: '#6366f1' }}>&#x221A;</div>
      <div style={{ position: 'absolute', animation: 'orbit3 25s linear infinite', fontSize: '14px', opacity: 0.08, color: '#a78bfa' }}>&#x03C0;</div>
    </div>

    {/* Ambient drift blobs */}
    <div style={{
      position: 'absolute', top: '10%', right: '5%', width: '200px', height: '200px',
      background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
      borderRadius: '50%', pointerEvents: 'none', animation: 'drift 8s ease-in-out infinite',
    }} />
    <div style={{
      position: 'absolute', bottom: '15%', left: '5%', width: '160px', height: '160px',
      background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
      borderRadius: '50%', pointerEvents: 'none', animation: 'drift 10s ease-in-out infinite 2s',
    }} />

    {/* Logo */}
    <div style={{ animation: 'float 4s ease-in-out infinite, fadeUp 0.6s ease' }}>
      <div style={{
        fontSize: '42px', marginBottom: '4px',
        filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.5))',
        color: '#a78bfa', fontWeight: 300,
      }}>&#x222B;</div>
    </div>

    <h1 style={{
      fontSize: '32px', fontWeight: 800, letterSpacing: '5px', marginBottom: '4px',
      background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 40%, #f472b6 70%, #818cf8 100%)',
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      animation: 'shimmer 4s linear infinite, fadeUp 0.6s ease 0.1s both',
    }}>MATHY BLITZ</h1>

    <p style={{
      fontSize: '10px', color: '#6366f1', marginBottom: '14px', letterSpacing: '5px', fontWeight: 600,
      animation: 'fadeUp 0.6s ease 0.2s both',
    }}>
      DAILY CHALLENGE #{dayIndex}
    </p>

    {/* Today's Mission card */}
    <div style={{
      background: `linear-gradient(135deg, ${mission.color}10, ${mission.color}05)`,
      borderRadius: '16px', padding: '12px 20px',
      marginBottom: '14px', maxWidth: '300px', width: '100%',
      border: `1px solid ${mission.color}25`,
      animation: 'fadeUp 0.6s ease 0.25s both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{ fontSize: '20px' }} dangerouslySetInnerHTML={{ __html: mission.emoji }} />
        <div>
          <div style={{ fontSize: '7px', color: mission.color, letterSpacing: '3px', fontWeight: 700, opacity: 0.7 }}>TODAY'S MISSION</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: mission.color }}>{mission.name}</div>
        </div>
      </div>
      <div style={{ fontSize: '10px', color: '#6b7094', lineHeight: 1.4, marginBottom: '6px' }}>
        {mission.description}
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '8px', padding: '2px 7px', borderRadius: '8px',
          background: `${mission.color}12`, color: mission.color,
          fontWeight: 700, letterSpacing: '1px',
        }}>{mission.modifier}</span>
        {mission.scoreMultiplier !== 1 && (
          <span style={{
            fontSize: '8px', padding: '2px 7px', borderRadius: '8px',
            background: 'rgba(16,185,129,0.08)', color: '#10b981',
            fontWeight: 700,
          }}>{mission.scoreMultiplier}x SCORE</span>
        )}
        <span style={{
          fontSize: '8px', padding: '2px 7px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.04)', color: '#4b5079',
          fontWeight: 600,
        }}>{mission.questionCount}Q</span>
      </div>
    </div>

    {/* Sample problem card */}
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
      borderRadius: '20px', padding: '14px 18px',
      marginBottom: '14px', maxWidth: '300px', width: '100%',
      border: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(20px)',
      animation: 'fadeUp 0.6s ease 0.3s both, pulseGlow 3s ease-in-out infinite',
      overflow: 'hidden',
    }}>
      <div style={{ fontSize: '8px', color: '#a78bfa', letterSpacing: '4px', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>
        Sample Problem
      </div>
      <div style={{
        fontSize: 'clamp(12px, 3.5vw, 16px)', color: '#e0e7ff', fontWeight: 700, lineHeight: 1.6,
        overflow: 'hidden', wordBreak: 'break-word' as const, maxWidth: '100%',
      }}>
        {sample.latex
          ? <MathInline tex={sample.question.split('\n')[0]!} />
          : sample.question.split('\n')[0]
        }
      </div>
      <div style={{ fontSize: '10px', color: '#4b5079', marginTop: '6px', letterSpacing: '1px' }}>
        {sample.category} &middot; 4 options &middot; 5 tools available
      </div>
    </div>

    {/* Challenge text */}
    <div style={{ animation: 'fadeUp 0.6s ease 0.4s both' }}>
      <p style={{
        fontSize: '14px', color: '#e0e7ff', marginBottom: '4px', maxWidth: '300px',
        fontWeight: 700, lineHeight: 1.4,
      }}>
        How sharp is your math?
      </p>
      <p style={{
        fontSize: '11px', color: '#4b5079', marginBottom: '10px', maxWidth: '260px', lineHeight: 1.5,
      }}>
        {context.username ?? 'Challenger'}, every wrong answer reveals the solution. Get graded from F to S rank.
      </p>
    </div>

    {/* Feature pills */}
    <div style={{
      display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center',
      marginBottom: '14px', maxWidth: '300px',
      animation: 'fadeUp 0.6s ease 0.45s both',
    }}>
      {['11 Missions', 'Letter Grade', 'Leaderboards', 'Share Scores', 'Level Assessment'].map(f => (
        <span key={f} style={{
          fontSize: '8px', padding: '3px 8px', borderRadius: '10px',
          background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)',
          color: '#818cf8', fontWeight: 600, letterSpacing: '0.5px',
        }}>{f}</span>
      ))}
    </div>

    {/* Leaderboard teasers */}
    <div style={{ display: 'flex', gap: '20px', marginBottom: '14px', animation: 'fadeUp 0.6s ease 0.5s both' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: 'rgba(250,204,21,0.6)' }}>&#x2211;</div>
        <div style={{ fontSize: '8px', color: 'rgba(250,204,21,0.7)', letterSpacing: '2px', fontWeight: 700, marginTop: '4px' }}>TOP SCORES</div>
      </div>
      <div style={{ fontSize: '10px', color: '#1e1e3a', alignSelf: 'center', fontWeight: 700 }}>|</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: 'rgba(239,68,68,0.6)' }}>&#x2202;</div>
        <div style={{ fontSize: '8px', color: 'rgba(239,68,68,0.7)', letterSpacing: '2px', fontWeight: 700, marginTop: '4px' }}>BOTTOM</div>
      </div>
    </div>

    {/* Play button */}
    <button
      className="play-btn"
      onClick={e => requestExpandedMode(e.nativeEvent, 'game')}
      style={{
        padding: '16px 56px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px',
        fontWeight: 700, letterSpacing: '4px', cursor: 'pointer',
        boxShadow: '0 4px 30px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        animation: 'fadeUp 0.6s ease 0.6s both',
      }}
    >
      PLAY NOW
    </button>
  </div>
);

createRoot(document.getElementById('root')!).render(<StrictMode><Splash /></StrictMode>);
