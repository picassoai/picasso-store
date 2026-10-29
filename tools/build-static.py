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
    "thank-you.html", "404.html", "track.html",
    # The policy pages stay crawlable: shipping and returns terms are a trust
    # signal for a commerce site, and Merchant Center expects to reach them.
]

STATIC_PAGES = [
    "index.html", "select.html", "contact.html",
    # Hand-written, but indexable and worth listing: buyers do read the terms
    # before a first order from a supplier they have not used.
    "shipping-policy.html", "refund-policy.html",
    "terms-of-service.html", "privacy-policy.html",
    # "what does the 9 in AK80-9 mean" is a real search, and nobody - CubeMars
    # included - answers it in English.
    "part-numbers.html",
]


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
        head = tail[:400]
        # Read specs from inside the specs block only. Taking every quoted pair
        # in the tail would sweep in variantLabel, blurb and the image names as
        # though a reader had asked for them.
        sp = re.search(r'specs: \{(.*?)\}, images', tail, re.S)
        specs = dict(re.findall(r'"([^"]+)"\s*:\s*"([^"]*)"', sp.group(1))) if sp else {}
        imgs = re.search(r'images: \[([^\]]*)\]', tail)
        blurb = re.search(r'blurb: "((?:[^"\\]|\\.)*)"', tail)

        def field(key):
            m2 = re.search(r'%s: "((?:[^"\\]|\\.)*)"' % key, head)
            return m2.group(1).replace('\\"', '"') if m2 else ""

        grp = re.search(r'variantGroup: "([^"]+)"', head)
        out.append({
            "id": pid, "name": name, "brand": brand, "series": series,
            "collection": coll, "price": float(price), "specs": specs,
            "group": grp.group(1) if grp else None,
            "blurb": blurb.group(1).replace('\\"', '"') if blurb else "",
            "images": re.findall(r'"([^"]+)"', imgs.group(1)) if imgs else [],
            "variantLabel": field("variantLabel"),
            "variantAxis": field("variantAxis"),
            "variantGroupName": field("variantGroupName"),
            "fit": field("fit"),
            "fittedAlternative": field("fittedAlternative"),
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

    # A variant earns its own place in the index when it is a different thing
    # to buy. With the specifications in the source, the encoder, hall sensor,
    # driver-board and grade variants come out 79-84% alike - different enough
    # that the right one should be findable, and someone searching for the
    # encoder version should not land on the one without.
    #
    # The clockwise and counter-clockwise thrusters are not that. Same price,
    # same specification table to the last row, same photographs: one product
    # mirrored, 99.5% identical however much true copy is added, because there
    # is nothing further that honestly differs. That is what a canonical is
    # for, so those still point at one page.
    for pr in out:
        twin = pr["group"] and pr["lead"] != pr["id"]
        if twin:
            boss = next(q for q in out if q["id"] == pr["lead"])
            same = pr["price"] == boss["price"] and pr["specs"] == boss["specs"]
        pr["canonical"] = pr["lead"] if (twin and same) else pr["id"]
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

# Filled by main() once the taxonomy is parsed. app.js replaces both mounts
# with the rendered header and footer (it assigns outerHTML, so whatever is
# here is discarded, not duplicated) - but a crawler reads what is here, and
# before this the two mounts were empty divs. Every page shipped zero links,
# which meant a crawl that started at the homepage reached eleven of a hundred
# and eighty pages and no page passed any authority to another.
NAV_HTML = ""
FOOT_HTML = ""


def nav_markup(cols, apps):
    shop = "".join('<li><a href="%s.html">%s</a></li>' % (slugify(c["name"]), esc(c["name"]))
                   for c in cols)
    use = "".join('<li><a href="actuators-for-%s.html">%s</a></li>'
                  % (slugify(a["name"]), esc(a["name"])) for a in apps)
    return ('<nav id="site-header" aria-label="Main">'
            '<a href="index.html">Picasso Intelligence</a>'
            '<ul>%s</ul><ul>%s</ul>'
            '<ul><li><a href="select.html">Find by spec</a></li>'
            '<li><a href="part-numbers.html">How to read a part number</a></li>'
            '<li><a href="contact.html">Contact</a></li></ul></nav>') % (shop, use)


def foot_markup(cols):
    shop = "".join('<li><a href="%s.html">%s</a></li>' % (slugify(c["name"]), esc(c["name"]))
                   for c in cols)
    return ('<footer id="site-footer">'
            '<ul>%s</ul>'
            '<ul><li><a href="shipping-policy.html">Shipping</a></li>'
            '<li><a href="refund-policy.html">Returns</a></li>'
            '<li><a href="terms-of-service.html">Terms</a></li>'
            '<li><a href="privacy-policy.html">Privacy</a></li>'
            '<li><a href="part-numbers.html">How to read a part number</a></li>'
            '<li><a href="contact.html">Contact</a></li></ul>'
            '<p>Picasso Intelligence LLC, New York. Authorized CubeMars '
            'distributor for North America.</p></footer>') % shop


def inject_shell(html):
    """Put the same header and footer into the hand-written pages.

    index.html and the policy pages are written by hand, not by page(), and
    they carried the same empty mounts - so the homepage, of all things,
    offered a crawler three links. The markers make this safe to run again:
    a second build replaces what the first one wrote rather than nesting it.
    """
    html = re.sub(r'<!--nav-->.*?<!--/nav-->|<div id="site-header"></div>',
                  lambda m: "<!--nav-->" + NAV_HTML + "<!--/nav-->", html, flags=re.S)
    html = re.sub(r'<!--foot-->.*?<!--/foot-->|<div id="site-footer"></div>',
                  lambda m: "<!--foot-->" + FOOT_HTML + "<!--/foot-->", html, flags=re.S)
    # index.html is the page an engine reads to learn who the site belongs to,
    # and it is hand-written, so page() never reached it. The marker is
    # written on the first run and replaced on every one after.
    extra = org_ld()
    faq = faq_ld(html)
    if faq:
        extra += '</script>\n<script type="application/ld+json">' + faq
    org = ('<!--org--><script type="application/ld+json">%s</script><!--/org-->'
           % extra)
    if "<!--org-->" in html:
        html = re.sub(r"<!--org-->.*?<!--/org-->", lambda m: org, html, flags=re.S)
    elif "</body>" in html:
        html = html.replace("</body>", org + "\n</body>", 1)
    return html


def llms_txt(products, cols, apps):
    """A plain-text map of the catalogue at /llms.txt.

    The convention is a proposal, not a standard: no major crawler is known to
    fetch this file, and it may never be read. It costs one generated file and
    no change to any page, which is the only reason it is worth doing at all -
    nothing here is relied on, and nothing is said here that the pages do not
    already say.

    Generated from data.js so it cannot go stale behind a price change, and
    every line carries the figure a question would be asked about: a part
    number, a price, and the sentence that distinguishes that model.
    """
    by_coll = {}
    for p in products:
        by_coll.setdefault(p["collection"], []).append(p)
    names = {c["id"]: c["name"] for c in cols}

    out = ["# Picasso Intelligence",
           "",
           "> Authorized CubeMars distributor for North America. Robotic "
           "actuators, frameless and gimbal motors and underwater thrusters, "
           "sold and supported from the United States.",
           "",
           "Prices are in US dollars and are what the site charges. Import "
           "duty on orders to the United States is paid by us, so there is no "
           "carrier invoice after delivery. Shipping within the United States "
           "is free on orders over $200 and $45 below that. Orders above "
           "$5,000 and all orders outside the United States are quoted "
           "individually.",
           ""]

    for cid, items in sorted(by_coll.items(),
                             key=lambda kv: names.get(kv[0], kv[0])):
        out.append("## %s" % names.get(cid, cid))
        out.append("")
        for p in sorted(items, key=lambda q: q["price"]):
            why = p["fit"] or p["blurb"]
            why = re.sub(r"\s+", " ", why).strip()
            if len(why) > 300:
                why = why[:300].rsplit(" ", 1)[0] + "..."
            out.append("- [%s](%s/%s.html): US$%s. %s"
                       % (p["name"], SITE, p["id"],
                          ("%.2f" % p["price"]).rstrip("0").rstrip("."), why))
        out.append("")

    out += ["## Choosing a part", ""]
    for a in apps:
        out.append("- [Actuators for %s](%s/actuators-for-%s.html): %s"
                   % (a["name"], SITE, slugify(a["name"]),
                      re.sub(r"\s+", " ", a["blurb"]).strip()))
    out += ["- [How to read a CubeMars part number](%s/part-numbers.html): "
            "what the digits mean in AK, AKE, AKH, RI, RO, GL, SW, DW and TW "
            "names, and which of them CubeMars does not publish." % SITE,
            "- [Find by specification](%s/select.html): every part on one "
            "table, sortable by torque, diameter, weight or price." % SITE,
            "",
            "## Terms", "",
            "- [Shipping and import duty](%s/shipping-policy.html)" % SITE,
            "- [Returns](%s/refund-policy.html)" % SITE,
            "- [Contact](%s/contact.html): info@picassointelligence.com" % SITE,
            ""]
    return "\n".join(out)


def faq_ld(html):
    """FAQPage structured data, read off the page's own visible question and
    answer pairs - or "" when the page has none.

    A div.faq holds h3 questions each followed by one p answer. Deriving the
    markup from that rather than keeping a second copy of the text in Python
    means the two cannot disagree, which is the failure this is written to
    avoid: Google's own guidance is that FAQ markup must match what the reader
    sees, and a hand-maintained duplicate drifts the first time a sentence is
    reworded.

    Worth being plain about what this buys. Google withdrew FAQ rich results
    for ordinary sites in 2023 and shows them now only for government and
    health pages, so this will not put a dropdown in the search result. It is
    here because the answer engines read JSON-LD, and a question with an
    answer attached is the form they quote.
    """
    m = re.search(r'<div class="faq">(.*?)</div>', html, re.S)
    if not m:
        return ""
    pairs = re.findall(r"<h3>(.*?)</h3>\s*<p>(.*?)</p>", m.group(1), re.S)
    if not pairs:
        return ""

    def flat(s):
        # The answers carry links and em dashes; strip the tags and collapse
        # the source's line breaks so the stored text reads as one paragraph.
        return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s)).strip()

    return json.dumps({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": flat(q),
             "acceptedAnswer": {"@type": "Answer", "text": flat(a)}}
            for q, a in pairs
        ],
    }, ensure_ascii=False)


