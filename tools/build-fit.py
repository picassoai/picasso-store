#!/usr/bin/env python3
# coding: utf-8
"""Write a `fit:` sentence into data.js for every product that has no
description of its own.

    python tools/build-fit.py            # rewrite assets/js/data.js
    python tools/build-fit.py --dry-run  # print what it would write

Fifty-six of a hundred and ten products shared their description with another
product, because CubeMars writes one paragraph per series and we repeated it
on every model in that series. A series paragraph is the right thing to say
about a series and the wrong thing to say about a model: asked what a GL40
KV70 is, an engine reading this site found eleven pages carrying the same
sentences and had no reason to quote any of them over the others. The same
paragraph also gave Search Console its "duplicate without user-selected
canonical" on pages that are not duplicates at all.

So each of those products gets one or two sentences built from its own
specification table and from where its figures fall among its siblings'.
Nothing here is composed: every clause is a figure the table already states,
and a superlative is claimed only when every sibling states the same figure,
so "the smallest" is never said of the only one that was measured.

A product whose blurb is already its own keeps it and gets nothing - the
AKE40-6's hand-written line says 140 g and 24.5 mm better than a generated
one would, and saying it twice on one page is worse than saying it once.

One figure is deliberately left out. Twenty-four percent of the models whose
"Maximum Torque Weight Ratio" we publish disagree with their own peak torque
divided by their own weight, by between seven and nine hundred percent - the
GL40 II states 60.71 N.m/kg for a motor whose published figures give 6.07.
Those rows may be computed against a different weight, or be wrong; either
way it is the one number on the page that cannot be checked against the two
beside it, so it is not repeated in prose. A reader with the peak torque and
the weight can divide.

Re-run this after editing any specification in data.js.
"""

import collections
import importlib.util
import io
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

_HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location(
    "bs", os.path.join(_HERE, "build-static.py"))
bs = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(bs)

ROOT = bs.ROOT
DATA = os.path.join(ROOT, "assets", "js", "data.js")

# How the catalogue's Application column reads in a sentence. A token that is
# not here is dropped rather than guessed at: one GL row carries "Radar
# Bearings Imported 6705 ZZ", which is a note to a buyer in Shenzhen and not
# an application of the motor.
USES = {
    "legged robot": "legged robots",
    "quadruped robot": "quadruped robots",
    "exoskeleton": "exoskeletons",
    "agv": "AGVs",
    "cobot arm": "cobot arms",
    "robotic arm": "robotic arms",
    "wheeledrobot": "wheeled robots",
    "wheeled robot": "wheeled robots",
    "gimbal": "gimbals",
    "radar": "radar",
    "humanoid robot": "humanoid robots",
    "drone": "drones",
}

TORQUE = "Rated Torque (N·m)"
PEAK = "Peak Torque (N·m)"
BOLLARD = "Maximum Bollard Thrust (kgf)"
RATIO = "Maximum Torque Weight Ratio (N·m/kg)"


def txt(p, k):
    return (p["specs"].get(k) or "").strip()


def num(p, k):
    """The figure as the catalogue prints it, so a sentence and the table
    below it never disagree in the last decimal."""
    return bs.lead_num(p["specs"].get(k))


def fnum(p, k):
    """The first number anywhere in the cell, for ranking only - never for
    display. build-static's lead_num wants the number at the start, and the
    thrust column is written ">=7 kgf", so reading it that way silently
    returned nothing and no thruster was ever ranked against its own line."""
    m = re.search(r"-?\d+(?:\.\d+)?", str(p["specs"].get(k) or ""))
    return float(m.group(0)) if m else None


def andlist(items):
    """Oxford-free list. Callers must not pass a clause containing "and" -
    "700 g in air and 395 g in water and a working depth of 30 m" was the bug
    this comment replaced."""
    items = [i for i in items if i]
    if len(items) < 2:
        return items[0] if items else ""
    return ", ".join(items[:-1]) + " and " + items[-1]


def cap(s):
    return s[:1].upper() + s[1:] if s else ""


