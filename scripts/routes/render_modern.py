"""コース地図を、現代的なデザインで描き直す

使い方: python3 scripts/routes/render_modern.py [slug ...]
- 地理院タイル（淡色地図）を取得し、色を置き換えて落ち着いた配色にする
  （水面＝やわらかな青、主要道路＝白、建物＝薄いグレー、文字＝グレー）
- GPX のルートを太い青の線で描き、1kmごと（長いコースは2kmごと）の距離表示、
  スタート・ゴール、方位、縮尺を入れる
- 出力: public/maps/<slug>.webp と scripts/routes/out/<slug>-map.json（zoom・bbox・サイズ）
  ※ zoom と bbox は content/courses.ts の MAPS に写す（ルートと地図の重ね合わせに使う）
"""
import io, json, math, os, re, sys, time, urllib.request
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
UA = {"User-Agent": "RunLifeHiroshima-build/0.2 (non-commercial site build)"}
FONT_LATIN = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts", "InstrumentSans.ttf")
FONT_JA = "/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf"

# コースごとの描画条件（形・画面の向き）
COURSES = {
    "riverside-run": dict(kind="loop", size=(1200, 1600)),
    "otagawa-riverside": dict(kind="out-and-back", size=(1600, 1200)),
    "chuo-park": dict(kind="loop", size=(1600, 1200)),
    "peace-park": dict(kind="loop", size=(1600, 1200)),
    "ujina-minato-park": dict(kind="loop", size=(1600, 1200)),
    "hijiyama": dict(kind="loop", size=(1600, 1200)),
    "terayama-park": dict(kind="one-way", size=(1600, 1200)),
    "ushitayama": dict(kind="one-way", size=(1600, 1200)),
}

BLUE = (31, 94, 176)
NAVY = (22, 45, 84)
YELLOW = (255, 214, 64)


def get(url, tries=4):
    for t in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read()
        except Exception:
            time.sleep(2 + 3 * t)
    raise RuntimeError(url)


def tile_xy(lat, lon, z):
    n = 2 ** z
    return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n


def read_gpx(slug):
    x = open(os.path.join(ROOT, "public", "gpx", f"{slug}.gpx"), encoding="utf-8").read()
    return [(float(a), float(b)) for a, b in re.findall(r'<trkpt lat="([\d.]+)" lon="([\d.]+)"', x)]


def hav(a, b):
    R = 6371008.8
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    h = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(b[1] - a[1]) / 2) ** 2
    return 2 * R * math.asin(min(1, math.sqrt(h)))


def recolor(img):
    """淡色地図の配色を置き換える"""
    a = np.asarray(img.convert("RGB")).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    out = np.empty_like(a)
    out[...] = (246, 247, 249)  # 土地
    near = lambda c, tol=22: (np.abs(r - c[0]) < tol) & (np.abs(g - c[1]) < tol) & (np.abs(b - c[2]) < tol)
    water = (b > r + 30) & (b > 200) & (g > 180)
    road_major = (r > 230) & (g > 190) & (b < 200) & (r - b > 50)
    gray = (np.abs(r - g) < 8) & (np.abs(g - b) < 8)
    build = gray & (r > 185) & (r < 245)
    outline = gray & (r >= 60) & (r <= 185)
    ink = (r < 60) & (g < 60) & (b < 60)
    green_txt = near((0, 90, 60), 40)
    out[build] = (232, 235, 240)
    out[outline] = (214, 218, 226)
    out[road_major] = (255, 255, 255)
    out[water] = (186, 216, 242)
    out[ink | green_txt] = (128, 136, 150)
    return Image.fromarray(out.astype(np.uint8))


def choose_zoom(pts, W, H):
    lats = [p[0] for p in pts]; lons = [p[1] for p in pts]
    for z in range(17, 11, -1):
        x0, y1 = tile_xy(min(lats), min(lons), z)
        x1, y0 = tile_xy(max(lats), max(lons), z)
        if (x1 - x0) * 256 < W * 0.70 and (y1 - y0) * 256 < H * 0.70:
            return z, [min(lats), min(lons), max(lats), max(lons)]
    return 12, [min(lats), min(lons), max(lats), max(lons)]


def pill(d, xy, text, font, fill, fg, pad=(16, 9), anchor="left"):
    x, y = xy
    bb = d.textbbox((0, 0), text, font=font)
    w, h = bb[2] - bb[0] + pad[0] * 2, bb[3] - bb[1] + pad[1] * 2
    if anchor == "left":
        box = (x, y - h / 2, x + w, y + h / 2)
    else:
        box = (x - w, y - h / 2, x, y + h / 2)
    d.rounded_rectangle(box, radius=h / 2, fill=fill)
    d.text((box[0] + pad[0] - bb[0], box[1] + pad[1] - bb[1]), text, font=font, fill=fg)
    return box