ORG_ID = SITE + "/#org"


def org_ld():
    """The company as one node, repeated on every page under one @id.

    Every page already carried an Organization, but only as the seller inside
    an Offer - enough to say who is selling a motor, not enough to say who we
    are. An engine asked "who distributes CubeMars in the United States" had
    to infer it from a footer line. This states it, and the @id lets the
    sellers in the offers point at the same node rather than a hundred
    unconnected ones.

    No sameAs: the only social link in data.js is a "#" placeholder, and a
    sameAs pointing nowhere is worse than none. No telephone either, which is
    a deliberate choice on this site, not an omission.
    """
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": ORG_ID,
        "name": "Picasso Intelligence LLC",
        "alternateName": "Picasso Intelligence",
        "url": SITE + "/",
        "logo": SITE + "/apple-touch-icon.png",
        "email": "info@picassointelligence.com",
        "description": ("Authorized CubeMars distributor for North America. "
                        "Robotic actuators, frameless and gimbal motors and "
                        "underwater thrusters, sold and supported from the "
                        "United States with import duty paid."),
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "215 W 125th St",
            "addressLocality": "New York",
            "addressRegion": "NY",
            "postalCode": "10027",
            "addressCountry": "US",
        },
        "areaServed": {"@type": "Place", "name": "North America"},
    }, ensure_ascii=False)


