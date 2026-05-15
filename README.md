# 退院後の暮らしガイド（家族向け 退院後サポート説明アプリ）

回復期リハビリテーション病院のMSW・相談員・看護師・療法士が、患者家族へ「退院後の選択肢」をやさしく説明するための iPad / スマホ向けアプリ（MVP）。

## 技術構成

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## 機能（MVP）

1. **退院先比較画面**（トップ）：自宅 / 老健 / 特養 / 有料 / サ高住 を大きなカードで比較
2. **詳細画面**：どんな人向け？・費用・リハビリ・医療対応・入りやすさ・メリット・注意点
3. **介護保険サービス説明**：通所リハ／デイ／訪問介護／訪問看護／ショート／福祉用具
4. **PDF出力**：ブラウザの「PDFとして保存」で家族へ配布できます
5. **LINE共有ボタン**：URLをLINEで送れます

## デプロイ

```bash
npm run build
```

Vercel に直接デプロイ可能です。

## ディレクトリ

```
app/
  page.tsx                  トップ
  options/[slug]/page.tsx   選択肢の詳細
  services/page.tsx         介護保険サービス
components/
  OptionCard.tsx
  InfoRow.tsx
  ShareButtons.tsx
lib/
  data.ts                   ダミーデータ
```

## 注意

費用・基準は地域・施設で異なります。説明の補助としてご利用ください。
