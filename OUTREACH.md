# 404-Redirect Marketplace — Outreach Playbook

## Your Assets

| Asset | URL |
|-------|-----|
| Landing Page | `https://YOUR_USERNAME.github.io/404-smoke-test/` |
| Demo 404 Page | `https://YOUR_USERNAME.github.io/404-smoke-test/lost.html` |
| Buy Me a Coffee | `https://buymeacoffee.com/warlockholmes` |
| Loom Video | `[CREATE THIS]` |

## Quick Start

### 1. Deploy to GitHub Pages (5 minutes)

```bash
# Create a new repo on GitHub called 404-smoke-test
git init
git add .
git commit -m "Initial smoke test"
git remote add origin https://github.com/YOUR_USERNAME/404-smoke-test.git
git push -u origin main

# Go to Settings → Pages → Source: Deploy from Branch → main → / (root)
# Wait 2 minutes, then visit your GitHub Pages URL
```

### 2. Create Your Loom Video (10 minutes)

Record a 30-second video showing:

1. **Open a browser** → navigate to a broken link (use any site, add `/broken123` to URL)
2. **Show the 404 error** → "Ugh, dead end"
3. **Open DevTools** → paste this one-liner:
   ```javascript
   // Fake redirect script for demo
   window.location.href = 'https://YOUR_USERNAME.github.io/404-smoke-test/lost.html';
   ```
4. **Show the cute 404 page** with your BMC button
5. **End card**: "Set up in 30 seconds. Turn your 404s into tips."

Upload to Loom (unlisted) → copy share link

### 3. Find Prospects

```bash
# Install dependencies
pip install requests

# Run the prospect hunter (3 searches = 150 prospects)
python prospect.py --search "404" --max 50
python prospect.py --search "dead link" --max 50  
python prospect.py --search "broken link" --max 50
```

This creates 3 CSV files with prospects.

### 4. Send Outreach

#### Method A: GitHub Issue Comments (Recommended)

Open each issue URL from the CSV. Post this comment:

```
Hey @username — saw this issue about broken links. 

I built a tiny tool that turns 404 traffic into Buy Me a Coffee tips. 

30-sec demo: [YOUR_LOOM_LINK]
Live example: https://YOUR_USERNAME.github.io/404-smoke-test/lost.html

If you're getting >100 404s/month, happy to set it up on your site free. 
Just reply here or email me at [YOUR_EMAIL].
```

#### Method B: Direct Email (If Available)

Check the repo owner's GitHub profile for a public email. Use the email body from the CSV.

### 5. Track Results

Create a simple tracker:

| Repo | Contacted | Replied | 404s/Month | Wants Pilot |
|------|-----------|---------|------------|-------------|
| user/repo | 2024-01-15 | ✅ | 500 | ✅ |

**Goal: 10 "Wants Pilot" in 48 hours**

---

## Email Templates

### Template 1: Short & Sweet (for GitHub comments)

```
Saw your issue about dead links — quick win?

I can turn those 404s into Buy Me a Coffee tips with one line of JS.

Demo: [LOOM]
Example: [YOUR_GH_PAGES]/lost.html

Reply with your 404s/month if >100 and I'll set it up free.
```

### Template 2: Slightly Warmer (for email)

```
Subject: Dead links on your site → easy fix + tips

Hey [Name],

I was browsing your repo and saw you're dealing with some 404/broken link issues.

I built a tiny redirect tool that turns "page not found" into "buy me a coffee" — literally. It's one line of JavaScript.

30-sec demo: [LOOM]
My BMC: https://buymeacoffee.com/warlockholmes

Quick question: roughly how many 404s do you serve per month? If it's >100, I'd love to set this up on your site as a free pilot.

Cheers,
[Your Name]
```

### Template 3: The Hustle (if no response after 24h)

```
Hey, following up on this — I've already set up 3 sites and they're seeing 
~$5-10 in tips from 404 traffic this week.

Worth a 30-second look? [LOOM]
```

---

## The Kill Criteria

Stop the clock after 48 hours.

| Result | Verdict |
|--------|---------|
| ≥10 people reply "Yes, set it up" | 🚢 **SHIP MVP** — Start building Django backend |
| 5-9 interested | 🤔 **MAYBE** — Extend 24h, try different outreach angle |
| <5 interested | 🪦 **KILL IT** — Trash the repo, move to next idea |

---

## Pro Tips

1. **Rate limit yourself**: Max 20 GitHub comments/hour to avoid looking spammy
2. **Target actively maintained repos**: Check "last updated" on the repo
3. **Personalize slightly**: Mention the specific issue number in your comment
4. **Time zones**: Post comments during US business hours for better visibility

---

## Post-Validation Build List

If you hit 10 pilots, build these in order:

1. Django app with Stripe Connect
2. Publisher dashboard (add domain, set error path)
3. JavaScript snippet generator
4. Hit tracking (Redis counters)
5. Revenue split logic (you/publisher/embedder)
6. Payout automation

**Don't build any of this until you have 10 confirmed pilots.**

---

Good luck! Go validate that pain. 💪
