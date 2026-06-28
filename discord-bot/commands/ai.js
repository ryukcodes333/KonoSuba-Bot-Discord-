const axios = require('axios')
const db = require('../database')

const POLLINATIONS_TEXT = 'https://text.pollinations.ai/'

const DEFAULT_SYSTEM = `You are a helpful, witty, and friendly AI assistant for a Discord server bot. Keep responses short and readable. Don't be overly formal.`

async function askAI(messages, model = 'openai') {
  const seed = Math.floor(Math.random() * 999999)
  const res = await axios.post(
    POLLINATIONS_TEXT,
    { messages, model, seed, private: true },
    { headers: { 'Content-Type': 'application/json' }, timeout: 35000, responseType: 'text' }
  )
  return typeof res.data === 'string' ? res.data.trim() : JSON.stringify(res.data)
}

async function genImage(prompt, model = 'flux') {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=${model}&seed=${Math.floor(Math.random() * 99999)}`
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 })
  return Buffer.from(res.data)
}

async function fetchNekoImg(type) {
  const res = await axios.get(`https://nekos.life/api/v2/img/${type}`, { timeout: 10000 })
  return res.data.url
}

async function sendAnimeImg(sock, jid, msg, type, caption) {
  try {
    const url = await fetchNekoImg(type)
    await msg.channel.send({ content: caption, files: [url] })
  } catch {
    await msg.reply(`🎭 ${caption}\n\n*(Image unavailable right now)*`)
  }
}

async function handleAiPersonaReply(sock, jid, msg, text, persona) {
  const axios_mod = require('axios')
  const GROQ_KEY = process.env.GROQ_KEY || ''
  if (!GROQ_KEY) return msg.reply('⚠️ GROQ_KEY not configured.')
  const systemPrompt = `You are ${persona.name}. Facts about you: ${(persona.facts || []).join('. ')}. Stay in character. Keep replies short (1-3 lines).`
  const res = await axios_mod.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: text }],
      max_tokens: 100,
      temperature: 0.9,
    },
    { headers: { Authorization: 'Bearer ' + GROQ_KEY }, timeout: 20000 }
  )
  const reply = res.data.choices[0].message.content.trim()
  await msg.reply(reply.slice(0, 1990))
}

module.exports = {
  handleAiPersonaReply,

  async ai({ sock, msg, jid, args, reply }) {
    const prompt = args.join(' ')
    if (!prompt) return reply('⚠️ Usage: `.ai <your question>`')
    await reply('🤖 Thinking...')
    try {
      const response = await askAI([
        { role: 'system', content: DEFAULT_SYSTEM },
        { role: 'user', content: prompt },
      ])
      await msg.channel.send(response.slice(0, 1990))
    } catch (e) {
      await msg.channel.send(`❌ AI error: ${e.message}`)
    }
  },

  async chatgpt(ctx) { return module.exports.ai(ctx) },
  async gpt(ctx) { return module.exports.ai(ctx) },

  async gemini({ args, msg, reply }) {
    const prompt = args.join(' ')
    if (!prompt) return reply('⚠️ Usage: `.gemini <prompt>`')
    await reply('♊ Thinking...')
    try {
      const response = await askAI([
        { role: 'system', content: DEFAULT_SYSTEM },
        { role: 'user', content: prompt },
      ], 'openai')
      await msg.channel.send(response.slice(0, 1990))
    } catch (e) {
      await msg.channel.send(`❌ Error: ${e.message}`)
    }
  },

  async llama({ args, msg, reply }) {
    const prompt = args.join(' ')
    if (!prompt) return reply('⚠️ Usage: `.llama <prompt>`')
    await reply('🦙 Thinking...')
    try {
      const response = await askAI([
        { role: 'system', content: DEFAULT_SYSTEM },
        { role: 'user', content: prompt },
      ], 'openai')
      await msg.channel.send(response.slice(0, 1990))
    } catch (e) {
      await msg.channel.send(`❌ Error: ${e.message}`)
    }
  },

  async deepseek(ctx) { return module.exports.llama(ctx) },
  async mistral(ctx) { return module.exports.llama(ctx) },
  async groq(ctx) { return module.exports.llama(ctx) },

  async flux({ args, msg, reply }) {
    const prompt = args.join(' ')
    if (!prompt) return reply('⚠️ Usage: `.flux <image description>`')
    await reply('🎨 Generating image...')
    try {
      const buf = await genImage(prompt, 'flux')
      await msg.channel.send({ files: [{ attachment: buf, name: 'generated.png' }] })
    } catch (e) {
      await msg.channel.send(`❌ Image error: ${e.message}`)
    }
  },

  async pixart(ctx) { return module.exports.flux(ctx) },
  async sdxl(ctx) { return module.exports.flux(ctx) },
  async pollinations(ctx) { return module.exports.flux(ctx) },
  async playground(ctx) { return module.exports.flux(ctx) },

  async waifu({ msg, reply }) {
    await sendAnimeImg(null, null, msg, 'waifu', '🌸 Waifu')
  },
  async neko({ msg, reply }) {
    await sendAnimeImg(null, null, msg, 'neko', '🐱 Neko')
  },

  async megumin({ msg, reply }) {
    try {
      const res = await axios.get('https://api.waifu.pics/sfw/pat', { timeout: 10000 })
      await msg.channel.send({ content: '💥 EXPLOSION!', files: [res.data.url] })
    } catch {
      await reply('💥 EXPLOSION! *(Megumin is too powerful to display right now)*')
    }
  },

  async aqua({ msg, reply }) {
    await reply('🌊 Aqua is here! Ask me anything by mentioning me or saying "aqua"!')
  },

  async aidetect({ msg, args, reply }) {
    const text = args.join(' ')
    if (!text) return reply('⚠️ Usage: `.aidetect <text>`')
    await reply('🔍 Analyzing...')
    try {
      const response = await askAI([
        { role: 'system', content: 'Determine if the following text was written by an AI or a human. Give a percentage confidence and brief explanation. Be direct.' },
        { role: 'user', content: text },
      ])
      await msg.channel.send(response.slice(0, 1990))
    } catch (e) {
      await msg.channel.send(`❌ Error: ${e.message}`)
    }
  },

  async aitrain({ args, isOwner, isMod, reply }) {
    if (!isOwner && !isMod) return reply('*🚫 Access Denied*')
    const sub = args[0]?.toLowerCase()
    if (sub === 'name') {
      const name = args.slice(1).join(' ')
      if (!name) return reply('❌ Usage: `.aitrain name <name>`')
      await db.updateAiPersona({ name })
      return reply(`✅ AI persona name set to *${name}*`)
    }
    if (sub === 'fact') {
      const fact = args.slice(1).join(' ')
      if (!fact) return reply('❌ Usage: `.aitrain fact <fact>`')
      await db.addAiPersonaFact(fact)
      return reply(`✅ Fact added to AI persona.`)
    }
    if (sub === 'clear') {
      await db.updateAiPersona({ facts: [] })
      return reply('✅ AI persona facts cleared.')
    }
    if (sub === 'show') {
      const p = await db.getAiPersona()
      return reply(`*AI Persona*\nName: ${p?.name || 'Not set'}\nFacts:\n${(p?.facts || []).map((f, i) => `${i + 1}. ${f}`).join('\n') || 'None'}`)
    }
    await reply('❌ Usage: `.aitrain name/fact/clear/show [value]`')
  },
}