def crumb_ld(trail):
    """The trail the page already shows, in the form an index reads.

    The visible crumbs have been on the product pages since the last pass;
    this is the same path said again where a crawler looks for it, so a result
    can be filed under Store > Frameless Motors rather than at the root."""
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            dict({"@type": "ListItem", "position": n + 1, "name": name},
                 **({"item": "%s/%s" % (SITE, href)} if href else {}))
            for n, (name, href) in enumerate(trail)
        ],
    }, ensure_ascii=False)


def page(title, desc, canonical, route, body, page_attr, crumbs=()):
    body = '%s\n<script type="application/ld+json">%s</script>' % (
        body, org_ld())
    if crumbs:
        body += '\n<script type="application/ld+json">%s</script>' % crumb_ld(crumbs)
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#548490">
<title>%s</title>
<meta name="description" content="%s">
<link rel="canonical" href="%s">
<link rel="stylesheet" href="assets/css/site.css">
</head>
<body data-page="%s">

%s

%s

%s

<!-- Generated by tools/build-static.py - do not edit by hand. -->
<script>window.ROUTE = %s;</script>
<script src="assets/js/data.js"></script>
<script src="assets/js/art.js"></script>
<script src="assets/js/app.js"></script>
</body>
</html>
""" % (esc(title), esc(desc), canonical, page_attr, NAV_HTML, body, FOOT_HTML, route)


def torque_text(v):
    """Under a newton-metre, say it in mN·m: "0.024 N·m" is not how anyone
    writes 24 millinewton-metres, and the site's own tiles already switch."""
    f = float(v)
    return ("%g mN·m" % round(f * 1000, 3)) if f < 1 else ("%g N·m" % f)


