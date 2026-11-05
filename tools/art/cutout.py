"""Cut out every photo's subject (rembg, isnet-general-use) and save the mask + stats for review.
Usage: python cutout.py <repo> <outdir>"""
import sys, os, glob, json
import numpy as np
from PIL import Image
from rembg import new_session, remove
repo, out = sys.argv[1], sys.argv[2]
sess = new_session('isnet-general-use')
files = sorted(glob.glob(f'{repo}/public/assets/packs/*/*.jpg') + glob.glob(f'{repo}/public/assets/packs/*/*.webp') + glob.glob(f'{repo}/public/assets/packs/*/*.png'))
stats = {}
for i, f in enumerate(files):
    rel = os.path.relpath(f, f'{repo}/public/assets/packs')
    dst = os.path.join(out, rel.replace('/', '__') + '.png')
    if os.path.exists(dst):
        continue
    im = Image.open(f).convert('RGB')
    cut = remove(im, session=sess, post_process_mask=True)
    a = np.asarray(cut.split()[-1], dtype=np.float32) / 255
    cov = float((a > 0.5).mean())
    # How much of the border is foreground: a subject touching every edge is probably a scene.
    border = float(np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]).mean())
    cut.save(dst)
    stats[rel] = {'coverage': round(cov, 3), 'border': round(border, 3)}
    if i % 20 == 0:
        print(i, len(files), rel, stats[rel], flush=True)
json.dump(stats, open(os.path.join(out, 'stats.json'), 'w'), indent=1)
print('done', len(files))
