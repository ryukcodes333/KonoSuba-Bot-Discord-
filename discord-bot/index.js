const db = require('../database')

const econStatsCmds   = require('./economyStats')
const gtaCmds         = require('./gta')
const mainCmds        = require('./main')
const adminCmds       = require('./admin')
const economyCmds     = require('./economy')
const cardCmds        = require('./cards')
const pokemonCmds     = require('./pokemon')
const interactionCmds = require('./interactions')
const funCmds         = require('./fun')
const rpgCmds         = require('./rpg')
const chessCmds       = require('./chess')
const blackjackCmds   = require('./blackjack')
const unoCmds         = require('./uno')
const gambleCmds      = require('./gamble')
const summerCmds      = require('./summer')
const guildCmds       = require('./guilds')
const converterCmds   = require('./converter')
const staffCmds       = require('./staff')
const pollCmds        = require('./poll')
const lotteryCmds     = require('./lottery')
const profileCmds     = require('./profile')
const aiCmds          = require('./ai')
const utilityCmds     = require('./utility')
const imagesCmds      = require('./images')
const { alphaChatReply, aquaChatReply } = require('./chat')
const vibeCmds        = require('./vibe')
const amongusCmds     = require('./amongus')

const PREFIX = global.prefix || '.'
const OWNER_ID = process.env.OWNER_ID || ''

const spamTracker = {}

// Split long messages to respect Discord's 2000 char limit
async function safeSend(target, text, isReply = false) {
  if (!text || text.toString().trim() === '') return
  const str = text.toString()
  if (str.length <= 1990) {
    return isReply ? target.reply(str) : target.channel.send(str)
  }
  const chunks = []
  let remaining = str
  while (remaining.length > 0) {
    chunks.push(remaining.slice(0, 1990))
    remaining = remaining.slice(1990)
  }
  if (isReply) await target.reply(chunks[0])
  else await target.channel.send(chunks[0])
  for (let i = 1; i < chunks.length; i++) {
    await target.channel.send(chunks[i])
  }
}

// Build a fake WA-style sock wrapper around Discord APIs
function buildSock(client, message) {
  return {
    user: { id: client.user.id, tag: client.user.tag },
    // WA-style sendMessage translated to Discord
    sendMessage: async (channelId, content, opts) => {
      const channel = message.channel
      if (content.text) {
        const text = content.text.toString().slice(0, 1990)
        if (opts?.quoted) return message.reply(text)
        return channel.send(text)
      }
      if (content.image) {
        const files = [content.image.url || content.image]
        const text = content.caption ? content.caption.slice(0, 1990) : ''
        return channel.send({ content: text || null, files })
      }
      if (content.react) {
        return message.react(content.react.text).catch(() => {})
      }
      if (content.delete) {
        return message.delete().catch(() => {})
      }
    },
    // Guild member management
    groupParticipantsUpdate: async (guildId, userIds, action) => {
      const guild = message.guild
      if (!guild) return
      for (const userId of userIds) {
        const member = await guild.members.fetch(userId).catch(() => null)
        if (!member) continue
        if (action === 'remove') await member.kick().catch(() => {})
        if (action === 'promote') {
          const modRole = guild.roles.cache.find(r => r.name === 'Moderator' || r.name === 'Mod')
          if (modRole) await member.roles.add(modRole).catch(() => {})
        }
        if (action === 'demote') {
          const modRole = guild.roles.cache.find(r => r.name === 'Moderator' || r.name === 'Mod')
          if (modRole) await member.roles.remove(modRole).catch(() => {})
        }
      }
    },
    // Guild metadata (WA-style)
    groupMetadata: async (guildId) => {
      const guild = message.guild
      if (!guild) return null
      await guild.members.fetch().catch(() => {})
      return {
        id: guild.id,
        subject: guild.name,
        participants: guild.members.cache.map(m => ({
          id: m.id,
          admin: m.permissions.has('ManageMessages') ? 'admin' : null,
          lid: m.id,
        }))
      }
    },
  }
}