def integrated_ids(src):
    """Every collection under the Integrated family. Derived rather than
    listed: the noun below used to test for "integrated" alone, and when the
    series became collections of their own, thirty actuators silently started
    calling themselves accessories."""
    ids = {"integrated"}
    ids.update(re.findall(
        r'id: "([a-z0-9\-]+)", name: "[^"]+", parent: "[^"]+", group: "integrated"',
        src))
    return ids


def product_page(p, actuators=frozenset(["integrated"]), siblings=(), coll_name=""):
    s = p["specs"]
    torque = lead_num(s.get("Rated Torque (N·m)"))
    peak = lead_num(s.get("Peak Torque (N·m)"))
    od = lead_num(s.get("OD (mm)"))
    weight = lead_num(s.get("Weight (g)"))
    ratio = s.get("Reduction Ratio", "")
    volts = lead_num(s.get("Rated Voltage (V)"))

    bits = []
    if torque:
        bits.append("%s rated" % torque_text(torque))
    if peak:
        bits.append("%s peak" % torque_text(peak))
    if od:
        bits.append("Ф%s mm" % od)
    if weight:
        bits.append("%s g" % weight)
    if ratio:
        bits.append("%s reduction" % ratio)
    if volts:
        bits.append("%s V" % volts)
    summary = ", ".join(bits)

    kind = "actuator" if p["collection"] in actuators else (
        "motor" if p["collection"] in ("frameless", "gimbal", "directdrive")
        else "accessory")

    title = "%s — %s %s | Picasso Intelligence" % (p["name"], torque_text(torque), kind) \
        if torque else "%s — %s | Picasso Intelligence" % (p["name"], p["series"])
    # The distributor claim is true of CubeMars and of nothing else we list,
    # so it is made on CubeMars pages and nowhere else.
    auth = ("an authorized North American CubeMars distributor"
            if p.get("brand", "CubeMars") == "CubeMars"
            else "a US distributor")
    desc = ("%s %s. %s. Full specifications and pricing from %s."
            % (p["name"], kind, summary, auth)) if summary else (
        "%s from the %s. Specifications and pricing from %s."
        % (p["name"], p["series"], auth))

    # Everything below sits inside [data-pdp], which app.js overwrites with
    # innerHTML - so the rendered page is unchanged and nothing is duplicated,
    # while a crawler that never runs the script still reads the whole product.
    # It used to read three lines: name, one summary sentence, price. Ninety
    # seven characters, which is both too thin to rank and too close to the
    # next variant to tell apart - "SW7 Thruster CW" and "SW7 Thruster CCW"
    # were 98.9% identical, so Google kept one and dropped the other.
    crumbs = ('<nav class="crumbs"><a href="index.html">Store</a> / '
              '<a href="%s.html">%s</a> / <span>%s</span></nav>'
              % (slugify(coll_name), esc(coll_name), esc(p["name"]))) if coll_name else ""

    img = ""
    if p["images"]:
        img = ('<img src="assets/img/products-branded/%s" width="800" height="800" '
               'alt="%s">' % (esc(p["images"][0]), esc(p["name"])))

    rows = "".join("<tr><th>%s</th><td>%s</td></tr>" % (esc(k), esc(v))
                   for k, v in p["specs"].items() if v)
    table = ('<h2>Specifications</h2><table class="spec-table"><tbody>%s</tbody></table>'
             % rows) if rows else ""

    # Say which variant this is, in a sentence rather than only in the name.
    # Without it the CW and CCW thrusters were 99.9% identical once the shared
    # specifications went in - same table, same price, same photographs, three
    # letters apart - and two pages that alike are one page as far as an index
    # is concerned. Everything here follows from the variant label itself,
    # except the pairing note, which is how counter-rotating thrusters are
    # specified on any vehicle and is worth a reader knowing.
    which = ""
    axis, label = p["variantAxis"], p["variantLabel"]
    if axis == "Rotation" and label:
        other = "counter-clockwise" if label.upper() == "CW" else "clockwise"
        which = ("This is the %s unit. Thrusters are specified in counter-rotating "
                 "pairs so the reaction torques cancel, so a vehicle carrying more "
                 "than one needs the %s unit for the opposing position."
                 % ("clockwise" if label.upper() == "CW" else "counter-clockwise",
                    other))
    elif axis and label:
        which = "This is the %s configuration." % label.lower()

    sibs = [q for q in siblings if q["id"] != p["id"]]
    alt = ""
    if sibs:
        links = "".join('<li><a href="%s.html">%s — US$%.2f</a></li>'
                        % (q["id"], esc(q["name"]), q["price"]) for q in sibs)
        alt = ("<h2>%s</h2><ul>%s</ul>"
               % (esc(p["variantAxis"] or "Other versions"), links))

    fitted = p.get("fittedAlternative")
    if fitted:
        alt += ('<p>Current production version: '
                '<a href="%s.html">%s</a>.</p>' % (esc(fitted), esc(fitted)))

    ld = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": p["name"],
        "sku": p["id"],
        "description": " ".join(x for x in (p["fit"], p["blurb"]) if x) or desc,
        "brand": {"@type": "Brand", "name": p.get("brand") or "CubeMars"},
        "offers": {
            "@type": "Offer",
            "url": "%s/%s.html" % (SITE, p["id"]),
            "priceCurrency": "USD",
            "price": "%.2f" % p["price"],
            "availability": "https://schema.org/InStock",
            "seller": {"@id": ORG_ID},
        },
    }
    if p["images"]:
        ld["image"] = ["%s/assets/img/products-branded/%s" % (SITE, i) for i in p["images"]]

    body = """<div class="wrap">
  <div class="pdp" data-pdp>
    %s
    <h1>%s</h1>
    %s
    <p>%s%s</p>
    <p><strong>US$%.2f</strong></p>
    %s
    %s
    %s
  </div>
</div>

<section class="section alt">
  <div class="wrap" data-related></div>
</section>
<script type="application/ld+json">%s</script>""" % (
        crumbs, esc(p["name"]), img,
        esc(p["series"] + ". ") if p["series"] else "",
        esc(summary + "." if summary else ""),
        p["price"],
        ("<p>%s</p>" % esc(p["fit"]) if p["fit"] else "") +
        ("<p>%s</p>" % esc(which) if which else "") +
        ("<p>%s</p>" % esc(p["blurb"]) if p["blurb"] else ""),
        alt, table,
        json.dumps(ld, ensure_ascii=False))

    trail = [("Store", "index.html")]
    if coll_name:
        trail.append((coll_name, "%s.html" % slugify(coll_name)))
    trail.append((p["name"], None))
    return page(title, desc, "%s/%s.html" % (SITE, p["canonical"]),
                '{ id: "%s" }' % p["id"], body, "product", trail)


