#!/usr/bin/env python3
"""Regenerate contour-cut character sprites + separated animated arm parts.

Style: medieval marginalia "contour cut" — flat fills with a thick dark sepia
outline around every part, fully transparent background (no parchment plate).

Outputs (all RGBA PNGs with true transparency):
  <char>-idle.png    full figure in resting pose (body + arm layers flattened)
  <char>-arm.png     knight sword arm / nun launching arm; pivot at canvas centre
  <char>-attack.png  figure with the arm thrown forward (engine 'attack' stance)
  <char>-full.png    portrait key art (body + arm posed)
Characters: knight, nun, jester, rabbit-on-snail.
"""
from PIL import Image, ImageDraw
import math
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'sprites')


def S(c):
    """hex -> rgba tuple"""
    c = c.lstrip('#')
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4)) + (255,)


INK = S('#3a2818')  # contour ink outline


# ---------------------------------------------------------------- primitives
def ell(d, bbox, fill, w=5, line=None):
    d.ellipse(bbox, fill=fill, outline=line or INK, width=w)


def poly(d, pts, fill, w=5, line=None):
    d.polygon(pts, fill=fill)
    if w:
        d.line(list(pts) + [pts[0]], fill=line or INK, width=w, joint='curve')
        for p in pts:
            d.ellipse([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2],
                      fill=line or INK)


def limb(d, pts, color, thick, cap=True):
    """Outlined tube-limb: ink stroke wider than the colour stroke."""
    d.line(pts, fill=INK, width=thick + 9, joint='curve')
    d.line(pts, fill=color, width=thick, joint='curve')
    if cap:
        r = thick // 2
        x, y = pts[-1]
        ell(d, [x - r, y - r, x + r, y + r], color, w=5)


def eye(d, c, r=4):
    d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=INK)


def face(d, c, flip=1):
    x, y = c
    eye(d, (x - 7 * flip, y))
    eye(d, (x + 6 * flip, y), r=3)
    d.arc([x - 9, y + 3, x + 9, y + 15], 20, 160, fill=INK, width=3)


def new(w, h):
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def trim(img, pad=4):
    """Trim to content + transparent margin so the figure floats on transparency."""
    bbox = img.getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    w, h = img.size
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(w, x1 + pad), min(h, y1 + pad)
    return img.crop((x0, y0, x1, y1))


def save(img, name):
    img = trim(img)
    img.save(os.path.join(OUT, name))
    print('wrote', name, img.size)


def save_full(img, name, pivot=None):
    """Save the FULL fixed-size canvas (no trimming).

    Layer PNGs stay canvas-aligned, so stacking body + arm in CSS reproduces
    the flattened idle art exactly and keeps the rotation pivot stable while
    the arm animates. If `pivot` (canvas coords) is given it is returned as
    offsets from the canvas edges — frames.ts records those numbers.
    """
    img.save(os.path.join(OUT, name))
    W, H = img.size
    if pivot:
        px, py = pivot
        print('wrote', name, img.size,
              f'pivot left={px} top={py} right={W - px} bottom={H - py}')
    else:
        print('wrote', name, img.size)


def arm_hole(img, pivot, radius=34):
    """Punch a transparent hole at the shoulder so the arm layer never hides
    the pauldron/sleeve joint underneath (clean contour-cut separation)."""
    px, py = pivot
    d = ImageDraw.Draw(img)
    d.ellipse([px - radius, py - radius, px + radius, py + radius], fill=(0, 0, 0, 0))
    return img


