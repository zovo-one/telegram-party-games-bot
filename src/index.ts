import { Bot, InlineKeyboard } from "grammy";
import type { Context } from "grammy";
import { PRO_STARS, displayName, isPrivate, makeFetch, preparedShare, proButton, sendInvoice, wirePro } from "./kit.ts";
import type { Env as KitEnv, ProSpec, Step } from "./kit.ts";
import { Store } from "./db.ts";
import { APP_HTML, buildShareText, handleProLink, initDataFailure, validateInitData } from "./webapp.ts";
import type { ProLinkBody } from "./webapp.ts";
import type { ProPlan } from "./webapp-i18n.ts";
import { BOT, BOT_LIVE, HUB_FALLBACK } from "./botname.ts";
import { CATEGORIES, CATEGORY_LABEL } from "./packs.ts";
import type { Category } from "./packs.ts";
import { availableSize, buildGuestReply, isSourcePayload, pickNextPlayer, promptAt, rollIndex, seenBucket } from "./logic.ts";
import type { Member } from "./logic.ts";
import { GuestReply, queryText, wireGuest, wireInline } from "./guest.ts";
import { resolveLang, t } from "./i18n.ts";
export { Store };

interface Env extends KitEnv { STORE: DurableObjectNamespace<Store>; }
const store = (env: Env) => env.STORE.get(env.STORE.idFromName("main"));
/** party has no minted token yet: BOT is a placeholder, so any link shown to a real user (the
 * Mini App's error/share paths) must use the hub Direct-Link instead of guessing a username. */
const PUBLIC_BASE = BOT_LIVE ? `https://t.me/${BOT}` : HUB_FALLBACK;

/** True prompt counts (verified against packs.ts): 320 more unlocked by Pro alone, 380 with Spicy. */
const PRO_MORE = 320;
const SPICY_MORE = 60;
const proCta = (lang: string): string => t(lang, "btn_unlockMorePrompts", { proMore: PRO_MORE });

const PRO: ProSpec = {
  title: "PartyPack Pro",
  description: `Unlock ${PRO_MORE} more prompts (Truth, Dare, Would You Rather, Never Have I Ever) plus the ${SPICY_MORE}-prompt 18+ Spicy pack, everywhere you play. One-time payment.`,
  payload: "party-pro",
  thanks: `✅ Pro unlocked! You get ${PRO_MORE} more prompts everywhere (${PRO_MORE + SPICY_MORE} with Spicy), plus /spicy in any group or in DM.\n\n/more — more free tools`,
};
const SHARE_PITCH = "Truth, Dare, Would You Rather and more for your group — free.";

const helpText = (lang: string): string => t(lang, "help", { proMore: PRO_MORE, proAll: PRO_MORE + SPICY_MORE });
const startText = (lang: string): string => t(lang, "start");

const isCategory = (s: string): s is Category => (CATEGORIES as readonly string[]).includes(s);

const chatTitle = (ctx: Context): string => (ctx.chat && "title" in ctx.chat ? ctx.chat.title ?? "" : "");

/** Mini App pseudo-chat id for a user's private rolls (matches api()'s webChatId). Shared so /spicy in
 * DM and the Mini App read/write the same toggle. */
const webChatId = (userId: number): number => -(9_000_000_000_000 + userId);

/** Pro CTA: a URL deep link in groups (Stars invoices can't be sent to a group), a callback in private. */
function proKb(ctx: Context, text: string): InlineKeyboard {
  return isPrivate(ctx) ? proButton(text) : new InlineKeyboard().url(text, `https://t.me/${BOT}?start=pro`);
}

