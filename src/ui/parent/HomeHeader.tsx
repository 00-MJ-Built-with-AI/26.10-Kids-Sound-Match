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
export function HomeHeader({ title, tagline, avatar }: { title: string; tagline: string; avatar?: React.ReactNode }) {
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
      </div>
    </header>
  );
}
