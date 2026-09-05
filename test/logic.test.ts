import { test } from "node:test";
import assert from "node:assert/strict";
import { CATEGORIES, FREE, FULL_POOL, PRO, SPICY } from "../src/packs.ts";
import { availableSize, buildGuestReply, isSourcePayload, pickNextPlayer, rollIndex, seenBucket } from "../src/logic.ts";

test("pack sizes are exactly as specified", () => {
  for (const c of CATEGORIES) {
    assert.equal(FREE[c].length, 40, `FREE ${c}`);
    assert.equal(PRO[c].length, 80, `PRO ${c}`);
  }
  const spicyTotal = CATEGORIES.reduce((n, c) => n + SPICY[c].length, 0);
  assert.equal(spicyTotal, 60, "SPICY total");
  const freeTotal = CATEGORIES.reduce((n, c) => n + FREE[c].length, 0);
  const proTotal = CATEGORIES.reduce((n, c) => n + PRO[c].length, 0);
  assert.equal(freeTotal, 160);
  assert.equal(proTotal, 320);
});

test("no duplicate prompts within a category (FREE+PRO+SPICY combined)", () => {
  for (const c of CATEGORIES) {
    const all = FULL_POOL[c];
    assert.equal(new Set(all).size, all.length, `duplicates found in ${c}`);
  }
});

test("rotation never repeats before exhaustion (simulate 40 rolls)", () => {
  const seen = new Set<number>();
  const poolSize = 40;
  const drawn = new Set<number>();
  for (let i = 0; i < poolSize; i++) {
    const { idx, reset } = rollIndex(seen, poolSize);
    assert.equal(reset, false, `unexpected reset at roll ${i}`);
    assert.equal(drawn.has(idx), false, `repeat at roll ${i}`);
    drawn.add(idx);
    seen.add(idx);
  }
  assert.equal(drawn.size, poolSize);
});

test("reset message triggers after exhaustion", () => {
  const seen = new Set<number>();
  const poolSize = 5;
  for (let i = 0; i < poolSize; i++) {
    const { idx, reset } = rollIndex(seen, poolSize);
    assert.equal(reset, false);
    seen.add(idx);
  }
  // pool fully seen now — next roll must reset and still return a valid index
  const { idx, reset } = rollIndex(seen, poolSize);
  assert.equal(reset, true);
  assert.ok(idx >= 0 && idx < poolSize);
});

test("pro gating of PRO/SPICY indices", () => {
  for (const c of CATEGORIES) {
    assert.equal(availableSize(c, false, false), 40);
    assert.equal(availableSize(c, false, true), 40, "spicy without pro stays free-only");
    assert.equal(availableSize(c, true, false), 120);
    assert.equal(availableSize(c, true, true), 135);
  }
});

test("next-player selection excludes the current player", () => {
  const members = [
    { id: 1, name: "Ann" },
    { id: 2, name: "Ben" },
    { id: 3, name: "Cara" },
  ];
  for (let i = 0; i < 50; i++) {
    const pick = pickNextPlayer(members, 1);
    assert.ok(pick);
    assert.notEqual(pick!.id, 1);
  }
  // only the current player is in the pool -> no valid next player
  assert.equal(pickNextPlayer([{ id: 9, name: "Solo" }], 9), null);
  assert.equal(pickNextPlayer([], 1), null);
});

test("seenBucket keys free/pro/spicy separately per category", () => {
  assert.equal(seenBucket("truth", false, false), "truth:free");
  assert.equal(seenBucket("truth", true, false), "truth:pro");
  assert.equal(seenBucket("truth", true, true), "truth:spicy");
  assert.equal(seenBucket("truth", false, true), "truth:free", "spicy without pro is still the free bucket");
  assert.notEqual(seenBucket("truth", false, false), seenBucket("dare", false, false));
});

test("per-tier rotation isolation: a free user's reset never touches Pro's seen set", () => {
  // Simulates db.ts's storage shape: one Set per (chat, bucket), bucket = seenBucket(cat, pro, spicy).
  const store = new Map<string, Set<number>>();
  const seenFor = (bucket: string): Set<number> => store.get(bucket) ?? new Set();
  const freeBucket = seenBucket("truth", false, false);
  const proBucket = seenBucket("truth", true, false);

  // Pro rolls 5 times first, marking indices 0-4 in the pro-tier bucket.
  const proSeen = new Set<number>();
  for (let i = 0; i < 5; i++) {
    const { idx, reset } = rollIndex(proSeen, availableSize("truth", true, false));
    assert.equal(reset, false, "pro should not reset with only 5/120 seen");
    proSeen.add(idx);
  }
  store.set(proBucket, proSeen);

  // A free user then exhausts and resets the *free* 40-prompt pool.
  let freeSeen = new Set<number>();
  for (let i = 0; i < 40; i++) {
    const { idx } = rollIndex(freeSeen, availableSize("truth", false, false));
    freeSeen.add(idx);
  }
  const { reset: freeReset } = rollIndex(freeSeen, availableSize("truth", false, false));
  assert.equal(freeReset, true, "free pool of 40 should be exhausted");
  freeSeen = new Set(); // resetSeen(chat, freeBucket) — only clears the free bucket
  store.set(freeBucket, freeSeen);

  // Pro's progress must be untouched by the free user's exhaustion/reset.
  assert.equal(seenFor(proBucket).size, 5, "pro's seen set must survive a free-tier reset");
  assert.deepEqual(seenFor(proBucket), proSeen);
});

test("source-payload regex", () => {
  assert.equal(isSourcePayload("site"), true);
  assert.equal(isSourcePayload("share"), true);
  assert.equal(isSourcePayload("list"), true);
  assert.equal(isSourcePayload("x"), false); // too short (min 2)
  assert.equal(isSourcePayload("pro"), false); // reserved
  assert.equal(isSourcePayload("thisistoolongasrc"), false); // over 12 chars
  assert.equal(isSourcePayload("Site1"), false); // must be lowercase letters only
});

test("buildGuestReply: a named category returns a free-tier value card", () => {
  const pitch = { title: "pitch", description: "d", text: "p" };
  const r = buildGuestReply("truth", pitch);
  assert.notEqual(r, pitch);
  assert.ok(FREE.truth.includes(r.text.split("\n\n")[1]));
  assert.ok(!("parse_mode" in r));
  assert.equal("buttons" in r, false, "buttons are appended by wireGuest, not the pure builder");
});
test("buildGuestReply: an unrecognized/empty category still returns a value card via the injected picker", () => {
  const pitch = { title: "pitch", description: "d", text: "p" };
  const r1 = buildGuestReply("not a category", pitch, () => "dare");
  const r2 = buildGuestReply("", pitch, () => "wyr");
  assert.notEqual(r1, pitch);
  assert.notEqual(r2, pitch);
  assert.ok(FREE.dare.includes(r1.text.split("\n\n")[1]));
  assert.ok(FREE.wyr.includes(r2.text.split("\n\n")[1]));
});
