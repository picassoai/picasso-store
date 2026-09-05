#!/usr/bin/env python3
# coding: utf-8
"""Generate the crawlable static pages, sitemap.xml and robots.txt.

Every "page" on this site is really one HTML file plus a query string, so the
source a crawler sees before it runs any JavaScript carries a generic title and
no product links at all. These generated files give the pages that matter a real
title, description and body in the source; app.js then renders the full
interactive page over the top from window.ROUTE.

Run from the site root after changing data.js:

    python tools/build-static.py
"""

import io
import json
import os
import re
import subprocess

SITE = "https://picassointelligence.com"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Pages that depend on cart or session state have nothing to index and would
# only burn crawl budget.
# The policy pages still ship placeholder copy, so they are unlinked and kept
# out of the index until real terms replace them.
NOINDEX = [
    "cart.html", "checkout.html", "summary.html", "compare.html", "search.html",
    "thank-you.html", "404.html",
    "privacy-policy.html", "refund-policy.html",
    "shipping-policy.html", "terms-of-service.html",
]

STATIC_PAGES = ["index.html", "select.html", "contact.html"]


def json_dump(obj):
    return json.dumps(obj, indent=2, ensure_ascii=False, sort_keys=True) + "\n"


def read(path):
    return io.open(os.path.join(ROOT, path), encoding="utf-8").read()


def write(path, text):
    full = os.path.join(ROOT, path)
    io.open(full, "w", encoding="utf-8", newline="\n").write(text)
    return path


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def lead_num(v):
    """Spec values sometimes carry a trailing stray label from the source PDF
    ("9 Km (N.m/sqrtW) 0.15"). Only the leading number is the value."""
    m = re.match(r"\s*(-?\d+(?:\.\d+)?)", str(v or ""))
    return m.group(1) if m else ""


def last_commit_date():
    try:
        out = subprocess.check_output(
            ["git", "log", "-1", "--format=%cs"], cwd=ROOT, stderr=subprocess.DEVNULL)
        return out.decode().strip()
    except Exception:
        return ""


# ---------------------------------------------------------------- parse data.js

def parse_products(src):
    out = []
    pat = re.compile(
        r'\{\s*id:\s*"([a-z0-9\-]+)",\s*name:\s*"([^"]+)",\s*brand:\s*"([^"]*)",'
        r'\s*series:\s*"([^"]*)",\s*collection:\s*"([^"]*)".*?price:\s*([0-9.]+)'
        r'(.*?)(?=\n  \{ id:|\n\];)', re.S)
    for m in pat.finditer(src):
        pid, name, brand, series, coll, price, tail = m.groups()
        specs = dict(re.findall(r'"([^"]+)"\s*:\s*"([^"]*)"', tail))
        grp = re.search(r'variantGroup: "([^"]+)"', tail[:300])
        out.append({
            "id": pid, "name": name, "brand": brand, "series": series,
            "collection": coll, "price": float(price), "specs": specs,
            "group": grp.group(1) if grp else None,
        })
    # The cheapest of a group is the one listings link to; the others keep their
    # page so old links still resolve, but point their canonical at it and stay
    # out of the sitemap so Google indexes one page per motor.
    lead = {}
    for pr in out:
        g = pr["group"]
        if g and (g not in lead or pr["price"] < lead[g]["price"]):
            lead[g] = pr
    for pr in out:
        pr["lead"] = lead[pr["group"]]["id"] if pr["group"] else pr["id"]
    return out


def parse_joints(src):
    """Only the humanoid application defines joints today; the shape is generic
    so another application can add a joints array without touching this."""
    apps = []
    for am in re.finditer(r'\{\s*id:\s*"([a-z\-]+)",\s*name:\s*"([^"]+)",\s*art:', src):
        apps.append((am.start(), am.group(1), am.group(2)))
    result = []
    for i, (pos, aid, aname) in enumerate(apps):
        end = apps[i + 1][0] if i + 1 < len(apps) else len(src)
        block = src[pos:end]
        scale = re.search(r'jointScale:\s*"([^"]*)"', block)
        for jm in re.finditer(
                r'id:\s*"([a-z]+)",\s*name:\s*"([^"]+)",\s*group:\s*"([^"]+)",'
                r'\s*note:\s*"((?:[^"\\]|\\.)*)"', block):
            result.append({
                "app": aid, "appName": aname,
                "id": jm.group(1), "name": jm.group(2), "group": jm.group(3),
                "note": jm.group(4).replace('\\"', '"'),
                "scale": scale.group(1) if scale else "",
            })
    return result


