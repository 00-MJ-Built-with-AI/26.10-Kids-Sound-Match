import { useEffect, useRef, useState } from 'react';
import { sureThing } from './cocoWords';

export type CameraState = 'starting' | 'loading' | 'ready' | 'denied' | 'failed';
export interface Box {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A look every this many ms: often enough to feel quick, gently enough for an older phone. */
const LOOK_EVERY_MS = 350;

/**
 * The back camera and the model, while `active`: calls `onSure` with the model's name when it is
 * sure it sees something (the same thing in most of the last few looks). The boxes, in % of the
 * video, show what it is looking at. Everything stays on the phone.
 */
export function useCamera(active: boolean, onSure: (name: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<CameraState>('starting');
  const [boxes, setBoxes] = useState<Box[]>([]);
  const latest = useRef(onSure);
  latest.current = onSure;

  useEffect(() => {
    if (!active) return;
    let stopped = false;
    let stream: MediaStream | null = null;
    let timer = 0;
    const looks: { name: string; score: number }[][] = [];
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('no camera');
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      } catch (e) {
        if (!stopped) setState(e instanceof DOMException && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? 'denied' : 'failed');
        return;
      }
      if (stopped) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      setState('loading');
      let detector: typeof import('./detector');
      try {
        detector = await import('./detector');
        await detector.loadDetector();
      } catch (e) {
        console.warn('[camera] the model did not load', e);
        if (!stopped) setState('failed');
        return;
      }
      if (stopped) return;
      setState('ready');
      const tick = async () => {
        if (stopped) return;
        if (document.visibilityState === 'visible' && video.readyState >= 2 && video.videoWidth) {
          try {
            const seen = await detector.look(video);
            looks.push(seen.map((d) => ({ name: d.name, score: d.score })));
            if (looks.length > 8) looks.shift();
            const vw = video.videoWidth;
            const vh = video.videoHeight;
            setBoxes(seen.filter((d) => d.score >= 0.5).map((d) => ({ name: d.name, x: (d.box[0] / vw) * 100, y: (d.box[1] / vh) * 100, w: (d.box[2] / vw) * 100, h: (d.box[3] / vh) * 100 })));
            const sure = sureThing(looks);
            if (sure) {
              looks.length = 0;
              latest.current(sure);
            }
          } catch (e) {
            console.warn('[camera] look failed', e);
          }
        }
        if (!stopped) timer = window.setTimeout(() => void tick(), LOOK_EVERY_MS);
      };
      void tick();
    })();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
      setBoxes([]);
    };
  }, [active]);

  return { videoRef, state, boxes };
}
