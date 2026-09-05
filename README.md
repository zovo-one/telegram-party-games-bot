# PartyPackProBot — party game prompts for Telegram

**Try it:** [@PartyPackProBot](https://t.me/PartyPackProBot?start=github) · [tg.zovo.one/bots/party/](https://tg.zovo.one/bots/party/)

## What it does

PartyPackProBot serves Truth, Dare, Would You Rather, and Never Have I Ever prompts straight into a Telegram group or DM. `/truth`, `/dare`, `/wyr`, `/nhie` pull one prompt from that category, `/random` picks a category at random, and every roll comes with **Another ▶️** (reroll the same category) and **Next player 👉** (pick a random recently-active member of the chat and roll again). Rotation never repeats a prompt in a category until every prompt in it has been shown once. Free tier: 40 prompts per category (160 total). Pro (one-time 150 ⭐) unlocks 320 more prompts across the four categories and an 18+ Spicy pack, toggled per chat with `/spicy`. A small Mini App (`/app`) offers the same roll-a-category flow outside the chat.

## Use it without adding the bot

Type `@PartyPackProBot` in **any** Telegram chat, even one the bot has never been added to. It answers with a pitch card introducing the four categories — a group roll needs "recently active members" the bot can't see as a guest, so this is a pitch rather than a live roll.

Both **Inline Mode** and **Guest Chat Mode** need to be turned on for the bot in [@BotFather](https://t.me/BotFather) (Bot Settings → Mode Settings) — turn Inline Mode on first, then Guest Chat Mode. Without both, only the classic `@Bot query` inline surface works.

## Self-host

```bash
pnpm i
wrangler secret put BOT_TOKEN
wrangler secret put WEBHOOK_SECRET
wrangler secret put OWNER_ID # optional
wrangler deploy
curl -G "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
  --data-urlencode "url=https://<your-worker>.workers.dev/webhook" \
  --data-urlencode "secret_token=$WEBHOOK_SECRET" \
  --data-urlencode 'allowed_updates=["message","callback_query","guest_message","inline_query","chosen_inline_result"]'
```

## Stack

[grammY](https://grammy.dev/) on Cloudflare Workers, state in a Durable Object backed by SQLite, Pro upgrades billed with Telegram Stars.

---
Part of Tiny Telegram Tools — https://tg.zovo.one/
