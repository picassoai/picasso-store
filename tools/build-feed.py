#!/usr/bin/env python3
# coding: utf-8
"""Generate the Google Merchant Center product feed.

Organic ranking against a distributor twenty years older is slow. Shopping is
not: a feed puts every model in front of someone searching the part number,
with the price beside it, without waiting to out-rank anybody.

The feed is built from the same assets/js/data.js the site and the worker are
built from, so a price can never be right in one place and wrong in another.

    python tools/build-feed.py        # writes feed.xml

Then in Merchant Center: Products > Feeds > Add, fetch
https://picassointelligence.com/feed.xml on a daily schedule.
"""

import io
import os
import re
import sys
import xml.sax.saxutils as sx

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib.util

_spec = importlib.util.spec_from_file_location(
    "bs", os.path.join(os.path.dirname(os.path.abspath(__file__)), "build-static.py"))
bs = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(bs)

SITE = bs.SITE
ROOT = bs.ROOT

# What Merchant Center is told about getting the goods to the buyer. These are
# the same figures the cart charges, read from the one table that sets them, so
# a shopper who clicks through is never quoted something different from what
# the advert promised.
#
# Google splits the wait in two, and so does the route. Handling is ours: the
# factory dispatches a stocked model within about three working days. Transit
# is the freight forwarder's: double-clearance out of China and into the United
# States runs seven to ten days, then UPS carries it the last leg.
#
# Both are stated a little long on purpose. Merchant Center suspends accounts
# for delivery estimates the shipments do not meet, and nothing is gained by
# promising a day we cannot hold - this is the same reasoning the quotes to
# customers use.
HANDLING_MIN, HANDLING_MAX = 1, 3
TRANSIT_MIN, TRANSIT_MAX = 5, 10


def esc(s):
    return sx.escape(str(s or ""))


def shipping_block(price, zones):
    """Google wants the freight stated per destination, not as a rule the
    shopper has to apply. The band table is the authority; this reads it."""
    out = []
    for z in zones:
        for c in z["countries"]:
            cost = None
            for r in z["rates"]:
                if r["upTo"] is None or price < r["upTo"]:
                    cost = r["cost"]
                    break
            out.append(
                "    <g:shipping>\n"
                "      <g:country>%s</g:country>\n"
                "      <g:service>Standard</g:service>\n"
                "      <g:price>%.2f USD</g:price>\n"
                "    </g:shipping>" % (esc(c), float(cost or 0)))
    return "\n".join(out)


def item(p, zones, coll_name):
    url = "%s/%s.html" % (SITE, p["id"])
    imgs = ["%s/assets/img/products-branded/%s" % (SITE, i) for i in p["images"]]

    # Title carries the words a buyer types. "AKE80-8 KV30" alone wins only the
    # people who already know the part number; the brand and what the thing is
    # reach the ones who do not.
    brand = p.get("brand") or "CubeMars"
    # The MyActuator parts carry the maker in their own name, so prefixing it
    # again reads "MyActuator MyActuator RMD-L-4010".
    title = p["name"] if p["name"].lower().startswith(brand.lower()) \
        else "%s %s" % (brand, p["name"])
    if coll_name:
        title += " — " + coll_name
    title = title[:150]

    bits = []
    for k in ("Rated Torque (N·m)", "Peak Torque (N·m)", "OD (mm)",
              "Weight (g)", "Reduction Ratio", "Rated Voltage (V)"):
        if p["specs"].get(k):
            bits.append("%s %s" % (k.split(" (")[0], p["specs"][k]))
    # The per-model sentence first: fourteen thrusters shared one series
    # paragraph, and Merchant Center reads a feed of identical descriptions
    # the same way an index reads a site of identical pages.
    desc = " ".join(x for x in (p.get("fit"), p["blurb"]) if x)
    if bits:
        desc = (desc + " " if desc else "") + "; ".join(bits) + "."
    desc += (" Delivered duty paid from a US distributor; no customs for you "
             "to clear and no carrier invoice after delivery.")

    extra = "\n".join("    <g:additional_image_link>%s</g:additional_image_link>" % esc(i)
                      for i in imgs[1:10])

    return """  <item>
    <g:id>%s</g:id>
    <g:title>%s</g:title>
    <g:description>%s</g:description>
    <g:link>%s</g:link>
    <g:image_link>%s</g:image_link>
%s
    <g:condition>new</g:condition>
    <g:availability>in_stock</g:availability>
    <g:price>%.2f USD</g:price>
    <g:brand>%s</g:brand>
    <g:mpn>%s</g:mpn>
    <g:identifier_exists>no</g:identifier_exists>
    <g:product_type>%s</g:product_type>
%s
    <g:min_handling_time>%d</g:min_handling_time>
    <g:max_handling_time>%d</g:max_handling_time>
    <g:min_transit_time>%d</g:min_transit_time>
    <g:max_transit_time>%d</g:max_transit_time>
  </item>""" % (
        esc(p["id"]), esc(title), esc(desc.strip()), esc(url),
        esc(imgs[0]) if imgs else "", extra,
        p["price"], esc(p.get("brand") or "CubeMars"), esc(p["name"]),
        esc(coll_name or p["series"]),
        shipping_block(p["price"], zones),
        HANDLING_MIN, HANDLING_MAX, TRANSIT_MIN, TRANSIT_MAX)


def main():
    src = bs.read("assets/js/data.js")
    products = bs.parse_products(src)
    cols = bs.parse_taxonomy(src, "COLLECTIONS", "parent:")
    by_coll = {c["id"]: c["name"] for c in cols}

    # Balance the brackets rather than looking for the first "],": a zone's
    # rates array closes with one too, and stopping there hands json half a
    # table. build-static.py reads the same block the same way.
    import json
    i = src.index("shippingZones: [") + len("shippingZones: ")
    depth, j = 0, i
    while True:
        if src[j] == "[":
            depth += 1
        elif src[j] == "]":
            depth -= 1
            if depth == 0:
                break
        j += 1
    zones = json.loads(src[i:j + 1])

    # Anything without a price is quote-only and has nothing to advertise.
    sellable = [p for p in products if p["price"]]
    items = "\n".join(item(p, zones, by_coll.get(p["collection"], ""))
                      for p in sellable)

    xml = """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>Picasso Intelligence</title>
  <link>%s</link>
  <description>Robotic actuators, frameless and gimbal motors and underwater thrusters, stocked and supported in the United States.</description>
%s
</channel>
</rss>
""" % (SITE, items)

    io.open(os.path.join(ROOT, "feed.xml"), "w", encoding="utf-8",
            newline="\n").write(xml)
    print("feed.xml   %d items   %.0f KB" % (len(sellable), len(xml) / 1024.0))
    print("price range  $%d - $%d" % (min(p["price"] for p in sellable),
                                      max(p["price"] for p in sellable)))


if __name__ == "__main__":
    main()