def family(p):
    """What a buyer calls this product's range, and the key that decides whose
    figures it is ranked against.

    "AKE Series" is how the taxonomy spells it and not how anyone says it. The
    thrusters need more than that: all seventeen share the series "Underwater",
    which puts the shallow SW line, the 350 m DW line, the W30 and two ESCs in
    one bucket - so "the largest Underwater" would be both ungrammatical and a
    comparison nobody makes. They are ranked within their own letter instead.
    """
    s = re.sub(r"\s+Series$", "", (p["series"] or "")).strip()
    if p["collection"] == "underwater":
        m = re.match(r"([A-Z]+)", p["name"])
        if m:
            return "underwater:" + m.group(1), "%s thruster" % m.group(1)
    return s, s


def uses_clause(p):
    want = [USES.get(a.strip().lower()) for a in txt(p, "Application").split(",")]
    want = [w for w in want if w]
    # Dropping duplicates keeps "gimbals and gimbals" out of the one row that
    # lists an application twice.
    seen, keep = set(), []
    for w in want:
        if w not in seen:
            seen.add(w)
            keep.append(w)
    return "CubeMars lists it for %s." % andlist(keep) if keep else ""


# --------------------------------------------------------------- placement
def placement(p, sibs):
    """Where it sits in its own range, or nothing.

    Claimed only when every sibling publishes the same figure, so a range in
    which one model was measured and the others were not produces no claim.
    Variants of one model are not siblings here: the AK80-9 with and without
    its driver board are one motor, and both are equally the largest AK.
    """
    _key, name = family(p)
    if not name or not sibs:
        return ""
    for key, lo, hi in ((BOLLARD, "The smallest %s", "The largest %s"),
                        ("OD (mm)", "The smallest %s", "The largest %s"),
                        (TORQUE, "The lightest-duty %s", "The highest-torque %s")):
        mine, theirs = fnum(p, key), [fnum(q, key) for q in sibs]
        if mine is None or not all(t is not None for t in theirs):
            continue
        if mine < min(theirs):
            return lo % name
        if mine > max(theirs):
            return hi % name
    return ""


def opening(place, clause):
    """"The smallest GL: 80 mN.m rated ..." when there is a placement to make,
    the clause on its own when there is not."""
    if place and clause:
        return "%s: %s." % (place, clause)
    return cap(clause) + "." if clause else ""


# ------------------------------------------------------------------ motors
def motor_line(p, sibs):
    rated, peak = num(p, TORQUE), num(p, PEAK)
    od, ht, wt = num(p, "OD (mm)"), num(p, "Height (mm)"), num(p, "Weight (g)")
    ratio, kv = txt(p, "Reduction Ratio"), num(p, "Kv (RPM/V)")
    volts, speed = num(p, "Rated Voltage (V)"), num(p, "Rated Speed (RPM)")

    if rated and peak:
        torque = "%s rated and %s peak" % (bs.torque_text(rated),
                                           bs.torque_text(peak))
    elif rated:
        torque = "%s rated" % bs.torque_text(rated)
    elif peak:
        torque = "%s peak" % bs.torque_text(peak)
    else:
        torque = ""

    frame = "Ф%s x %s mm" % (od, ht) if od and ht else (
        "Ф%s mm" % od if od else "")
    if wt:
        frame = (frame + ", " if frame else "") + "%s g" % wt

    first = "%s from a %s frame" % (torque, frame) if torque and frame \
        else (torque or frame)
    if first and ratio and ratio not in ("1", "1:1"):
        first += ", geared %s" % ratio
    if first and volts:
        first += ", on %s V" % volts

    # The electrical figures are what separate two windings of one housing.
    # Without them the GL80 KV60 and the GL80 KV30 read identically, which is
    # the whole complaint: same frame, wound for different speeds.
    second = []
    if kv and speed:
        second.append("Kv %s, %s RPM rated" % (kv, speed))
    elif kv:
        second.append("Kv %s" % kv)
    elif speed:
        second.append("%s RPM rated" % speed)
    # No-load speed and nothing else from the electrical block. Peak current
    # looked like a fourth free figure until the AK60-6 V3.0 turned out to
    # state it as "0.3/11.2" - a pair, of which only the first half survives
    # being read as a number, and 0.3 A peak on a motor rated at 3.8 is a
    # sentence that discredits the page it sits on.
    nl = num(p, "No-Load Speed (RPM)")
    if nl:
        second.append("%s RPM no-load" % nl)

    return " ".join(x for x in (opening(placement(p, sibs), first),
                                cap(andlist(second)) + "." if second else "",
                                uses_clause(p)) if x)


