"""Make the die-cut sticker pictures for the Sticker book look.

Every photo was composed by compose.py (a subject with a white edge on a pastel circle), so the
circle can be drawn again exactly and taken away, which is cleaner than guessing where the subject
is. What is left gets a thicker white edge and is saved with transparency.

Usage: python sticker-cutouts.py <repo> <outdir>
Writes <outdir>/<pack>/<name>.webp and <outdir>/report.txt (anything that needs a look by eye).
"""
import sys, os, glob
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd

repo, out_dir = sys.argv[1], sys.argv[2]
SIZE = 720       # the composed photos
OUT = 620        # the longest side of the finished sticker
EDGE = 8         # extra white edge, in pixels of the photo
FRAME_R = int(SIZE * 0.46)
SHADOW = np.array([90, 60, 45], dtype=np.float32)
packs_dir = os.path.join(repo, 'public', 'assets', 'packs')
report = []


def base(rel, a):
    """The empty background compose.py put behind this photo (its circle's colour, read from the photo)."""
    arc = (dist > SIZE * 0.47) & (dist < SIZE * 0.485) & (xx + yy > SIZE)
    c = tuple(int(v) for v in np.median(a[arc], axis=0))
    img = Image.new('RGB', (SIZE, SIZE), (255, 255, 255))
    r = int(SIZE * 0.49)
    ImageDraw.Draw(img).ellipse([SIZE / 2 - r, SIZE / 2 - r, SIZE / 2 + r, SIZE / 2 + r], fill=c)
    glow = Image.new('L', (SIZE, SIZE), 0)
    ImageDraw.Draw(glow).ellipse([SIZE * 0.18, SIZE * 0.12, SIZE * 0.62, SIZE * 0.5], fill=110)
    img.paste((255, 255, 255), (0, 0), glow.filter(ImageFilter.GaussianBlur(60)))
    return np.asarray(img, dtype=np.float32)


yy, xx = np.mgrid[0:SIZE, 0:SIZE]
dist = np.hypot(xx - SIZE / 2 + 0.5, yy - SIZE / 2 + 0.5)


def mask_of(rel, im):
    a = np.asarray(im, dtype=np.float32)
    # A whole scene in a round frame: the frame is the sticker.
    ring = (dist > FRAME_R - 3) & (dist < FRAME_R + 5)
    if (a[ring].min(axis=1) > 243).mean() > 0.9:
        return dist <= FRAME_R + 12, 'framed'
    b = base(rel, a)
    diff = np.abs(a - b).sum(axis=2)
    subject = diff > 34
    # The soft shadow under the subject: the background, darkened towards one colour.
    with np.errstate(divide='ignore', invalid='ignore'):
        t = (b - a) / (b - SHADOW)
    shadowy = (t.max(axis=2) - t.min(axis=2) < 0.09) & (t.mean(axis=2) > 0) & (t.mean(axis=2) < 0.34) & (yy > SIZE * 0.45)
    outside = ~subject | shadowy
    labels, _ = nd.label(outside)
    # Everything joined to the circle's rim is background (the rim's own edge can cut the circle off from the corners).
    border = np.unique(labels[(dist > SIZE * 0.455) | (xx < 2) | (yy < 2)])
    subject = ~np.isin(labels, border[border > 0])
    # Noise and specks go; separate parts of one thing (two shoes) stay.
    labels, n = nd.label(subject)
    if not n:
        return None, 'empty'
    sizes = nd.sum(subject, labels, range(1, n + 1))
    keep = [i + 1 for i, s in enumerate(sizes) if s >= max(sizes.max() * 0.04, 150)]
    subject = np.isin(labels, keep)
    # Pinholes inside the subject are JPEG noise, not gaps.
    # Enclosed patches paler than the circle are white fur or glass, not gaps between the legs.
    holes, n = nd.label(~subject)
    if n > 1:
        sizes = nd.sum(~subject, holes, range(1, n + 1))
        paler = nd.mean(a.min(axis=2) - b.min(axis=2), holes, range(1, n + 1))
        rim = set(np.unique(holes[(dist > SIZE * 0.455) | (xx < 2) | (yy < 2)]).tolist())
        subject |= np.isin(holes, [i + 1 for i in range(n) if i + 1 not in rim and (sizes[i] < 90 or paler[i] > 6)])
    return subject, 'cut'


# White subjects on the circle's pale glow: the difference can't see their edge, so these use rembg.
PALE = {'animal-babies/bunny.jpg', 'animal-babies/foal.jpg', 'animals/dog.jpg', 'animals/goose.jpg', 'toys/doll.jpg', 'food/water.jpg'}
session = None


def mask_rembg(im):
    global session
    from rembg import new_session, remove
    session = session or new_session('isnet-general-use')
    alpha = np.asarray(remove(im, session=session, post_process_mask=True))[:, :, 3] > 128
    alpha &= dist < SIZE * 0.455
    labels, n = nd.label(alpha)
    sizes = nd.sum(alpha, labels, range(1, n + 1))
    return np.isin(labels, [i + 1 for i, v in enumerate(sizes) if v >= sizes.max() * 0.04])


def sticker(im, mask):
    a = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
    grown = a.filter(ImageFilter.GaussianBlur(EDGE * 0.62)).point(lambda v: min(255, max(0, (v - 12) * 9)))
    rgba = im.convert('RGBA')
    rgba.putalpha(a)
    edge = Image.new('RGBA', im.size, (255, 255, 255, 0))
    edge.putalpha(grown)
    out = Image.alpha_composite(edge, rgba)
    out = out.crop(grown.getbbox())
    scale = OUT / max(out.size)
    if scale < 1:
        out = out.resize((round(out.width * scale), round(out.height * scale)), Image.LANCZOS)
    return out


files = sorted(glob.glob(f'{packs_dir}/*/*.jpg'))
counts = {'cut': 0, 'framed': 0, 'empty': 0}
for f in files:
    rel = os.path.relpath(f, packs_dir).replace('\\', '/')
    pack, name = rel.split('/')
    im = Image.open(f).convert('RGB')
    if im.size != (SIZE, SIZE):
        report.append(f'{rel}: not a composed photo {im.size}')
        continue
    mask, kind = (mask_rembg(im), 'cut') if rel in PALE else mask_of(rel, im)
    counts[kind] += 1
    if mask is None:
        report.append(f'{rel}: nothing found')
        continue
    share = float(mask.mean())
    if kind == 'cut' and (share < 0.03 or share > 0.6):
        report.append(f'{rel}: covers {share:.2f}')
    dst = os.path.join(out_dir, pack, os.path.splitext(name)[0] + '.webp')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    sticker(im, mask).save(dst, 'WEBP', quality=82, method=4)

with open(os.path.join(out_dir, 'report.txt'), 'w', encoding='utf8') as fh:
    fh.write('\n'.join(report))
print(counts, 'to look at:', len(report), flush=True)
