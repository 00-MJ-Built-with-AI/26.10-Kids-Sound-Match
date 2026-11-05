"""Compose the cut-out photos into the app's soft "sticker on a pastel circle" style.

Usage: python compose.py <repo> <cutdir> <outdir> [--write]
  Writes previews to <outdir>; with --write, also replaces the photos in the repo (same path and format).
A photo whose subject couldn't be cut out cleanly (a scene: rain, waves, a forest; or the cut-out
covers almost all or almost none of it) is kept whole, cropped into the circle instead.
"""
import sys, os, json, glob, hashlib
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

repo, cutdir, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
write = '--write' in sys.argv
os.makedirs(outdir, exist_ok=True)
stats = json.load(open(os.path.join(cutdir, 'stats.json')))
SIZE = 720
PASTELS = ['#FFE3EC', '#E0F0FF', '#FFF1C9', '#E2F5DD', '#EFE6FF', '#FFE6D5', '#DDF6F3', '#FCE4F4']
# Whole scenes: keep the photo, framed in the circle.
SCENE_PACKS = {'weather', 'where-lives'}
KEEP_WHOLE = set(json.load(open(os.path.join(cutdir, 'keep.json')))) if os.path.exists(os.path.join(cutdir, 'keep.json')) else set()

def hex_rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))

def pastel_for(rel):
    return PASTELS[int(hashlib.md5(rel.encode()).hexdigest(), 16) % len(PASTELS)]

def base(rel):
    img = Image.new('RGB', (SIZE, SIZE), (255, 255, 255))
    d = ImageDraw.Draw(img)
    c = hex_rgb(pastel_for(rel))
    r = int(SIZE * 0.49)
    d.ellipse([SIZE / 2 - r, SIZE / 2 - r, SIZE / 2 + r, SIZE / 2 + r], fill=c)
    # A soft lighter glow at the top-left of the circle.
    glow = Image.new('L', (SIZE, SIZE), 0)
    ImageDraw.Draw(glow).ellipse([SIZE * 0.18, SIZE * 0.12, SIZE * 0.62, SIZE * 0.5], fill=110)
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    img.paste((255, 255, 255), (0, 0), glow)
    return img

def sticker(rel, cut):
    img = base(rel)
    a = cut.split()[-1]
    box = a.point(lambda v: 255 if v > 24 else 0).getbbox()
    if not box:
        return None
    subj = cut.crop(box)
    w, h = subj.size
    scale = min(SIZE * 0.8 / w, SIZE * 0.8 / h)
    subj = subj.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.LANCZOS)
    w, h = subj.size
    x = (SIZE - w) // 2
    y = (SIZE - h) // 2 - int(SIZE * 0.02)
    alpha = subj.split()[-1]
    # Soft shadow on the ground under the subject.
    sh = Image.new('L', (SIZE, SIZE), 0)
    ImageDraw.Draw(sh).ellipse([x + w * 0.12, y + h - 18, x + w * 0.88, y + h + 22], fill=70)
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    img.paste((90, 60, 45), (0, 0), sh)
    # A white sticker outline around the subject.
    outline = alpha.filter(ImageFilter.MaxFilter(13)).filter(ImageFilter.GaussianBlur(1.5))
    ring = Image.new('L', (SIZE, SIZE), 0)
    ring.paste(outline, (x, y))
    img.paste((255, 255, 255), (0, 0), ring)
    img.paste(subj, (x, y), alpha)
    return img

def framed(rel, photo):
    img = base(rel)
    r = int(SIZE * 0.46)
    p = photo.convert('RGB')
    side = min(p.size)
    p = p.crop(((p.width - side) // 2, (p.height - side) // 2, (p.width + side) // 2, (p.height + side) // 2)).resize((2 * r, 2 * r), Image.LANCZOS)
    m = Image.new('L', (2 * r, 2 * r), 0)
    ImageDraw.Draw(m).ellipse([0, 0, 2 * r - 1, 2 * r - 1], fill=255)
    img.paste(p, (SIZE // 2 - r, SIZE // 2 - r), m)
    d = ImageDraw.Draw(img)
    d.ellipse([SIZE // 2 - r - 6, SIZE // 2 - r - 6, SIZE // 2 + r + 6, SIZE // 2 + r + 6], outline=(255, 255, 255), width=12)
    return img

decisions = {}
for rel, st in sorted(stats.items()):
    pack = rel.split('/')[0]
    src = os.path.join(repo, 'public/assets/packs', rel)
    cut = Image.open(os.path.join(cutdir, rel.replace('/', '__') + '.png')).convert('RGBA')
    whole = pack in SCENE_PACKS or rel in KEEP_WHOLE or not (0.03 <= st['coverage'] <= 0.8) or st['border'] > 0.25
    img = framed(rel, Image.open(src)) if whole else sticker(rel, cut)
    if img is None:
        img = framed(rel, Image.open(src))
        whole = True
    decisions[rel] = 'framed' if whole else 'sticker'
    img.save(os.path.join(outdir, rel.replace('/', '__') + '.jpg'), quality=86)
    if write:
        ext = os.path.splitext(src)[1].lower()
        if ext in ('.jpg', '.jpeg'):
            img.save(src, 'JPEG', quality=86, optimize=True, progressive=True)
        elif ext == '.webp':
            img.save(src, 'WEBP', quality=86)
        else:
            img.save(src)
json.dump(decisions, open(os.path.join(outdir, 'decisions.json'), 'w'), indent=1)
print('composed', len(decisions), 'stickers', sum(1 for v in decisions.values() if v == 'sticker'))
