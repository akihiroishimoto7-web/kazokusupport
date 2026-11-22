"""
コースの想定ルートを作る（ビルド用の作業スクリプト）
- 徒歩ルート: routing.openstreetmap.de（OSRM foot, OpenStreetMap データ）
- 標高: 国土地理院 標高API（DEM）
- 地図: 地理院タイル（淡色地図）にルートを重ねる
出力: public/gpx/<slug>.gpx, public/maps/<slug>.webp, geo/<slug>.json（要約）
"""
import json, math, sys, time, io, urllib.request, urllib.parse, os
from PIL import Image, ImageDraw, ImageEnhance

UA = {'User-Agent': 'RunLifeHiroshima-build/0.2 (non-commercial site build)'}
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
GEO = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')

def get(url, tries=4):
    for t in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read()
        except Exception as e:
            time.sleep(2 + t * 3)
    raise RuntimeError('fetch failed ' + url)

def route(points):
    coords = ';'.join(f'{lon},{lat}' for lat, lon in points)
    url = f'https://routing.openstreetmap.de/routed-foot/route/v1/driving/{coords}?overview=full&geometries=geojson&steps=false'
    d = json.loads(get(url))
    return [(c[1], c[0]) for c in d['routes'][0]['geometry']['coordinates']], d['routes'][0]['distance']

def hav(a, b):
    R = 6371008.8
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    dp, dl = p2 - p1, math.radians(b[1] - a[1])
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(min(1, math.sqrt(h)))

def resample(pts, step):
    out = [pts[0]]
    acc = 0
    for a, b in zip(pts, pts[1:]):
        d = hav(a, b)
        while acc + d >= step and d > 0:
            t = (step - acc) / d
            a = (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
            out.append(a)
            d = hav(a, b)
            acc = 0
        acc += d
    out.append(pts[-1])
    return out

def elevation(lat, lon):
    url = f'https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php?lon={lon:.6f}&lat={lat:.6f}&outtype=JSON'
    d = json.loads(get(url))
    e = d.get('elevation')
    return None if e in (None, '-----') else float(e), d.get('hsrc')

def tile_xy(lat, lon, z):
    n = 2 ** z
    x = (lon + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y

def static_map(pts, out, W=1600, H=1200):
    lats = [p[0] for p in pts]; lons = [p[1] for p in pts]
    for z in range(17, 11, -1):
        x0, y1 = tile_xy(min(lats), min(lons), z)
        x1, y0 = tile_xy(max(lats), max(lons), z)
        if (x1 - x0) * 256 < W * 0.72 and (y1 - y0) * 256 < H * 0.72:
            break
    cx, cy = (x0 + x1) / 2 * 256, (y0 + y1) / 2 * 256
    left, top = cx - W / 2, cy - H / 2
    canvas = Image.new('RGB', (W, H), 'white')
    for tx in range(int(left // 256), int((left + W) // 256) + 1):
        for ty in range(int(top // 256), int((top + H) // 256) + 1):
            img = Image.open(io.BytesIO(get(f'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{tx}/{ty}.png'))).convert('RGB')
            canvas.paste(img, (int(tx * 256 - left), int(ty * 256 - top)))
            time.sleep(0.05)
    # 背景は彩度を落として明るく：ルートを主役に
    canvas = ImageEnhance.Color(canvas).enhance(0.25)
    canvas = Image.blend(canvas, Image.new('RGB', canvas.size, (250, 250, 248)), 0.38)
    big = canvas.resize((W * 2, H * 2), Image.LANCZOS)
    d = ImageDraw.Draw(big)
    xy = []
    for la, lo in pts:
        x, y = tile_xy(la, lo, z)
        xy.append(((x * 256 - left) * 2, (y * 256 - top) * 2))
    d.line(xy, fill=(255, 255, 255), width=22, joint='curve')
    d.line(xy, fill=(27, 77, 58), width=11, joint='curve')
    sx, sy = xy[0]
    d.ellipse((sx - 22, sy - 22, sx + 22, sy + 22), fill=(255, 255, 255), outline=(27, 77, 58), width=8)
    ex, ey = xy[-1]
    if math.hypot(ex - sx, ey - sy) > 40:
        d.ellipse((ex - 13, ey - 13, ex + 13, ey + 13), fill=(27, 77, 58))
    img = big.resize((W, H), Image.LANCZOS)
    img.save(out, 'WEBP', quality=86, method=6)
    return z

def gpx(name, pts, eles):
    rows = ''.join(
        f'<trkpt lat="{la:.6f}" lon="{lo:.6f}">' + (f'<ele>{e:.1f}</ele>' if e is not None else '') + '</trkpt>\n'
        for (la, lo), e in zip(pts, eles)
    )
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="RUN LIFE HIROSHIMA" xmlns="http://www.topografix.com/GPX/1/1">
<metadata><name>{name}</name><desc>OpenStreetMap の徒歩ルートと国土地理院の標高データから作成した想定ルート（現地未走）。© OpenStreetMap contributors</desc></metadata>
<trk><name>{name}</name><trkseg>
{rows}</trkseg></trk></gpx>
'''

def run(slug, name, waypoints):
    pts, dist = route(waypoints)
    samp = resample(pts, 25)
    eles, src = [], set()
    for la, lo in samp:
        e, h = elevation(la, lo)
        eles.append(e); src.add(h)
        time.sleep(0.08)
    os.makedirs(f'{ROOT}/public/gpx', exist_ok=True)
    os.makedirs(f'{ROOT}/public/maps', exist_ok=True)
    open(f'{ROOT}/public/gpx/{slug}.gpx', 'w').write(gpx(name, samp, eles))
    z = static_map(pts, f'{ROOT}/public/maps/{slug}.webp')
    lats = [p[0] for p in pts]; lons = [p[1] for p in pts]
    summary = dict(slug=slug, osrm_m=round(dist), points=len(samp), ele_sources=sorted(s for s in src if s),
                   missing_ele=sum(e is None for e in eles), zoom=z,
                   bbox=[min(lats), min(lons), max(lats), max(lons)], start=pts[0])
    os.makedirs(GEO, exist_ok=True)
    json.dump(summary, open(f'{GEO}/{slug}.json', 'w'), ensure_ascii=False)
    print(json.dumps(summary, ensure_ascii=False))

if __name__ == '__main__':
    spec = json.load(open(sys.argv[1]))
    for c in spec:
        if len(sys.argv) > 2 and c['slug'] not in sys.argv[2:]:
            continue
        run(c['slug'], c['name'], [tuple(p) for p in c['waypoints']])
