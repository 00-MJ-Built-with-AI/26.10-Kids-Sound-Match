import { useEffect } from 'react';
import { GAMES, gamePicture } from '../parent/games';
import { useI18n } from '../../i18n/I18n';
import { KidFrame } from './KidFrame';
import type { PickerOptions } from './EndScreen';
import { clearKidSnapshot, saveKidSnapshot, type KidConfig, type KidKind } from './kidSnapshot';

const SOFT = ['#FDE3EC', '#E0ECFB', '#E2F4E2', '#FDF3CF'];

/** Her own menu: four giant pictures and no words. */
export function MenuGrid({ kinds, onPick }: { kinds: readonly KidKind[]; onPick: (kind: KidKind) => void }) {
  const { t } = useI18n();
  return (
    <div className={`her-menu n${kinds.length}`}>
      {kinds.map((kind, i) => (
        <button
          type="button"
          key={kind}
          className="her-menu-tile"
          style={{ background: SOFT[i % SOFT.length] }}
          aria-label={GAMES[kind] ? t(GAMES[kind].label) : kind}
          onClick={() => onPick(kind)}
        >
          <img src={gamePicture(kind)} alt="" draggable={false} />
        </button>
      ))}
    </div>
  );
}

/** "Let her choose": locked like a game, and only the parent's corner leads out of it. */
export function KidMenu({ config, picker, onExit }: { config: KidConfig; picker?: PickerOptions; onExit: () => void }) {
  useEffect(() => {
    saveKidSnapshot({ v: 1, config, startedAt: Date.now(), stage: 'idle', session: null });
  }, [config]);
  return (
    <KidFrame
      stage="idle"
      onGateOpen={() => undefined}
      onGateCancel={() => undefined}
      onExit={() => {
        clearKidSnapshot();
        onExit();
      }}
    >
      {picker?.menu && <MenuGrid kinds={picker.menu} onPick={picker.onMenu!} />}
    </KidFrame>
  );
}
