# 🌊 Konosuba Discord Bot

A feature-rich Discord bot ported from WhatsApp — economy, card games, Pokémon, RPG, AI chat, admin tools, and more. Prefix: `.`

---

## 📋 Prerequisites

- A **Discord account** and a **Discord server** where you have admin rights
- A **MongoDB** database (your existing one works)
- A **Render** account (free tier works): https://render.com
- Optionally: a **Groq API key** for AI chat (Alpha & Aqua) — free at https://console.groq.com

---

## 🤖 Step 1 — Create the Discord Bot

1. Go to https://discord.com/developers/applications
2. Click **New Application** → give it a name (e.g. "Konosuba")
3. Click **Bot** on the left sidebar
4. Click **Reset Token** → copy the token (save it somewhere safe!)
5. Under **Privileged Gateway Intents**, enable ALL three:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
6. Click **Save Changes**

### Invite the bot to your server

1. Go to **OAuth2 → URL Generator** on the left sidebar
2. Under **Scopes**, check: `bot`
3. Under **Bot Permissions**, check:
   - `Send Messages`
   - `Read Message History`
   - `Manage Messages`
   - `Kick Members`
   - `Ban Members`
   - `Moderate Members` (for timeout/mute)
   - `Add Reactions`
   - `Attach Files`
   - `Read Messages/View Channels`
4. Copy the generated URL at the bottom and open it in your browser
5. Select your server → click **Authorize**

---

## 🔑 Step 2 — Get Your Owner ID

Your Owner ID lets the bot know YOU are the admin.

1. In Discord, go to **Settings → Advanced** and enable **Developer Mode**
2. Right-click your own username anywhere → click **Copy User ID**
3. Save that number — you'll need it in Step 4

---

## 🚀 Step 3 — Deploy on Render

### Option A — Upload as ZIP (easiest)

1. Go to https://render.com and sign in
2. Click **New +** → **Web Service**
3. Choose **"Deploy from an existing code repository"** OR select **"Upload files"**
4. Upload this ZIP file when prompted
5. Set the following in Render's settings:
   - **Name**: `konosuba-discord-bot` (or anything you like)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`

### Option B — Push to GitHub first (recommended for updates)

1. Create a new **private** GitHub repo
2. Extract this ZIP and push the files to your repo
3. In Render → **New Web Service** → connect your GitHub repo
4. Render will detect the `render.yaml` and auto-configure everything

---

## ⚙️ Step 4 — Set Environment Variables on Render

In your Render service, go to **Environment** and add these variables:

| Variable | Value | Required? |
|---|---|---|
| `DISCORD_TOKEN` | Your bot token from Step 1 | ✅ Yes |
| `MONGO_URI` | Your MongoDB connection string | ✅ Yes |
| `OWNER_ID` | Your Discord User ID from Step 2 | ✅ Yes |
| `GROQ_KEY` | Your Groq API key | Optional (for AI chat) |
| `REMOVEBG_API_KEY` | Your remove.bg key | Optional (for .removebg) |

> ⚠️ **Never share your DISCORD_TOKEN or MONGO_URI with anyone!**

---

## ▶️ Step 5 — Start the Bot

1. After adding env vars, click **Deploy** (or it may deploy automatically)
2. Watch the logs — you should see:
   ```
   ✅ Konosuba Bot (Aqua) is ONLINE! 🌑
   🤖 Logged in as: YourBotName#1234
   ```
3. Go to your Discord server and type `.menu` — the bot should respond!

---

## 🧩 Features & Commands

All commands use the `.` prefix (e.g. `.menu`, `.daily`, `.help`)

| Category | Commands |
|---|---|
| 📋 Info | `.menu`, `.help`, `.ping`, `.alive`, `.uptime` |
| 💰 Economy | `.balance`, `.daily`, `.work`, `.fish`, `.dig`, `.pay`, `.shop`, `.bank` |
| 🎰 Gambling | `.slot`, `.blackjack`, `.gamble`, `.coinflip` |
| 🃏 Cards | `.cards`, `.draw`, `.sell`, `.trade`, `.deck` |
| 🐾 Pokémon | `.pokemon`, `.catch`, `.party`, `.battle` |
| ⚔️ RPG | `.rpg`, `.dungeon`, `.quest`, `.class` |
| 🤖 AI | `.ai`, `.gpt`, `.flux` (image gen), mention bot or say "aqua"/"alpha" |
| 😂 Fun | `.gay`, `.ship`, `.fact`, `.joke`, `.8ball`, `.roll`, `.flip` |
| 👥 Admin | `.kick`, `.ban`, `.mute`, `.warn`, `.antilink`, `.welcome`, `.lockgroup` |
| 👤 Profile | `.profile`, `.register`, `.bio`, `.level` |
| 🏰 Guilds | `.guild create/join/leave/info` |
| 🎟️ Lottery | `.lottery`, `.lotteryjoin`, `.lotterydraw` |
| 📊 Poll | `.poll <question>` |
| 🛠️ Utility | `.translate`, `.weather`, `.wiki`, `.math`, `.trivia` |

---

## 💡 Tips

- **AI Chat**: Mention the bot (`@BotName`) or say "aqua" or "alpha" in any message to chat with the AI
- **Owner commands**: Only work for the user whose ID is set as `OWNER_ID`
- **Mod commands**: Give users the "Mod" or "Moderator" role in Discord for moderator permissions
- **Database**: Uses your existing MongoDB — all economy/card/pokémon data carries over if using the same DB
- **Keep-alive**: Render's free tier sleeps after 15 mins of inactivity. The `/ping` endpoint helps keep it awake — use https://uptimerobot.com (free) to ping `/ping` every 5 minutes

---

## 🔄 Updating the Bot

1. Edit your files locally
2. Push to GitHub (if using Option B) — Render auto-deploys
3. Or re-upload the ZIP (Option A)

---

## ❓ Troubleshooting

| Problem | Fix |
|---|---|
| Bot doesn't respond | Check `DISCORD_TOKEN` is correct. Check **Message Content Intent** is enabled |
| "Database not connected" | Check `MONGO_URI` is correct and your IP is whitelisted in MongoDB Atlas (use `0.0.0.0/0` for Render) |
| AI chat not working | Add `GROQ_KEY` in environment variables |
| Commands not showing | Make sure bot has **View Channel** + **Send Messages** permissions |
| `.kick`/`.ban` not working | Bot needs **Kick Members**/**Ban Members** permissions AND its role must be above the target user's role |
