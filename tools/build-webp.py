#!/usr/bin/env python3
# coding: utf-8
"""Write a WebP beside every product photograph, and point data.js at it.

    python tools/build-webp.py            # convert, then rewrite data.js
    python tools/build-webp.py --dry-run  # report only

Forty megabytes of JPEG and PNG, on a site whose heaviest page is a product
photograph at 900 px. WebP carries the same picture at roughly a third of the
bytes, and every browser the analytics have ever seen supports it.

The originals stay where they are, for three reasons. They are the source: a
re-encode from WebP would compound the loss. They are the only copy. And
whatever image search has already indexed still resolves, which it would not
if the JPEGs were deleted out from under their URLs.

Quality 85 at method 6: on these photographs - a part on a white field - that
is a mean error around one unit per channel out of 255, which is nothing you
can see, at a little over a third of the original size. method 6 is the
slowest encoder setting and the smallest output; this runs rarely enough that
the minutes do not matter.

Re-run after adding or recropping a photograph. Files already converted are
left alone unless the original is newer.
"""

import io
import os
import re
import sys

from PIL import Image

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIRS = ("assets/img/products", "assets/img/products-branded")
DATA = os.path.join(ROOT, "assets", "js", "data.js")
QUALITY, METHOD = 85, 6
SOURCES = (".jpg", ".jpeg", ".png")

# Merchant Center rejects a product image below this, and from 31 January
# 2027 does so for every product rather than some. Flagged rather than
# upscaled: enlarging a 445 px photograph produces a 500 px photograph that
# looks like an enlarged 445 px one, and the fix is a better original.
MIN_EDGE = 500


def convert(path, dry):
    out = os.path.splitext(path)[0] + ".webp"
    if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(path):
        return os.path.getsize(path), os.path.getsize(out), False
    im = Image.open(path)
    # A PNG with transparency flattens onto white, which is the background
    # every one of these photographs already has.
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    else:
        im = im.convert("RGB")
    if dry:
        b = io.BytesIO()
        im.save(b, "WEBP", quality=QUALITY, method=METHOD)
        return os.path.getsize(path), len(b.getvalue()), True
    im.save(out, "WEBP", quality=QUALITY, method=METHOD)
    return os.path.getsize(path), os.path.getsize(out), True


def main():
    dry = "--dry-run" in sys.argv
    before = after = 0
    made = kept = 0
    small = []

    for d in DIRS:
        full = os.path.join(ROOT, d)
        if not os.path.isdir(full):
            continue
        for f in sorted(os.listdir(full)):
            if not f.lower().endswith(SOURCES):
                continue
            path = os.path.join(full, f)
            w, h = Image.open(path).size
            if min(w, h) < MIN_EDGE:
                small.append("%s/%s (%dx%d)" % (d, f, w, h))
            o, n, fresh = convert(path, dry)
            before += o
            after += n
            made += 1 if fresh else 0
            kept += 0 if fresh else 1

    print("photographs    %d" % (made + kept))
    print("converted      %d%s" % (made, " (dry run)" if dry else ""))
    print("already current %d" % kept)
    print("%.1f MB -> %.1f MB  (%.0f%% of the original)"
          % (before / 1e6, after / 1e6, 100.0 * after / max(before, 1)))
    if small:
        print("\nbelow Merchant Center's %d px minimum, which applies to every"
              % MIN_EDGE)
        print("product from 31 January 2027 - these need better originals:")
        for s in small:
            print("   %s" % s)

    src = io.open(DATA, encoding="utf-8").read()
    # Only inside an images: [...] list, so a .png named in a spec value or a
    # blurb is not rewritten along with it.
    def swap(m):
        return re.sub(r'"([^"]+)\.(?:jpe?g|png)"', r'"\1.webp"', m.group(0))
    out = re.sub(r"images: \[[^\]]*\]", swap, src)
    n = len(re.findall(r'"[^"]+\.webp"', out))
    if dry:
        print("\ndata.js would name %d .webp files" % n)
        return
    if out != src:
        io.open(DATA, "w", encoding="utf-8", newline="\n").write(out)
    print("\ndata.js names %d .webp files" % n)
    print("Originals kept: they are the re-encode source, and the URLs image")
    print("search already holds still resolve.")


if __name__ == "__main__":
    main()
