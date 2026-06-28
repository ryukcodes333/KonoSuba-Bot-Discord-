const axios = require('axios')

async function sendImage(msg, url, caption) {
  try {
    await msg.channel.send({ content: caption || null, files: [url] })
  } catch (e) {
    await msg.reply(`${caption || '🖼️ Image'}\n*(Could not load image: ${e.message})*`)
  }
}

module.exports = {
  async waifu({ msg, reply }) {
    try {
      const res = await axios.get('https://api.waifu.pics/sfw/waifu', { timeout: 10000 })
      await sendImage(msg, res.data.url, '🌸 Waifu')
    } catch { await reply('❌ Could not fetch waifu image.') }
  },

  async neko({ msg, reply }) {
    try {
      const res = await axios.get('https://api.waifu.pics/sfw/neko', { timeout: 10000 })
      await sendImage(msg, res.data.url, '🐱 Neko')
    } catch { await reply('❌ Could not fetch neko image.') }
  },

  async animesearch({ args, msg, reply }) {
    const query = args.join(' ')
    if (!query) return reply('⚠️ Usage: `.animesearch <title>`')
    try {
      const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`, { timeout: 10000 })
      const anime = res.data.data[0]
      if (!anime) return reply(`❌ Anime not found: "${query}"`)
      await sendImage(msg, anime.images.jpg.image_url,
        `*${anime.title}*\n⭐ ${anime.score || 'N/A'} | 📺 ${anime.episodes || '?'} eps | ${anime.synopsis?.slice(0, 200) || 'No description'}`)
    } catch (e) { await reply(`❌ Error: ${e.message}`) }
  },

  async animekill({ msg, reply }) {
    try {
      const res = await axios.get('https://api.waifu.pics/sfw/kill', { timeout: 10000 })
      await sendImage(msg, res.data.url, '⚔️ Kill!')
    } catch { await reply('❌ Could not fetch image.') }
  },

  async animebite({ msg, reply }) {
    try {
      const res = await axios.get('https://api.waifu.pics/sfw/bite', { timeout: 10000 })
      await sendImage(msg, res.data.url, '😤 Bite!')
    } catch { await reply('❌ Could not fetch image.') }
  },

  async animewave({ msg, reply }) {
    try {
      const res = await axios.get('https://api.waifu.pics/sfw/wave', { timeout: 10000 })
      await sendImage(msg, res.data.url, '👋 Wave!')
    } catch { await reply('❌ Could not fetch image.') }
  },

  async animewink({ msg, reply }) {
    try {
      const res = await axios.get('https://api.waifu.pics/sfw/wink', { timeout: 10000 })
      await sendImage(msg, res.data.url, '😉 Wink!')
    } catch { await reply('❌ Could not fetch image.') }
  },

  async animebonk({ msg, reply }) {
    try {
      const res = await axios.get('https://api.waifu.pics/sfw/bonk', { timeout: 10000 })
      await sendImage(msg, res.data.url, '🔨 Bonk!')
    } catch { await reply('❌ Could not fetch image.') }
  },

  async megumin({ msg, reply }) {
    await sendImage(msg, 'https://i.pinimg.com/originals/9d/a2/3f/9da23f0ffd89d4a8acb27c1c59065c39.jpg', '💥 EXPLOSION!')
  },

  async mikasa({ msg, reply }) {
    await sendImage(msg, 'https://api.waifu.pics/sfw/waifu', '⚔️ Mikasa!')
  },

  async naruto({ msg, reply }) {
    await sendImage(msg, 'https://wallpapercave.com/wp/wp3104717.jpg', '🍥 Naruto!')
  },

  async sasuke({ msg, reply }) {
    await sendImage(msg, 'https://wallpapercave.com/wp/wp3104668.jpg', '⚡ Sasuke!')
  },

  async itachi({ msg, reply }) {
    await sendImage(msg, 'https://wallpapercave.com/wp/wp2099698.jpg', '🌸 Itachi!')
  },

  async madara({ msg, reply }) {
    await sendImage(msg, 'https://wallpapercave.com/wp/wp2099711.jpg', '🌀 Madara!')
  },

  async gojo({ msg, reply }) {
    await sendImage(msg, 'https://wallpapercave.com/wp/wp12168064.jpg', '♾️ Gojo!')
  },

  async nezuko({ msg, reply }) {
    await sendImage(msg, 'https://wallpapercave.com/wp/wp9680484.jpg', '🎋 Nezuko!')
  },

  async kurumi({ msg, reply }) {
    await sendImage(msg, 'https://wallpapercave.com/wp/wp4033059.jpg', '🕰️ Kurumi!')
  },

  async onepiece({ msg, reply }) {
    await sendImage(msg, 'https://wallpapercave.com/wp/wp2369815.jpg', '🏴‍☠️ One Piece!')
  },

  async yumeko({ msg, reply }) {
    await sendImage(msg, 'https://wallpapercave.com/wp/wp4072879.jpg', '🎰 Yumeko!')
  },

  async wallpaper({ args, msg, reply }) {
    const query = args.join(' ') || 'anime'
    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(query + ' wallpaper 4K')}?width=1920&height=1080&nologo=true`
      await sendImage(msg, url, `🖼️ Wallpaper: *${query}*`)
    } catch (e) { await reply(`❌ Error: ${e.message}`) }
  },

  async pinterest({ args, msg, reply }) {
    const query = args.join(' ')
    if (!query) return reply('⚠️ Usage: `.pinterest <query>`')
    await reply(`📌 Pinterest: https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`)
  },
}
