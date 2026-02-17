# 404-Redirect Marketplace 🎮🔗

> **Built by [Wizardrytezch](https://github.com/CrazhHolmes)** — Turning dead links into delightful Easter eggs.

[![GitHub stars](https://img.shields.io/github/stars/CrazhHolmes/404-smoke-test?style=social)](https://github.com/CrazhHolmes/404-smoke-test/stargazers)

---

## 🎯 What is this?

The **404-Redirect Marketplace** is an experimental project that transforms boring 404 error pages into engaging experiences. Instead of hitting a dead end, lost visitors discover a fun ghost-catching game — and optionally, a way to support the creator.

This repo serves as both:
- 🎮 **An Easter egg destination** — A playful surprise for curious clickers
- 📊 **A smoke test** — Validating whether 404 monetization is viable

---

## 🕹️ The Game: Ghost Catcher

When someone lands on your 404 page, they get:

- **30 seconds** to catch as many ghosts as possible
- **4 ghost types** with different point values:
  - 👻 Normal (10 pts) — Easy targets
  - 💨 Fast (25 pts) — Blink and you'll miss 'em
  - 👀 Tiny (50 pts) — Small but valuable
  - 👹 Big (100 pts) — Rare and rewarding
- **3 levels** of increasing difficulty
- **Local high score** tracking

### [🎮 Play the Game →](https://crazhholmes.github.io/404-smoke-test/lost.html)

---

## 🚀 Quick Setup

Want this on your own site? Just redirect your 404s to:

```javascript
// In your 404 handler or .htaccess
window.location.href = 'https://crazhholmes.github.io/404-smoke-test/lost.html';
```

Or self-host:

```bash
git clone https://github.com/CrazhHolmes/404-smoke-test.git
# Upload to your server or enable GitHub Pages
```

---

## 🎨 Customization

The game is fully client-side. To customize:

1. Fork this repo
2. Edit `lost.html`:
   - Change the Buy Me a Coffee link (line 315)
   - Modify ghost emojis or add new types
   - Adjust game duration or scoring
3. Deploy to GitHub Pages or your own server

---

## 📊 The Smoke Test

This project is part validation, part entertainment:

| Metric | Target |
|--------|--------|
| 404 Redirects | Track via referrer |
| Game Starts | Button clicks |
| Completion Rate | Sessions finishing 30s |
| Support Rate | Coffee purchases |

**Goal:** Determine if 404 traffic can be meaningfully engaged (and optionally monetized) without annoying users.

---

## 🛠️ Files

| File | Purpose |
|------|---------|
| `index.html` | Landing page / project description |
| `lost.html` | The actual 404 game experience |
| `prospect.py` | Outreach tool for finding 404-heavy sites |
| `OUTREACH.md` | Validation playbook & email templates |

---

## 🤝 How to Use This

### As a Site Owner
Add the game to your 404 page and see if visitors engage. Zero cost, potential upside.

### As a Curious User
You probably clicked a "broken" link and ended up here. Enjoy the game! ☕

### As a Developer
Fork it, remix it, make it your own. The code is vanilla JS — no dependencies.

---

## 📝 Attribution

Built by **[Wizardrytezch](https://github.com/CrazhHolmes)** — Maker of things that make things.

This project is part of the [passive-gen](https://github.com/CrazhHolmes/passive-gen) ecosystem: tools for generating passive income through creative automation.

If you found this via a "broken" link — that was intentional. You triggered the **404-Redirect Marketplace protocol**. 🎮

---

## 📜 License

MIT — Use it, remix it, deploy it. Just keep the attribution.

---

<p align="center">
  <strong>☕ <a href="https://buymeacoffee.com/warlockholmes">Buy me a coffee</a></strong> if this made your 404s less sad.
</p>

<p align="center">
  <sub>FTX Protocol Enforced • Easter Egg Active</sub>
</p>
