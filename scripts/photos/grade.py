"""シネマティックな色調補正（早朝のやわらかな光、深い影、自然な色、細かな粒子）
使い方: python3 grade.py <入力jpg> <出力jpg>
"""
import sys, random
import numpy as np
from PIL import Image, ImageFilter

def grade(im: Image.Image) -> Image.Image:
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255.0
    # 1. 中間調をわずかに沈め（ガンマ）、ハイライトだけをやわらかく圧縮
    a = np.power(a, 1.10)
    knee = 0.72
    hiz = a > knee
    a[hiz] = knee + (1 - knee) * np.tanh((a[hiz] - knee) / (1 - knee) * 1.15) / np.tanh(1.15)
    # 2. ゆるやかなSカーブ（中間調の立体感）
    a = a + 0.14 * (a - 0.5) * (1 - np.abs(2 * a - 1))
    # 3. 黒を少し持ち上げてフィルムのような締まり（マット）
    a = 0.025 + a * (1 - 0.025)
    # 4. 彩度を落とす（自然な色へ）
    lum = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2])[..., None]
    a = lum + (a - lum) * 0.80
    # 5. スプリットトーン：影はわずかに青緑、明部はわずかに暖色（朝の光）
    sh = np.clip(1 - lum * 1.8, 0, 1)
    hi = np.clip((lum - 0.55) * 2.2, 0, 1)
    a[..., 0] += -0.012 * sh[..., 0] + 0.022 * hi[..., 0]
    a[..., 1] += 0.006 * sh[..., 0] + 0.010 * hi[..., 0]
    a[..., 2] += 0.016 * sh[..., 0] - 0.018 * hi[..., 0]
    a = np.clip(a, 0, 1)
    # 6. 周辺をごくわずかに落とす（視線を中央へ）
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    a *= (1 - 0.10 * np.clip(r - 0.55, 0, 1) ** 1.6)[..., None]
    # 7. 細かな粒子（輝度ノイズのみ、ごく弱く）
    rng = np.random.default_rng(7)
    g = rng.normal(0, 0.012, (h, w)).astype(np.float32)
    a += (g * (1 - np.abs(lum[..., 0] - 0.5) * 1.2))[..., None]
    a = np.clip(a, 0, 1)
    out = Image.fromarray((a * 255 + 0.5).astype(np.uint8))
    return out.filter(ImageFilter.UnsharpMask(radius=1.0, percent=30, threshold=2))

if __name__ == '__main__':
    im = Image.open(sys.argv[1])
    grade(im).save(sys.argv[2], quality=86, optimize=True, progressive=True)
