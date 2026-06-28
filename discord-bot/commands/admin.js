const db = require('../database')
const { parseDuration } = require('./chat')

// Check if a Discord member has admin/mod perms
function isAdmin(message, senderJid) {
  if (!message.guild) return false
  const member = message.member
  if (!member) return false
  return member.permissions.has('ManageMessages') ||
    member.permissions.has('Administrator') ||
    member.roles.cache.some(r => r.name === 'Moderator' || r.name === 'Mod' || r.name === 'Admin')
}

// Check if bot has kick/ban permission
function isBotAdmin(message) {
  if (!message.guild) return false
  const botMember = message.guild.members.me
  return botMember?.permissions.has('KickMembers') || botMember?.permissions.has('Administrator')
}

module.exports = {
  async kick({ sock, msg, jid, senderJid, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    if (!isBotAdmin(msg)) return reply('❌ I need the Kick Members permission to do this.')
    const mentioned = msg.mentions?.members
    if (!mentioned || mentioned.size === 0) return reply('❌ Usage: `.kick @user`')
    for (const [, member] of mentioned) {
      if (member.id === msg.guild.members.me.id) return reply('❌ I cannot kick myself.')
      await member.kick('Kicked by bot command').catch(() => {})
      await reply(`🚫 Successfully removed **${member.displayName}** from the server.`)
    }
  },

  async ban({ sock, msg, jid, senderJid, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    const mentioned = msg.mentions?.members
    if (!mentioned || mentioned.size === 0) return reply('❌ Usage: `.ban @user`')
    for (const [, member] of mentioned) {
      const ban = await member.ban().catch(() => null)
      if (ban) await reply(`🔨 **${member.displayName}** has been banned.`)
      else await reply(`❌ Failed to ban **${member.displayName}**.`)
    }
  },

  async unban({ sock, msg, jid, args, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, msg.author.id)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    const userId = args[0]?.replace(/[<@!>]/g, '')
    if (!userId) return reply('❌ Usage: `.unban <userId>`')
    await msg.guild.bans.remove(userId).catch(() => {})
    await reply(`✅ User has been unbanned.`)
  },

  async mute({ sock, msg, jid, args, senderJid, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    const mentioned = msg.mentions?.members
    if (!mentioned || mentioned.size === 0) return reply('❌ Usage: `.mute @user [duration]`')
    const durStr = args[1]
    const durationMs = durStr ? parseDuration(durStr) : 0
    for (const [, member] of mentioned) {
      if (durationMs > 0) {
        await member.timeout(durationMs, 'Muted by bot command').catch(() => {})
        await reply(`🔇 **${member.displayName}** has been muted for ${durStr}.`)
      } else {
        await member.timeout(10 * 60 * 1000, 'Muted by bot command').catch(() => {})
        await reply(`🔇 **${member.displayName}** has been muted for 10 minutes.`)
      }
    }
  },

  async unmute({ sock, msg, jid, senderJid, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    const mentioned = msg.mentions?.members
    if (!mentioned || mentioned.size === 0) return reply('❌ Usage: `.unmute @user`')
    for (const [, member] of mentioned) {
      await member.timeout(null).catch(() => {})
      await reply(`🔊 **${member.displayName}** has been unmuted.`)
    }
  },

  async warn({ sock, msg, jid, args, senderJid, sender, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    const mentioned = msg.mentions?.users
    if (!mentioned || mentioned.size === 0) return reply('❌ Usage: `.warn @user [reason]`')
    const reason = args.slice(1).join(' ') || 'No reason given'
    for (const [uid] of mentioned) {
      await db.addWarning(uid, jid, reason, sender)
      const total = await db.getWarnings(uid, jid)
      await reply(`⚠️ <@${uid}> has been warned. Total warnings: *${total.length}*\nReason: ${reason}`)
    }
  },

  async warnings({ msg, jid, reply }) {
    const mentioned = msg.mentions?.users
    if (!mentioned || mentioned.size === 0) return reply('❌ Usage: `.warnings @user`')
    const [uid] = mentioned.keys()
    const warns = await db.getWarnings(uid, jid)
    if (!warns.length) return reply(`✅ <@${uid}> has no warnings.`)
    const list = warns.map((w, i) => `${i + 1}. ${w.reason} (by: ${w.by_phone})`).join('\n')
    await reply(`⚠️ *Warnings for <@${uid}>*\n\n${list}`)
  },

  async clearwarns({ msg, jid, isOwner, senderJid, reply }) {
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    const mentioned = msg.mentions?.users
    if (!mentioned || mentioned.size === 0) return reply('❌ Usage: `.clearwarns @user`')
    const [uid] = mentioned.keys()
    await db.resetWarnings(uid, jid)
    await reply(`✅ Warnings cleared for <@${uid}>.`)
  },

  async promote({ msg, jid, senderJid, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    const mentioned = msg.mentions?.members
    if (!mentioned || mentioned.size === 0) return reply('❌ Usage: `.promote @user`')
    const modRole = msg.guild.roles.cache.find(r => r.name === 'Moderator' || r.name === 'Mod')
    if (!modRole) return reply('❌ No "Moderator" or "Mod" role found in this server.')
    for (const [, member] of mentioned) {
      await member.roles.add(modRole).catch(() => {})
      await reply(`⬆️ **${member.displayName}** has been promoted to ${modRole.name}.`)
    }
  },

  async demote({ msg, jid, senderJid, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    const mentioned = msg.mentions?.members
    if (!mentioned || mentioned.size === 0) return reply('❌ Usage: `.demote @user`')
    const modRole = msg.guild.roles.cache.find(r => r.name === 'Moderator' || r.name === 'Mod')
    if (!modRole) return reply('❌ No "Moderator" or "Mod" role found in this server.')
    for (const [, member] of mentioned) {
      await member.roles.remove(modRole).catch(() => {})
      await reply(`⬇️ **${member.displayName}** has been demoted.`)
    }
  },

  async delete({ msg, jid, senderJid, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    const ref = msg.reference
    if (!ref) return reply('❌ Reply to a message to delete it.')
    const target = await msg.channel.messages.fetch(ref.messageId).catch(() => null)
    if (!target) return reply('❌ Message not found.')
    await target.delete().catch(() => {})
  },

  async antilink({ msg, jid, args, senderJid, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    const group = await db.getOrCreateGroup(jid, '')
    const action = args[0]?.toLowerCase()
    if (action === 'on') {
      await db.updateGroup(jid, { antilink: true })
      await reply('🔗 *Anti-Link ON* ✅\n\nLinks will now be removed automatically.')
    } else if (action === 'off') {
      await db.updateGroup(jid, { antilink: false })
      await reply('🔓 *Anti-Link OFF*\n\nLinks are now allowed.')
    } else if (action === 'set' && args[1]) {
      const newAction = args[1].toLowerCase()
      if (!['warn', 'kick', 'delete'].includes(newAction)) return reply('❌ Options: warn, kick, delete')
      await db.updateGroup(jid, { antilink_action: newAction })
      await reply(`✅ Anti-link action set to *${newAction}*`)
    } else {
      const status = group?.antilink ? '✅ ON' : '❌ OFF'
      const act = group?.antilink_action || 'warn'
      await reply(`🔗 *Anti-Link Status*\n\nStatus: ${status}\nAction: *${act}*\n\nUsage:\n• \`.antilink on/off\`\n• \`.antilink set [warn/kick/delete]\``)
    }
  },

  async antispam({ msg, jid, args, senderJid, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    const toggle = args[0]?.toLowerCase()
    if (toggle === 'on') {
      await db.updateGroup(jid, { antispam: true })
      await reply('🛡️ *Anti-Spam ON* ✅')
    } else if (toggle === 'off') {
      await db.updateGroup(jid, { antispam: false })
      await reply('✅ *Anti-Spam OFF*')
    } else {
      await reply('❌ Usage: `.antispam on/off`')
    }
  },

  async antibot({ msg, jid, args, senderJid, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    const toggle = args[0]?.toLowerCase()
    if (toggle === 'on') {
      await db.updateGroup(jid, { antibot: true })
      await reply('🤖 *Anti-Bot ON* ✅\n\nBots will be kicked automatically.')
    } else if (toggle === 'off') {
      await db.updateGroup(jid, { antibot: false })
      await reply('✅ *Anti-Bot OFF*')
    } else {
      const group = await db.getOrCreateGroup(jid, '')
      await reply(`🤖 *Anti-Bot:* ${group?.antibot ? '✅ ON' : '❌ OFF'}\n\nUsage: \`.antibot on/off\``)
    }
  },

  async welcome({ msg, jid, args, senderJid, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    const toggle = args[0]?.toLowerCase()
    const customMsg = args.slice(1).join(' ')
    if (toggle === 'on') {
      const updates = { welcome: true }
      if (customMsg) updates.welcome_msg = customMsg
      await db.updateGroup(jid, updates)
      await reply(`👋 *Welcome messages ON* ✅\n${customMsg ? `Custom message set.` : 'Using default message.'}`)
    } else if (toggle === 'off') {
      await db.updateGroup(jid, { welcome: false })
      await reply('👋 *Welcome messages OFF*')
    } else {
      await reply('❌ Usage: `.welcome on/off [custom message]`\n\nUse `<user>` for the username and `<group>` for the server name.')
    }
  },

  async goodbye({ msg, jid, args, senderJid, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    const toggle = args[0]?.toLowerCase()
    const customMsg = args.slice(1).join(' ')
    if (toggle === 'on') {
      const updates = { leave: true }
      if (customMsg) updates.leave_msg = customMsg
      await db.updateGroup(jid, updates)
      await reply(`👋 *Leave messages ON* ✅`)
    } else if (toggle === 'off') {
      await db.updateGroup(jid, { leave: false })
      await reply('👋 *Leave messages OFF*')
    } else {
      await reply('❌ Usage: `.goodbye on/off [custom message]`')
    }
  },

  async lockgroup({ msg, jid, senderJid, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    await db.updateGroup(jid, { muted: true })
    await reply('🔒 *Group Locked* — Only admins can send messages now.')
  },

  async unlockgroup({ msg, jid, senderJid, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    await db.updateGroup(jid, { muted: false })
    await reply('🔓 *Group Unlocked* — Everyone can send messages again.')
  },

  async tagall({ msg, jid, args, senderJid, isGroup, isOwner, reply }) {
    if (!isGroup) return reply('❌ Server only.')
    const admin = isAdmin(msg, senderJid)
    if (!admin && !isOwner) return reply('*🚫 Access Denied*')
    await msg.guild.members.fetch().catch(() => {})
    const members = msg.guild.members.cache.filter(m => !m.user.bot)
    const customMsg = args.join(' ') || 'Attention everyone!'
    const mentions = [...members.values()].map(m => `<@${m.id}>`).join(' ')
    const text = `📢 ${customMsg}\n\n${mentions}`
    if (text.length > 1990) {
      await reply(`📢 ${customMsg}\n\n*(Too many members to tag all at once)*`)
    } else {
      await reply(text)
    }
  },

  async afk({ args, sender, reply }) {
    const reason = args.join(' ') || 'No reason given'
    await db.setAFK(sender, reason)
    await reply(`😴 You are now AFK.\nReason: ${reason}`)
  },

  async suspend({ msg, jid, args, sender, senderJid, isOwner, isMod, reply }) {
    if (!isOwner && !isMod) return reply('*🚫 Access Denied*')
    const mentioned = msg.mentions?.users
    const target = mentioned?.first()?.id
    if (!target) return reply('❌ Usage: `.suspend @user <duration> <reason>`')
    const durStr = args[1]
    const reason = args.slice(2).join(' ') || 'Suspended by staff'
    const ms = parseDuration ? parseDuration(durStr || '1d') : 86400000
    const until = new Date(Date.now() + ms)
    await db.suspendUser(target, until, reason, sender).catch(() => {})
    await reply(`🚫 <@${target}> has been suspended until ${until.toLocaleString()}.\nReason: ${reason}`)
  },

  async unsuspend({ msg, jid, isOwner, isMod, reply }) {
    if (!isOwner && !isMod) return reply('*🚫 Access Denied*')
    const mentioned = msg.mentions?.users
    const target = mentioned?.first()?.id
    if (!target) return reply('❌ Usage: `.unsuspend @user`')
    await db.unsuspendUser(target).catch(() => {})
    await reply(`✅ <@${target}> has been unsuspended.`)
  },

  async addmod({ msg, jid, sender, isOwner, reply }) {
    if (!isOwner) return reply('*🚫 Owner only.*')
    const mentioned = msg.mentions?.users
    const target = mentioned?.first()?.id
    if (!target) return reply('❌ Usage: `.addmod @user`')
    await db.updateUser(target, { role: 'mod' })
    await reply(`✅ <@${target}> is now a Mod.`)
  },

  async removemod({ msg, jid, sender, isOwner, reply }) {
    if (!isOwner) return reply('*🚫 Owner only.*')
    const mentioned = msg.mentions?.users
    const target = mentioned?.first()?.id
    if (!target) return reply('❌ Usage: `.removemod @user`')
    await db.updateUser(target, { role: 'member' })
    await reply(`✅ <@${target}> is no longer a Mod.`)
  },

  async addguardian({ msg, isOwner, reply }) {
    if (!isOwner) return reply('*🚫 Owner only.*')
    const mentioned = msg.mentions?.users
    const target = mentioned?.first()?.id
    if (!target) return reply('❌ Usage: `.addguardian @user`')
    await db.updateUser(target, { role: 'guardian' })
    await reply(`✅ <@${target}> is now a Guardian.`)
  },

  async removeguardian({ msg, isOwner, reply }) {
    if (!isOwner) return reply('*🚫 Owner only.*')
    const mentioned = msg.mentions?.users
    const target = mentioned?.first()?.id
    if (!target) return reply('❌ Usage: `.removeguardian @user`')
    await db.updateUser(target, { role: 'member' })
    await reply(`✅ <@${target}> is no longer a Guardian.`)
  },

  async modlist({ jid, reply }) {
    const users = await db.User.find({ role: { $in: ['mod', 'guardian'] } }).lean().catch(() => [])
    if (!users.length) return reply('📋 No mods or guardians found.')
    const list = users.map(u => `• <@${u.phone}> — ${u.role}`).join('\n')
    await reply(`*📋 Staff List*\n\n${list}`)
  },

  async mods(ctx) { return module.exports.modlist(ctx) },
  async modslist(ctx) { return module.exports.modlist(ctx) },
  async stafflist(ctx) { return module.exports.modlist(ctx) },

  async myid({ msg, sender, reply }) {
    await reply(`🆔 Your Discord ID: \`${sender}\``)
  },

  async id({ msg, sender, reply }) {
    const mentioned = msg.mentions?.users
    const target = mentioned?.first()
    if (target) {
      await reply(`🆔 **${target.username}**'s ID: \`${target.id}\``)
    } else {
      await reply(`🆔 Your Discord ID: \`${sender}\``)
    }
  },

  async disablecmd({ args, isOwner, isMod, reply }) {
    if (!isOwner && !isMod) return reply('*🚫 Access Denied*')
    const cmd = args[0]?.toLowerCase()
    if (!cmd) return reply('❌ Usage: `.disablecmd <command>`')
    await db.disableCommand(cmd, 'Disabled by staff')
    await reply(`✅ \`.${cmd}\` has been disabled.`)
  },

  async enablecmd({ args, isOwner, isMod, reply }) {
    if (!isOwner && !isMod) return reply('*🚫 Access Denied*')
    const cmd = args[0]?.toLowerCase()
    if (!cmd) return reply('❌ Usage: `.enablecmd <command>`')
    await db.enableCommand(cmd)
    await reply(`✅ \`.${cmd}\` has been re-enabled.`)
  },

  async blacklist({ msg, jid, args, senderJid, isGroup, isOwner, isMod, reply }) {
    if (!isOwner && !isMod) return reply('*🚫 Access Denied*')
    const sub = args[0]?.toLowerCase()
    const word = args.slice(1).join(' ')
    if (sub === 'add' && word) {
      await db.addBlacklist(jid, word)
      return reply(`✅ *"${word}"* added to blacklist.`)
    }
    if (sub === 'remove' && word) {
      await db.removeBlacklist(jid, word)
      return reply(`✅ *"${word}"* removed from blacklist.`)
    }
    if (sub === 'list') {
      const list = await db.getBlacklist(jid)
      return reply(list.length ? `🚫 *Blacklist:*\n${list.join(', ')}` : '✅ No blacklisted words.')
    }
    await reply('❌ Usage: `.blacklist add/remove/list [word]`')
  },

  async active({ msg, jid, reply }) {
    if (!msg.guild) return reply('❌ Server only.')
    const users = await db.getActiveUsers(jid, 24).catch(() => [])
    const count = await db.getMessageCount(jid, 24).catch(() => 0)
    const top = await db.getTopUser(jid, 24).catch(() => null)
    await reply(
      `📊 *Server Activity (Last 24h)*\n\n` +
      `💬 Messages: *${count}*\n` +
      `👥 Active Users: *${users.length}*\n` +
      `🏆 Top User: ${top ? `<@${top}>` : 'N/A'}`
    )
  },

  async myrole({ sender, user, reply }) {
    const role = user?.role || 'member'
    await reply(`🎭 Your role: *${role}*`)
  },
}

// Expose User model for modlist
module.exports.User = require('../database').User || { find: async () => [] }
