import { useI18n } from '../../i18n/I18n';
import type { Look } from '../../settings/settings';
import { Mascot } from '../kid/Mascot';

/** The five looks, each shown with the same cow (Settings and the end of a game). */
export function LookGrid({ look, onChange }: { look: Look; onChange: (look: Look) => void }) {
  const { t } = useI18n();
  const base = `${import.meta.env.BASE_URL}assets/`;
  const tiles: { id: Look; label: string; picture: string }[] = [
    { id: 'now', label: t('lookNow'), picture: `${base}packs/animals/cow.jpg` },
    { id: 'sticker', label: t('lookSticker'), picture: `${base}looks/sticker/animals/cow.webp` },
    { id: 'storybook', label: t('lookStorybook'), picture: `${base}packs/animals/cow.svg` },
    { id: 'puffy', label: t('lookPuffy'), picture: `${base}looks/puffy/animals/cow.webp` },
    { id: 'bunny', label: t('lookBunny'), picture: `${base}packs/animals/cow.jpg` },
  ];
  return (
    <div className="look-grid" role="radiogroup" aria-label={t('settingsLook')}>
      {tiles.map((tile) => (
        <button
          type="button"
          key={tile.id}
          role="radio"
          aria-checked={look === tile.id}
          className={`look-tile look-tile-${tile.id}${look === tile.id ? ' on' : ''}`}
          onClick={() => onChange(tile.id)}
        >
          <span className="look-pic">
            <img src={tile.picture} alt="" />
            {tile.id === 'bunny' && <Mascot mood="wave" className="look-bunny" />}
          </span>
          {tile.label}
        </button>
      ))}
    </div>
  );
}