def slugify(name):
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return s


def browse_body(h1, blurb, listing=()):
    """The catalogue browser, used by the joint, collection and application
    pages alike. app.js fills in whichever parts the route calls for.

    `listing` is written into [data-grid], which app.js overwrites, so the
    rendered page is unchanged - but a crawler now reads the models a category
    holds and can follow them. The AKE Series page used to carry no link to a
    single AKE motor.
    """
    def row(q):
        t = lead_num(q["specs"].get("Rated Torque (N·m)"))
        lead = "%s rated, " % torque_text(t) if t else ""
        return ('<li><a href="%s.html">%s</a> &mdash; %sUS$%.2f</li>'
                % (q["id"], esc(q["name"]), esc(lead), q["price"]))

    rows = "".join(row(q) for q in listing)
    grid = ('<ul class="grid" data-grid>%s</ul>' % rows) if rows else \
        '<div class="grid" data-grid></div>'
    return """<section class="page-head compact">
  <div class="wrap">
    <div class="crumbs"><a href="index.html">Store</a><span>/</span><span data-crumb></span></div>
    <h1 data-col-name>%s</h1>
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
    %s
  </div>
</section>

<div class="wrap">
  <div class="compare-bar" data-compare-bar hidden>
    <span class="count"></span>
    <a class="btn btn-accent" href="compare.html" data-compare-go>Compare side by side</a>
  </div>
</div>""" % (esc(h1), esc(blurb), grid)


