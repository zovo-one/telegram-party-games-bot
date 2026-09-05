/** Pure logic for PartyPack: rotation, pool sizing, next-player pick. */
import { CATEGORIES, CATEGORY_LABEL, FREE_SIZE, FULL_POOL, PRO_SIZE, SPICY_SIZE } from "./packs.ts";
import type { Category } from "./packs.ts";
import type { GuestReply } from "./guest.ts";

/** How many prompts are unlocked for this category given pro/spicy state. Fixed prefix of FULL_POOL. */
export function availableSize(cat: Category, pro: boolean, spicy: boolean): number {
  if (pro && spicy) return SPICY_SIZE[cat];
  if (pro) return PRO_SIZE[cat];
  return FREE_SIZE[cat];
}

/** The prompt text for a given pool index in a category. */
export function promptAt(cat: Category, idx: number): string {
  return FULL_POOL[cat][idx];
}

export interface RollResult { idx: number; reset: boolean; }

/** Pick a random unseen index within [0, poolSize). Resets (clearing seen within range) when exhausted.
 * seen may hold indices outside the current range; those are ignored, not mutated. */
export function rollIndex(seen: ReadonlySet<number>, poolSize: number): RollResult {
  let unseen: number[] = [];
  for (let i = 0; i < poolSize; i++) if (!seen.has(i)) unseen.push(i);
  let reset = false;
  if (unseen.length === 0) {
    reset = true;
    unseen = Array.from({ length: poolSize }, (_, i) => i);
  }
  const idx = unseen[Math.floor(Math.random() * unseen.length)];
  return { idx, reset };
}

export type Tier = "free" | "pro" | "spicy";

/** Which content tier a roll draws from, given the roller's pro/spicy state. Mirrors availableSize's
 * own gating: spicy only counts when the roller is also Pro. */
export function tierOf(pro: boolean, spicy: boolean): Tier {
  if (pro && spicy) return "spicy";
  return pro ? "pro" : "free";
}

/** Rotation "seen" bucket key: isolates free/pro/spicy progress per chat+category so a free user's
 * reset can never clear a Pro user's progress (or vice versa). */
export function seenBucket(cat: Category, pro: boolean, spicy: boolean): string {
  return `${cat}:${tierOf(pro, spicy)}`;
}

export interface Member { id: number; name: string; }

/** Pick a random member other than currentId. Returns null if no other member exists. Bounded by members.length. */
export function pickNextPlayer(members: readonly Member[], currentId: number): Member | null {
  const others = members.filter((m) => m.id !== currentId);
  if (others.length === 0) return null;
  return others[Math.floor(Math.random() * others.length)];
}

/** True for a first-touch attribution payload on /start (e.g. "site", "share", "list", "x"),
 *  never the reserved "pro" tag (this bot's per-user Pro deep link). */
export const SOURCE_PAYLOAD_RE = /^[a-z]{2,12}$/;
export function isSourcePayload(s: string): boolean { return s !== "pro" && SOURCE_PAYLOAD_RE.test(s); }

const isCategory = (s: string): s is Category => (CATEGORIES as readonly string[]).includes(s);

/** Pure Guest Mode reply builder: posts one free-tier prompt from the named (or random)
 * category. Always draws from the free tier (tierOf(false, false)) — Pro/Spicy content and
 * "Another"/"Next player" buttons both need an account and real chat membership, neither of
 * which a guest summon has. Never touches the store: `seen` is always empty here. */
export function buildGuestReply(q: string, pitch: GuestReply, pickCategory: () => Category = () => CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]): GuestReply {
  const query = q.trim().toLowerCase();
  const cat: Category = isCategory(query) ? query : pickCategory();
  const size = availableSize(cat, false, false);
  if (size === 0) return pitch;
  const { idx } = rollIndex(new Set(), size);
  const prompt = promptAt(cat, idx);
  return { title: `${CATEGORY_LABEL[cat]}`, description: prompt.slice(0, 90), text: `${CATEGORY_LABEL[cat]}\n\n${prompt}` };
}