async function sendRoll(ctx: Context, env: Env, category: Category, chatId: number, userId: number, pro: boolean, spicy: boolean): Promise<void> {
  const size = availableSize(category, pro, spicy);
  const bucket = seenBucket(category, pro, spicy);
  const seen = await store(env).getSeen(chatId, bucket);
  const { idx, reset } = rollIndex(seen, size);
  if (reset) await store(env).resetSeen(chatId, bucket);
  await store(env).markSeen(chatId, bucket, idx);
  if (reset && !pro) await store(env).track(userId, "pro_prompt");
  const prompt = promptAt(category, idx);
  const text = (reset ? "🔁 New round!\n\n" : "") + `${CATEGORY_LABEL[category]}\n\n${prompt}`;
  const kb = new InlineKeyboard().text("Another ▶️", `a:${category}`).text("Next player 👉", `n:${category}`);
  if (!pro) {
    const lang = resolveLang(ctx.from?.language_code);
    const cta = proCta(lang);
    kb.row();
    if (isPrivate(ctx)) kb.text(cta, "pro"); else kb.url(cta, `https://t.me/${BOT}?start=pro`);
  }
  await ctx.reply(text, { reply_markup: kb });
}

/** The chat id whose /spicy toggle applies to this roll: the real chat in a group, the shared
 * Mini App pseudo-chat in DM (so /spicy in private and the Mini App agree on one toggle). */
function spicyChatId(ctx: Context, chatId: number, userId: number): number {
  return isPrivate(ctx) ? webChatId(userId) : chatId;
}

async function onRoll(ctx: Context, env: Env, category: Category): Promise<void> {
  const from = ctx.from;
  if (!from) return;
  const user = await store(env).touchUser(from.id, from.username, displayName(from));
  const priv = isPrivate(ctx);
  const chatId = ctx.chat!.id;
  await store(env).touchChat(chatId, chatTitle(ctx));
  if (!priv) await store(env).touchMember(chatId, from.id, displayName(from));
  await store(env).track(from.id, "action");
  await store(env).logRoll(from.id, chatId);
  const spicy = await store(env).chatSpicy(spicyChatId(ctx, chatId, from.id));
  await sendRoll(ctx, env, category, chatId, from.id, user.pro === 1, spicy);
}

async function onSpicy(ctx: Context, env: Env): Promise<void> {
  const from = ctx.from;
  if (!from) return;
  const lang = resolveLang(from.language_code);
  const priv = isPrivate(ctx);
  const user = await store(env).touchUser(from.id, from.username, displayName(from));
  const chatId = spicyChatId(ctx, ctx.chat!.id, from.id);
  await store(env).touchChat(chatId, priv ? "" : chatTitle(ctx));
  if (user.pro !== 1) {
    await store(env).track(from.id, "pro_prompt");
    await ctx.reply(t(lang, "spicyProOnly"), { reply_markup: proKb(ctx, proCta(lang)) });
    return;
  }
  const on = !(await store(env).chatSpicy(chatId));
  await store(env).setSpicy(chatId, on);
  const where = t(lang, priv ? "wherePrivate" : "whereGroup");
  await ctx.reply(t(lang, on ? "spicyOn" : "spicyOff", { where }));
}

async function onNextPlayer(ctx: Context, env: Env, chatId: number, currentId: number): Promise<void> {
  const members: Member[] = await store(env).recentMembers(chatId);
  const next = pickNextPlayer(members, currentId);
  if (next) await ctx.reply(`👉 ${next.name}'s turn!`);
}

const MORE_TEXT = "More free tools by the same maker:\n🔒 @WhisperLockBot — locked messages only one person can open\n⏰ @NudgeRemindBot — reminders that arrive on time\n📮 @AnonInboxProBot — anonymous inbox via your link\n🧾 @SplitTabsBot — split group expenses\n🔥 @HabitStreakProBot — habit streaks with daily check-ins";

/** Registered before wirePro so it wins the "pro"/"pro" command+callback slots: group taps must never
 * reach wirePro's unconditional replyWithInvoice (Stars invoices are private-chat only). */
function localizedProSpec(lang: string): ProSpec {
  return { ...PRO, description: t(lang, "proDescription", { proMore: PRO_MORE, spicyMore: SPICY_MORE }) };
}

