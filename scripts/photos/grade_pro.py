"""運営者の写真を、写真集のような仕上がりに整える（1枚ずつ調整できる版）

使い方: python3 scripts/photos/grade_pro.py <入力> <出力> [プリセット] [切り抜き x0,y0,x1,y1（0〜1）]
プリセット: day（日中の青空）/ golden（夕方・逆光）/ night（夜景）/ dusk（夜明け・曇り）

ねらい
- iPhone 特有の濃すぎる青空と、平たい明るさを抑える
- 影に深さ、ハイライトにやわらかさ（フィルムのロールオフ）
- 中くらいの細部を立たせる（クラリティ）
- 色は少し控えめに、光にはわずかな温度
- 周辺をわずかに落とし、細かな粒子
- 位置情報などのメタデータは保存しない
"""
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps

PRESETS = {
    #           gamma  shadow  hi_knee  sat   sky_desat sky_dark warm  clarity vignette grain
    "day":    dict(gamma=1.13, shadow=0.00, knee=0.66, sat=0.80, sky=0.50, skyd=0.14, warm=0.030, clarity=0.32, vig=0.20, grain=0.011),
    "golden": dict(gamma=1.08, shadow=0.01, knee=0.62, sat=0.88, sky=0.30, skyd=0.08, warm=0.055, clarity=0.30, vig=0.24, grain=0.012),
    "night":  dict(gamma=1.08, shadow=0.018, knee=0.60, sat=0.86, sky=0.20, skyd=0.00, warm=0.020, clarity=0.24, vig=0.26, grain=0.015),
    "dusk":   dict(gamma=1.10, shadow=0.010, knee=0.62, sat=0.84, sky=0.12, skyd=0.06, warm=0.040, clarity=0.26, vig=0.22, grain=0.013),
}


def rgb_to_hsv(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a.max(-1); mn = a.min(-1); d = mx - mn + 1e-6
    h = np.where(mx == r, (g - b) / d % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-6), 0)
    return h, s, mx


def grade(im: Image.Image, p: dict) -> Image.Image:
    a = np.asarray(im.convert("RGB")).astype(np.float32) / 255.0
    h_, w_ = a.shape[:2]

    # 1. ホワイトバランスをほんの少し中立へ（グレーワールドを30%だけ）
    mean = a.reshape(-1, 3).mean(0)
    a = a * (1 + 0.3 * (mean.mean() / (mean + 1e-6) - 1))

    # 2. 濃すぎる青空を落ち着かせる（青い・明るい・上の方の画素ほど）
    hue, sat, val = rgb_to_hsv(np.clip(a, 0, 1))
    blue = np.clip(1 - np.abs(hue - 0.60) / 0.09, 0, 1) * np.clip((sat - 0.15) * 3, 0, 1)
    top = np.clip(1.2 - np.linspace(0, 1, h_)[:, None] * 1.3, 0, 1)
    m = (blue * (0.5 + 0.5 * top))[..., None]
    lum = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2])[..., None]
    a = a * (1 - m) + (lum + (a - lum) * (1 - p["sky"])) * (1 - p["skyd"]) * m

    # 3. トーン：中間調をやや沈め、影を少し持ち上げ、ハイライトをやわらかく
    a = np.clip(a, 0, 1) ** p["gamma"]
    a = p["shadow"] + a * (1 - p["shadow"])
    k = p["knee"]
    hi = a > k
    a[hi] = k + (1 - k) * np.tanh((a[hi] - k) / (1 - k) * 1.2) / np.tanh(1.2)
    a = a + 0.12 * (a - 0.5) * (1 - np.abs(2 * a - 1))  # ゆるやかなSカーブ

    # 4. 色：全体を少し控えめに
    lum = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2])[..., None]
    a = lum + (a - lum) * p["sat"]

    # 5. 光の温度：ハイライトにわずかなぬくもり、影はわずかに冷たく
    hiw = np.clip((lum - 0.5) * 2, 0, 1)
    shw = np.clip(1 - lum * 2.2, 0, 1)
    a[..., 0] += p["warm"] * hiw[..., 0] - 0.010 * shw[..., 0]
    a[..., 1] += p["warm"] * 0.45 * hiw[..., 0]
    a[..., 2] += -p["warm"] * 0.8 * hiw[..., 0] + 0.014 * shw[..., 0]
    a = np.clip(a, 0, 1)

    # 6. クラリティ：中くらいの細部を立たせる
    img = Image.fromarray((a * 255).astype(np.uint8))
    blur = np.asarray(img.filter(ImageFilter.GaussianBlur(radius=max(h_, w_) / 90))).astype(np.float32) / 255
    a = np.clip(a + p["clarity"] * (a - blur) * (1 - np.abs(2 * lum - 1)), 0, 1)

    # 7. 周辺減光
    yy, xx = np.mgrid[0:h_, 0:w_]
    r = np.sqrt(((xx - w_ / 2) / (w_ / 2)) ** 2 + ((yy - h_ / 2) / (h_ / 2)) ** 2)
    a *= (1 - p["vig"] * np.clip(r - 0.5, 0, 1) ** 1.8)[..., None]

    # 8. 粒子（輝度のみ）
    g = np.random.default_rng(11).normal(0, p["grain"], (h_, w_)).astype(np.float32)
    a = np.clip(a + g[..., None] * (1 - np.abs(lum - 0.5) * 1.3), 0, 1)

    out = Image.fromarray((a * 255 + 0.5).astype(np.uint8))
    return out.filter(ImageFilter.UnsharpMask(radius=1.0, percent=35, threshold=2))


def main():
    src, dst = sys.argv[1], sys.argv[2]
    preset = sys.argv[3] if len(sys.argv) > 3 else "day"
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    if len(sys.argv) > 4:
        x0, y0, x1, y1 = map(float, sys.argv[4].split(","))
        W, H = im.size
        im = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
    # 保存時にメタデータ（位置情報を含む）は書き込まない
    grade(im, PRESETS[preset]).save(dst, quality=86, optimize=True, progressive=True)


if __name__ == "__main__":
    main()
