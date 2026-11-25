/**
 * The camera's recognition model (COCO-SSD, the small "lite" version), loaded only when a camera
 * game opens: this file is imported on demand, so the 2 MB of TensorFlow code and the 18 MB model
 * stay out of the app's first load. The model files are part of the app (public/models/coco-ssd)
 * and nothing seen by the camera leaves the phone.
 */
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import { load, type ObjectDetection } from '@tensorflow-models/coco-ssd';

let model: Promise<ObjectDetection> | null = null;

export function loadDetector(): Promise<ObjectDetection> {
  model ??= (async () => {
    // The phone's graphics chip when it can; the slower processor otherwise.
    try {
      await tf.setBackend('webgl');
    } catch {
      await tf.setBackend('cpu');
    }
    await tf.ready();
    return load({ base: 'lite_mobilenet_v2', modelUrl: `${import.meta.env.BASE_URL}models/coco-ssd/model.json` });
  })().catch((e) => {
    model = null;
    throw e;
  });
  return model;
}

/** What the model sees in one frame: names and scores (the boxes in the video's pixels). */
export async function look(video: HTMLVideoElement): Promise<{ name: string; score: number; box: [number, number, number, number] }[]> {
  const detector = await loadDetector();
  const found = await detector.detect(video, 6, 0.35);
  return found.map((d) => ({ name: d.class, score: d.score, box: d.bbox }));
}