# ---------------------------------------------------------------- page template

def page(title, desc, canonical, route, body, page_attr):
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%s</title>
<meta name="description" content="%s">
<link rel="canonical" href="%s">
<link rel="stylesheet" href="assets/css/site.css">
</head>
<body data-page="%s">

<div id="site-header"></div>

%s

<div id="site-footer"></div>

<!-- Generated by tools/build-static.py - do not edit by hand. -->
<script>window.ROUTE = %s;</script>
<script src="assets/js/data.js"></script>
<script src="assets/js/art.js"></script>
<script src="assets/js/app.js"></script>
</body>
</html>
""" % (esc(title), esc(desc), canonical, page_attr, body, route)


def product_page(p):
    s = p["specs"]
    torque = lead_num(s.get("Rated Torque (N·m)"))
    peak = lead_num(s.get("Peak Torque (N·m)"))
    od = lead_num(s.get("OD (mm)"))
    weight = lead_num(s.get("Weight (g)"))
    ratio = s.get("Reduction Ratio", "")
    volts = lead_num(s.get("Rated Voltage (V)"))

    bits = []
    if torque:
        bits.append("%s N·m rated" % torque)
    if peak:
        bits.append("%s N·m peak" % peak)
    if od:
        bits.append("Ф%s mm" % od)
    if weight:
        bits.append("%s g" % weight)
    if ratio:
        bits.append("%s reduction" % ratio)
    if volts:
        bits.append("%s V" % volts)
    summary = ", ".join(bits)

    kind = "actuator" if p["collection"] == "integrated" else (
        "motor" if p["collection"] in ("frameless", "gimbal") else "accessory")

    title = "%s — %s N·m %s | Picasso Intelligence" % (p["name"], torque, kind) \
        if torque else "%s — %s | Picasso Intelligence" % (p["name"], p["series"])
    desc = ("%s %s. %s. Full specifications and pricing from an authorized "
            "North American CubeMars distributor." % (p["name"], kind, summary)) \
        if summary else ("%s from the %s. Specifications and pricing from an "
                         "authorized North American CubeMars distributor."
                         % (p["name"], p["series"]))

    # This block is what a crawler sees before JS runs; app.js replaces it with
    # the rendered product page, which states the same facts.
    body = """<div class="wrap">
  <div class="pdp" data-pdp>
    <h1>%s</h1>
    <p>%s%s</p>
    <p>US$%.2f</p>
  </div>
</div>

<section class="section alt">
  <div class="wrap" data-related></div>
</section>""" % (esc(p["name"]),
                 esc(p["series"] + ". ") if p["series"] else "",
                 esc(summary + "." if summary else ""),
                 p["price"])

    return page(title, desc, "%s/%s.html" % (SITE, p["lead"]),
                '{ id: "%s" }' % p["id"], body, "product")


def joint_page(j):
    slug = "%s-%s-joint-actuators" % (j["app"], j["id"])
    title = "%s joint actuators for %s | Picasso Intelligence" % (
        j["name"], j["appName"].lower())
    desc = j["note"][:155].rsplit(" ", 1)[0] + "…"
    body = """<section class="page-head compact">
  <div class="wrap">
    <div class="crumbs"><a href="index.html">Store</a><span>/</span><span data-crumb></span></div>
    <h1 data-col-name>%s joint actuators</h1>
    <p data-col-blurb>%s</p>
    <p class="joint-scale" data-joint-scale hidden></p>
  </div>
</section>

