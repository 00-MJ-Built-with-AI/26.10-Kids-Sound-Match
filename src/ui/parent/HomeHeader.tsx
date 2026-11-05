import type { Season } from '../../settings/season';
import { Mascot } from '../kid/Mascot';

type Time = 'morning' | 'day' | 'evening' | 'night';

/** Which part of the day it is, for the header's sky. */
export function timeOfDay(hour: number): Time {
  if (hour >= 6 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

const SKY: Record<Time, [string, string]> = {
  morning: ['#FFE6D5', '#DDF1FF'],
  day: ['#BFE6FF', '#E8F6FF'],
  evening: ['#FFC2A8', '#E8C6F0'],
  night: ['#2E3560', '#4A4F86'],
};

/**
 * Home's header: a little scene whose sky follows the time of day (a rising sun in the morning, a
 * sunset in the evening, the moon and stars at night), drifting clouds, hills, the bunny waving and
 * the child's own avatar. The app's name sits on top.
 */
export function HomeHeader({
  title,
  tagline,
  avatar,
  season,
  seasonLine,
}: {
  title: string;
  tagline: string;
  avatar?: React.ReactNode;
  /** Ramadan or Eid: lanterns hang from the top of the sky. */
  season?: Season | null;
  seasonLine?: string;
}) {
  const time = timeOfDay(new Date().getHours());
  const [top, bottom] = SKY[time];
  const night = time === 'night';
  return (
    <header className={`home-header scene-header ${time}`}>
      <svg className="header-scene" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="hdr-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={top} />
            <stop offset="1" stopColor={bottom} />
          </linearGradient>
        </defs>
        <rect width="400" height="200" fill="url(#hdr-sky)" />
        {night ? (
          <g>
            <path d="M330 26 a22 22 0 1 0 14 40 a17 17 0 1 1 -14 -40 Z" fill="#FFE08A" />
            {[
              [40, 30],
              [90, 60],
              [160, 22],
              [230, 48],
              [280, 18],
              [370, 80],
            ].map(([x, y], i) => (
              <circle key={i} className={`hdr-star s${i % 3}`} cx={x} cy={y} r="2.4" fill="#fff" />
            ))}
          </g>
        ) : (
          <g className={`hdr-sun ${time}`}>
            <circle cx={time === 'evening' ? 60 : 330} cy={time === 'morning' ? 70 : time === 'evening' ? 96 : 44} r="24" fill={time === 'evening' ? '#FF9F80' : '#FFD54A'} />
            <circle cx={time === 'evening' ? 60 : 330} cy={time === 'morning' ? 70 : time === 'evening' ? 96 : 44} r="38" fill={time === 'evening' ? '#FF9F80' : '#FFD54A'} opacity="0.25" />
          </g>
        )}
        <g className="hdr-clouds" opacity={night ? 0.25 : 0.95}>
          <g transform="translate(80 50)">
            <ellipse rx="30" ry="14" fill="#fff" />
            <ellipse cx="-20" cy="5" rx="20" ry="11" fill="#fff" />
            <ellipse cx="22" cy="5" rx="22" ry="11" fill="#fff" />
          </g>
          <g transform="translate(250 34) scale(0.8)">
            <ellipse rx="30" ry="14" fill="#fff" />
            <ellipse cx="-20" cy="5" rx="20" ry="11" fill="#fff" />
            <ellipse cx="22" cy="5" rx="22" ry="11" fill="#fff" />
          </g>
        </g>
        <path d="M0 160 Q90 120 190 150 T400 140 V200 H0 Z" fill={night ? '#3D4A72' : '#C9EBB8'} />
        <path d="M0 178 Q120 150 230 176 T400 168 V200 H0 Z" fill={night ? '#344066' : '#B4E0A6'} />
        {season && (
          <g className="hdr-lanterns">
            {/* Inside what a 320 px phone still shows of the sky, clear of the moon and the title. */}
            {[
              [78, 34, 0],
              [290, 46, 1],
            ].map(([x, len, i]) => (
              <g key={i} className={`hdr-lantern l${i}`} style={{ transformOrigin: `${x}px 0px` }}>
                <path d={`M${x} 0 V${len}`} stroke="#5A3B2B" strokeWidth="1.6" />
                <g transform={`translate(${x} ${len + 22}) scale(0.24)`}>
                  <path d="M-34 -70 L0 -104 L34 -70 Z" fill="#E8B94A" stroke="#5A3B2B" strokeWidth="5" />
                  <path d="M-40 -58 L-52 20 L-30 70 L30 70 L52 20 L40 -58 Z" fill="#F6C85F" stroke="#5A3B2B" strokeWidth="5" />
                  <path d="M-28 -50 L-38 18 L-22 58 L-6 58 L-6 -50 Z" fill={i === 1 ? '#7ED0B5' : '#F05A8C'} />
                  <path d="M6 -50 L6 58 L22 58 L38 18 L28 -50 Z" fill={i === 1 ? '#F7D046' : '#7ED0B5'} />
                  <ellipse cx="0" cy="6" rx="10" ry="16" fill="#FFF4C2" className="hdr-glow" />
                  <path d="M-16 70 L0 92 L16 70 Z" fill="#E8B94A" stroke="#5A3B2B" strokeWidth="5" />
                </g>
              </g>
            ))}
            {season === 'eid' &&
              [60, 110, 160, 210, 250].map((x, i) => (
                <path key={x} d={`M${x - 9} ${8 + (i % 2) * 4} L${x + 9} ${10 + (i % 2) * 4} L${x} ${30 + (i % 2) * 4} Z`} fill={['#F05A8C', '#F7D046', '#7ED0B5', '#5B8DEF', '#B48CF0'][i]} />
              ))}
            {season === 'eid' && <path d="M40 6 Q150 26 270 10" fill="none" stroke="#C99A5B" strokeWidth="1.4" />}
          </g>
        )}
        {!night &&
          [30, 70, 120, 300, 350].map((x, i) => (
            <circle key={x} cx={x} cy={186 - (i % 2) * 6} r="4" fill={['#FFB3C6', '#FFE08A', '#fff', '#C9B8FF', '#FFB3C6'][i]} />
          ))}
      </svg>
      <div className="header-mascot">
        <Mascot mood={night ? 'sleep' : 'wave'} />
      </div>
      {avatar && <div className="header-avatar">{avatar}</div>}
      <div className="header-text">
        <h1>{title}</h1>
        <p className="tagline">{tagline}</p>
        {seasonLine && <p className="season-line">{seasonLine}</p>}
      </div>
    </header>
  );
}
