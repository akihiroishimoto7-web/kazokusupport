import { test } from "node:test";
import assert from "node:assert/strict";
import { gaId, analytics } from "../content/analytics.ts";

test("GA: 測定IDがなければ読み込まない、形式が違えば無効", () => {
  const keep = analytics.gaMeasurementId;
  analytics.gaMeasurementId = null;
  assert.equal(gaId(), null);
  analytics.gaMeasurementId = "UA-12345-1";
  assert.equal(gaId(), null);
  analytics.gaMeasurementId = "G-ABC123XYZ";
  assert.equal(gaId(), "G-ABC123XYZ");
  analytics.gaMeasurementId = keep;
});