# --------------------------------------------------------------- thrusters
def thruster_line(p, sibs):
    bollard = txt(p, BOLLARD)
    fwd, back = txt(p, "Forward Thrust (kgf)"), txt(p, "Backward Thrust (kgf)")
    power, volts = num(p, "Rated Power (W)"), num(p, "Rated Voltage (V)")
    amps = num(p, "Rated Current (A)")
    depth = txt(p, "Applicable Water Depth")
    prop = txt(p, "Propeller Diameter") or txt(p, "Dimensions")
    air, water = num(p, "Weight in Air (g)"), num(p, "Weight in Water (g)")
    esc = txt(p, "Driver") or txt(p, "ESC")

    if bollard:
        head = "%s kgf of bollard thrust" % bollard
    elif fwd and back:
        head = "%s kgf of forward thrust, %s kgf astern" % (fwd, back)
    elif fwd:
        head = "%s kgf of forward thrust" % fwd
    else:
        head = ""
    if head:
        if power and volts:
            head += " on %s W at %s V" % (power, volts)
        elif power and amps:
            head += " on %s W, %s A" % (power, amps)
        elif power:
            head += " on %s W" % power

    body = []
    if prop:
        body.append("a %s propeller" % prop if txt(p, "Propeller Diameter")
                    else "%s overall" % prop)
    if air:
        body.append("%s g in air" % air)
    if water:
        body.append("%s g in water" % water)
    if depth:
        body.append("a working depth of %s" % depth)

    tail = ""
    if esc:
        inner = esc.split("(")[-1].rstrip(")") if "(" in esc else esc
        tail = ("Driven by an external ESC (%s), which is a separate part."
                % inner) if "ESC" in esc.upper() and "(" in esc else (
            "Driven by the %s, which is a separate part." % inner)

    return " ".join(x for x in (opening(placement(p, sibs), head),
                                cap(andlist(body)) + "." if body else "",
                                tail) if x)


# ------------------------------------------------------------- accessories
# Rows worth reading as prose, in the order a buyer wants them. "Fits" is the
# one that earns its keep: someone searching "cable for AK80-9" should land on
# a page that says so in a sentence, not only in a table cell.
PLAIN = (("Works with", "Works with the %s."),
         ("Contents", "Contains %s."),
         ("In the box", "In the box: %s."),
         ("Interface", "%s interface."),
         ("Communication", "%s communication."),
         ("Functions", "Handles %s."),
         ("Input Voltage", "Takes %s input."),
         ("Software", "Used with %s."),
         ("Size", "%s."),
         ("Dimensions (mm)", "%s mm."))


def accessory_line(p, sibs):
    out = []
    fits = txt(p, "Fits")
    if fits:
        out.append("Fits the %s."
                   % andlist([x.strip() for x in fits.split(",") if x.strip()]))
    for key, fmt in PLAIN:
        v = txt(p, key)
        if v and len(v) < 90:
            out.append(fmt % v)
        if len(out) >= 3:
            break
    mv = num(p, "Motor rated voltage (V)")
    if mv and len(out) < 4:
        out.append("For a %s V motor." % mv)
    return " ".join(out)


# -------------------------------------------------------------------- route
def fit_line(p, sibs):
    """Route on the figures present, not on the collection: the thruster ESCs
    sit in the underwater collection and have no thrust of their own, and a
    driver board sits in accessories and has no torque."""
    if any(k in p["specs"] for k in (BOLLARD, "Forward Thrust (kgf)",
                                     "Weight in Water (g)")):
        return thruster_line(p, sibs)
    if TORQUE in p["specs"] or PEAK in p["specs"]:
        return motor_line(p, sibs)
    return accessory_line(p, sibs)