function wireProOverride(bot: Bot, env: Env): void {
  const track = (ctx: Context) => (s: Step): Promise<void> => store(env).track(ctx.from!.id, s);
  bot.command("pro", async (ctx) => {
    const lang = resolveLang(ctx.from?.language_code);
    if (isPrivate(ctx)) { await sendInvoice(ctx, localizedProSpec(lang), PRO.payload, track(ctx)); return; }
    await ctx.reply(t(lang, "proAccountInfo", { proMore: PRO_MORE, proAll: PRO_MORE + SPICY_MORE, stars: PRO_STARS }), { reply_markup: proKb(ctx, proCta(lang)) });
  });
  bot.callbackQuery("pro", async (ctx) => {
    await ctx.answerCallbackQuery();
    const lang = resolveLang(ctx.from?.language_code);
    if (isPrivate(ctx)) { await sendInvoice(ctx, localizedProSpec(lang), PRO.payload, track(ctx)); return; }
    await ctx.reply(t(lang, "proDMOnly", { bot: BOT }));
  });
}

/** Static copy for a guest chat, with the Markdown the i18n table carries stripped: guest
 * results are posted as plain text (the query is user-supplied and may contain _ or *). */
const plain = (s: string): string => s.replaceAll("*", "").replaceAll("`", "");

/** Guest Mode: someone @-mentioned us in a chat we were never added to. The prompt pick
 * (parses -> value card) lives in the pure, unit-tested `buildGuestReply` in logic.ts; this
 * just gathers the query text and the caller's language. */
async function onGuest(ctx: Context, env: Env): Promise<GuestReply> {
  const lang = resolveLang(ctx.from?.language_code);
  const q = queryText(ctx, BOT);
  const pitch: GuestReply = { title: "🎉 PartyPack — Truth, Dare, WYR, NHIE", description: "Try: @" + BOT + " truth", text: plain(startText(lang)) };
  return buildGuestReply(q, pitch);
}

