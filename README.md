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

## Related projects

Part of the same small family of single-purpose Telegram bots — each one does one thing, open source (MIT), built with grammY on Cloudflare Workers:

| Bot | What it does |
|---|---|
| [AnonSayProBot](https://github.com/theluckystrike/telegram-anonymous-group-post-bot) | Post to a group anonymously |
| [AnonInboxProBot](https://github.com/theluckystrike/telegram-anonymous-inbox-bot) | A personal link for anonymous messages |
| [BirthdayReminderProBot](https://github.com/theluckystrike/telegram-birthday-reminder-bot) | Tracks a group's birthdays, posts on the day |
| [CountdownDaysBot](https://github.com/theluckystrike/telegram-countdown-bot) | Live countdown card for a date that matters |
| [BudgetLogBot](https://github.com/theluckystrike/telegram-expense-tracker-bot) | Private-chat expense tracker, auto-categorized |
| [GroupPulseProBot](https://github.com/theluckystrike/telegram-group-activity-stats-bot) | Group activity stats, no message content stored |
| [HabitStreakProBot](https://github.com/theluckystrike/telegram-habit-tracker-bot) | Daily habit tracking with streaks |
| [IcebreakerDailyBot](https://github.com/theluckystrike/telegram-icebreaker-question-bot) | Daily conversation-starter question for a group |
| [WhisperLockBot](https://github.com/theluckystrike/telegram-locked-message-bot) | Drop a locked message into any chat, reveal on tap |
| [FocusTimerProBot](https://github.com/theluckystrike/telegram-pomodoro-bot) | Pomodoro focus timers, solo or shared |
| [NudgeRemindBot](https://github.com/theluckystrike/telegram-reminder-bot) | Reminders inside Telegram, no separate app |
| [EventRSVPProBot](https://github.com/theluckystrike/telegram-rsvp-event-bot) | Event cards with live Going / Maybe / Can't counts |
| [SantaDrawProBot](https://github.com/theluckystrike/telegram-secret-santa-bot) | Secret Santa draw and exchange for a group |
| [SplitTabsBot](https://github.com/theluckystrike/telegram-split-bill-bot) | Running expense ledger for group bills |
| [AsyncStandupBot](https://github.com/theluckystrike/telegram-standup-bot) | Async daily standup for a team, no meeting |
| [TimeSheetProBot](https://github.com/theluckystrike/telegram-time-tracking-bot) | Freelance time tracking by client |
| [WhenIsItBot](https://github.com/theluckystrike/telegram-time-zone-bot) | Converts a time across a group's timezones |
| [TriviaDailyProBot](https://github.com/theluckystrike/telegram-trivia-bot) | Daily trivia quiz with leaderboard and streaks |
| [WordADayLearnBot](https://github.com/theluckystrike/telegram-vocabulary-bot) | Daily vocabulary with spaced repetition |

---
Part of Tiny Telegram Tools — https://tg.zovo.one/
