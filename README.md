# ✈️ Aviator Signal — Telegram Mini App

A sleek, hacker-aesthetic Telegram Mini App that delivers Aviator game signal predictions.

---

## 📁 Project Structure

```
aviator-signal/
├── index.html       — Main HTML shell + Telegram SDK
├── styles.css       — Full dark-theme UI (Orbitron + Rajdhani fonts)
├── script.js        — API logic, particles, animations
├── Av-new_2x.png    — Aviator logo (copy into this folder)
└── README.md
```

---

## 🚀 Local Testing

1. Copy `Av-new_2x.png` into the project folder.
2. Run a local server (file:// won't work with fetch):
   ```bash
   # Python 3
   python3 -m http.server 8080
   # or Node
   npx serve .
   ```
3. Open `http://localhost:8080` in your browser.

---

## 🌐 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# From project folder
vercel deploy
```

Or drag-and-drop the folder at [vercel.com/new](https://vercel.com/new).

## 🌐 Deploy to Netlify

Drag and drop the folder at [app.netlify.com/drop](https://app.netlify.com/drop).

---

## 🤖 Connect to Telegram Bot

1. Open [@BotFather](https://t.me/BotFather)
2. `/newbot` → follow setup
3. `/newapp` → follow setup, enter your deployed URL as the Web App URL
4. Or attach to existing bot: `/setmenubutton` and set the URL

Users tap the menu button (or a keyboard button you send) and the Mini App opens.

---

## ⚙️ API Details

**Endpoint:** `GET https://api.mellwgameos.cc/api/get_games?game=aviator&user_id=1`

**Response:**
```json
{ "success": true, "data": "Current: 14.2 | Next: 1.74" }
```

- `Current` — the live/ongoing round multiplier
- `Next` — the predicted next-round multiplier (displayed as main signal)

---

## 🔧 Customisation

| Variable | Location | Purpose |
|---|---|---|
| `CONFIG.API_URL` | `script.js` | Swap in a different API endpoint |
| `CONFIG.MIN_LOADING_MS` | `script.js` | Min. animation time before showing result |
| `--red` | `styles.css :root` | Primary accent color |
| Telegram handle | `index.html` footer | Change `@AVIATOR` to your channel |
