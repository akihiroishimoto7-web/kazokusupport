import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAmebloRss } from "../lib/ameblo-parse.ts";

const rss = `<?xml version="1.0"?><rss><channel>
<item><title>シューズ比較 &amp; レビュー</title><link>https://ameblo.jp/myid/entry-1.html</link>
<description><![CDATA[ <img src="https://stat.ameba.jp/user_images/a.jpg"><br>本文の冒頭です。<b>強調</b> ]]></description>
<pubDate>Sat, 22 Nov 2026 07:30:00 +0900</pubDate></item>
<item><title>他人のブログ</title><link>https://ameblo.jp/other/entry-2.html</link><pubDate>Sat, 22 Nov 2026 07:30:00 +0900</pubDate></item>
<item><title>日付なし</title><link>https://ameblo.jp/myid/entry-3.html</link></item>
<item><title>外部画像</title><link>https://ameblo.jp/myid/entry-4.html</link><description><![CDATA[<img src="https://evil.example/x.jpg">本文]]></description><pubDate>Fri, 21 Nov 2026 23:00:00 +0900</pubDate></item>
</channel></rss>`;

test("アメブロRSS: 自分の記事だけ・日付つき・HTMLを除いた要約", () => {
  const e = parseAmebloRss(rss, "myid");
  assert.equal(e.length, 2);
  assert.equal(e[0].title, "シューズ比較 & レビュー");
  assert.equal(e[0].date, "2026-11-22");
  assert.equal(e[0].summary, "本文の冒頭です。強調");
  assert.equal(e[0].image, "https://stat.ameba.jp/user_images/a.jpg");
  // アメブロ以外の画像は使わない
  assert.equal(e[1].image, undefined);
  assert.equal(e[1].date, "2026-11-21");
});

import { linkEntries, pickForResult } from "../lib/ameblo-match.ts";
test("アメブロ×診断: タイトルからシューズと用途を結びつける", () => {
  const l = linkEntries([
    { title: "【約41％OFF】ニューバランス Rebel v5が9,999円！", url: "u1", date: "2026-11-10" },
    { title: "【50%OFF】New Balance「1080 v15」が11,000円！", url: "u2", date: "2026-10-01" },
    { title: "【50%OFF】New Balance「10800」は存在しない", url: "u3", date: "2026-10-01" },
    { title: "【半額以下】Nike「Structure Plus」が10,499円！", url: "u4", date: "2026-10-02" },
  ]);
  assert.deepEqual(l[0].shoes, ["nb-rebel"]);
  assert.deepEqual(l[1].shoes, ["nb-1080"]);
  assert.deepEqual(l[2].shoes, []);
  assert.ok(l[3].purposes.includes("stability"));
  const r = pickForResult(l, ["nb-1080", "asics-gel-kayano"], "stability");
  assert.deepEqual(r.map((e) => e.url), ["u2", "u4"]);
});
