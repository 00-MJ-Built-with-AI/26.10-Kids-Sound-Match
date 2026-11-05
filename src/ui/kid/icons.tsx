export function SpeakerIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true" style={direction === 'left' ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M9 4.5l7.5 7.5L9 19.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Home screen's Explore button. */
export function ExploreIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path d="M15 15l5 5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Two cards, one face up. */
export function MemoryIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.5" y="5" width="9" height="13" rx="2" fill="currentColor" opacity="0.35" />
      <rect x="12.5" y="5" width="9" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="11.5" r="2.2" fill="currentColor" />
    </svg>
  );
}

/** Three circles and one triangle. */
export function OddIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6.5" cy="7" r="3.2" fill="currentColor" />
      <circle cx="17.5" cy="7" r="3.2" fill="currentColor" />
      <circle cx="6.5" cy="17.5" r="3.2" fill="currentColor" />
      <path d="M17.5 13.6l3.8 6.6h-7.6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/** A blanket with a pair of eyes peeking out. */
export function PeekabooIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 9.5Q12 6.5 21 9.5V19q-2.2 1.6-4.5 0-2.2 1.6-4.5 0-2.2 1.6-4.5 0-2.2 1.6-4.5 0z" fill="currentColor" opacity="0.35" />
      <circle cx="9" cy="6" r="2.1" fill="currentColor" />
      <circle cx="15" cy="6" r="2.1" fill="currentColor" />
    </svg>
  );
}

/** A little house with a sun: a scene to look around. */
export function SceneIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12.5L10 6l7 6.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M5 11.5V20h10v-8.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="19.5" cy="5" r="2.4" fill="currentColor" opacity="0.5" />
      <path d="M2 20.5h20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/** A face with a finger pointing at its nose. */
/** Do it with me: a little person jumping with arms up. */
export function ActionsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="4.5" r="2.4" fill="currentColor" />
      <path
        d="M4.5 6.5l7.5 3.5 7.5-3.5M12 10v5.5M12 15.5l-4 5M12 15.5l4 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PointIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10" cy="11" r="7.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="7.5" cy="9.5" r="1.1" fill="currentColor" />
      <circle cx="12.5" cy="9.5" r="1.1" fill="currentColor" />
      <path d="M10 10.5v3h1.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 21l-6.5-6.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

const ICON = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function TalkIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V16.5H4A1.5 1.5 0 0 1 2.5 15V7A1.5 1.5 0 0 1 4 5.5z" {...ICON} />
      <circle cx="8" cy="11" r="1.2" fill="currentColor" />
      <circle cx="12" cy="11" r="1.2" fill="currentColor" />
      <circle cx="16" cy="11" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function BookIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 6.5C9.5 4.8 6 4.5 3 5.5v13c3-1 6.5-.7 9 1 2.5-1.7 6-2 9-1v-13c-3-1-6.5-.7-9 1zM12 6.5v13" {...ICON} />
      <path d="M17.5 2.5a2.6 2.6 0 1 0 2.5 3.2 2 2 0 1 1-2.5-3.2z" fill="currentColor" />
    </svg>
  );
}

export function CareIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="8" width="8" height="13" rx="3" {...ICON} />
      <path d="M9 8V6.5h6V8M10.5 6.5c0-2 .6-3.5 1.5-3.5s1.5 1.5 1.5 3.5M10 12.5h2.5M10 15.5h2.5" {...ICON} />
    </svg>
  );
}

export function TurnsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 10a7 7 0 0 1 12.5-3.5M19 14a7 7 0 0 1-12.5 3.5" {...ICON} />
      <path d="M18 3v4h-4M6 21v-4h4" {...ICON} />
    </svg>
  );
}

export function DayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="9" r="3.5" {...ICON} />
      <path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M4 4l1 1M13 13l1 1M14 4l-1 1M5 13l-1 1" {...ICON} />
      <path d="M20.5 15.5a4.5 4.5 0 1 1-5-5 3.5 3.5 0 0 0 5 5z" fill="currentColor" />
    </svg>
  );
}

export function SoundsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 9c0-3 2-5 5-5s5 2 5 5v3c0 3-2 5-5 5s-5-2-5-5z" {...ICON} />
      <circle cx="8.3" cy="9.5" r="1" fill="currentColor" />
      <circle cx="11.7" cy="9.5" r="1" fill="currentColor" />
      <path d="M8.5 13.5h3M17.5 8.5c1 1 1 3 0 4M20 6.5c2 2 2 6 0 8" {...ICON} />
    </svg>
  );
}

export function HuntIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3c-5 0-9 3.5-9 8s3.5 7 6.5 7c1.5 0 1.5-1.5 1-2.5s0-2.5 1.5-2.5H15c3.5 0 6-2 6-5 0-3-4-5-9-5z" {...ICON} />
      <circle cx="7.5" cy="10" r="1.4" fill="currentColor" />
      <circle cx="11" cy="7" r="1.4" fill="currentColor" />
      <circle cx="15.5" cy="7.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function BigIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="13" r="6" {...ICON} />
      <circle cx="18.5" cy="16" r="3" {...ICON} />
    </svg>
  );
}

export function MissingIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.5" y="9" width="5" height="7" rx="1.5" {...ICON} />
      <path d="M9.5 16.5c0-6 1.5-8 5-8s5 2 5 8z" fill="currentColor" />
      <path d="M2 19.5h20" {...ICON} />
    </svg>
  );
}

export function CountIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="12" r="2.6" fill="currentColor" />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
      <circle cx="19" cy="12" r="2.6" fill="currentColor" />
      <path d="M3.5 18.5h17" {...ICON} />
    </svg>
  );
}

export function BubblesIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="14" r="6" {...ICON} />
      <circle cx="17.5" cy="6.5" r="3.5" {...ICON} />
      <path d="M6.5 11.5a3 3 0 0 1 2.5-1.5" {...ICON} />
    </svg>
  );
}

export function TidyIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 11h17l-1.5 9.5h-14z" {...ICON} />
      <path d="M3 8h18M9 8l1-4h4l1 4" {...ICON} />
    </svg>
  );
}

export function SingIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 18V5l11-2v13" {...ICON} />
      <circle cx="6.5" cy="18" r="2.5" fill="currentColor" />
      <circle cx="17.5" cy="16" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function FeelIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" {...ICON} />
      <circle cx="9" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" />
      <path d="M8.5 14.5c1 1.5 2 2 3.5 2s2.5-.5 3.5-2" {...ICON} />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" {...ICON} />
      <path d="M17 4.5l.6 1.3 1.4.2-1 1 .2 1.4-1.2-.7-1.2.7.2-1.4-1-1 1.4-.2z" fill="currentColor" />
    </svg>
  );
}

export function PuzzleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h6v2a2 2 0 1 0 4 0V4h6v6h-2a2 2 0 1 0 0 4h2v6h-6v-2a2 2 0 1 0-4 0v2H4z" {...ICON} />
    </svg>
  );
}

export function ShapesIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="7" cy="7" r="4" {...ICON} />
      <rect x="13" y="3" width="8" height="8" rx="1" {...ICON} />
      <path d="M12 13l5 8H7z" {...ICON} />
    </svg>
  );
}

export function OppositesIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 20V5M6 5l-3 3M6 5l3 3M18 4v15M18 19l-3-3M18 19l3-3" {...ICON} />
    </svg>
  );
}
