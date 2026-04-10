# 🧠 Trivia Quiz — Test Your Knowledge

A polished, feature-rich trivia quiz web app built with **vanilla HTML, CSS, and JavaScript**, powered by the [Open Trivia Database API](https://opentdb.com/). Features a classic editorial aesthetic, fully functional dark mode, per-question countdown timer, sound effects, high-score tracking, and an answer review screen — all with zero dependencies or build tools.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🌍 **14 Categories** | General Knowledge, Science, History, Sports, Video Games, and more |
| 🎯 **Difficulty Levels** | Easy, Medium, Hard, or Any |
| ⏱️ **Per-Question Timer** | 15-second countdown with visual warning at ≤5 s |
| ⏸️ **Pause / Resume** | Freeze the timer mid-question at any time |
| 🔊 **Sound Effects** | Distinct audio cues for correct answers, wrong answers, and button clicks |
| 🏆 **High Score Tracking** | Personal best persisted via `localStorage` |
| 📋 **Answer Review** | Post-game review of every question with your answer vs. the correct one |
| 🌙 **Dark / Light Mode** | Theme toggle persisted across sessions in `localStorage` |
| ↻ **Restart Quiz** | Play again without refreshing — picks a fresh set of questions |
| ⌨️ **Keyboard Controls** | `Enter` → next/start/restart; `1–4` → select answer options |
| 📱 **Responsive Design** | Optimised for mobile, tablet, and desktop |

---

## 🛠️ Tech Stack

- **Markup:** HTML5 (semantic)
- **Styles:** Vanilla CSS — custom properties, CSS animations, dark-mode via class toggle
- **Logic:** Vanilla JavaScript (ES2020+) — no frameworks, no bundlers
- **Fonts:** [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) + [Lato](https://fonts.google.com/specimen/Lato) via Google Fonts
- **API:** [Open Trivia Database](https://opentdb.com/) (free, no key required)

---

## 🗂️ Project Structure

```
Quiz-App/
├── index.html   # App shell — start screen, quiz screen structure
├── style.css    # All styles including dark mode, animations, and responsive layout
└── script.js    # Game logic — fetch, render, timer, scoring, review, theme
```

---

## 🔌 API Details

Questions are fetched from the Open Trivia DB REST endpoint:

```
https://opentdb.com/api.php?amount=10&type=multiple[&category=<id>][&difficulty=<level>]
```

### Graceful Fallback Strategy

If a category + difficulty combination returns fewer than 10 questions, the app automatically retries — first dropping the difficulty filter, then dropping the category, so the quiz always starts successfully.

---

## 🎮 How to Play

1. Open `index.html` in any modern browser — **no server required**.
2. Select a **category** and **difficulty** (or leave on "Any").
3. Hit **Start Quiz →** (or press `Enter`).
4. Answer each question before the 15-second timer runs out.
   - Use mouse clicks **or** press `1`, `2`, `3`, `4` to select an option.
5. After all 10 questions, review your **score ring**, accuracy, and high score.
6. Click **📋 Review Answers** to inspect every question in detail.
7. Hit **↻ Play Again** to start a fresh game.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Enter` | Start quiz / Next question / Restart |
| `1` – `4` | Select answer option 1–4 |
| *(theme toggle is click-only)* | |

---

## 🚀 Running Locally

No build step needed:

```bash
# Clone the repo
git clone https://github.com/your-username/Quiz-App.git
cd Quiz-App

# Open directly
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

Or serve it with any static file server:

```bash
npx serve .
# → http://localhost:3000
```

---

## 🔮 Potential Future Improvements

- [ ] True/False question type support
- [ ] Configurable question count (5 / 10 / 15 / 20)
- [ ] Global leaderboard via a backend or Firebase
- [ ] Multiplayer / PvP mode
- [ ] PWA support for offline play

---

## 📄 License

This project is for educational purposes.

---

## 👨‍💻 Author

**Rishi Bhardwaj** — College Project 🎓
