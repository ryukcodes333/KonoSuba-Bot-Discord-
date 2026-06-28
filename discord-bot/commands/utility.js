const axios = require('axios')

module.exports = {
  async translate({ reply, args }) {
    const text = args.slice(1).join(' ')
    const lang = args[0]?.toLowerCase() || 'en'
    if (!text) return reply('⚠️ Usage: `.translate <lang> <text>`\n\nExample: `.translate fr Hello world`')
    try {
      const res = await axios.get(`https://api.mymemory.translated.net/get`, {
        params: { q: args.slice(1).join(' '), langpair: `auto|${lang}` },
        timeout: 10000,
      })
      const result = res.data?.responseData?.translatedText
      if (!result) return reply('📚 Unsupported language or nothing to translate.')
      await reply(
        `🌐 *Translation Complete*\n\n` +
        `📝 Original: ${args.slice(1).join(' ')}\n\n` +
        `🔄 ${lang.toUpperCase()}: ${result}`
      )
    } catch (e) { await reply(`⚠️ Failed: ${e.message}`) }
  },
  async tr(ctx) { return module.exports.translate(ctx) },

  async tts({ reply, args }) {
    const text = args.join(' ')
    if (!text) return reply('⚠️ Usage: `.tts <text>`')
    const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(text.slice(0, 200))}`
    try {
      const { msg } = arguments[0]
      await msg.channel.send({ content: `🔊 TTS: *${text.slice(0, 100)}*`, files: [url] })
    } catch (e) {
      await reply(`❌ TTS failed: ${e.message}`)
    }
  },

  async weather({ args, reply }) {
    const city = args.join(' ')
    if (!city) return reply('⚠️ Usage: `.weather <city>`')
    try {
      const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, { timeout: 10000 })
      const data = res.data
      const current = data.current_condition[0]
      const area = data.nearest_area[0]
      const areaName = area.areaName[0].value
      const country = area.country[0].value
      const desc = current.weatherDesc[0].value
      const tempC = current.temp_C
      const tempF = current.temp_F
      const feels = current.FeelsLikeC
      const humidity = current.humidity
      const wind = current.windspeedKmph
      await reply(
        `🌤️ *Weather in ${areaName}, ${country}*\n\n` +
        `📍 Condition: ${desc}\n` +
        `🌡️ Temp: ${tempC}°C / ${tempF}°F\n` +
        `🤔 Feels like: ${feels}°C\n` +
        `💧 Humidity: ${humidity}%\n` +
        `💨 Wind: ${wind} km/h`
      )
    } catch (e) { await reply(`❌ Weather not found for "${city}".`) }
  },

  async wiki({ args, reply }) {
    const query = args.join(' ')
    if (!query) return reply('⚠️ Usage: `.wiki <topic>`')
    try {
      const res = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
        { timeout: 10000 }
      )
      const data = res.data
      const title = data.title
      const extract = data.extract?.slice(0, 600) || 'No summary available.'
      const url = data.content_urls?.desktop?.page || ''
      await reply(`📚 *${title}*\n\n${extract}${url ? `\n\n🔗 ${url}` : ''}`)
    } catch { await reply(`❌ Nothing found for "${query}".`) }
  },

  async google({ args, reply }) {
    const query = args.join(' ')
    if (!query) return reply('⚠️ Usage: `.google <query>`')
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`
    await reply(`🔍 Google: ${url}`)
  },

  async lyrics({ args, reply }) {
    const query = args.join(' ')
    if (!query) return reply('⚠️ Usage: `.lyrics <song name>`')
    try {
      const res = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`, { timeout: 10000 })
      const data = res.data
      if (!data.lyrics) return reply('❌ Lyrics not found.')
      const lyrics = data.lyrics.slice(0, 1800)
      await reply(`🎵 *${data.title}* by *${data.author}*\n\n${lyrics}${data.lyrics.length > 1800 ? '\n...(truncated)' : ''}`)
    } catch (e) { await reply(`❌ Lyrics error: ${e.message}`) }
  },

  async movie({ args, reply }) {
    const query = args.join(' ')
    if (!query) return reply('⚠️ Usage: `.movie <title>`')
    try {
      const res = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=trilogy`, { timeout: 10000 })
      const d = res.data
      if (d.Response === 'False') return reply(`❌ Movie not found: "${query}"`)
      await reply(
        `🎬 *${d.Title}* (${d.Year})\n\n` +
        `⭐ Rating: ${d.imdbRating}/10\n` +
        `🎭 Genre: ${d.Genre}\n` +
        `👥 Cast: ${d.Actors}\n` +
        `📝 ${d.Plot?.slice(0, 300)}`
      )
    } catch (e) { await reply(`❌ Error: ${e.message}`) }
  },

  async ytsearch({ args, reply }) {
    const query = args.join(' ')
    if (!query) return reply('⚠️ Usage: `.ytsearch <query>`')
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
    await reply(`📺 YouTube Search:\n${url}`)
  },

  async trivia({ reply }) {
    try {
      const res = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple', { timeout: 10000 })
      const q = res.data.results[0]
      const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
      const question = decode(q.question)
      const correct = decode(q.correct_answer)
      const options = [correct, ...q.incorrect_answers.map(decode)].sort(() => Math.random() - 0.5)
      const labels = ['A', 'B', 'C', 'D']
      const formatted = options.map((o, i) => `${labels[i]}. ${o}`).join('\n')
      const correctLabel = labels[options.indexOf(correct)]
      await reply(`❓ *Trivia*\n\n${question}\n\n${formatted}\n\n||✅ Answer: **${correctLabel}. ${correct}**||`)
    } catch (e) { await reply(`❌ Trivia error: ${e.message}`) }
  },

  async math({ args, reply }) {
    const expr = args.join(' ')
    if (!expr) return reply('⚠️ Usage: `.math <expression>`')
    try {
      const safe = expr.replace(/[^0-9+\-*/().%^ ]/g, '')
      // eslint-disable-next-line no-eval
      const result = Function(`"use strict"; return (${safe})`)()
      await reply(`🧮 *${expr}*\n= **${result}**`)
    } catch { await reply('❌ Invalid math expression.') }
  },

  async fact({ reply }) {
    try {
      const res = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', { timeout: 10000 })
      await reply(`📖 *Random Fact*\n\n${res.data.text}`)
    } catch { await reply('❌ Could not fetch a fact right now.') }
  },

  async joke({ reply }) {
    try {
      const res = await axios.get('https://v2.jokeapi.dev/joke/Any?blacklistFlags=racist,sexist&format=txt', { timeout: 10000 })
      await reply(`😂 *Joke*\n\n${res.data}`)
    } catch { await reply('❌ Could not fetch a joke right now.') }
  },

  async flip({ reply }) {
    await reply(`🪙 ${Math.random() < 0.5 ? '**Heads!** 👑' : '**Tails!** 🌟'}`)
  },

  async roll({ args, reply }) {
    const sides = parseInt(args[0]) || 6
    const result = Math.floor(Math.random() * sides) + 1
    await reply(`🎲 Rolled a **d${sides}**: **${result}**`)
  },

  async choose({ args, reply }) {
    const options = args.join(' ').split(',').map(s => s.trim()).filter(Boolean)
    if (options.length < 2) return reply('⚠️ Usage: `.choose option1, option2, option3`')
    const chosen = options[Math.floor(Math.random() * options.length)]
    await reply(`🤔 I choose: **${chosen}**`)
  },

  async '8ball'({ args, reply }) {
    const question = args.join(' ')
    if (!question) return reply('⚠️ Ask me a question! `.8ball <question>`')
    const answers = [
      'It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes, definitely.',
      'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.',
      'Yes.', 'Signs point to yes.', 'Reply hazy, try again.', 'Ask again later.',
      'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.',
      "Don't count on it.", 'My reply is no.', 'My sources say no.',
      'Outlook not so good.', 'Very doubtful.',
    ]
    await reply(`🎱 *${answers[Math.floor(Math.random() * answers.length)]}*`)
  },

  async removebg({ msg, args, reply }) {
    const url = args[0] || (msg.attachments?.first()?.url)
    if (!url) return reply('⚠️ Usage: `.removebg <image_url>` or attach an image')
    const apiUrl = `https://api.remove.bg/v1.0/url`
    const apiKey = process.env.REMOVEBG_API_KEY
    if (!apiKey) return reply('⚠️ REMOVEBG_API_KEY not configured.')
    try {
      const res = await axios.post(apiUrl, { image_url: url, size: 'auto' }, {
        headers: { 'X-Api-Key': apiKey },
        responseType: 'arraybuffer',
        timeout: 30000,
      })
      await msg.channel.send({ files: [{ attachment: Buffer.from(res.data), name: 'no-bg.png' }] })
    } catch (e) {
      await reply(`❌ Remove BG error: ${e.message}`)
    }
  },

  async nobg(ctx) { return module.exports.removebg(ctx) },
}