function buildBot(env: Env): Bot {
  const bot = new Bot(env.BOT_TOKEN);
  bot.command("start", async (ctx) => {
    const from = ctx.from!;
    await store(env).touchUser(from.id, from.username, displayName(from));
    await store(env).track(from.id, "start");
    const lang = resolveLang(from.language_code);
    const payload = String(ctx.match ?? "");
    if (payload === "pro") { await sendInvoice(ctx, localizedProSpec(lang), PRO.payload, (s) => store(env).track(from.id, s)); return; }
    if (isSourcePayload(payload)) await store(env).recordSource(from.id, payload);
    const kb = new InlineKeyboard().url(t(lang, "btn_addToGroup"), `https://t.me/${BOT}?startgroup=true`);
    await ctx.reply(startText(lang), { parse_mode: "Markdown", reply_markup: kb });
  });
  bot.command("help", (ctx) => ctx.reply(helpText(resolveLang(ctx.from?.language_code)), { parse_mode: "Markdown" }));
  bot.command("more", (ctx) => ctx.reply(MORE_TEXT));
  bot.command("truth", (ctx) => onRoll(ctx, env, "truth"));
  bot.command("dare", (ctx) => onRoll(ctx, env, "dare"));
  bot.command("wyr", (ctx) => onRoll(ctx, env, "wyr"));
  bot.command("nhie", (ctx) => onRoll(ctx, env, "nhie"));
  bot.command("random", (ctx) => onRoll(ctx, env, CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]));
  bot.command("spicy", (ctx) => onSpicy(ctx, env));
  wireProOverride(bot, env);
  // wirePro (shared kit.ts) always sends its own (English) spec.thanks after onPaid resolves;
  // for a non-English payer we follow up with a localized thank-you.
  wirePro(bot, PRO, async (ctx, _payload, charge) => {
    await store(env).setPro(ctx.from!.id, charge);
    const lang = resolveLang(ctx.from?.language_code);
    if (lang !== "en") await ctx.reply(t(lang, "thankYou", { proMore: PRO_MORE, proAll: PRO_MORE + SPICY_MORE }));
  }, (uid, s) => store(env).track(uid, s), true);

  bot.callbackQuery(/^([an]):(truth|dare|wyr|nhie)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const from = ctx.from;
    const chatId = ctx.chat?.id;
    if (!from || chatId === undefined) return;
    const match = ctx.match as RegExpMatchArray;
    const kind = match[1];
    const category = match[2];
    if (!isCategory(category)) return;
    const user = await store(env).touchUser(from.id, from.username, displayName(from));
    const priv = isPrivate(ctx);
    if (!priv) await store(env).touchMember(chatId, from.id, displayName(from));
    await store(env).track(from.id, "action");
    await store(env).logRoll(from.id, chatId);
    if (kind === "n" && !priv) await onNextPlayer(ctx, env, chatId, from.id);
    const spicy = await store(env).chatSpicy(spicyChatId(ctx, chatId, from.id));
    await sendRoll(ctx, env, category, chatId, from.id, user.pro === 1, spicy);
  });

  bot.on("message:new_chat_members", async (ctx) => {
    const me = ctx.me.id;
    if (ctx.message.new_chat_members.some((m) => m.id === me)) await ctx.reply(helpText(resolveLang(ctx.from?.language_code)), { parse_mode: "Markdown" });
  });
  bot.on("message:text", async (ctx) => {
    if (!isPrivate(ctx)) {
      await store(env).touchChat(ctx.chat.id, chatTitle(ctx));
      if (ctx.from) await store(env).touchMember(ctx.chat.id, ctx.from.id, displayName(ctx.from));
      return;
    }
    if (!ctx.message.via_bot) await ctx.reply(helpText(resolveLang(ctx.from.language_code)), { parse_mode: "Markdown" });
  });
  wireGuest(bot, {
    botUsername: BOT,
    reply: (ctx) => onGuest(ctx, env),
    // `guest` is NOT written to `sources` here (REVIEW-GUEST F3): a summoner is not an
    // installer. src_guest is earned later, through the ?start=guest deep link in the
    // buttons below. recordGuest self-limits; `flood` downgrades us to the cheap pitch.
    record: async (uid, chatType, chatId) => {
      const r = await store(env).recordGuest(uid, chatType, chatId);
      if (r.recorded) await store(env).track(uid, "guest");
      return !r.flood;
    },
  });
  // Classic inline mode: the SAME reply builder, answered as an inline result. A user types
  // "@Bot query" in any chat on any client and posts the card with `via @Bot` attribution —
  // no admin, no membership, no Guest Chat Mode toggle. The destination chat is unknown, so
  // the card carries private-style buttons only. Counted under `inline_queries`; `sources` is
  // never written here (an inline user is not an installer, same rule as the guest path).
  wireInline(bot, {
    botUsername: BOT,
    reply: (ctx) => onGuest(ctx, env),
    record: async (uid) => !(await store(env).recordInline(uid)).flood,
    chosen: (uid) => store(env).recordInlineChosen(uid),
  });
  return bot;
}

async function api(req: Request, env: Env): Promise<Response> {
  const body = (await req.json().catch(() => ({}))) as { initData?: string; category?: string };
  const user = await validateInitData(body.initData ?? "", [env.BOT_TOKEN, env.HUB_BOT_TOKEN].filter((t): t is string => !!t));
  if (!user) return Response.json(initDataFailure(body.initData ?? "", PUBLIC_BASE), { status: 401 });
  const category: Category = isCategory(body.category ?? "") ? (body.category as Category) : "truth";
  const dbUser = await store(env).touchUser(user.id, user.username, displayName(user));
  const pro = dbUser.pro === 1;
  const chatId = webChatId(user.id);
  await store(env).touchChat(chatId, "");
  await store(env).track(user.id, "action");
  await store(env).logRoll(user.id, chatId);
  // Spicy only if the user explicitly turned it on via /spicy in a private chat with the bot —
  // never force-enabled just because they're Pro.
  const spicy = await store(env).chatSpicy(chatId);
  const size = availableSize(category, pro, spicy);
  const bucket = seenBucket(category, pro, spicy);
  const seen = await store(env).getSeen(chatId, bucket);
  const { idx, reset } = rollIndex(seen, size);
  if (reset) await store(env).resetSeen(chatId, bucket);
  await store(env).markSeen(chatId, bucket, idx);
  if (reset && !pro) await store(env).track(user.id, "pro_prompt");
  return Response.json({ category, prompt: promptAt(category, idx), reset, pro, proStars: PRO_STARS });
}