<div class="wrap">
  <div data-joints></div>
  <div class="filters" data-filters></div>
  <div class="collection-bar">
    <span class="count" data-col-count></span>
    <span class="count range" data-col-range></span>
    <label class="sr" for="sort">Sort by</label>
    <select class="field" id="sort" data-sort style="width:auto">
      <option value="od-asc">Outer diameter</option>
      <option value="torque-asc">Rated torque: low to high</option>
      <option value="torque-desc">Rated torque: high to low</option>
      <option value="weight-asc">Weight: light to heavy</option>
      <option value="price-asc">Price: low to high</option>
      <option value="price-desc">Price: high to low</option>
    </select>
  </div>
</div>

<section class="section grid-section">
  <div class="wrap">
    <div class="grid" data-grid></div>
  </div>
</section>

<div class="wrap">
  <div class="compare-bar" data-compare-bar hidden>
    <span class="count"></span>
    <a class="btn btn-accent" href="compare.html" data-compare-go>Compare side by side</a>
  </div>
</div>""" % (esc(j["name"]), esc(j["note"]))

    return slug, page(title, desc, "%s/%s.html" % (SITE, slug),
                      '{ a: "%s", j: "%s" }' % (j["app"], j["id"]),
                      body, "collection")


# ---------------------------------------------------------------- main

def main():
    src = read("assets/js/data.js")
    products = parse_products(src)
    joints = parse_joints(src)
    lastmod = last_commit_date()
    urls = []

    for f in STATIC_PAGES:
        urls.append("%s/%s" % (SITE, f))

    for c in re.findall(r'\{\s*id:\s*"([a-z]+)",\s*name:\s*"[^"]+",\s*parent:', src):
        urls.append("%s/collection.html?c=%s" % (SITE, c))
    for a in re.findall(r'\{\s*id:\s*"([a-z\-]+)",\s*name:\s*"[^"]+",\s*art:', src):
        urls.append("%s/collection.html?a=%s" % (SITE, a))

    for p in products:
        write("%s.html" % p["id"], product_page(p))
        if p["lead"] == p["id"]:
            urls.append("%s/%s.html" % (SITE, p["id"]))

    for j in joints:
        slug, html = joint_page(j)
        write("%s.html" % slug, html)
        urls.append("%s/%s.html" % (SITE, slug))

    entries = []
    for u in urls:
        loc = esc(u)
        if lastmod:
            entries.append("  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n  </url>"
                           % (loc, lastmod))
        else:
            entries.append("  <url>\n    <loc>%s</loc>\n  </url>" % loc)

    # changefreq and priority are ignored by Google, so they are left out.
    write("sitemap.xml",
          '<?xml version="1.0" encoding="UTF-8"?>\n'
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
          + "\n".join(entries) + "\n</urlset>\n")

    # The worker must not trust the browser about money, so it gets its own copy
    # of the prices, generated here so it can never drift from the catalogue.
    prices = {}
    for pr in products:
        prices[pr["id"]] = {
            "name": pr["name"],
            "series": pr["series"],
            "cents": int(round(pr["price"] * 100)),
        }
    write("worker/prices.json", json_dump(prices))

    # Cloudflare's dashboard editor has no bundler, so also emit a single file
    # with the prices inlined — paste-and-deploy, no build step, which is how
    # the rest of this site works too.
    src = read("worker/checkout.js").replace(
        'import PRICES from "./prices.json";',
        "const PRICES = " + json_dump(prices).rstrip() + ";")
    banner = [
        "/* GENERATED by tools/build-static.py from worker/checkout.js +",
        "   worker/prices.json. Paste THIS file into the Cloudflare editor.",
        "   Edit worker/checkout.js instead and re-run the generator. */",
        "",
    ]
    write("worker/checkout.bundled.js", chr(10).join(banner) + src)

    write("robots.txt",
          "User-agent: *\n"
          + "".join("Disallow: /%s\n" % f for f in NOINDEX)
          + "\nSitemap: %s/sitemap.xml\n" % SITE)

    print("products      %d" % len(products))
    print("joint pages   %d" % len(joints))
    print("sitemap URLs  %d" % len(urls))
    print("worker prices %d" % len(prices))
    print("lastmod       %s" % (lastmod or "(omitted)"))


if __name__ == "__main__":
    main()
