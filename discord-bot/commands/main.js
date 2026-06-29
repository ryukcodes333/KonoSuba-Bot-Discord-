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
      `Hᴇʏʏʏʏʏ ${userName}... ɪ'ᴍ Aǫᴜᴀ ꜰʀᴏᴍ ᴛʜᴇ 𝐊𝚯𝐍𝚯𝐒𝐔𝐁𝚫 ᴄᴏᴍᴍᴜɴɪᴛʏ ɴɪᴄᴇ ᴛᴏ ᴍᴇᴇᴛ ʏᴏᴜ!\n\n` +
      `Cʜᴇᴄᴋ ʙᴇʟᴏᴡ ғᴏʀ ᴀᴠᴀɪʟᴀʙʟᴇ ᴄᴏᴍᴍᴀɴᴅs ✦\n\n` +

      `*⚙️ ADMIN ⚙️*\n` +
      `┃\n` +
      `┃ ⤷ .kick @user\n` +
      `┃ ⤷ .mute @user\n` +
      `┃ ⤷ .unmute @user\n` +
      `┃ ⤷ .warn @user\n` +
      `┃ ⤷ .warnings @user\n` +
      `┃ ⤷ .clearwarns @user\n` +
      `┃ ⤷ .promote @user\n` +
      `┃ ⤷ .demote @user\n` +
      `┃ ⤷ .ban @user\n` +
      `┃ ⤷ .unban @user\n` +
      `┃ ⤷ .addmod @user\n` +
      `┃ ⤷ .removemod @user\n` +
      `┃ ⤷ .lockgroup\n` +
      `┃ ⤷ .unlockgroup\n` +
      `┃ ⤷ .setname <name>\n` +
      `┃ ⤷ .setdesc <description>\n` +
      `┃ ⤷ .setpp (reply image)\n` +
      `┃ ⤷ .tagall\n` +
      `┃ ⤷ .hidetag <message>\n` +
      `┃ ⤷ .delete (reply msg)\n` +
      `┃ ⤷ .antilink on/off\n` +
      `┃ ⤷ .antispam on/off\n` +
      `┃ ⤷ .welcome on/off\n` +
      `┃ ⤷ .goodbye on/off\n` +
      `┃ ⤷ .autoreply on/off\n` +
      `┃ ⤷ .active\n` +
      `┃ ⤷ .resetlink\n` +
      `┃ ⤷ .revoke\n` +
      `┃ ⤷ .invitelink\n` +
      `┃ ⤷ .stafflist\n` +
      `┃ ⤷ .myrole\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*💰 ECONOMY 💰*\n` +
      `┃\n` +
      `┃ ⤷ .balance / .bal\n` +
      `┃ ⤷ .wallet\n` +
      `┃ ⤷ .bank\n` +
      `┃ ⤷ .deposit <amount>\n` +
      `┃ ⤷ .withdraw <amount>\n` +
      `┃ ⤷ .pay @user <amount>\n` +
      `┃ ⤷ .loan <amount>\n` +
      `┃ ⤷ .repay <amount>\n` +
      `┃ ⤷ .daily\n` +
      `┃ ⤷ .fish\n` +
      `┃ ⤷ .dig\n` +
      `┃ ⤷ .weekly\n` +
      `┃ ⤷ .monthly\n` +
      `┃ ⤷ .work\n` +
      `┃ ⤷ .beg\n` +
      `┃ ⤷ .crime\n` +
      `┃ ⤷ .rob @user\n` +
      `┃ ⤷ .heist\n` +
      `┃ ⤷ .market\n` +
      `┃ ⤷ .buy <item>\n` +
      `┃ ⤷ .sell <item>\n` +
      `┃ ⤷ .inventory / .inv\n` +
      `┃ ⤷ .use <item>\n` +
      `┃ ⤷ .gift @user <item>\n` +
      `┃ ⤷ .topmoney\n` +
      `┃ ⤷ .topbank\n` +
      `┃ ⤷ .cooldowns / .cds\n` +
      `┃ ⤷ .profile / .p\n` +
      `┃ ⤷ .rank\n` +
      `┃ ⤷ .xp\n` +
      `┃ ⤷ .achievements\n` +
      `┃ ⤷ .quests\n` +
      `┃ ⤷ .claim\n` +
      `┃ ⤷ .bonus\n` +
      `┃ ⤷ .upgrade\n` +
      `┃ ⤷ .prestige\n` +
      `┃ ⤷ .bankupgrade\n` +
      `┃ ⤷ .withdrawall\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*🎲 GAMBLING 🎲*\n` +
      `┃\n` +
      `┃ ⤷ .coinflip <amount>\n` +
      `┃ ⤷ .slots <amount>\n` +
      `┃ ⤷ .blackjack <amount>\n` +
      `┃ ⤷ .roulette <amount>\n` +
      `┃ ⤷ .dice <amount>\n` +
      `┃ ⤷ .lottery\n` +
      `┃ ⤷ .bet <amount>\n` +
      `┃ ⤷ .highlow <amount>\n` +
      `┃ ⤷ .crash <amount>\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*🎉 FUN 🎉*\n` +
      `┃\n` +
      `┃ ⤷ .joke\n` +
      `┃ ⤷ .meme\n` +
      `┃ ⤷ .quote\n` +
      `┃ ⤷ .fact\n` +
      `┃ ⤷ .8ball <question>\n` +
      `┃ ⤷ .truth\n` +
      `┃ ⤷ .dare\n` +
      `┃ ⤷ .ship @user @user\n` +
      `┃ ⤷ .rate @user\n` +
      `┃ ⤷ .roast @user\n` +
      `┃ ⤷ .compliment @user\n` +
      `┃ ⤷ .pick <option1/option2>\n` +
      `┃ ⤷ .reverse <text>\n` +
      `┃ ⤷ .fliptext <text>\n` +
      `┃ ⤷ .emojify <text>\n` +
      `┃ ⤷ .rps <rock/paper/scissors>\n` +
      `┃ ⤷ .wouldyourather\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*💞 INTERACTIONS 💞*\n` +
      `┃\n` +
      `┃ ⤷ .hug @user\n` +
      `┃ ⤷ .kiss @user\n` +
      `┃ ⤷ .pat @user\n` +
      `┃ ⤷ .slap @user\n` +
      `┃ ⤷ .punch @user\n` +
      `┃ ⤷ .bite @user\n` +
      `┃ ⤷ .cuddle @user\n` +
      `┃ ⤷ .poke @user\n` +
      `┃ ⤷ .tickle @user\n` +
      `┃ ⤷ .wave @user\n` +
      `┃ ⤷ .highfive @user\n` +
      `┃ ⤷ .stare @user\n` +
      `┃ ⤷ .blush\n` +
      `┃ ⤷ .smile\n` +
      `┃ ⤷ .cry\n` +
      `┃ ⤷ .laugh\n` +
      `┃ ⤷ .dance\n` +
      `┃ ⤷ .angry\n` +
      `┃ ⤷ .sleep\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*🎮 GAMES 🎮*\n` +
      `┃\n` +
      `┃ ⤷ .tictactoe @user\n` +
      `┃ ⤷ .hangman\n` +
      `┃ ⤷ .quiz\n` +
      `┃ ⤷ .trivia\n` +
      `┃ ⤷ .mathquiz\n` +
      `┃ ⤷ .wordgame\n` +
      `┃ ⤷ .riddle\n` +
      `┃ ⤷ .guessnumber\n` +
      `┃ ⤷ .fasttype\n` +
      `┃ ⤷ .minesweeper\n` +
      `┃ ⤷ .snake\n` +
      `┃ ⤷ .2048\n` +
      `┃ ⤷ .duel @user\n` +
      `┃ ⤷ .arcade\n` +
      `┃ ⤷ .leaderboard\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*🐾 POKÉMONS 🐾*\n` +
      `┃\n` +
      `┃ ⤷ .pokemon\n` +
      `┃ ⤷ .party\n` +
      `┃ ⤷ .pc\n` +
      `┃ ⤷ .starter\n` +
      `┃ ⤷ .catch\n` +
      `┃ ⤷ .hunt\n` +
      `┃ ⤷ .battle @user\n` +
      `┃ ⤷ .heal\n` +
      `┃ ⤷ .evolve <pokemon>\n` +
      `┃ ⤷ .release <pokemon>\n` +
      `┃ ⤷ .rename <pokemon> <name>\n` +
      `┃ ⤷ .buddy <pokemon>\n` +
      `┃ ⤷ .feed <pokemon>\n` +
      `┃ ⤷ .train <pokemon>\n` +
      `┃ ⤷ .moves <pokemon>\n` +
      `┃ ⤷ .pokeshop\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*⬇️ DOWNLOADER ⬇️*\n` +
      `┃\n` +
      `┃ ⤷ .play <song>\n` +
      `┃ ⤷ .ytmp3 <link>\n` +
      `┃ ⤷ .ytmp4 <link>\n` +
      `┃ ⤷ .tiktok <link>\n` +
      `┃ ⤷ .instagram <link>\n` +
      `┃ ⤷ .facebook <link>\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*⚔️ RPG ⚔️*\n` +
      `┃\n` +
      `┃ ⤷ .rpg\n` +
      `┃ ⤷ .stats\n` +
      `┃ ⤷ .hunt\n` +
      `┃ ⤷ .boss\n` +
      `┃ ⤷ .raid\n` +
      `┃ ⤷ .dungeon\n` +
      `┃ ⤷ .quest\n` +
      `┃ ⤷ .equip <item>\n` +
      `┃ ⤷ .unequip <item>\n` +
      `┃ ⤷ .skills\n` +
      `┃ ⤷ .craft <item>\n` +
      `┃ ⤷ .forge\n` +
      `┃ ⤷ .shop\n` +
      `┃ ⤷ .prestige\n` +
      `┃ ⤷ .rparty\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*🏰 GUILD 🏰*\n` +
      `┃\n` +
      `┃ ⤷ .createguild <name>\n` +
      `┃ ⤷ .guild\n` +
      `┃ ⤷ .guildinfo\n` +
      `┃ ⤷ .joinguild <name>\n` +
      `┃ ⤷ .leaveguild\n` +
      `┃ ⤷ .invite @user\n` +
      `┃ ⤷ .kickmember @user\n` +
      `┃ ⤷ .guildtop\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*🎴 CARDS 🎴*\n` +
      `┃\n` +
      `┃ ⤷ .collection / .coll\n` +
      `┃ ⤷ .deck\n` +
      `┃ ⤷ .card\n` +
      `┃ ⤷ .ci <name> [tier]\n` +
      `┃ ⤷ .ss <name>\n` +
      `┃ ⤷ .fs <series> [tier]\n` +
      `┃ ⤷ .cardlb\n` +
      `┃ ⤷ .get <card_id>\n` +
      `┃ ⤷ .stardust\n` +
      `┃ ⤷ .tc @user\n` +
      `┃ ⤷ .dc <number>\n` +
      `┃ ⤷ .cg <number>\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*🔥 VIBE 🔥*\n` +
      `┃\n` +
      `┃ ⤷ .vibe\n` +
      `┃ ⤷ .vibecheck\n` +
      `┃ ⤷ .energy\n` +
      `┃ ⤷ .aura\n` +
      `┃ ⤷ .rizz\n` +
      `┃ ⤷ .sigma\n` +
      `┃ ⤷ .ratio\n` +
      `┃ ⤷ .npc\n` +
      `┃ ⤷ .cope\n` +
      `┃ ⤷ .mood\n` +
      `┃ ⤷ .lowkey\n` +
      `┃ ⤷ .slay\n` +
      `┃ ⤷ .ghost\n` +
      `┃ ⤷ .toxic\n` +
      `┃ ⤷ .real\n` +
      `┃ ⤷ .sus\n` +
      `┃ ⤷ .caught\n` +
      `┃ ⤷ .clout\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━\n\n` +

      `*📱 MEDIA 📱*\n` +
      `┃\n` +
      `┃ ⤷ .upscale\n` +
      `┃ ⤷ .enhance\n` +
      `┃ ⤷ .remini\n` +
      `┃ ⤷ .removebg\n` +
      `┃ ⤷ .night\n` +
      `┃ ⤷ .sunset\n` +
      `┃ ⤷ .rain\n` +
      `┃\n` +
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