async function handleMessage(client, message) {
  const isGuild = message.guild !== null
  const senderId = message.author.id
  const displayName = message.member?.displayName || message.author.username
  const textRaw = message.content || ''
  const channelId = message.channel.id
  const guildId = message.guild?.id || senderId

  const isOwner = senderId === OWNER_ID

  let isMod = false
  let isGuardian = false
  if (!isOwner) {
    try {
      const staffUser = await db.getOrCreateUser(senderId).catch(() => null)
      isMod = staffUser?.role === 'mod'
      isGuardian = staffUser?.role === 'guardian'
    } catch {}
  }

  const sock = buildSock(client, message)

  const reply = async (text) => safeSend(message, text, true)
  const react = async (emoji) => message.react(emoji).catch(() => {})

  // Group-level settings
  if (isGuild && textRaw && !textRaw.startsWith(PREFIX)) {
    await db.logMessage(senderId, guildId).catch(() => {})

    const groupSettings = await db.getOrCreateGroup(guildId, message.guild?.name || '').catch(() => null)

    if (groupSettings?.antispam) {
      const now = Date.now()
      if (!spamTracker[senderId]) spamTracker[senderId] = []
      spamTracker[senderId] = spamTracker[senderId].filter(t => now - t < 5000)
      spamTracker[senderId].push(now)
      if (spamTracker[senderId].length > 6) {
        await message.channel.send(`⚠️ <@${senderId}> slow down!`)
        return
      }
    }

    if (groupSettings?.antilink) {
      const urlRegex = /https?:\/\/[^\s]+/gi
      if (urlRegex.test(textRaw)) {
        const hasManage = message.member?.permissions.has('ManageMessages')
        if (!hasManage && !isOwner && !isMod) {
          const action = groupSettings.antilink_action || 'warn'
          if (action === 'kick') {
            await message.member?.kick('Anti-link violation').catch(() => {})
            await message.channel.send(`❌ <@${senderId}> removed for posting a link.`)
          } else if (action === 'delete') {
            await message.delete().catch(() => {})
            await message.channel.send(`⚠️ <@${senderId}> link deleted!`)
          } else {
            await db.addWarning(senderId, guildId, 'Anti-link violation', 'bot')
            const total = await db.getWarnings(senderId, guildId)
            await message.delete().catch(() => {})
            await message.channel.send(`⚠️ <@${senderId}> warning #${total.length}`)
          }
          return
        }
      }
    }

    if (groupSettings?.cardspawn_enabled) {
      setImmediate(() => cardCmds.checkAutoSpawn(sock, guildId))
    }
  }

  // AFK return
  if (textRaw && !textRaw.startsWith(PREFIX)) {
    const afkRecord = await db.getAFK(senderId).catch(() => null)
    if (afkRecord) {
      const duration = Date.now() - new Date(afkRecord.since).getTime()
      const mins = Math.floor(duration / 60000)
      const hrs = Math.floor(mins / 60)
      const durationStr = hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`
      await db.removeAFK(senderId)
      await message.channel.send(`Welcome back ${displayName}-senpai! You were AFK for ${durationStr}\n> ${afkRecord.reason}`)
    }
  }

  // AFK mention notifications
  if (isGuild && textRaw && message.mentions.users.size > 0) {
    for (const [userId] of message.mentions.users) {
      const afkRecord = await db.getAFK(userId).catch(() => null)
      if (afkRecord) {
        await db.incrementAFKMentions(userId)
        await message.channel.send(`🔔 Please don't tag <@${userId}>-senpai! They are currently AFK.\n> Reason: ${afkRecord.reason}`)
      }
    }
  }

  // AI chat detection (bot mention or reply to bot)
  if (textRaw && !textRaw.startsWith(PREFIX)) {
    const isBotMentioned = message.mentions.has(client.user)
    const isReplyToBot = message.reference
      ? (await message.fetchReference().catch(() => null))?.author?.id === client.user.id
      : false
    const mentionsAlpha = /\balpha\b/i.test(textRaw)
    const mentionsAqua = /\baqua\b/i.test(textRaw)

    const persona = await db.getAiPersona().catch(() => null)
    const aiName = (persona?.name || '').trim().toLowerCase()
    const nameRegex = aiName ? new RegExp(`\\b${aiName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i') : null
    const mentionsAiName = nameRegex ? nameRegex.test(textRaw) : false

    const isDM = !isGuild
    const triggered = isDM || isBotMentioned || isReplyToBot || mentionsAiName || mentionsAlpha || mentionsAqua

    if (triggered) {
      const cleanText = textRaw.replace(`<@${client.user.id}>`, '').trim()
      if (isReplyToBot || isBotMentioned || (mentionsAqua && !mentionsAlpha)) {
        await aquaChatReply(sock, channelId, message, senderId, displayName, cleanText || textRaw)
      } else if (persona?.name && mentionsAiName) {
        try {
          await aiCmds.handleAiPersonaReply(sock, channelId, message, cleanText || textRaw, persona)
        } catch (e) {
          console.error('[AI Persona] reply error:', e.message)
        }
      } else {
        await alphaChatReply(sock, channelId, message, senderId, displayName, cleanText || textRaw, isOwner)
      }
      return
    }
  }

  // Only handle prefix commands from here
  if (!textRaw.startsWith(PREFIX)) return

  const body = textRaw.slice(PREFIX.length).trim()
  if (!body) return
  const args = body.split(/\s+/)
  const cmd = args.shift().toLowerCase()

  // Yes/No pay confirmation
  if (cmd === 'yes' || cmd === 'no') {
    try {
      const handled = await economyCmds.handlePayConfirm(senderId, cmd === 'yes', { sock, msg: message, jid: channelId })
      if (handled) return
    } catch {}
  }

  // Chess accept
  if (cmd === 'accept') {
    const game = chessCmds.chessGames?.get(channelId)
    if (game?.status === 'pending') {
      await chessCmds.accept({ sock, msg: message, jid: channelId, senderJid: senderId, sender: senderId, reply })
      return
    }
  }

  // Chess move
  if (isGuild && chessCmds.chessGames?.has(channelId)) {
    const chessMove = body.trim().match(/^([a-h][1-8])[\s-]?([a-h][1-8])$/i)
    const isResign = body.trim().toLowerCase() === 'resign'
    if (chessMove || isResign) {
      const handled = await chessCmds.handleMove(sock, channelId, senderId, body.trim()).catch(() => false)
      if (handled) return
    }
  }

  // Look up user
  const user = await db.getOrCreateUser(senderId, displayName).catch(() => null)

  if (user?.banned && !isOwner) return

  // Suspension check
  if (!isOwner && cmd !== 'p' && cmd !== 'profile') {
    const suspension = await db.getSuspension(senderId).catch(() => null)
    if (suspension) {
      const until = new Date(suspension.suspended_until).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
      })
      await reply(
        `*You are currently suspended from using this bot.*\n\n` +
        `*⏳ Suspension Ends:* ${until}\n` +
        `*📋 Reason:* ${suspension.reason || 'No reason given'}\n\n` +
        `> Contact a staff if you think this was a mistake.`
      )
      return
    }
  }

  const disabledCmds = await db.getDisabledCommands().catch(() => [])
  if (disabledCmds.some(d => d.command === cmd) && !isOwner) {
    await reply(`⚠️ *.${cmd}* is currently disabled.`)
    return
  }

  const isDbReady = db.mongoose.connection.readyState === 1

  const NO_DB_CMDS = new Set([
    'menu','help','ping','uptime','botstatus','info','status','alive','version','speed',
    'sticker','s','translate','tr','tts','say','weather','wiki','google',
    'lyrics','movie','ytsearch',
    'ai','chatgpt','gpt','gemini','llama','deepseek','mistral','groq',
    'flux','pixart','sdxl','pollinations','playground',
    'waifu','neko','animesearch','animekill','animebite','animewave','animewink','animebonk',
    'megumin','mikasa','naruto','sasuke','itachi','madara','gojo','nezuko','kurumi','onepiece','yumeko',
    'lotterystart','lotteryjoin','lotterystatus','lotterydraw','lotteryend','lottery',
    'poll','pollresult','trivia','math','fact','joke','flip','8ball','roll','choose',
    'removebg','nobg',
    'register','reg','start','p','profile','bal','balance','menu',
    'myid','id','signup',
  ])

  if (!isDbReady && !NO_DB_CMDS.has(cmd)) {
    await reply('⚠️ Database is not connected. Please wait a moment and try again.')
    return
  }

  // Build the context object (compatible with all WA command files)
  const ctx = {
    sock,
    msg: message,
    jid: channelId,
    senderJid: senderId,
    sender: senderId,
    args,
    cmd,
    user,
    isGroup: isGuild,
    isOwner,
    isMod,
    isGuardian,
    PREFIX,
    pushName: displayName,
    msgType: 'text',
    textRaw,
    reply,
    react,
  }

  // ── Command routing ──────────────────────────────────────────────────────

  // Main / info commands
  if (mainCmds[cmd]) { await mainCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Admin commands
  if (adminCmds[cmd]) { await adminCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Economy
  if (economyCmds[cmd]) { await economyCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Cards
  if (cardCmds[cmd]) { await cardCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Games

  // Pokemon
  if (pokemonCmds[cmd]) { await pokemonCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Interactions
  if (interactionCmds[cmd]) { await interactionCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Fun
  if (funCmds[cmd]) { await funCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // RPG
  if (rpgCmds[cmd]) { await rpgCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Chess
  if (chessCmds[cmd]) { await chessCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Blackjack
  if (blackjackCmds[cmd]) { await blackjackCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // UNO
  if (unoCmds[cmd]) { await unoCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Gamble
  if (gambleCmds[cmd]) { await gambleCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Summer
  if (summerCmds[cmd]) { await summerCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Guilds
  if (guildCmds[cmd]) { await guildCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Converter
  if (converterCmds[cmd]) { await converterCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Staff
  if (staffCmds[cmd]) { await staffCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Poll
  if (pollCmds[cmd]) { await pollCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Lottery
  if (lotteryCmds[cmd]) { await lotteryCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Profile
  if (profileCmds[cmd]) { await profileCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // AI commands
  if (aiCmds[cmd]) { await aiCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Utility
  if (utilityCmds[cmd]) { await utilityCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Images
  if (imagesCmds[cmd]) { await imagesCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Vibe
  if (vibeCmds[cmd]) { await vibeCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Among Us
  if (amongusCmds[cmd]) { await amongusCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // Economy stats
  if (econStatsCmds[cmd]) { await econStatsCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }

  // GTA
  if (gtaCmds[cmd]) { await gtaCmds[cmd](ctx).catch(e => reply(`❌ Error: ${e.message}`)); return }
}

module.exports = { handleMessage }
