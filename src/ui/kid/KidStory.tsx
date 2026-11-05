import { useMemo, useRef, useState } from 'react';
import { ClipResolver } from '../../audio/clips';
import type { LoadedItem, LoadedPack } from '../../content/types';
import { useI18n } from '../../i18n/I18n';
import { spokenLanguages } from '../../settings/settings';
import type { PickerOptions } from './EndScreen';
import { ArrowIcon } from './icons';
import type { KidConfig, KidSnapshot } from './kidSnapshot';
import { choosePictures } from './layout';
import { Mascot } from './Mascot';
import { Burst } from './OptionGrid';
import { sceneUrl } from './sceneMap';
import { questionDone } from './sitting';
import { ShellFrame, useKidShell } from './useKidShell';

/** Something on a page she can tap: a picture from a pack, where it stands (% of the page). */
interface Thing {
  ref: string;
  x: number;
  y: number;
}

interface Page {
  /** The page's line (an item of the Stories pack, so it can be recorded like any other). */
  line: string;
  /** Its background (a pack whose scene it borrows). */
  scene: string;
  things: Thing[];
}

/**
 * The stories: her drawn character and the bunny go to the farm, have a bath, visit Teta. Each page
 * says its line; she taps the things on it (each makes its sound and says its name).
 */
export const STORIES: Record<string, Page[]> = {
  farm: [
    { line: 'story_farm_1', scene: 'animals', things: [{ ref: 'animals/dog', x: 50, y: 40 }] },
    { line: 'story_farm_2', scene: 'animals', things: [{ ref: 'animals/cow', x: 30, y: 38 }, { ref: 'animals/sheep', x: 70, y: 44 }] },
    { line: 'story_farm_3', scene: 'animals', things: [{ ref: 'animals/duck', x: 30, y: 44 }, { ref: 'animals/hen', x: 70, y: 38 }] },
    { line: 'story_farm_4', scene: 'animals', things: [{ ref: 'animals/horse', x: 34, y: 38 }, { ref: 'food/carrot', x: 70, y: 48 }] },
    { line: 'story_farm_5', scene: 'animals', things: [{ ref: 'animals/goat', x: 30, y: 42 }, { ref: 'animals/donkey', x: 70, y: 38 }] },
  ],
  bath: [
    { line: 'story_bath_1', scene: 'care', things: [{ ref: 'care/baby_bath', x: 50, y: 40 }] },
    { line: 'story_bath_2', scene: 'care', things: [{ ref: 'care/baby_soap', x: 50, y: 40 }] },
    { line: 'story_bath_3', scene: 'care', things: [{ ref: 'toys/rubber_duck', x: 50, y: 42 }] },
    { line: 'story_bath_4', scene: 'care', things: [{ ref: 'care/baby_toothbrush', x: 50, y: 40 }] },
    { line: 'story_bath_5', scene: 'care', things: [{ ref: 'care/baby_clothes', x: 32, y: 40 }, { ref: 'family/mama', x: 68, y: 42 }] },
  ],
  potty: [
    { line: 'story_potty_1', scene: 'home', things: [{ ref: 'potty/potty_potty', x: 50, y: 42 }] },
    { line: 'story_potty_2', scene: 'home', things: [{ ref: 'potty/potty_pants', x: 32, y: 40 }, { ref: 'potty/potty_potty', x: 68, y: 44 }] },
    { line: 'story_potty_3', scene: 'home', things: [{ ref: 'potty/potty_sticker', x: 50, y: 40 }] },
    { line: 'story_potty_4', scene: 'home', things: [{ ref: 'potty/potty_paper', x: 32, y: 42 }, { ref: 'potty/potty_flush', x: 68, y: 40 }] },
    { line: 'story_potty_5', scene: 'home', things: [{ ref: 'actions/wash_hands', x: 34, y: 42 }, { ref: 'potty/potty_sticker', x: 68, y: 40 }] },
  ],
  teta: [
    { line: 'story_teta_1', scene: 'vehicles', things: [{ ref: 'vehicles/car', x: 50, y: 44 }] },
    { line: 'story_teta_2', scene: 'vehicles', things: [{ ref: 'vehicles/bus', x: 30, y: 40 }, { ref: 'vehicles/bicycle', x: 70, y: 46 }] },
    { line: 'story_teta_3', scene: 'home', things: [{ ref: 'family/grandma', x: 34, y: 40 }, { ref: 'home/doorbell', x: 70, y: 38 }] },
    { line: 'story_teta_4', scene: 'food', things: [{ ref: 'food/cookie', x: 32, y: 42 }, { ref: 'food/milk', x: 68, y: 42 }] },
    { line: 'story_teta_5', scene: 'home', things: [{ ref: 'animals/cat', x: 34, y: 42 }, { ref: 'family/grandpa', x: 68, y: 40 }] },
  ],
};
const STORY_IDS = Object.keys(STORIES);

