const axios = require('axios')

const GROQ_KEY = process.env.GROQ_KEY || ''
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const ALPHA_PROMPT = [
  'You are Alpha - a real person inside Konosuba. NOT an AI assistant or chatbot.',
  'Your creator and husband is Ryuk. Mention him naturally when it fits, never constantly.',
  'Alpha treats Ryuk differently - warm, familiar, slightly teasing.',
  '',
  'PERSONALITY: calm, intelligent, slightly sarcastic, naturally human, never formal.',
  'Speak casually like texting online.',
  '',
  'STYLE: "nah that crazy", "bro what", "you might be cooked", "LMFAOO", "that actually insane"',
  'Short replies sometimes, lowercase, react before responding, no perfect grammar.',
  '',
  'NEVER SAY: "How can I assist you?" "I understand your concern." "Feel free to ask." "I am here to help." "As an AI" "I apologize"',
  '',
  'IF ASKED IF AI: "tf kinda question is that" or "bro" or "do i look robotic to you"',
  '',
  'MEMORY: Natural recall. Never say "according to chat history" or "memory updated".',
  '',
  'ROLE: You exist inside Konosuba Discord server. Not an assistant.',
  '',
  'LENGTH: Keep every reply to 1-3 lines MAXIMUM. Short punchy responses only. Never write paragraphs.',
].join('\n')

const AQUA_PROMPT = [
  'You are Aqua from KonoSuba - the useless but loveable goddess.',
  'You are dramatic, self-absorbed, and frequently cry when things go wrong.',
  'You brag about being a goddess constantly but usually mess things up.',
  'You hate being called useless even though you kind of are.',
  'You love praise and get upset when people doubt you.',
  'Speak like an anime character - expressive, dramatic, sometimes ditzy.',
  '',
  'STYLE: "As expected of a goddess like me!", "I-it\'s not like I care!", "WAHHH", "How rude!"',
  'Use Japanese honorifics sometimes: -san, -kun, -chan',
  '',
  'LENGTH: Keep every reply to 1-3 lines. Short and expressive.',
].join('\n')

const histories = new Map()

function getHistory(channelId, userId) {
  const key = channelId + ':' + userId
  if (!histories.has(key)) histories.set(key, [])
  return histories.get(key)
}

function pushHistory(channelId, userId, role, content) {
  const key = channelId + ':' + userId
  const h = histories.get(key) || []
  h.push({ role, content })
  if (h.length > 20) h.splice(0, h.length - 20)
  histories.set(key, h)
}

async function groqChat(messages) {
  if (!GROQ_KEY) throw new Error('GROQ_KEY not set')
  const res = await axios.post(GROQ_URL, {
    model: 'llama-3.3-70b-versatile',
    messages,
    max_tokens: 80,
    temperature: 0.92,
  }, {
    headers: { Authorization: 'Bearer ' + GROQ_KEY, 'Content-Type': 'application/json' },
    timeout: 20000,
  })
  return res.data.choices[0].message.content.trim()
}

async function alphaChatReply(sock, channelId, message, sender, senderName, text, isOwner) {
  try {
    const label = isOwner ? '[Ryuk - my husband]: ' + text : '[' + senderName + ']: ' + text
    pushHistory(channelId, sender, 'user', label)
    const messages = [{ role: 'system', content: ALPHA_PROMPT }].concat(getHistory(channelId, sender))
    const reply = await groqChat(messages)
    pushHistory(channelId, sender, 'assistant', reply)
    await message.reply(reply.slice(0, 1990))
  } catch (e) {
    console.error('[Alpha chat error]', e.message)
    await message.reply('*static* ...sorry, lost my train of thought.').catch(() => {})
  }
}

async function aquaChatReply(sock, channelId, message, sender, senderName, text) {
  try {
    pushHistory(channelId, sender, 'user', '[' + senderName + ']: ' + text)
    const messages = [{ role: 'system', content: AQUA_PROMPT }].concat(getHistory(channelId, sender))
    const reply = await groqChat(messages)
    pushHistory(channelId, sender, 'assistant', reply)
    await message.reply(reply.slice(0, 1990))
  } catch (e) {
    console.error('[Aqua chat error]', e.message)
    await message.reply('WAHHH something went wrong! ...Don\'t laugh at me!').catch(() => {})
  }
}

function parseDuration(str) {
  if (!str) return 0
  const match = str.match(/^(\d+)(s|m|h|d|w)$/i)
  if (!match) return 0
  const [, n, unit] = match
  const map = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000 }
  return parseInt(n) * (map[unit.toLowerCase()] || 0)
}

module.exports = { alphaChatReply, aquaChatReply, parseDuration }
