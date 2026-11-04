/** What the baby needs, and what it is being given. */
export type BabyNeed =
  | 'hungry'
  | 'thirsty'
  | 'dirty'
  | 'sleepy'
  | 'sad'
  | 'cold'
  | 'hot'
  | 'wet'
  | 'runny'
  | 'ouch'
  | 'bored'
  | 'song'
  | 'messy'
  | 'teeth'
  | 'hands'
  | 'sick'
  | 'out'
  | 'undressed';
export type BabyCare =
  | 'food'
  | 'milk'
  | 'bath'
  | 'bed'
  | 'hug'
  | 'hat'
  | 'fan'
  | 'nappy'
  | 'tissue'
  | 'plaster'
  | 'rattle'
  | 'music'
  | 'brush'
  | 'toothbrush'
  | 'soap'
  | 'doctor'
  | 'pram'
  | 'clothes';

const INK = '#5A3B2B';
const SKIN = '#F6CBA5';
const SUIT = '#8FD0FF';
const MUD = '#8B5A2B';

const line = { fill: 'none', stroke: INK, strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const out = { stroke: INK, strokeWidth: 5, strokeLinejoin: 'round' } as const;

const drop = (x: number, y: number, s = 1, fill = '#5DB7F5') => (
  <path d={`M${x} ${y} q${-9 * s} ${15 * s} 0 ${22 * s} q${9 * s} ${-7 * s} 0 ${-22 * s} Z`} fill={fill} stroke={INK} strokeWidth="2.5" />
);
const heart = (x: number, y: number, s = 1) =>
  `M${x} ${y + 12 * s} C${x - 22 * s} ${y - 2 * s} ${x - 16 * s} ${y - 20 * s} ${x} ${y - 9 * s} C${x + 16 * s} ${y - 20 * s} ${x + 22 * s} ${y - 2 * s} ${x} ${y + 12 * s} Z`;
const note = (x: number, y: number, fill: string) => (
  <g>
    <ellipse cx={x} cy={y} rx="11" ry="8" fill={fill} stroke={INK} strokeWidth="3" transform={`rotate(-20 ${x} ${y})`} />
    <path d={`M${x + 9} ${y - 3} V${y - 38} l16 6`} {...line} strokeWidth="4" />
  </g>
);
const sparkle = (x: number, y: number, s = 1, fill = '#FFC531') => (
  <path d={`M${x} ${y - 14 * s} L${x + 4 * s} ${y - 4 * s} L${x + 14 * s} ${y} L${x + 4 * s} ${y + 4 * s} L${x} ${y + 14 * s} L${x - 4 * s} ${y + 4 * s} L${x - 14 * s} ${y} L${x - 4 * s} ${y - 4 * s} Z`} fill={fill} />
);
const bubble = (x: number, y: number, r: number, i = 0) => (
  <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff" stroke="#9CC9F2" strokeWidth="4" style={{ animationDelay: `${i * 0.12}s` }} />
);

/**
 * The baby in "Look after the baby", drawn here so it can react. It shows what it needs (a rumbling
 * tummy, mud, a yawn, tears, snowflakes, a runny nose, messy hair...), then she gives it the right
 * thing (food, a bath, a woolly hat, a plaster...) and it laughs.
 * `mood` null means happy. `no` shakes its head (that's not what it needs).
 */
export function Baby({ mood, doing, no }: { mood: BabyNeed | null; doing: BabyCare | null; no: boolean }) {
  const happy = mood === null || (doing !== null && doing !== 'bed');
  const asleep = doing === 'bed';
  const waiting = doing === null;
  const need = waiting ? mood : null;
  const dirty = mood === 'dirty';
  // In a nappy only, until she brings the clothes.
  const undressed = mood === 'undressed' && doing !== 'clothes';
  const suit = undressed ? SKIN : SUIT;
  const frown = need !== null && ['sad', 'wet', 'ouch', 'runny', 'sick', 'cold', 'messy', 'hot', 'undressed'].includes(need);
  const blush = need === 'cold' ? '#9CC9F2' : need === 'sick' ? '#B8D98A' : need === 'hot' ? '#FF6F61' : '#FF8FA3';
  const armsUp = doing === 'hug' || doing === 'clothes';
  // The rattle is held up in her right hand.
  const holding = doing === 'rattle';

  return (
    <svg className={`baby-svg${no ? ' no' : ''}${doing ? ` doing-${doing}` : ''}${need ? ` need-${need}` : ''}`} viewBox="0 0 400 400" aria-hidden="true">
      {/* around the baby: weather, a window, a pram */}
      {need === 'cold' && (
        <g className="baby-snow" fill="none" stroke="#9CC9F2" strokeWidth="4" strokeLinecap="round">
          {[
            [60, 70],
            [340, 60],
            [40, 250],
            [360, 230],
            [90, 160],
            [320, 150],
          ].map(([x, y]) => (
            <path key={`${x}`} d={`M${x - 10} ${y} H${x + 10} M${x} ${y - 10} V${y + 10} M${x - 7} ${y - 7} L${x + 7} ${y + 7} M${x + 7} ${y - 7} L${x - 7} ${y + 7}`} />
          ))}
        </g>
      )}
      {need === 'hot' && (
        <g className="baby-sun">
          <circle cx="338" cy="62" r="30" fill="#FFC531" />
          <g stroke="#FFC531" strokeWidth="7" strokeLinecap="round">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => {
              const a = (d * Math.PI) / 180;
              return <path key={d} d={`M${338 + 40 * Math.cos(a)} ${62 + 40 * Math.sin(a)} L${338 + 54 * Math.cos(a)} ${62 + 54 * Math.sin(a)}`} />;
            })}
          </g>
        </g>
      )}
      {doing === 'pram' && (
        <g className="give-pram">
          <path d="M60 230 Q60 120 170 110 L170 230 Z" fill="#F05A8C" {...out} />
          <g className="pram-wheel">
            <circle cx="120" cy="356" r="30" fill="#fff" {...out} />
            <path d="M120 326 V386 M90 356 H150" {...line} strokeWidth="4" />
          </g>
          <g className="pram-wheel">
            <circle cx="280" cy="356" r="30" fill="#fff" {...out} />
            <path d="M280 326 V386 M250 356 H310" {...line} strokeWidth="4" />
          </g>
        </g>
      )}

      {/* body */}
      <g className="baby-body">
        <ellipse cx="150" cy="352" rx="40" ry="26" fill={suit} {...out} />
        <ellipse cx="250" cy="352" rx="40" ry="26" fill={suit} {...out} />
        <ellipse cx="200" cy="292" rx="88" ry="74" fill={suit} {...out} />
        {undressed ? (
          <path d="M126 318 Q200 300 274 318 Q262 366 200 368 Q138 366 126 318 Z" fill="#fff" {...out} />
        ) : (
          <circle cx="200" cy="300" r="7" fill="#fff" stroke={INK} strokeWidth="3" />
        )}
        {need === 'wet' && (
          <g className="baby-drips">
            <ellipse cx="200" cy="336" rx="36" ry="16" fill="#5B9FD8" opacity="0.55" />
            {drop(176, 360, 0.8)}
            {drop(224, 364, 0.7)}
          </g>
        )}
        {/* arms: up for a hug or the clothes, one up holding the rattle, else resting */}
        {armsUp ? (
          <>
            <path d="M126 262 L84 206" {...line} strokeWidth="38" />
            <path d="M126 262 L84 206" fill="none" stroke={suit} strokeWidth="28" strokeLinecap="round" />
            <path d="M274 262 L316 206" {...line} strokeWidth="38" />
            <path d="M274 262 L316 206" fill="none" stroke={suit} strokeWidth="28" strokeLinecap="round" />
            <circle cx="80" cy="200" r="16" fill={SKIN} {...out} />
            <circle cx="320" cy="200" r="16" fill={SKIN} {...out} />
          </>
        ) : (
          <>
            <path d="M128 262 L110 316" {...line} strokeWidth="38" />
            <path d="M128 262 L110 316" fill="none" stroke={suit} strokeWidth="28" strokeLinecap="round" />
            <circle cx="108" cy="322" r="16" fill={need === 'hands' ? MUD : SKIN} {...out} />
            {holding ? (
              <g className="give-rattle">
                <path d="M272 262 L318 214" {...line} strokeWidth="38" />
                <path d="M272 262 L318 214" fill="none" stroke={suit} strokeWidth="28" strokeLinecap="round" />
                <path d="M322 210 L344 160" {...line} strokeWidth="12" />
                <path d="M322 210 L344 160" fill="none" stroke="#F7D046" strokeWidth="6" strokeLinecap="round" />
                <circle cx="350" cy="142" r="26" fill="#F05A8C" {...out} />
                <circle cx="342" cy="134" r="5" fill="#fff" />
                <circle cx="358" cy="150" r="4" fill="#FFE08A" />
                <circle cx="320" cy="210" r="16" fill={SKIN} {...out} />
              </g>
            ) : (
              <>
                <path d="M272 262 L290 316" {...line} strokeWidth="38" />
                <path d="M272 262 L290 316" fill="none" stroke={suit} strokeWidth="28" strokeLinecap="round" />
                <circle cx="292" cy="322" r="16" fill={need === 'hands' ? MUD : SKIN} {...out} />
              </>
            )}
          </>
        )}
        {need === 'ouch' && <path d="M100 312 l16 8 M98 324 l18 6 M104 334 l12 4" fill="none" stroke="#E8304A" strokeWidth="4" strokeLinecap="round" />}
        {doing === 'plaster' && (
          <g className="give-plaster" transform="rotate(-25 108 322)">
            <rect x="84" y="312" width="48" height="20" rx="10" fill="#F4C9A0" {...out} strokeWidth={3.5} />
            <rect x="100" y="312" width="16" height="20" fill="#E8B48A" />
            <circle cx="92" cy="322" r="1.8" fill={INK} />
            <circle cx="124" cy="322" r="1.8" fill={INK} />
          </g>
        )}
        {doing === 'soap' &&
          [
            [96, 304, 14],
            [122, 330, 12],
            [304, 304, 14],
            [282, 334, 12],
            [110, 344, 9],
            [296, 346, 9],
          ].map(([x, y, r], i) => <g key={i} className="give-bubbles">{bubble(x, y, r, i)}</g>)}
        {need === 'hungry' && (
          <g className="baby-rumble">
            <path d="M150 290 q-12 -6 0 -12 M146 312 q-14 -6 0 -12 M250 290 q12 -6 0 -12 M254 312 q14 -6 0 -12" fill="none" stroke="#E0703B" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}
        {doing === 'doctor' && (
          <g className="give-doctor">
            <path d="M168 196 Q150 250 196 268 M232 196 Q250 250 204 268" {...line} strokeWidth="6" />
            <circle cx="200" cy="276" r="16" fill="#C9CED6" {...out} />
            <path className="give-beat" d={heart(200, 244, 1)} fill="#E8304A" stroke={INK} strokeWidth="3" />
          </g>
        )}
      </g>

      {/* the front of the pram, in front of her body */}
      {doing === 'pram' && (
        <g className="give-pram">
          <path d="M50 250 H350 Q346 340 250 346 H150 Q54 340 50 250 Z" fill="#FF8FB1" {...out} />
          <path d="M70 274 H330" {...line} strokeWidth="4" opacity="0.3" />
          <path d="M350 250 L384 200" {...line} strokeWidth="8" />
        </g>
      )}
      {/* head */}
      <g className="baby-head">
        <ellipse cx="112" cy="160" rx="16" ry="20" fill={SKIN} {...out} />
        <ellipse cx="288" cy="160" rx="16" ry="20" fill={SKIN} {...out} />
        <circle cx="200" cy="152" r="88" fill={SKIN} {...out} />
        {need === 'hot' && <circle cx="200" cy="152" r="86" fill="#FF8A70" opacity="0.18" />}
        {need === 'sick' && <circle cx="200" cy="152" r="86" fill="#B8D98A" opacity="0.2" />}
        {/* hair: one curl, or messy tufts */}
        {need === 'messy' ? (
          <g fill="#7A4A30" stroke={INK} strokeWidth="4" strokeLinejoin="round">
            <path d="M150 84 l-14 -34 l26 22 Z" />
            <path d="M180 70 l-6 -40 l20 32 Z" />
            <path d="M214 68 l10 -40 l6 40 Z" />
            <path d="M246 82 l26 -28 l-10 36 Z" />
            <path d="M126 112 l-34 -14 l36 0 Z" />
          </g>
        ) : (
          <path d="M196 66 q-10 -24 12 -30 q-6 14 6 26" fill="#7A4A30" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        )}
        <ellipse cx="144" cy="188" rx="18" ry="12" fill={blush} opacity="0.6" />
        <ellipse cx="256" cy="188" rx="18" ry="12" fill={blush} opacity="0.6" />
        <circle cx="140" cy="184" r="3" fill="#fff" opacity="0.8" />
        <circle cx="252" cy="184" r="3" fill="#fff" opacity="0.8" />
        {/* eyes */}
        {asleep || need === 'sleepy' ? (
          <path d="M152 156 q14 12 28 0 M220 156 q14 12 28 0" {...line} />
        ) : happy ? (
          <path d="M152 160 q14 -16 28 0 M220 160 q14 -16 28 0" {...line} />
        ) : (
          <>
            {[166, 234].map((x) => (
              <g key={x}>
                <ellipse cx={x + (need === 'out' || need === 'bored' ? 6 : 0)} cy="156" rx="14" ry="17" fill="#3A2418" />
                <ellipse cx={x} cy="162" rx="10" ry="7" fill="#6B4A3A" opacity="0.6" />
                <circle cx={x + 5} cy="149" r="6" fill="#fff" />
                <circle cx={x - 5} cy="163" r="2.6" fill="#fff" />
              </g>
            ))}
            {(frown || need === 'hungry' || need === 'thirsty') && <path d="M150 132 L178 124 M222 124 L250 132" {...line} />}
            {need === 'sick' && <path d="M150 146 h32 M218 146 h32" fill="none" stroke={SKIN} strokeWidth="12" strokeLinecap="round" />}
          </>
        )}
        {/* nose (a drip when runny) */}
        {need === 'runny' && drop(194, 178, 0.8, '#BFE6FF')}
        {doing === 'tissue' && (
          <g className="give-tissue">
            <path d="M168 168 L232 160 L240 206 L176 214 Z" fill="#fff" {...out} strokeWidth={4} />
            <path d="M184 176 l40 -4" {...line} strokeWidth="2.5" opacity="0.4" />
          </g>
        )}
        {/* mouth */}
        {doing === 'tissue' ? null : asleep ? (
          <path d="M190 202 q10 6 20 0" {...line} strokeWidth="4" />
        ) : need === 'teeth' || doing === 'toothbrush' ? (
          <g>
            <ellipse cx="200" cy="206" rx="24" ry="20" fill="#8A2B1E" stroke={INK} strokeWidth="4" />
            <path d="M182 194 h36 v8 h-36 Z M186 212 h28 v8 h-28 Z" fill="#fff" />
            {need === 'teeth' && (
              <>
                <circle cx="192" cy="198" r="3" fill="#C98E5A" />
                <circle cx="208" cy="216" r="3" fill="#7ED0B5" />
              </>
            )}
          </g>
        ) : happy ? (
          <path d="M168 192 Q200 234 232 192 Z" fill="#8A2B1E" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        ) : need === 'sleepy' ? (
          <ellipse cx="200" cy="206" rx="14" ry="18" fill="#8A2B1E" stroke={INK} strokeWidth="4" />
        ) : need === 'thirsty' ? (
          <>
            <ellipse cx="200" cy="202" rx="14" ry="10" fill="#8A2B1E" stroke={INK} strokeWidth="4" />
            <path d="M190 204 h20 v14 q0 10 -10 10 q-10 0 -10 -10 Z" fill="#F07B7B" stroke={INK} strokeWidth="3.5" />
          </>
        ) : need === 'cold' ? (
          <g>
            <rect x="178" y="196" width="44" height="16" rx="6" fill="#fff" stroke={INK} strokeWidth="4" />
            <path d="M189 196 v16 M200 196 v16 M211 196 v16" {...line} strokeWidth="2.5" />
          </g>
        ) : need === 'hungry' ? (
          <ellipse cx="200" cy="204" rx="11" ry="12" fill="#8A2B1E" stroke={INK} strokeWidth="4" />
        ) : need === 'bored' ? (
          <path d="M184 206 H216" {...line} />
        ) : frown ? (
          <path d="M178 212 Q200 192 222 212" {...line} />
        ) : (
          <path d="M184 200 Q200 210 216 200" {...line} />
        )}
        {(need === 'sad' || need === 'ouch' || need === 'wet') && (
          <g className="baby-tears">
            {drop(160, 174)}
            {need === 'sad' && drop(240, 174)}
          </g>
        )}
        {(need === 'thirsty' || need === 'hot') && <g className="baby-sweat">{drop(270, 96)}</g>}
        {need === 'sick' && (
          <g>
            <path d="M216 206 L262 224" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
            <path d="M216 206 L262 224" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <circle cx="265" cy="225" r="6" fill="#E8304A" stroke={INK} strokeWidth="2.5" />
          </g>
        )}
        {/* the woolly hat */}
        {doing === 'hat' && (
          <g className="give-hat">
            <path d="M114 124 C114 52 158 34 200 34 C242 34 286 52 286 124 Z" fill="#E8504A" {...out} />
            <rect x="106" y="110" width="188" height="30" rx="14" fill="#F7F2EE" {...out} />
            <circle cx="200" cy="30" r="20" fill="#F7F2EE" {...out} />
            <path d="M150 70 v36 M200 56 v50 M250 70 v36" {...line} strokeWidth="3" opacity="0.35" />
          </g>
        )}
        {doing === 'brush' && (
          <g className="give-brush">
            <rect x="214" y="44" width="110" height="40" rx="20" fill="#B48CF0" {...out} />
            <path d="M226 84 v14 M240 84 v14 M254 84 v14 M268 84 v14 M282 84 v14 M296 84 v14" {...line} strokeWidth="4" />
            <path d="M324 64 L384 40" {...line} strokeWidth="18" />
            <path d="M324 64 L384 40" fill="none" stroke="#B48CF0" strokeWidth="10" strokeLinecap="round" />
          </g>
        )}
        {doing === 'toothbrush' && (
          <g className="give-toothbrush">
            <path d="M226 206 L350 176" {...line} strokeWidth="16" />
            <path d="M226 206 L350 176" fill="none" stroke="#5B8DEF" strokeWidth="8" strokeLinecap="round" />
            <rect x="208" y="190" width="30" height="20" rx="6" fill="#fff" {...out} strokeWidth={3.5} />
            {bubble(178, 232, 9)}
            {bubble(226, 236, 7, 1)}
          </g>
        )}
      </g>

      {/* mud, washed off in the bath */}
      {dirty && (
        <g className="baby-mud">
          <ellipse cx="236" cy="112" rx="16" ry="11" fill={MUD} />
          <ellipse cx="150" cy="210" rx="12" ry="8" fill={MUD} />
          <ellipse cx="236" cy="300" rx="22" ry="14" fill={MUD} />
          <ellipse cx="160" cy="330" rx="16" ry="10" fill={MUD} />
          {waiting && <path className="baby-stink" d="M300 120 q12 -12 0 -24 q-12 -12 0 -24 M326 136 q12 -12 0 -24 q-12 -12 0 -24" fill="none" stroke="#8FBF6A" strokeWidth="5" strokeLinecap="round" />}
        </g>
      )}
      {need === 'sleepy' && (
        <g className="baby-zzz" fill="none" stroke="#5B8DEF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M290 70 h20 l-20 22 h20" />
        </g>
      )}
      {need === 'cold' && <path className="baby-shiver" d="M76 240 l-12 8 l12 8 l-12 8 M324 240 l12 8 l-12 8 l12 8" fill="none" stroke="#5B8DEF" strokeWidth="4" strokeLinecap="round" />}
      {need === 'bored' && (
        <g className="baby-dots" fill="#B0A6C8">
          <circle cx="290" cy="80" r="8" />
          <circle cx="316" cy="66" r="8" />
          <circle cx="342" cy="52" r="8" />
        </g>
      )}
      {/* a thought: a song, or going out */}
      {(need === 'song' || need === 'out') && (
        <g className="baby-think">
          <circle cx="282" cy="92" r="8" fill="#fff" stroke={INK} strokeWidth="3" />
          <circle cx="300" cy="70" r="12" fill="#fff" stroke={INK} strokeWidth="3" />
          <ellipse cx="340" cy="40" rx="50" ry="36" fill="#fff" stroke={INK} strokeWidth="3.5" />
          {need === 'song' ? (
            note(334, 56, '#B48CF0')
          ) : (
            <g>
              <circle cx="364" cy="26" r="11" fill="#FFC531" />
              <rect x="324" y="38" width="8" height="26" rx="3" fill="#A9714A" />
              <circle cx="328" cy="32" r="18" fill="#7ED0B5" stroke={INK} strokeWidth="3" />
            </g>
          )}
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
          ].map(([x, y, r], i) => bubble(x, y, r, i))}
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
      {(doing === 'hug' || doing === 'plaster') && (
        <g className="give-hearts" fill="#E8304A" stroke={INK} strokeWidth="3.5">
          <path d="M200 92 C176 76 182 52 200 64 C218 52 224 76 200 92 Z" />
          <path className="b" d="M90 120 C72 108 76 90 90 99 C104 90 108 108 90 120 Z" />
          <path className="c" d="M310 120 C292 108 296 90 310 99 C324 90 328 108 310 120 Z" />
        </g>
      )}
      {doing === 'fan' && (
        <g>
          <g className="give-wind" fill="none" stroke="#9CC9F2" strokeWidth="6" strokeLinecap="round">
            <path d="M330 150 q-40 -10 -80 0" />
            <path d="M336 190 q-46 -8 -96 4" />
            <path d="M330 230 q-40 -10 -80 0" />
          </g>
          <circle cx="360" cy="190" r="34" fill="#DDF1FF" {...out} />
          <g className="give-fan">
            {[0, 120, 240].map((d) => (
              <ellipse key={d} cx="360" cy="172" rx="10" ry="18" fill="#5B8DEF" transform={`rotate(${d} 360 190)`} />
            ))}
          </g>
          <circle cx="360" cy="190" r="6" fill={INK} />
          <path d="M360 224 V300 M336 300 H384" {...line} strokeWidth="8" />
        </g>
      )}
      {doing === 'nappy' && (
        <g className="give-sparkles">
          {sparkle(110, 250, 1.2)}
          {sparkle(296, 260, 1)}
          {sparkle(200, 380, 1.1, '#7ED0B5')}
          {sparkle(320, 330, 0.8, '#FF8FA3')}
        </g>
      )}
      {doing === 'clothes' && (
        <g className="give-sparkles">
          {sparkle(120, 330, 1.1)}
          {sparkle(290, 320, 1, '#7ED0B5')}
          {sparkle(200, 250, 0.9, '#FF8FA3')}
        </g>
      )}
      {doing === 'music' && (
        <g>
          <g className="give-note">{note(80, 120, '#B48CF0')}</g>
          <g className="give-note b">{note(320, 110, '#FF8FA3')}</g>
          <g className="give-note c">{note(300, 240, '#7ED0B5')}</g>
        </g>
      )}
      {doing === 'rattle' && (
        <g className="give-shake" fill="none" stroke="#F05A8C" strokeWidth="4" strokeLinecap="round">
          <path d="M374 112 q10 -6 14 -18 M384 140 q12 0 20 -8" />
        </g>
      )}
    </svg>
  );
}