def joint_page(j):
    slug = "%s-%s-joint-actuators" % (j["app"], j["id"])
    title = "%s joint actuators for %s | Picasso Intelligence" % (
        j["name"], j["appName"].lower())
    desc = j["note"][:155].rsplit(" ", 1)[0] + "…"
    body = browse_body("%s joint actuators" % j["name"], j["note"])
    return slug, page(title, desc, "%s/%s.html" % (SITE, slug),
                      '{ a: "%s", j: "%s" }' % (j["app"], j["id"]),
                      body, "collection",
                      [("Store", "index.html"),
                       ("%s joint actuators" % j["name"], None)])


def parse_taxonomy(src, block_name, tail):
    """id / name / blurb for COLLECTIONS and APPLICATIONS. Without these pages
    a crawler saw eleven sitemap URLs that all served the same generic
    collection.html, title and all."""
    i = src.index("window.%s" % block_name)
    body = src[i:src.index(chr(10) + "];", i)]
    out = []
    hits = list(re.finditer(r'\{\s*id: "([a-z0-9\-]+)", name: "([^"]+)", %s' % tail, body))
    for n, m in enumerate(hits):
        end = hits[n + 1].start() if n + 1 < len(hits) else len(body)
        chunk = body[m.start():end]
        blurb = re.search(r'blurb: "((?:[^"\\]|\\.)*)"', chunk)
        out.append({"id": m.group(1), "name": m.group(2),
                    "blurb": (blurb.group(1).replace('\\"', '"') if blurb else "")})
    return out


def collection_page(c, products=None):
    slug = slugify(c["name"])
    # Name the brand only where there is one to name. Every collection
    # held CubeMars alone until Direct Drive Motors, and a title reading
    # "Direct Drive Motors - CubeMars" over a MyActuator part is a lie in
    # the one place a search engine quotes verbatim.
    brands = sorted({q.get("brand", "CubeMars") for q in (products or [])
                     if q["collection"] == c["id"]})
    title = ("%s — %s | Picasso Intelligence" % (c["name"], brands[0])
             if len(brands) == 1
             else "%s | Picasso Intelligence" % c["name"])
    mine = [q for q in (products or [])
            if q["collection"] == c["id"] and q["canonical"] == q["id"]]
    mine.sort(key=lambda q: q["price"])
    return slug, page(title, c["blurb"], "%s/%s.html" % (SITE, slug),
                      '{ c: "%s" }' % c["id"],
                      browse_body(c["name"], c["blurb"], mine), "collection",
                      [("Store", "index.html"), (c["name"], None)])


def application_page(a):
    slug = "actuators-for-%s" % slugify(a["name"])
    title = "Actuators for %s | Picasso Intelligence" % a["name"]
    return slug, page(title, a["blurb"], "%s/%s.html" % (SITE, slug),
                      '{ a: "%s" }' % a["id"],
                      browse_body("Actuators for %s" % a["name"], a["blurb"]),
                      "collection",
                      [("Store", "index.html"),
                       ("Actuators for %s" % a["name"], None)])


# ---------------------------------------------------------------- main

