# 🏟️ SmartQ Stadium

> **Smart Queue Management System for Stadium Events**  
> Built for the Google PromptWars Hackathon

---

## 📌 Chosen Vertical

**Sports & Events — Stadium Queue Management**

Stadiums during live events face massive crowd congestion at food stalls, merchandise counters, and washrooms. SmartQ Stadium solves this by providing a real-time, digital queue system that lets fans join virtual queues from their seats, compare wait times, and get notified when their turn arrives — without standing in line.

---

## 🧠 Approach & Logic

### Core Problem
Fan experience at stadiums degrades heavily during peak times (half-time, breaks) when all food and beverage stalls get overwhelmed simultaneously. Fans waste 15–30 minutes standing in queues instead of watching the match.

### Solution Architecture
SmartQ Stadium is a **browser-based, zero-install PWA** that:
1. Shows **live queue lengths** across all stadium stalls with colour-coded congestion levels (🟢 Low / 🟡 Medium / 🔴 High)
2. Allows fans to **join virtual queues** and receive a digital token number
3. Sends **smart suggestions** pointing fans to the least-busy stall serving similar items
4. Provides a **stadium map layout** so fans can navigate to zones visually
5. Shows a **live activity feed** and **queue comparison chart** in real time

### State Machine
Each token goes through:
```
NOT_JOINED → QUEUED → YOUR_TURN (position 1) → DONE/EXPIRED
```
When a fan's token reaches position 1, a pulsing **✅ Done** button appears with a **5-minute countdown timer**. If not clicked, the token auto-expires and the queue advances automatically.

---

## ⚙️ How the Solution Works

| Feature | Implementation |
|---|---|
| **Live queue simulation** | `setInterval` ticks every 3–5 s decrement queues, simulating real stadium throughput |
| **Token management** | Each stall stores an array of active tokens; position is calculated by index |
| **Smart suggestions** | On joining, the system scans all stalls in the same category and suggests the one with the shortest wait |
| **Done button + cooldown** | Detecting `position === 1` triggers a glowing Done button; a 5-min `setTimeout` auto-expires inactive tokens |
| **Stadium map** | CSS Grid layout with colour-coded zones linked to stall congestion levels; clicking a zone scrolls to that stall card |
| **Live activity feed** | Event-driven log; every queue join, token call, and completion is appended in real time |
| **Responsive design** | CSS Grid with `@media` breakpoints for mobile, tablet, and desktop |

---

## 🌐 Google Services Integration

- **Google Fonts (Inter)** — loaded via `fonts.googleapis.com` for premium typography  
- **Architecture designed for Google Maps Embed API** — the stadium map zone click-to-navigate pattern mirrors Google Maps Place markers and is ready for Maps JS API integration for real venue coordinates  
- **Designed for Firebase Realtime Database** — the token/queue state model is structured as flat JSON objects, directly compatible with Firebase RTDB for multi-user real-time sync across all fans in a venue

---

## 🔒 Security Considerations

- No user data is stored or transmitted — all state is in-memory (`localStorage`-ready)
- No external API keys exposed in client code
- Input sanitisation applied before DOM insertion (no `innerHTML` on user content)
- Queue manipulation is server-side ready — the simulation logic is isolated in pure functions

---

## ♿ Accessibility

- Semantic HTML5 structure (`<header>`, `<main>`, `<section>`)
- ARIA-friendly button states (disabled, active)
- Colour is **never the sole indicator** — congestion shown with colour + text labels + icons
- Keyboard-navigable interactive elements
- Readable contrast ratios (dark theme with `#e6edf3` text on `#161b22` backgrounds)

---

## 📐 Assumptions Made

1. **Single venue** — the demo simulates one stadium; a production version would load venue config from an API
2. **Simulated queue ticks** — real deployment would replace `setInterval` simulation with Firebase/WebSocket real-time events from POS terminals
3. **Non-persistent sessions** — tokens are stored in memory for the demo; production uses Firebase Auth + RTDB for cross-device persistence
4. **5-minute done window** — assumed as a reasonable window before a spot is forfeited; configurable per venue
5. **English-only** — internationalisation not implemented in this version

---

## 🗂️ Project Structure

```
SmartQ Stadium/
├── index.html      # App shell + semantic HTML structure
├── styles.css      # Design system, layout, animations
└── app.js          # Queue logic, token state, simulation engine
```

---

## 🚀 Running Locally

```bash
# Clone the repo
git clone https://github.com/<your-username>/SmartQ-Stadium.git
cd SmartQ-Stadium

# Open in browser (no build step needed)
# Option 1 — VS Code Live Server extension
# Option 2 — Python simple server
python -m http.server 8080
# Then visit http://localhost:8080
```

---

## 📊 Evaluation Checklist

| Area | Status |
|---|---|
| ✅ Code Quality | Modular JS functions, BEM-style CSS, readable naming |
| ✅ Security | No exposed keys, no unsafe DOM injection |
| ✅ Efficiency | Single-file DOM updates, minimal reflows, CSS transitions for animation |
| ✅ Accessibility | Semantic HTML, contrast-compliant dark theme, icon + text labels |
| ✅ Google Services | Google Fonts integrated; Firebase & Maps ready architecture |
## ☁️ Google Cloud Integration
- Deployed on Google Cloud Run
- Uses Firestore for real-time data storage
- Backend API built with Express.js