# ================================================================ KNIGHT
def knight_body(canvas_w=221, canvas_h=225, pose='idle'):
    """Knight torso/legs/head/shield. The sword arm is a separate layer."""
    img, d = new(canvas_w, canvas_h)
    cx = canvas_w // 2
    gy = canvas_h - 12
    steel, dark = S('#aeb6bd'), S('#7d858c')
    tabard, red = S('#c8ccd2'), S('#b13a2e')

    crouch = 14 if pose == 'crouch' else 0
    hip = gy - 74 + crouch
    sh = gy - 148 + crouch
    head_cy = sh - 20

    # legs (greaves) + sabatons
    limb(d, [(cx - 14, hip), (cx - 16, gy - 14), (cx - 24, gy)], steel, 16)
    limb(d, [(cx + 12, hip), (cx + 15, gy - 14), (cx + 24, gy)], steel, 16)
    poly(d, [(cx - 34, gy - 4), (cx - 14, gy - 4), (cx - 12, gy), (cx - 38, gy)], dark, 4)
    poly(d, [(cx + 6, gy - 4), (cx + 26, gy - 4), (cx + 30, gy), (cx + 4, gy)], dark, 4)

    # torso armour + tabard cross
    poly(d, [(cx - 26, sh), (cx + 24, sh), (cx + 20, hip + 6), (cx - 22, hip + 6)], steel, 6)
    poly(d, [(cx - 8, sh + 2), (cx + 8, sh + 2), (cx + 6, hip + 4), (cx - 6, hip + 4)], tabard, 3)
    poly(d, [(cx - 8, sh + 16), (cx + 8, sh + 16), (cx + 8, sh + 26), (cx - 8, sh + 26)], red, 0)
    d.line([(cx - 8, sh + 21), (cx + 8, sh + 21)], fill=S('#8f2b20'), width=4)
    d.line([(cx + 0, sh + 12), (cx + 0, sh + 30)], fill=S('#8f2b20'), width=4)
    ell(d, [cx - 24, hip - 6, cx + 22, hip + 10], dark, w=4)
    ell(d, [cx - 38, sh - 10, cx - 14, sh + 12], steel, w=5)   # pauldrons
    ell(d, [cx + 14, sh - 10, cx + 38, sh + 12], steel, w=5)

    # left arm + heater shield
    limb(d, [(cx - 26, sh + 6), (cx - 36, sh + 34), (cx - 34, hip - 2)], steel, 12)
    poly(d, [(cx - 58, sh + 18), (cx - 30, sh + 14), (cx - 28, hip + 16),
             (cx - 56, hip + 20), (cx - 62, (sh + hip) // 2)], S('#8a94a0'), 6)
    eye(d, (cx - 45, sh + 34), r=5)
    eye(d, (cx - 45, hip - 2), r=5)

    # great helm with visor slit, breath holes, plume
    hx, hy = cx + 2, head_cy
    poly(d, [(hx - 20, hy + 14), (hx - 20, hy - 12), (hx - 8, hy - 24), (hx + 10, hy - 24),
             (hx + 20, hy - 10), (hx + 20, hy + 14)], steel, 6)
    d.rectangle([hx - 20, hy - 4, hx + 20, hy + 2], fill=INK)
    for i in range(3):
        eye(d, (hx + 6 + i * 5, hy + 8), r=2)
    poly(d, [(hx - 2, hy - 24), (hx + 6, hy - 40), (hx + 14, hy - 26), (hx + 4, hy - 22)], red, 4)
    return img


def knight_arm(canvas_w=221, canvas_h=225, pose='idle'):
    """Sword arm on its own layer; shoulder pivot at canvas centre."""
    img, d = new(canvas_w, canvas_h)
    cx, cy = canvas_w // 2, canvas_h // 2
    steel, grip = S('#aeb6bd'), S('#6b4a2b')

    if pose == 'idle':
        sh, elb, hand = (cx + 24, cy + 6), (cx + 34, cy + 34), (cx + 30, cy + 58)
        blade_to = (cx + 6, cy + 118)
    elif pose == 'windup':
        sh, elb, hand = (cx + 24, cy + 6), (cx + 40, cy - 26), (cx + 26, cy - 52)
        blade_to = (cx - 18, cy - 104)
    elif pose == 'launch':
        sh, elb, hand = (cx + 24, cy + 6), (cx + 52, cy - 2), (cx + 92, cy - 22)
        blade_to = (cx + 150, cy - 52)
    else:
        raise ValueError(pose)

    limb(d, [sh, elb, hand], steel, 13)
    ell(d, [hand[0] - 11, hand[1] - 11, hand[0] + 11, hand[1] + 11], S('#8f979e'), w=5)

    ang = math.atan2(blade_to[1] - hand[1], blade_to[0] - hand[0])
    ux, uy = math.cos(ang), math.sin(ang)
    px, py = -uy, ux

    def g(t, o=0):
        return (hand[0] + ux * t + px * o, hand[1] + uy * t + py * o)

    d.line([g(-14), g(10)], fill=INK, width=15)                     # grip
    d.line([g(-14), g(10)], fill=grip, width=9)
    d.line([g(8, -14), g(8, 14)], fill=INK, width=11)               # gold crossguard
    d.line([g(8, -14), g(8, 14)], fill=S('#c9a24b'), width=7)
    poly(d, [g(12, -6), g(12, 6), (blade_to[0] + px * 2, blade_to[1] + py * 2),
             (blade_to[0] - px * 2, blade_to[1] - py * 2)], S('#d7dde3'), 5)
    tip = (blade_to[0] * 0.92 + hand[0] * 0.08, blade_to[1] * 0.92 + hand[1] * 0.08)
    d.line([g(16), tip], fill=S('#9aa4ad'), width=3)                # fuller
    return img


# ================================================================ NUN
def nun_body(canvas_w=166, canvas_h=230, pose='idle'):
    img, d = new(canvas_w, canvas_h)
    cx = canvas_w // 2
    gy = canvas_h - 10
    robe, dark = S('#7d7490'), S('#3f3a56')
    veil, skin = S('#4a445e'), S('#e8cfae')

    crouch = 12 if pose == 'crouch' else 0
    sh = gy - 150 + crouch
    hip = gy - 66 + crouch
    head_cy = sh - 22

    # flowing habit
    poly(d, [(cx - 20, sh), (cx + 20, sh), (cx + 34, gy), (cx - 34, gy)], robe, 6)
    d.line([(cx - 6, sh + 10), (cx - 10, gy - 4)], fill=dark, width=4)
    d.line([(cx + 8, sh + 10), (cx + 12, gy - 4)], fill=dark, width=4)
    # rope belt
    d.line([(cx - 18, hip), (cx + 18, hip)], fill=INK, width=9)
    d.line([(cx - 18, hip), (cx + 18, hip)], fill=S('#caa96b'), width=5)
    for i in range(3):
        d.line([(cx - 10 + i * 9, hip + 3), (cx - 13 + i * 9, hip + 26)],
               fill=S('#caa96b'), width=4)
    ell(d, [cx - 20, gy - 8, cx - 2, gy + 4], skin, w=4)            # peeking feet
    ell(d, [cx + 2, gy - 8, cx + 20, gy + 4], skin, w=4)

    # left arm clasped at chest
    limb(d, [(cx - 18, sh + 8), (cx - 24, sh + 40), (cx - 4, sh + 52)], robe, 12)

    # head: veil backdrop, then face disc on top so features stay visible
    hx, hy = cx + 1, head_cy
    poly(d, [(hx - 20, hy - 14), (hx + 20, hy - 14), (hx + 24, hy + 34), (hx + 14, hy + 40),
             (hx - 14, hy + 40), (hx - 24, hy + 34)], veil, 5)
    ell(d, [hx - 15, hy - 15, hx + 15, hy + 17], skin, w=5)
    d.arc([hx - 15, hy - 19, hx + 15, hy + 9], 180, 360, fill=S('#f2ead8'), width=7)
    eye(d, (hx - 6, hy))
    eye(d, (hx + 7, hy), r=3)
    d.line([(hx - 4, hy + 11), (hx + 5, hy + 11)], fill=INK, width=3)
    # small gold cross on chest
    d.line([(cx + 14, sh + 18), (cx + 14, sh + 34)], fill=INK, width=8)
    d.line([(cx + 14, sh + 18), (cx + 14, sh + 34)], fill=S('#c9a24b'), width=5)
    d.line([(cx + 8, sh + 24), (cx + 20, sh + 24)], fill=INK, width=8)
    d.line([(cx + 8, sh + 24), (cx + 20, sh + 24)], fill=S('#c9a24b'), width=5)
    return img


def nun_arm(canvas_w=166, canvas_h=230, pose='idle'):
    """Right arm; launches cucumis. Pivot at canvas centre."""
    img, d = new(canvas_w, canvas_h)
    cx, cy = canvas_w // 2, canvas_h // 2
    robe, skin = S('#7d7490'), S('#e8cfae')
    gourd = S('#7fa043')

    if pose == 'idle':
        sh, elb, hand = (cx + 18, cy + 8), (cx + 26, cy + 36), (cx + 10, cy + 52)
    elif pose == 'windup':
        sh, elb, hand = (cx + 18, cy + 8), (cx + 34, cy - 18), (cx + 12, cy - 40)
    elif pose == 'launch':
        sh, elb, hand = (cx + 18, cy + 8), (cx + 48, cy - 6), (cx + 78, cy - 24)
    else:
        raise ValueError(pose)

    limb(d, [sh, elb, hand], robe, 12)
    ell(d, [elb[0] - 13, elb[1] - 13, elb[0] + 13, elb[1] + 13], robe, w=5)  # sleeve flare
    ell(d, [hand[0] - 9, hand[1] - 9, hand[0] + 9, hand[1] + 9], skin, w=4)

    if pose in ('idle', 'windup'):
        hx, hy = hand
        ang = -0.5 if pose == 'windup' else 1.9
        L = 34
        bx, by = hx + math.cos(ang) * L, hy + math.sin(ang) * L
        d.line([(hx, hy), (bx, by)], fill=INK, width=20)
        d.line([(hx, hy), (bx, by)], fill=gourd, width=15)
        for t in (0.25, 0.5, 0.75):
            d.ellipse([hx + (bx - hx) * t - 2, hy + (by - hy) * t - 2,
                       hx + (bx - hx) * t + 2, hy + (by - hy) * t + 2], fill=S('#5c7d30'))
        ell(d, [bx - 9, by - 9, bx + 9, by + 9], gourd, w=4)
    return img


# ================================================================ JESTER
def jester_body(canvas_w=166, canvas_h=225, pose='idle'):
    img, d = new(canvas_w, canvas_h)
    cx = canvas_w // 2
    gy = canvas_h - 10
    red, gold = S('#b13a2e'), S('#e7c25a')
    skin = S('#ecd0ae')

    crouch = 14 if pose == 'crouch' else 0
    sh = gy - 138 + crouch
    hip = gy - 62 + crouch
    head_cy = sh - 24

    # legs with curled pointed shoes + bells
    limb(d, [(cx - 12, hip), (cx - 16, gy - 16), (cx - 26, gy - 4)], red, 12)
    limb(d, [(cx + 12, hip), (cx + 16, gy - 16), (cx + 26, gy - 4)], gold, 12)
    poly(d, [(cx - 40, gy - 8), (cx - 14, gy - 8), (cx - 14, gy), (cx - 44, gy),
             (cx - 52, gy - 6)], red, 4)
    poly(d, [(cx + 14, gy - 8), (cx + 40, gy - 8), (cx + 44, gy - 6), (cx + 52, gy - 2),
             (cx + 14, gy)], gold, 4)
    for b in ((cx - 50, gy - 5), (cx + 50, gy - 3)):
        ell(d, [b[0] - 5, b[1] - 5, b[0] + 5, b[1] + 5], S('#d9b64e'), w=3)

    # motley coat with diamond panels
    poly(d, [(cx - 22, sh), (cx + 22, sh), (cx + 26, hip + 8), (cx - 26, hip + 8)],
         S('#f0e6cc'), 6)
    poly(d, [(cx - 22, sh), (cx, sh), (cx, hip + 8), (cx - 26, hip + 8)], red, 0)
    poly(d, [(cx, sh), (cx + 22, sh), (cx + 26, hip + 8), (cx, hip + 8)], gold, 0)
    for yy, ca, cb in ((sh + 22, gold, red), (sh + 44, red, gold)):
        poly(d, [(cx - 24, yy), (cx - 16, yy - 8), (cx - 8, yy), (cx - 16, yy + 8)], ca, 2)
        poly(d, [(cx + 8, yy), (cx + 16, yy - 8), (cx + 24, yy), (cx + 16, yy + 8)], cb, 2)
    ell(d, [cx - 30, hip + 2, cx - 10, hip + 18], red, w=4)          # scalloped hem
    ell(d, [cx - 10, hip + 4, cx + 10, hip + 20], gold, w=4)
    ell(d, [cx + 10, hip + 2, cx + 30, hip + 18], red, w=4)

    # arms akimbo
    limb(d, [(cx - 20, sh + 6), (cx - 36, sh + 30), (cx - 20, sh + 44)], gold, 10)
    limb(d, [(cx + 20, sh + 6), (cx + 36, sh + 30), (cx + 20, sh + 44)], red, 10)

    # head: collar puffs, painted smile, coon cap with bells
    hx, hy = cx, head_cy
    for sgn in (-1, 1):
        ell(d, [hx + sgn * 4 - 10, hy + 16, hx + sgn * 4 + 10, hy + 32],
            gold if sgn > 0 else red, w=4)
    ell(d, [hx - 16, hy - 16, hx + 16, hy + 16], skin, w=5)
    d.arc([hx - 10, hy + 0, hx + 10, hy + 14], 20, 160, fill=S('#8f2b20'), width=4)
    d.ellipse([hx - 14, hy + 2, hx - 8, hy + 8], fill=S('#d98a7a'))
    d.ellipse([hx + 8, hy + 2, hx + 14, hy + 8], fill=S('#d98a7a'))
    eye(d, (hx - 6, hy - 4))
    eye(d, (hx + 6, hy - 4), r=3)
    poly(d, [(hx - 17, hy - 12), (hx - 34, hy - 34), (hx - 24, hy - 10)], red, 4)
    poly(d, [(hx + 17, hy - 12), (hx + 34, hy - 34), (hx + 24, hy - 10)], gold, 4)
    d.arc([hx - 18, hy - 24, hx + 18, hy - 6], 180, 360, fill=INK, width=6)
    ell(d, [hx - 40, hy - 40, hx - 30, hy - 30], S('#d9b64e'), w=3)
    ell(d, [hx + 30, hy - 40, hx + 40, hy - 30], S('#d9b64e'), w=3)
    return img


def jester_attack(canvas_w=200, canvas_h=265):
    """Leap-and-swing pose with marotte flail."""
    img, d = new(canvas_w, canvas_h)
    base = jester_body(166, 225)
    off = (canvas_w // 2 - 83, canvas_h - 235)
    img.alpha_composite(base, off)
    cx, cy = canvas_w // 2 + off[0], canvas_h // 2 + off[1]
    sh, elb, hand = (cx + 20, cy + 10), (cx + 52, cy - 16), (cx + 92, cy - 40)
    limb(d, [sh, elb, hand], S('#b13a2e'), 10)
    ell(d, [hand[0] - 8, hand[1] - 8, hand[0] + 8, hand[1] + 8], S('#ecd0ae'), w=4)
    d.line([hand, (cx + 120, cy - 70)], fill=INK, width=10)
    d.line([hand, (cx + 120, cy - 70)], fill=S('#6b4a2b'), width=6)
    ell(d, [cx + 112, cy - 84, cx + 136, cy - 60], S('#e7c25a'), w=5)
    eye(d, (cx + 120, cy - 72), r=3)
    return img


# ================================================================ RABBIT ON SNAIL
def rabbit_body(canvas_w=206, canvas_h=220, pose='idle'):
    img, d = new(canvas_w, canvas_h)
    cx = canvas_w // 2
    gy = canvas_h - 8
    shell, shell2 = S('#c07a3f'), S('#a35f2c')
    flesh, cream = S('#efe4cf'), S('#f6efdd')
    fur, fur2 = S('#8a9a3b'), S('#c7d08a')

    # --- snail foot + head ---
    body_pts = [(cx - 78, gy - 16), (cx - 64, gy - 30), (cx + 40, gy - 30),
                (cx + 58, gy - 20), (cx + 62, gy - 6), (cx - 78, gy - 4)]
    poly(d, body_pts, flesh, 6)
    d.line([(cx - 74, gy - 8), (cx + 58, gy - 8)], fill=S('#d8cbb2'), width=5)

    # spiral shell
    scx, scy = cx - 8, gy - 62
    ell(d, [scx - 46, scy - 46, scx + 46, scy + 34], shell, w=6)
    pts = []
    for t in range(0, 630, 10):
        rr = 4 + t * 0.055
        pts.append((scx + rr * math.cos(math.radians(t)),
                    scy - 6 + rr * math.sin(math.radians(t)) * 0.8))
    d.line(pts, fill=S('#7d4620'), width=4)
    ell(d, [scx - 46, scy - 46, scx + 46, scy + 34], None, w=6)

    # head + eyestalks
    hx, hy = cx + 58, gy - 46
    limb(d, [(cx + 48, gy - 24), (hx, hy)], flesh, 16, cap=False)
    ell(d, [hx - 12, hy - 12, hx + 12, hy + 12], flesh, w=5)
    for sgn in (-1, 1):
        top = (hx + sgn * 6, hy - 26)
        d.line([(hx + sgn * 4, hy - 8), top], fill=INK, width=10)
        d.line([(hx + sgn * 4, hy - 8), top], fill=flesh, width=6)
        eye(d, top, r=4)
    face(d, (hx + 2, hy + 2), flip=-1)

    # --- rabbit rider atop the shell ---
    rcx, rcy = cx - 12, gy - 108
    crouch = 8 if pose == 'crouch' else 0
    rcy += crouch
    ell(d, [rcx - 26, rcy + 2 - crouch, rcx + 6, rcy + 30], fur2, w=5)      # haunch
    limb(d, [(rcx - 14, rcy + 24), (rcx - 20, rcy + 40), (rcx - 6, rcy + 44)], fur, 10)
    limb(d, [(rcx + 6, rcy + 22), (rcx + 14, rcy + 40), (rcx + 26, rcy + 42)], fur, 10)
    ell(d, [rcx - 36, rcy + 6, rcx - 24, rcy + 18], cream, w=4)             # cotton tail
    poly(d, [(rcx - 16, rcy - 24), (rcx + 16, rcy - 24), (rcx + 20, rcy + 16),
             (rcx - 20, rcy + 16)], fur, 6)
    poly(d, [(rcx - 6, rcy - 20), (rcx + 8, rcy - 20), (rcx + 10, rcy + 12),
             (rcx - 8, rcy + 12)], cream, 2)
    # left arm holding lance against the body
    limb(d, [(rcx - 14, rcy - 14), (rcx - 24, rcy + 2), (rcx - 16, rcy + 14)], fur, 8)
    d.line([(rcx - 30, rcy + 22), (rcx - 2, rcy - 30)], fill=INK, width=9)
    d.line([(rcx - 30, rcy + 22), (rcx - 2, rcy - 30)], fill=S('#6b4a2b'), width=5)
    poly(d, [(rcx - 4, rcy - 38), (rcx + 4, rcy - 26), (rcx - 10, rcy - 26)],
         S('#cfd6da'), 4)
    # right arm raised
    limb(d, [(rcx + 14, rcy - 14), (rcx + 26, rcy - 26), (rcx + 24, rcy - 40)], fur, 8)
    # head + long ears
    hx, hy = rcx + 2, rcy - 40
    ell(d, [hx - 15, hy - 13, hx + 15, hy + 13], fur, w=5)
    for sgn, tilt in ((-1, -14), (1, 10)):
        e0 = (hx + sgn * 7, hy - 10)
        e1 = (hx + sgn * 10 + tilt, hy - 44)
        d.line([e0, e1], fill=INK, width=14)
        d.line([e0, e1], fill=fur, width=10)
        d.line([e0, (e1[0], e1[1] + 6)], fill=S('#d8a7a0'), width=4)
    eye(d, (hx + 6, hy - 2), r=4)
    eye(d, (hx - 6, hy - 2), r=3)
    nose = (hx + 13, hy + 4)
    poly(d, [(nose[0] - 3, nose[1] - 2), (nose[0] + 3, nose[1] - 2), (nose[0], nose[1] + 3)],
         S('#d88a7a'), 2)
    d.line([(hx + 2, hy + 8), (hx + 9, hy + 9)], fill=INK, width=2)
    return img


def rabbit_attack(canvas_w=244, canvas_h=260):
    """Lance-thrust pose."""
    img, d = new(canvas_w, canvas_h)
    base = rabbit_body(206, 220)
    off = (canvas_w // 2 - 103, canvas_h - 228)
    img.alpha_composite(base, off)
    cx, cy = canvas_w // 2 + off[0], canvas_h // 2 + off[1]
    rcx, rcy = cx - 12, cy - 68
    limb(d, [(rcx + 14, rcy - 14), (rcx + 40, rcy - 20), (rcx + 64, rcy - 26)],
         S('#8a9a3b'), 9)
    d.line([(rcx + 40, rcy - 22), (rcx + 128, rcy - 34)], fill=INK, width=10)
    d.line([(rcx + 40, rcy - 22), (rcx + 128, rcy - 34)], fill=S('#6b4a2b'), width=6)
    poly(d, [(rcx + 136, rcy - 35), (rcx + 120, rcy - 42), (rcx + 120, rcy - 28)],
         S('#cfd6da'), 4)
    return img


# ================================================================ assemble
def flatten(*layers):
    base = layers[0].copy()
    for l in layers[1:]:
        base.alpha_composite(l)
    return base


def main():
    W, H = 221, 225
    KP = (W // 2 + 24, H // 2 + 6)  # knight shoulder pivot in canvas coords
    # ---- knight ----
    save(flatten(knight_body(W, H), knight_arm(W, H, 'idle')), 'knight-idle.png')
    save_full(knight_body(W, H), 'knight-body.png')
    save_full(arm_hole(knight_arm(W, H, 'idle'), KP), 'knight-arm.png', KP)
    save(flatten(knight_body(W, H), knight_arm(W, H, 'launch')), 'knight-attack.png')
    PW, PH = 265, 265
    port = new(PW, PH)[0]
    off = ((PW - W) // 2, PH - H + 6)
    port.alpha_composite(knight_body(W, H), off)
    port.alpha_composite(knight_arm(W, H, 'windup'), off)
    save(port, 'knight-full.png')

    # ---- nun ----
    NW, NH = 166, 230
    NP = (NW // 2 + 18, NH // 2 + 8)  # nun shoulder pivot in canvas coords
    save(flatten(nun_body(NW, NH), nun_arm(NW, NH, 'idle')), 'nun-idle.png')
    save_full(nun_body(NW, NH), 'nun-body.png')
    save_full(arm_hole(nun_arm(NW, NH, 'idle'), NP, radius=30), 'nun-arm.png', NP)
    save(flatten(nun_body(NW, NH), nun_arm(NW, NH, 'launch')), 'nun-attack.png')
    PW, PH = 206, 270
    port = new(PW, PH)[0]
    off = ((PW - NW) // 2, PH - NH + 8)
    port.alpha_composite(nun_body(NW, NH), off)
    port.alpha_composite(nun_arm(NW, NH, 'windup'), off)
    save(port, 'nun-full.png')

    # ---- jester ----
    JW, JH = 166, 225
    save(jester_body(JW, JH), 'jester-idle.png')
    save(jester_attack(200, 265), 'jester-attack.png')
    save(jester_attack(200, 265), 'jester-full.png')

    # ---- rabbit on snail ----
    save(rabbit_body(206, 220), 'rabbit-idle.png')
    save(rabbit_attack(244, 260), 'rabbit-attack.png')
    save(rabbit_attack(244, 260), 'rabbit-full.png')


if __name__ == '__main__':
    main()
