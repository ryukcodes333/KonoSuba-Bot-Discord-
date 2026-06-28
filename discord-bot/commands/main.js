const db = require('../database')
const fs = require('fs')
const path = require('path')

const BOT_VERSION = '3.0'

function uptime() {
  const ms = Date.now() - (global.botStartTime || Date.now())
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`
  return `${m}m ${s % 60}s`
}

function dateStr() {
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

module.exports = {
  async menu({ reply, pushName }) {
    const userName = pushName || 'Traveller'
    const menuText =
      `Hᴇʏʏʏʏʏ ${userName}... ɪ'ᴍ Aǫᴜᴀ ꜰʀᴏᴍ ᴛʜᴇ 𝐊𝚯𝐍𝚯𝐒𝐔𝐁𝚫 ᴄᴏᴍᴜɴɪᴛʏ!\n\n` +
      `Cʜᴇᴄᴋ ʙᴇʟᴏᴡ ғᴏʀ ᴀᴠᴀɪʟᴀʙʟᴇ ᴄᴏᴍᴍᴀɴᴅs ✦\n` +
      `> Prefix: **.** (dot)\n\n` +

      `*⚙️ ADMIN ⚙️*\n` +
      `┃ ⤷ .kick @user\n` +
      `┃ ⤷ .ban @user\n` +
      `┃ ⤷ .mute @user\n` +
      `┃ ⤷ .unmute @user\n` +
      `┃ ⤷ .warn @user\n` +
      `┃ ⤷ .warnings @user\n` +
      `┃ ⤷ .clearwarns @user\n` +
      `┃ ⤷ .promote @user\n` +
      `┃ ⤷ .demote @user\n` +
      `┃ ⤷ .addmod @user\n` +
      `┃ ⤷ .removemod @user\n` +
      `┃ ⤷ .lockgroup / .unlockgroup\n` +
      `┃ ⤷ .antilink on/off\n` +
      `┃ ⤷ .antispam on/off\n` +
      `┃ ⤷ .welcome on/off\n` +
      `┃ ⤷ .goodbye on/off\n` +
      `┃ ⤷ .tagall\n` +
      `┃ ⤷ .active\n` +
      `┃ ⤷ .blacklist add/remove/list\n` +
      `┃ ⤷ .suspend @user <time> <reason>\n` +
      `┃ ⤷ .unsuspend @user\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*💰 ECONOMY 💰*\n` +
      `┃ ⤷ .balance / .bal\n` +
      `┃ ⤷ .wallet / .bank\n` +
      `┃ ⤷ .deposit <amount>\n` +
      `┃ ⤷ .withdraw <amount>\n` +
      `┃ ⤷ .pay @user <amount>\n` +
      `┃ ⤷ .daily / .weekly / .monthly\n` +
      `┃ ⤷ .work / .dig / .fish / .beg\n` +
      `┃ ⤷ .crime / .rob @user / .heist\n` +
      `┃ ⤷ .shop / .buy <item>\n` +
      `┃ ⤷ .inventory / .inv\n` +
      `┃ ⤷ .loan <amount> / .repay\n` +
      `┃ ⤷ .topmoney / .topbank\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*🎮 GAMES 🎮*\n` +
      `┃ ⤷ .blackjack / .bj\n` +
      `┃ ⤷ .uno / .unojoin\n` +
      `┃ ⤷ .chess @user\n` +
      `┃ ⤷ .trivia / .math\n` +
      `┃ ⤷ .8ball <question>\n` +
      `┃ ⤷ .roll / .flip\n` +
      `┃ ⤷ .slot / .coinflip\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*🃏 CARDS 🃏*\n` +
      `┃ ⤷ .cards / .mycards\n` +
      `┃ ⤷ .draw / .sell <card>\n` +
      `┃ ⤷ .trade @user <card>\n` +
      `┃ ⤷ .deck / .setdeck\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*🐾 POKEMON 🐾*\n` +
      `┃ ⤷ .pokemon / .poke\n` +
      `┃ ⤷ .catch / .release\n` +
      `┃ ⤷ .party / .heal\n` +
      `┃ ⤷ .battle @user\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*⚔️ RPG ⚔️*\n` +
      `┃ ⤷ .rpg / .class\n` +
      `┃ ⤷ .dungeon / .raid\n` +
      `┃ ⤷ .quest / .skills\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*🤖 AI 🤖*\n` +
      `┃ ⤷ .ai <prompt>\n` +
      `┃ ⤷ .gpt / .gemini / .llama\n` +
      `┃ ⤷ .flux <prompt> (image gen)\n` +
      `┃ ⤷ Mention me or say "aqua"/"alpha" to chat!\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*😂 FUN 😂*\n` +
      `┃ ⤷ .gay / .ship / .pp\n` +
      `┃ ⤷ .fact / .joke / .meme\n` +
      `┃ ⤷ .afk <reason>\n` +
      `┃ ⤷ .poll <question>\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*👤 PROFILE 👤*\n` +
      `┃ ⤷ .profile / .p\n` +
      `┃ ⤷ .register / .bio <text>\n` +
      `┃ ⤷ .xp / .level\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*🏰 GUILDS 🏰*\n` +
      `┃ ⤷ .guild create <name>\n` +
      `┃ ⤷ .guild join / .guild leave\n` +
      `┃ ⤷ .guild info / .guild top\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*🎟️ LOTTERY 🎟️*\n` +
      `┃ ⤷ .lottery / .lotteryjoin\n` +
      `┃ ⤷ .lotterystatus / .lotterydraw\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*🛠️ UTILITY 🛠️*\n` +
      `┃ ⤷ .translate <lang> <text>\n` +
      `┃ ⤷ .weather <city>\n` +
      `┃ ⤷ .wiki <query>\n` +
      `┃ ⤷ .myid / .id\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `> Bot v${BOT_VERSION} | Konosuba Community`

    await reply(menuText)
  },

  async help(ctx) { return module.exports.menu(ctx) },

  async ping({ reply }) {
    const start = Date.now()
    const msg = await reply('🏓 Pinging...')
    const latency = Date.now() - start
    await msg.edit(`🏓 Pong! **${latency}ms**`)
  },

  async uptime({ reply }) {
    await reply(`⏰ *Uptime:* ${uptime()}`)
  },

  async alive({ reply }) {
    await reply(`🌑 *Konosuba Bot is ONLINE!*\n\n⏰ Uptime: ${uptime()}\n📅 ${dateStr()}`)
  },

  async botstatus({ reply }) {
    const mem = process.memoryUsage()
    const mb = (b) => (b / 1024 / 1024).toFixed(1) + ' MB'
    await reply(
      `*📊 Bot Status*\n\n` +
      `✅ Online\n` +
      `⏰ Uptime: ${uptime()}\n` +
      `💾 RAM: ${mb(mem.rss)}\n` +
      `📅 Date: ${dateStr()}\n` +
      `🔢 Version: ${BOT_VERSION}`
    )
  },

  async version({ reply }) {
    await reply(`🌑 Konosuba Discord Bot v${BOT_VERSION}`)
  },

  async dbstatus({ reply }) {
    const db = require('../database')
    const state = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting']
    const s = db.mongoose.connection.readyState
    await reply(`🗄️ Database: *${state[s] || 'Unknown'}*`)
  },

  async checkdb(ctx) { return module.exports.dbstatus(ctx) },

  async memory({ reply }) {
    const mem = process.memoryUsage()
    const mb = (b) => (b / 1024 / 1024).toFixed(1) + ' MB'
    await reply(
      `*💾 Memory Usage*\n\n` +
      `RSS: ${mb(mem.rss)}\n` +
      `Heap Used: ${mb(mem.heapUsed)}\n` +
      `Heap Total: ${mb(mem.heapTotal)}`
    )
  },

  async info({ msg, reply }) {
    const guild = msg.guild
    if (!guild) return reply(`🌑 **Konosuba Discord Bot v${BOT_VERSION}**\nPrefix: \`.\`\n`)
    await msg.guild.members.fetch().catch(() => {})
    const memberCount = guild.memberCount
    const botCount = guild.members.cache.filter(m => m.user.bot).size
    await reply(
      `*🌑 Server Info*\n\n` +
      `📛 Name: ${guild.name}\n` +
      `👥 Members: ${memberCount}\n` +
      `🤖 Bots: ${botCount}\n` +
      `📅 Created: ${guild.createdAt.toLocaleDateString()}\n` +
      `🆔 ID: ${guild.id}`
    )
  },

  async myid({ sender, reply }) {
    await reply(`🆔 Your ID: \`${sender}\``)
  },

  async signup({ sender, pushName, reply }) {
    const db = require('../database')
    const existing = await db.getUser(sender)
    if (existing) return reply(`✅ You're already registered, ${pushName}!`)
    await db.createUser(sender, pushName)
    await reply(`🎉 Welcome to Konosuba, **${pushName}**! You've been registered.\nStart with \`.daily\` to get your first coins!`)
  },

  async register(ctx) { return module.exports.signup(ctx) },
  async reg(ctx) { return module.exports.signup(ctx) },
  async start(ctx) { return module.exports.signup(ctx) },
}