/** POST /api/share: registers a Bot API "prepared" inline message (savePreparedInlineMessage)
 * so the Mini App can hand its id to tg.shareMessage(id) for a native chat/group/channel share. */
async function apiShare(req: Request, env: Env): Promise<Response> {
  const body = (await req.json().catch(() => ({}))) as { initData?: string };
  const user = await validateInitData(body.initData ?? "", [env.BOT_TOKEN, env.HUB_BOT_TOKEN].filter((t): t is string => !!t));
  if (!user) return Response.json(initDataFailure(body.initData ?? "", PUBLIC_BASE), { status: 401 });
  try {
    const share = await preparedShare(env, user.id, buildShareText(SHARE_PITCH, PUBLIC_BASE, "shared"), PUBLIC_BASE);
    await store(env).recordShare(user.id, "chat");
    return Response.json(share);
  } catch { return Response.json({ error: "Share unavailable." }, { status: 502 }); }
}

/** POST /api/share-story: records a "share to story" click. Telegram gives no server
 * callback for tg.shareToStory, so the client fires this right before calling it. */
async function apiShareStory(req: Request, env: Env): Promise<Response> {
  const body = (await req.json().catch(() => ({}))) as { initData?: string };
  const user = await validateInitData(body.initData ?? "", [env.BOT_TOKEN, env.HUB_BOT_TOKEN].filter((t): t is string => !!t));
  if (!user) return Response.json(initDataFailure(body.initData ?? "", PUBLIC_BASE), { status: 401 });
  await store(env).recordShare(user.id, "story");
  return Response.json({ ok: true });
}

/** One Stars invoice link, with exactly the title/description/payload the chat flow uses
 * (English base copy — the Mini App link is not localized). Shared shape with the other
 * Mini Apps' POST /api/pro-link; party has no monthly plan so `plan` is always "onetime"
 * once normalizePlan(_, false) runs. */
function proLink(api: Bot["api"], _plan: ProPlan): Promise<string> {
  return api.createInvoiceLink(PRO.title, PRO.description, PRO.payload, "", "XTR", [{ label: PRO.title, amount: PRO_STARS }]);
}

/** POST /api/pro-link: the Mini App's own Stars checkout (tg.openInvoice). Same invoice
 * as the chat flow, so successful_payment / setPro is unchanged. */
async function apiProLink(req: Request, env: Env): Promise<Response> {
  const body = (await req.json().catch(() => ({}))) as ProLinkBody;
  return handleProLink(body, {
    tokens: [env.BOT_TOKEN, env.HUB_BOT_TOKEN].filter((t): t is string => !!t),
    botLink: PUBLIC_BASE,
    allowMonthly: false,
    mint: (plan) => proLink(new Bot(env.BOT_TOKEN).api, plan),
    track: (userId) => store(env).track(userId, "invoice"),
  });
}

const botFetch = makeFetch<Env>(buildBot, (env) => store(env).stats());
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const path = new URL(req.url).pathname;
    if (path === "/app") return new Response(APP_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
    if (path === "/api/share" && req.method === "POST") return apiShare(req, env);
    if (path === "/api/share-story" && req.method === "POST") return apiShareStory(req, env);
    if (path === "/api/pro-link" && req.method === "POST") return apiProLink(req, env);
    if (path === "/api/roll" && req.method === "POST") return api(req, env);
    return botFetch(req, env);
  },
};
