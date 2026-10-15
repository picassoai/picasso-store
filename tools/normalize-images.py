"""Re-frame a product photograph to the house rule.

Every product shot on the site that was framed deliberately obeys one rule,
and obeys it to within half a percent: the subject's longer side covers 93%
of a square, pure-white canvas, centred.  Twelve reference files measured
92.8% to 93.4%, across side views, top views and three-quarter views, so the
rule is the convention and not a coincidence.

A shot that breaks it breaks a page.  The listing scales each card by the
motor's real diameter, which is the comparison worth making; when one supplier
hands over a photograph with the motor at 43% of the frame, that scaling is
applied on top of a subject already half the size it should be, and a 51 mm
actuator renders at 41% of a 69 mm one rather than the 74% the diameters call
for.  The reader sees a much smaller motor, which is a claim about the product
and a false one.

Canvas is the source's longer side, so nothing is enlarged further than
reaching 93% requires.  Transparency is flattened onto white rather than
carried, because a transparent PNG on a page that later grows a grey panel or
a dark mode turns into a silhouette.

  python tools/normalize-images.py [--apply] FILE...
"""
import io, os, sys
import numpy as np
from PIL import Image

FILL = 0.93
INK  = 12          # how far off pure white a pixel must be to count as subject


def subject_box(a):
    ink = (255 - a).max(axis=2) > INK
    ys, xs = np.where(ink)
    if not len(xs):
        return None
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def flatten(path):
    im = Image.open(path)
    if im.mode in ("RGBA", "LA", "P"):
        rgba = im.convert("RGBA")
        bg = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
        bg.alpha_composite(rgba)
        return bg.convert("RGB"), True
    return im.convert("RGB"), False


def normalize(path, apply=False):
    im, had_alpha = flatten(path)
    a = np.asarray(im).astype(int)
    box = subject_box(a)
    if box is None:
        return "%-34s blank, skipped" % os.path.basename(path)
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    W, H = im.size

    canvas = max(W, H)
    scale  = FILL * canvas / max(bw, bh)
    nw, nh = max(1, round(bw * scale)), max(1, round(bh * scale))

    crop = im.crop(box).resize((nw, nh), Image.LANCZOS)
    out  = Image.new("RGB", (canvas, canvas), (255, 255, 255))
    out.paste(crop, ((canvas - nw) // 2, (canvas - nh) // 2))

    # The source's own background is rarely exactly 255; anything that nearly
    # is becomes exactly it, so the frame cannot show as a pale rectangle
    # against the card.
    b = np.asarray(out).astype(int)
    near = (255 - b).max(axis=2) <= 2
    b[near] = 255
    out = Image.fromarray(b.astype("uint8"))

    note = "%-34s %dx%d -> %dx%d  fill %4.1f%% -> %.0f%%  x%.2f%s" % (
        os.path.basename(path), W, H, canvas, canvas,
        100 * max(bw / W, bh / H), 100 * FILL, scale,
        "  (flattened alpha)" if had_alpha else "")

    if apply:
        ext = os.path.splitext(path)[1].lower()
        if ext in (".jpg", ".jpeg"):
            out.save(path, "JPEG", quality=92, subsampling=0, optimize=True)
        else:
            out.save(path, "PNG", optimize=True)
    return note


if __name__ == "__main__":
    args  = [a for a in sys.argv[1:] if a != "--apply"]
    apply = "--apply" in sys.argv
    if not args:
        print(__doc__)
        raise SystemExit(2)
    for p in args:
        print(("APPLY " if apply else "dry   ") + normalize(p, apply))
