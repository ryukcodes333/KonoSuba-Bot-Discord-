const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js')

require('./web')

const { handleMessage } = require('./commands/index')

const PREFIX = '.'
const BOT_NAME = 'Aqua'
const START_TIME = Date.now()

global.botStartTime = START_TIME
global.botName = BOT_NAME
global.prefix = PREFIX
global.botConnected = false

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason?.message || reason)
})
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err?.message || err)
})

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Channel, Partials.Message],
})

global.discordClient = client

client.once('ready', () => {
  global.botConnected = true
  console.log(`\n✅ Konosuba Bot (${BOT_NAME}) is ONLINE! 🌑`)
  console.log(`🤖 Logged in as: ${client.user.tag}\n`)

  client.user.setActivity('Konosuba Community | .menu', { type: ActivityType.Watching })

  try {
    const { autoStartLottery } = require('./commands/lottery')
    autoStartLottery('$100,000 Cash', 10)
    console.log('🎰 Auto-lottery started!')
  } catch (e) {
    console.error('Auto-lottery error:', e.message)
  }
})

client.on('messageCreate', async (message) => {
  if (message.author.bot) return
  try {
    await handleMessage(client, message)
  } catch (err) {
    console.error('Message handler error:', err.message)
  }
})

client.on('guildMemberAdd', async (member) => {
  try {
    const db = require('./database')
    const guild = member.guild
    const guildSettings = await db.getGroup(guild.id).catch(() => null)
    if (!guildSettings?.welcome) return

    const channel = guild.systemChannel || guild.channels.cache.find(c => c.name === 'general')
    if (!channel) return

    const text = (guildSettings.welcome_msg ||
      `Hello there <@${member.id}> we are happy to have you in **${guild.name}**!`)
      .replace('<user>', `<@${member.id}>`)
      .replace('<group>', guild.name)

    await channel.send(text)
  } catch (e) {
    console.error('Guild member add error:', e.message)
  }
})

client.on('guildMemberRemove', async (member) => {
  try {
    const db = require('./database')
    const guild = member.guild
    const guildSettings = await db.getGroup(guild.id).catch(() => null)
    if (!guildSettings?.leave) return

    const channel = guild.systemChannel || guild.channels.cache.find(c => c.name === 'general')
    if (!channel) return

    const text = (guildSettings.leave_msg || `Sayonara **${member.displayName}** we will miss you`)
      .replace('<user>', member.displayName)

    await channel.send(text)
  } catch (e) {
    console.error('Guild member remove error:', e.message)
  }
})

const TOKEN = process.env.DISCORD_TOKEN
if (!TOKEN) {
  console.error('❌ DISCORD_TOKEN environment variable is not set!')
  console.error('   Set it in your environment and restart.')
  process.exit(1)
}

console.log('🌑 Konosuba Bot starting…')
client.login(TOKEN).catch(err => {
  console.error('Fatal login error:', err.message)
  process.exit(1)
})
