# コースのルートと写真を作り直す手順

## 想定ルート（距離・累積標高・地図）

```bash
pip install pillow
python3 scripts/routes/routes.py scripts/routes/spec.json            # すべて
python3 scripts/routes/routes.py scripts/routes/spec.json hijiyama   # 1コースだけ
```

- `spec.json` に、コースの slug・名前・経由地点（緯度, 経度）を書きます
- 出力：`public/gpx/<slug>.gpx`、`public/maps/<slug>.webp`
- ルート：OpenStreetMap の徒歩ルート検索（routing.openstreetmap.de）
- 標高：国土地理院 標高API（約25mごと）
- 地図：地理院タイル（淡色地図）を加工
- 作ったら、地図画像を目で見て、ルートが意図した道（川沿い・お堀沿いなど）をたどっているか必ず確認してください
- サイト上の距離・累積標高は GPX から自動計算されます

実際に走ったときは、腕時計やアプリの GPX を `public/gpx/<slug>.gpx` に置き換え、
`content/courses.ts` の `status` を `"surveyed"`、`runReport` に感想を書きます。

## 写真の色調補正

```bash
pip install pillow numpy
python3 scripts/photos/grade.py 元の写真.jpg public/photos/出力.jpg
```

早朝のやわらかな光を意識した、控えめなシネマティック補正（ハイライトの圧縮、ゆるやかなSカーブ、彩度を少し下げる、スプリットトーン、細かな粒子）をかけます。