def siblings_by_series(ps):
    fam = collections.defaultdict(list)
    for p in ps:
        fam[family(p)[0] or p["collection"]].append(p)

    def of(p):
        mine, seen, out = p["lead"] or p["id"], set(), []
        for q in fam[family(p)[0] or p["collection"]]:
            lead = q["lead"] or q["id"]
            if lead == mine or lead in seen:
                continue
            seen.add(lead)
            out.append(q)
        return out
    return of


def boilerplate_key(p):
    """A blurb with this product's own name and figures taken out of it.

    Comparing blurbs as written found the fourteen thrusters but missed the
    AK10-9, whose description is "The AK10-9 V2.0 actuator integrates a
    high-performance brushless DC motor, a self-developed planetary reducer,
    an encoder, and an integrated drive" - a unique string, because the model
    name is in it, and otherwise word for word the AK10-9 V3.0's and the
    AK80-64's. A sentence that is only distinctive where the part number was
    substituted into it is not a description of the part.
    """
    s = (p["blurb"] or "").lower()
    for tok in re.split(r"[\s/]+", p["name"].lower()):
        if tok:
            s = s.replace(tok, " ")
    s = re.sub(r"v\d+(\.\d+)?|kv\d+|\d+(\.\d+)?", " ", s)
    return re.sub(r"[^a-z]+", " ", s).strip()


def needs_line(ps):
    """The products with no description of their own: the ones with no blurb,
    the ones whose blurb is also some other product's, and the ones whose
    blurb is the same boilerplate as another's with the model name swapped."""
    counts = collections.Counter(boilerplate_key(p) for p in ps if p["blurb"])
    return {p["id"] for p in ps
            if not p["blurb"] or counts[boilerplate_key(p)] > 1}


def main():
    dry = "--dry-run" in sys.argv
    src = io.open(DATA, encoding="utf-8").read()
    ps = bs.parse_products(src)
    sibs_of = siblings_by_series(ps)
    want = needs_line(ps)

    lines = {}
    for p in ps:
        if p["id"] in want:
            l = fit_line(p, sibs_of(p))
            if l:
                lines[p["id"]] = l

    out, written, skipped = src, 0, []
    for p in ps:
        line = lines.get(p["id"])
        # A product is addressed by its id so the rewrite cannot land on the
        # wrong entry, and the existing fit is replaced rather than appended
        # to, so running this twice is the same as running it once.
        anchor = '{ id: "%s", name:' % p["id"]
        i = out.find(anchor)
        if i < 0:
            skipped.append(p["id"])
            continue
        j = out.find('\n    blurb:', i)
        if j < 0:
            j = out.find('\n    specs:', i)
        if j < 0:
            skipped.append(p["id"])
            continue
        head = re.sub(r',\s*fit: "(?:[^"\\]|\\.)*"', "", out[i:j])
        # The entry's own trailing comma is what separates it from the blurb
        # line below, and it is at the end of this slice. Appending another
        # produced `variantLabel: "Without encoder",, fit:` - two commas, and
        # a data.js that no browser would parse.
        bare = head.rstrip().rstrip(",")
        if bare == head.rstrip():
            skipped.append(p["id"] + " (no separator)")
            continue
        if line:
            bare += ', fit: "%s"' % line.replace("\\", "\\\\").replace('"', '\\"')
            written += 1
        out = out[:i] + bare + "," + out[j:]

    print("products                %d" % len(ps))
    print("without own description %d" % len(want))
    print("fit sentences written   %d" % written)
    if skipped:
        print("could not place         %d  %s" % (len(skipped), ", ".join(skipped)))
    dup = {k: v for k, v in collections.Counter(lines.values()).items() if v > 1}
    print("sentences shared by >1  %d (variant pairs of one model)" % len(dup))

    if dry:
        for p in ps:
            if p["id"] in lines:
                print("\n%s\n    %s" % (p["name"], lines[p["id"]]))
        return
    io.open(DATA, "w", encoding="utf-8", newline="\n").write(out)
    print("wrote %s  (%+d bytes)" % (DATA, len(out) - len(src)))


if __name__ == "__main__":
    main()