def main():
    src = read("assets/js/data.js")
    # `src` is reused for the worker bundle further down; keep a name that
    # still means data.js when the zone table is lifted out.
    data_src = src
    products = parse_products(src)
    joints = parse_joints(src)
    lastmod = last_commit_date()
    urls = []
    # Collected before the nav exists, rewritten once it does.
    static_pending = []

    for f in STATIC_PAGES:
        # The homepage is served at both / and /index.html. The sitemap has to
        # name the same one its canonical does, or the two forms compete and
        # Google picks its own.
        urls.append(SITE + "/" if f == "index.html" else "%s/%s" % (SITE, f))
        static_pending.append(f)

    cols = parse_taxonomy(data_src, "COLLECTIONS", "parent:")
    actuators = integrated_ids(data_src)
    apps = parse_taxonomy(data_src, "APPLICATIONS", "art:")

    # Every page from here on carries the same header and footer in its source.
    global NAV_HTML, FOOT_HTML
    NAV_HTML = nav_markup(cols, apps)
    FOOT_HTML = foot_markup(cols)
    for f in static_pending:
        write(f, inject_shell(read(f)))
    for c in cols:
        slug, html = collection_page(c, products)
        write("%s.html" % slug, html)
        urls.append("%s/%s.html" % (SITE, slug))
    for a in apps:
        slug, html = application_page(a)
        write("%s.html" % slug, html)
        urls.append("%s/%s.html" % (SITE, slug))

    # Every variant now has a page of its own worth indexing, so every variant
    # gets a self-canonical and a sitemap entry. The old rule pointed the other
    # 41 at the cheapest of their group and left them out, which was right when
    # the pages were ninety-seven characters and all but identical: Google
    # would have picked one anyway, and saying which beat letting it guess.
    # With the specifications, the description and the images in the source,
    # they are different documents, and someone searching for the encoder
    # version should land on the encoder version.
    by_coll = {c["id"]: c["name"] for c in cols}
    for p in products:
        sibs = [q for q in products
                if p["group"] and q["group"] == p["group"]] if p["group"] else []
        write("%s.html" % p["id"],
              product_page(p, actuators, sibs, by_coll.get(p["collection"], "")))
        # A page whose canonical names another page does not belong in the
        # sitemap: it would ask Google to index a URL we have just told it to
        # fold away.
        if p["canonical"] == p["id"]:
            urls.append("%s/%s.html" % (SITE, p["id"]))

    for j in joints:
        slug, html = joint_page(j)
        write("%s.html" % slug, html)
        urls.append("%s/%s.html" % (SITE, slug))

    write("llms.txt", llms_txt(products, cols, apps))

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

    # Freight zones live in data.js so the cart and the worker read one table.
    # The array is written with quoted keys precisely so it can be lifted out
    # as JSON here; a stray comment or single quote inside it will fail loudly
    # rather than ship a worker that prices freight differently from the cart.
    i = data_src.index("shippingZones: [") + len("shippingZones: ")
    depth, j = 0, i
    while True:
        if data_src[j] == "[":
            depth += 1
        elif data_src[j] == "]":
            depth -= 1
            if depth == 0:
                break
        j += 1
    zones = json.loads(data_src[i:j + 1])
    for z in zones:
        assert z["rates"][-1]["upTo"] is None, "zone %s has no catch-all band" % z["code"]
    self_serve_max = int(re.search(r"selfServeMax:\s*(\d+)", data_src).group(1))
    shipping = {"selfServeMax": self_serve_max, "zones": zones}
    write("worker/shipping.json", json_dump(shipping))

    # Cloudflare's dashboard editor has no bundler, so also emit a single file
    # with the prices inlined — paste-and-deploy, no build step, which is how
    # the rest of this site works too.
    src = read("worker/checkout.js").replace(
        'import PRICES from "./prices.json";',
        "const PRICES = " + json_dump(prices).rstrip() + ";").replace(
        'import SHIPPING from "./shipping.json";',
        "const SHIPPING = " + json_dump(shipping).rstrip() + ";")
    banner = [
        "/* GENERATED by tools/build-static.py from worker/checkout.js +",
        "   worker/prices.json + worker/shipping.json. Paste THIS file into Cloudflare.",
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
    print("taxonomy      %d collections + %d applications" % (len(cols), len(apps)))
    print("sitemap URLs  %d" % len(urls))
    print("worker prices %d" % len(prices))
    print("ship zones    %s" % ", ".join(z["code"] for z in zones))
    print("self-serve to $%s" % format(self_serve_max, ","))
    print("lastmod       %s" % (lastmod or "(omitted)"))


if __name__ == "__main__":
    main()