def render(slug):
    cfg = COURSES[slug]
    W, H = cfg["size"]
    pts = read_gpx(slug)
    z, bbox = choose_zoom(pts, W, H)
    x0, y1 = tile_xy(bbox[0], bbox[1], z)
    x1, y0 = tile_xy(bbox[2], bbox[3], z)
    left = (x0 + x1) / 2 * 256 - W / 2
    top = (y0 + y1) / 2 * 256 - H / 2

    base = Image.new("RGB", (W, H), (246, 247, 249))
    for tx in range(int(left // 256), int((left + W) // 256) + 1):
        for ty in range(int(top // 256), int((top + H) // 256) + 1):
            t = Image.open(io.BytesIO(get(f"https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{tx}/{ty}.png")))
            base.paste(recolor(t), (int(tx * 256 - left), int(ty * 256 - top)))
            time.sleep(0.04)

    S = 2  # 高精細に描いてから縮小
    img = base.resize((W * S, H * S), Image.LANCZOS).convert("RGBA")
    xy = []
    for la, lo in pts:
        tx, ty = tile_xy(la, lo, z)
        xy.append(((tx * 256 - left) * S, (ty * 256 - top) * S))

    # ルートのやわらかな影 → 白い縁 → 青い線
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).line(xy, fill=(20, 40, 80, 90), width=34, joint="curve")
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)))
    d = ImageDraw.Draw(img)
    d.line(xy, fill=(255, 255, 255, 255), width=30, joint="curve")
    d.line(xy, fill=BLUE + (255,), width=18, joint="curve")
    for p in (xy[0], xy[-1]):
        d.ellipse((p[0] - 9, p[1] - 9, p[0] + 9, p[1] + 9), fill=BLUE)

    # 距離表示
    total = sum(hav(pts[i - 1], pts[i]) for i in range(1, len(pts))) / 1000
    step = 1 if total <= 6 else 2
    fnum = ImageFont.truetype(FONT_LATIN, 30 * S // 2 * 2)
    fja = ImageFont.truetype(FONT_JA, 26 * S // 2 * 2)
    acc, nxt = 0.0, step
    cx, cy = W * S / 2, H * S / 2
    for i in range(1, len(pts)):
        acc += hav(pts[i - 1], pts[i]) / 1000
        limit = total / 2 + 0.05 if cfg["kind"] == "out-and-back" else total - step * 0.4  # 往復は行きだけ表示
        if acc >= nxt and nxt < limit:
            px, py = xy[i]
            d.ellipse((px - 12, py - 12, px + 12, py + 12), fill=(255, 255, 255), outline=NAVY, width=5)
            right = px < cx  # 地図の外側へ向けてラベルを出す
            lx = px - 22 if right else px + 22
            pill(d, (lx, py), f"{nxt:g}km", fnum, YELLOW, NAVY, anchor="right" if right else "left")
            nxt += step

    # スタート・ゴール
    sx, sy = xy[0]
    label = "スタート・ゴール" if cfg["kind"] in ("loop", "out-and-back") else "スタート"
    pill(d, (sx + 26, sy), label, fja, NAVY, (255, 255, 255), anchor="left")
    d.ellipse((sx - 16, sy - 16, sx + 16, sy + 16), fill=(255, 255, 255), outline=NAVY, width=8)
    if cfg["kind"] == "one-way":
        ex, ey = xy[-1]
        d.ellipse((ex - 16, ey - 16, ex + 16, ey + 16), fill=NAVY, outline=(255, 255, 255), width=6)
        pill(d, (ex + 26, ey), f"ゴール  {total:.1f}km", fja, NAVY, (255, 255, 255), anchor="left")

    # 方位と縮尺（左下）
    m_per_px = 156543.03392 * math.cos(math.radians((bbox[0] + bbox[2]) / 2)) / 2 ** z
    for L in (50, 100, 200, 250, 500, 1000, 2000):
        if L / m_per_px > W * 0.12:
            break
    bx, by = 56 * S, H * S - 56 * S
    blen = L / m_per_px * S
    d.rounded_rectangle((bx - 24, by - 110, bx + blen + 40, by + 34), radius=18, fill=(255, 255, 255, 230))
    d.line((bx, by, bx + blen, by), fill=NAVY, width=6)
    d.line((bx, by - 12, bx, by + 6), fill=NAVY, width=6)
    d.line((bx + blen, by - 12, bx + blen, by + 6), fill=NAVY, width=6)
    fs = ImageFont.truetype(FONT_LATIN, 24 * S // 2 * 2)
    d.text((bx + blen + 10, by - 34), f"{L // 1000}km" if L >= 1000 else f"{L}m", font=fs, fill=NAVY)
    nx, ny = bx + 12, by - 62
    d.polygon([(nx, ny - 30), (nx - 16, ny + 16), (nx, ny + 6), (nx + 16, ny + 16)], fill=NAVY)
    d.text((nx + 26, ny - 22), "N", font=fs, fill=NAVY)

    out = img.convert("RGB").resize((W, H), Image.LANCZOS)
    out.save(os.path.join(ROOT, "public", "maps", f"{slug}.webp"), "WEBP", quality=88, method=6)
    os.makedirs(OUT, exist_ok=True)
    meta = dict(slug=slug, zoom=z, bbox=[round(v, 6) for v in bbox], width=W, height=H, km=round(total, 2))
    json.dump(meta, open(os.path.join(OUT, f"{slug}-map.json"), "w"))
    print(json.dumps(meta))


if __name__ == "__main__":
    for s in sys.argv[1:] or COURSES:
        render(s)