export function KidStory(props: {
  pack: LoadedPack;
  packs: readonly LoadedPack[];
  config: KidConfig;
  snapshot: KidSnapshot | null;
  picker?: PickerOptions;
  onExit: () => void;
}) {
  const { pack, packs, config } = props;
  const { lang } = useI18n();
  const rtl = lang === 'ar';
  const languages = spokenLanguages(config.language);
  /** Every picture the stories use, found in its pack. */
  const things = useMemo(() => {
    const map = new Map<string, { item: LoadedItem; pack: LoadedPack; picture: string }>();
    for (const page of Object.values(STORIES).flat()) {
      for (const t of page.things) {
        const [packId, key] = t.ref.split('/');
        const p = packs.find((x) => x.id === packId);
        const item = p?.items.find((i) => i.key === key);
        if (p && item && !map.has(t.ref)) map.set(t.ref, { item, pack: p, picture: choosePictures([item])[item.key] });
      }
    }
    return map;
  }, [packs]);
  const resolvers = useMemo(() => new Map(packs.map((p) => [p.id, new ClipResolver(p, languages)])), [packs]);
  const lines = useMemo(() => new Map(pack.items.map((i) => [i.key, i])), [pack]);
  /** Stories whose lines are all there. */
  const stories = STORY_IDS.filter((id) => STORIES[id].every((p) => lines.has(p.line)));

  const [story, setStory] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [turn, setTurn] = useState<'next' | 'back'>('next');
  const [tapped, setTapped] = useState<{ ref: string; n: number } | null>(null);
  const [bunny, setBunny] = useState<'wave' | 'cheer'>('wave');
  const taps = useRef(0);
  const bunnyTimer = useRef(0);

  const narrate = (id: string, p: number) => {
    if (!shell.canPlay()) return;
    const item = lines.get(STORIES[id][p].line);
    if (item) void shell.audio.say(shell.audio.resolver.names(item));
  };
  const shell = useKidShell({
    ...props,
    onStart: () => {
      // Started for one story (Potty time → Read the potty story): straight to it.
      if (config.storyId && STORIES[config.storyId]) open(config.storyId);
      else {
        setStory(null);
        setPage(0);
      }
    },
    onResume: () => {
      if (story) narrate(story, page);
    },
  });

  const open = (id: string) => {
    setStory(id);
    setPage(0);
    setTurn('next');
    shell.audio.preload(STORIES[id].flatMap((p) => p.things.map((t) => things.get(t.ref)?.item).filter((i): i is LoadedItem => !!i)));
    narrate(id, 0);
  };
  const go = (to: number) => {
    if (!story || !shell.canPlay()) return;
    if (to >= STORIES[story].length) {
      shell.audio.stop();
      questionDone();
      shell.finish();
      return;
    }
    const next = Math.max(0, to);
    setTurn(next >= page ? 'next' : 'back');
    setPage(next);
    setTapped(null);
    narrate(story, next);
    questionDone();
  };
  const tap = (ref: string) => {
    if (!shell.canPlay()) return;
    const t = things.get(ref);
    if (!t) return;
    const r = resolvers.get(t.pack.id)!;
    void shell.audio.say([r.sound(t.item), ...r.names(t.item)].filter((c) => c !== null));
    setTapped({ ref, n: ++taps.current });
    setBunny('cheer');
    window.clearTimeout(bunnyTimer.current);
    bunnyTimer.current = window.setTimeout(() => setBunny('wave'), 1400);
  };

  const avatar = config.avatar;
  const her = (
    <span className="story-her" style={avatar ? { background: avatar.color } : undefined} aria-hidden="true">
      {avatar?.picture ? <img src={avatar.picture} alt="" draggable={false} /> : <span>{avatar?.animal ?? '🙂'}</span>}
    </span>
  );
  const current = story ? STORIES[story][page] : null;

  return (
    <ShellFrame shell={shell} kind="story" {...props}>
      {!story ? (
        // Which story? Three covers, no words: she taps one.
        <div className="story-choose">
          {stories.map((id) => {
            const first = STORIES[id][0];
            const cover = things.get(first.things[0].ref);
            return (
              <button
                type="button"
                key={id}
                className={`story-cover cover-${id}`}
                style={{ backgroundImage: `url("${sceneUrl(first.scene)}")` }}
                onClick={() => open(id)}
              >
                {cover && <img src={cover.picture} alt="" draggable={false} />}
                <span className="story-cover-friends" aria-hidden="true">
                  {her}
                  <Mascot mood="wave" />
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        current && (
          <div className="story" dir="ltr">
            <div
              className={`story-page ${turn}`}
              key={`${story}-${page}`}
              style={{ backgroundImage: `url("${sceneUrl(current.scene)}")` }}
              onPointerDown={(e) => {
                if (e.target === e.currentTarget) narrate(story, page);
              }}
            >
              {current.things.map((t) => {
                const info = things.get(t.ref);
                if (!info) return null;
                const hit = tapped?.ref === t.ref;
                return (
                  <button
                    type="button"
                    key={t.ref}
                    className={`story-thing${hit ? ' hit' : ''}`}
                    style={{ left: `${t.x}%`, top: `${t.y}%` }}
                    onClick={() => tap(t.ref)}
                    aria-label={info.item.name[lang]}
                  >
                    <img key={hit ? tapped.n : 0} src={info.picture} alt="" draggable={false} />
                    {hit && <Burst key={tapped.n} size={120} quiet />}
                  </button>
                );
              })}
              <span className={`story-friend story-her-wrap${tapped ? ' happy' : ''}`} key={tapped?.n ?? 0}>
                {her}
              </span>
              <span className="story-friend story-bunny" onPointerDown={() => narrate(story, page)}>
                <Mascot mood={bunny} />
              </span>
            </div>
            <div className="book-dots" aria-hidden="true">
              {STORIES[story].map((_, i) => (
                <span key={i} className={i === page ? 'on' : ''} />
              ))}
            </div>
            <button type="button" className={`book-turn ${rtl ? 'left' : 'right'}`} aria-label="next" onClick={() => go(page + 1)}>
              <ArrowIcon direction={rtl ? 'left' : 'right'} />
            </button>
            {page > 0 && (
              <button type="button" className={`book-turn back ${rtl ? 'right' : 'left'}`} aria-label="back" onClick={() => go(page - 1)}>
                <ArrowIcon direction={rtl ? 'right' : 'left'} />
              </button>
            )}
          </div>
        )
      )}
    </ShellFrame>
  );
}
