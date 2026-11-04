/** What the baby needs, and what it is being given. */
export type BabyNeed = 'hungry' | 'thirsty' | 'dirty' | 'sleepy' | 'sad';
export type BabyCare = 'food' | 'milk' | 'bath' | 'bed' | 'hug';

const INK = '#5A3B2B';
const SKIN = '#F6CBA5';
const SUIT = '#8FD0FF';

const line = { fill: 'none', stroke: INK, strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const out = { stroke: INK, strokeWidth: 5, strokeLinejoin: 'round' } as const;

/**
 * The baby in "Look after the baby", drawn here so it can react: it shows what it needs (a rumbling
 * tummy, mud, a yawn, tears), then is fed, bathed, put to bed or hugged, then laughs.
 * `mood` null means happy. `no` shakes its head (that's not what it needs).
 */
export function Baby({ mood, doing, no }: { mood: BabyNeed | null; doing: BabyCare | null; no: boolean }) {
  const happy = mood === null || (doing !== null && doing !== 'bed');
  const asleep = doing === 'bed';
  const dirty = mood === 'dirty';
  return (
    <svg className={`baby-svg${no ? ' no' : ''}${doing ? ` doing-${doing}` : ''}`} viewBox="0 0 400 400" aria-hidden="true">
      {/* body */}
      <g className="baby-body">
        <ellipse cx="150" cy="352" rx="40" ry="26" fill={SUIT} {...out} />
        <ellipse cx="250" cy="352" rx="40" ry="26" fill={SUIT} {...out} />
        <ellipse cx="200" cy="292" rx="88" ry="74" fill={SUIT} {...out} />
        <circle cx="200" cy="300" r="7" fill="#fff" stroke={INK} strokeWidth="3" />
        {/* arms: up for a hug, else resting */}
        {doing === 'hug' ? (
          <>
            <path d="M126 262 L84 206" {...line} strokeWidth="38" />
            <path d="M126 262 L84 206" fill="none" stroke={SUIT} strokeWidth="28" strokeLinecap="round" />
            <path d="M274 262 L316 206" {...line} strokeWidth="38" />
            <path d="M274 262 L316 206" fill="none" stroke={SUIT} strokeWidth="28" strokeLinecap="round" />
            <circle cx="80" cy="200" r="16" fill={SKIN} {...out} />
            <circle cx="320" cy="200" r="16" fill={SKIN} {...out} />
          </>
        ) : (
          <>
            <path d="M128 262 L110 316" {...line} strokeWidth="38" />
            <path d="M128 262 L110 316" fill="none" stroke={SUIT} strokeWidth="28" strokeLinecap="round" />
            <path d="M272 262 L290 316" {...line} strokeWidth="38" />
            <path d="M272 262 L290 316" fill="none" stroke={SUIT} strokeWidth="28" strokeLinecap="round" />
            <circle cx="108" cy="322" r="16" fill={SKIN} {...out} />
            <circle cx="292" cy="322" r="16" fill={SKIN} {...out} />
          </>
        )}
        {mood === 'hungry' && !doing && (
          <g className="baby-rumble">
            <path d="M150 290 q-12 -6 0 -12 M146 312 q-14 -6 0 -12 M250 290 q12 -6 0 -12 M254 312 q14 -6 0 -12" fill="none" stroke="#E0703B" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}
      </g>
      {/* head */}
      <g className="baby-head">
        <ellipse cx="112" cy="160" rx="16" ry="20" fill={SKIN} {...out} />
        <ellipse cx="288" cy="160" rx="16" ry="20" fill={SKIN} {...out} />
        <circle cx="200" cy="152" r="88" fill={SKIN} {...out} />
        <path d="M196 66 q-10 -24 12 -30 q-6 14 6 26" fill="#7A4A30" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <ellipse cx="144" cy="188" rx="18" ry="12" fill="#FF8FA3" opacity="0.6" />
        <ellipse cx="256" cy="188" rx="18" ry="12" fill="#FF8FA3" opacity="0.6" />
        <circle cx="140" cy="184" r="3" fill="#fff" opacity="0.8" />
        <circle cx="252" cy="184" r="3" fill="#fff" opacity="0.8" />
        {/* eyes */}
        {asleep || mood === 'sleepy' ? (
          <>
            <path d="M152 156 q14 12 28 0 M220 156 q14 12 28 0" {...line} />
          </>
        ) : happy ? (
          <path d="M152 160 q14 -16 28 0 M220 160 q14 -16 28 0" {...line} />
        ) : (
          <>
            {[166, 234].map((x) => (
              <g key={x}>
                <ellipse cx={x} cy="156" rx="14" ry="17" fill="#3A2418" />
                <ellipse cx={x} cy="162" rx="10" ry="7" fill="#6B4A3A" opacity="0.6" />
                <circle cx={x + 5} cy="149" r="6" fill="#fff" />
                <circle cx={x - 5} cy="163" r="2.6" fill="#fff" />
              </g>
            ))}
            {(mood === 'sad' || mood === 'hungry' || mood === 'thirsty') && (
              <path d="M150 132 L178 124 M222 124 L250 132" {...line} />
            )}
          </>
        )}
        {/* mouth */}
        {asleep ? (
          <path d="M190 202 q10 6 20 0" {...line} strokeWidth="4" />
        ) : happy ? (
          <path d="M168 192 Q200 234 232 192 Z" fill="#8A2B1E" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        ) : mood === 'sleepy' ? (
          <ellipse cx="200" cy="206" rx="14" ry="18" fill="#8A2B1E" stroke={INK} strokeWidth="4" />
        ) : mood === 'thirsty' ? (
          <>
            <ellipse cx="200" cy="202" rx="14" ry="10" fill="#8A2B1E" stroke={INK} strokeWidth="4" />
            <path d="M190 204 h20 v14 q0 10 -10 10 q-10 0 -10 -10 Z" fill="#F07B7B" stroke={INK} strokeWidth="3.5" />
          </>
        ) : mood === 'sad' ? (
          <path d="M178 212 Q200 192 222 212" {...line} />
        ) : mood === 'hungry' ? (
          <ellipse cx="200" cy="204" rx="11" ry="12" fill="#8A2B1E" stroke={INK} strokeWidth="4" />
        ) : (
          <path d="M184 200 Q200 210 216 200" {...line} />
        )}
        {mood === 'sad' && !doing && (
          <g className="baby-tears">
            <path d="M160 174 q-9 15 0 22 q9 -7 0 -22 Z" fill="#5DB7F5" stroke={INK} strokeWidth="2.5" />
            <path d="M240 174 q-9 15 0 22 q9 -7 0 -22 Z" fill="#5DB7F5" stroke={INK} strokeWidth="2.5" />
          </g>
        )}
        {mood === 'thirsty' && !doing && <path className="baby-sweat" d="M270 96 q-9 15 0 22 q9 -7 0 -22 Z" fill="#5DB7F5" stroke={INK} strokeWidth="2.5" />}
      </g>
      {/* mud, washed off in the bath */}
      {dirty && (
        <g className="baby-mud">
          <ellipse cx="236" cy="112" rx="16" ry="11" fill="#8B5A2B" />
          <ellipse cx="150" cy="210" rx="12" ry="8" fill="#8B5A2B" />
          <ellipse cx="236" cy="300" rx="22" ry="14" fill="#8B5A2B" />
          <ellipse cx="160" cy="330" rx="16" ry="10" fill="#8B5A2B" />
          {!doing && <path className="baby-stink" d="M300 120 q12 -12 0 -24 q-12 -12 0 -24 M326 136 q12 -12 0 -24 q-12 -12 0 -24" fill="none" stroke="#8FBF6A" strokeWidth="5" strokeLinecap="round" />}
        </g>
      )}
      {mood === 'sleepy' && !doing && (
        <g className="baby-zzz" fill="none" stroke="#5B8DEF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M290 70 h20 l-20 22 h20" />
        </g>
      )}
      {/* what she gives the baby */}
      {doing === 'food' && (
        <g className="give-spoon">
          <path d="M330 300 L230 214" fill="none" stroke="#B0B6C0" strokeWidth="12" strokeLinecap="round" />
          <ellipse cx="222" cy="206" rx="22" ry="15" fill="#C9CED6" stroke={INK} strokeWidth="4" transform="rotate(40 222 206)" />
          <circle cx="222" cy="204" r="9" fill="#F4C06A" />
        </g>
      )}
      {doing === 'milk' && (
        <g className="give-bottle" transform="rotate(-50 250 210)">
          <rect x="226" y="200" width="56" height="120" rx="20" fill="#fff" stroke={INK} strokeWidth="5" />
          <rect x="230" y="250" width="48" height="66" rx="16" fill="#FFF6E8" />
          <rect x="232" y="182" width="44" height="22" rx="8" fill="#F05A8C" stroke={INK} strokeWidth="4" />
          <path d="M244 182 Q246 156 254 156 Q262 156 264 182 Z" fill="#F7D046" stroke={INK} strokeWidth="4" />
        </g>
      )}
      {doing === 'bath' && (
        <g className="give-bubbles">
          {[
            [110, 290, 34],
            [170, 330, 40],
            [240, 320, 42],
            [300, 280, 32],
            [140, 230, 26],
            [270, 220, 24],
            [200, 260, 30],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#fff" stroke="#9CC9F2" strokeWidth="4" style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </g>
      )}
      {doing === 'bed' && (
        <g className="give-blanket">
          <path d="M70 260 Q200 230 330 260 L340 380 L60 380 Z" fill="#9A90EE" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M90 280 Q200 256 310 280" fill="none" stroke="#B9B3F2" strokeWidth="6" strokeLinecap="round" />
          <g fill="none" stroke="#5B8DEF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
            <path className="give-z" d="M290 70 h20 l-20 22 h20" />
            <path className="give-z b" d="M318 40 h14 l-14 16 h14" />
          </g>
        </g>
      )}
      {doing === 'hug' && (
        <g className="give-hearts" fill="#E8304A" stroke={INK} strokeWidth="3.5">
          <path d="M200 92 C176 76 182 52 200 64 C218 52 224 76 200 92 Z" />
          <path className="b" d="M90 120 C72 108 76 90 90 99 C104 90 108 108 90 120 Z" />
          <path className="c" d="M310 120 C292 108 296 90 310 99 C324 90 328 108 310 120 Z" />
        </g>
      )}
    </svg>
  );
}
