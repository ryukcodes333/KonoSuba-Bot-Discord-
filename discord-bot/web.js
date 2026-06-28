const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req, res) => {
  const connected = global.botConnected || false
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Konosuba — Discord Bot Panel</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #06060d; --surface: #0d0d18; --surface2: #12121f;
    --border: rgba(139,92,246,0.18); --purple: #8b5cf6; --purple2: #6d28d9;
    --glow: rgba(139,92,246,0.45); --text: #e2e8f0; --muted: #64748b;
    --green: #10b981; --red: #ef4444;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif;
    min-height: 100vh; display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 24px 16px; }
  body::before { content: ''; position: fixed; inset: 0;
    background: radial-gradient(ellipse 80% 50% at 20% 20%, rgba(109,40,217,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139,92,246,0.08) 0%, transparent 60%);
    pointer-events: none; z-index: 0; }
  .card { position: relative; z-index: 1; background: var(--surface);
    border: 1px solid var(--border); border-radius: 24px; padding: 44px 40px;
    max-width: 480px; width: 100%;
    box-shadow: 0 4px 6px rgba(0,0,0,0.4), 0 20px 60px rgba(0,0,0,0.5); }
  .card::before { content: ''; position: absolute; top: 0; left: 10%; right: 10%;
    height: 1px; background: linear-gradient(90deg, transparent, rgba(139,92,246,0.7), transparent); }
  .header { text-align: center; margin-bottom: 32px; }
  .brand-icon { font-size: 2.5rem; margin-bottom: 12px; }
  .brand-name { font-size: 1.65rem; font-weight: 800;
    background: linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 50%, #6d28d9 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 4px; }
  .brand-sub { font-size: 0.78rem; color: var(--muted); letter-spacing: 0.12em; text-transform: uppercase; }
  .status-wrap { display: flex; justify-content: center; margin-bottom: 28px; }
  .status { display: inline-flex; align-items: center; gap: 7px; padding: 7px 18px;
    border-radius: 100px; font-size: 0.8rem; font-weight: 600; }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; }
  .status.online { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
  .status.online .status-dot { background: #10b981; box-shadow: 0 0 6px #10b981; animation: blink 2s infinite; }
  .status.offline { background: rgba(239,68,68,0.1); color: #fca5a5; border: 1px solid rgba(239,68,68,0.25); }
  .status.offline .status-dot { background: #ef4444; }
  @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
  .info-grid { display: grid; gap: 12px; margin-bottom: 24px; }
  .info-row { background: var(--surface2); border: 1px solid var(--border);
    border-radius: 12px; padding: 14px 18px; display: flex; justify-content: space-between;
    align-items: center; font-size: 0.85rem; }
  .info-label { color: var(--muted); }
  .info-val { font-weight: 600; color: var(--text); }
  .divider { border: none; border-top: 1px solid rgba(255,255,255,0.05); margin: 24px 0 20px; }
  .footer { display: flex; justify-content: space-between; font-size: 0.72rem; color: rgba(255,255,255,0.15); }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="brand-icon">🌑</div>
    <div class="brand-name">Konosuba</div>
    <div class="brand-sub">Discord Bot Panel</div>
  </div>
  <div class="status-wrap">
    <div class="status ${connected ? 'online' : 'offline'}">
      <span class="status-dot"></span>
      <span>${connected ? 'Online' : 'Offline'}</span>
    </div>
  </div>
  <div class="info-grid">
    <div class="info-row">
      <span class="info-label">Uptime</span>
      <span class="info-val">${formatUptime(process.uptime())}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Prefix</span>
      <span class="info-val">.</span>
    </div>
    <div class="info-row">
      <span class="info-label">Node.js</span>
      <span class="info-val">${process.version}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Environment</span>
      <span class="info-val">${process.env.NODE_ENV || 'development'}</span>
    </div>
  </div>
  <hr class="divider">
  <div class="footer">
    <span>Konosuba Discord Bot</span>
    <span>v3.0</span>
  </div>
</div>
<script>setTimeout(() => location.reload(), 10000)</script>
</body>
</html>`)
})

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  return `${m}m ${s}s`
}

app.get('/status', (req, res) => {
  res.json({
    connected: global.botConnected || false,
    uptime: process.uptime(),
  })
})

app.get('/ping', (req, res) => res.json({ status: 'alive', ts: Date.now() }))
app.get('/bot.ping', (req, res) => res.json({ status: 'alive', ts: Date.now() }))

app.listen(PORT, () => {
  console.log(`🌐 Web panel running on port ${PORT}`)
})
