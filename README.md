# Warwyn Website

Welcome to the official website repository for **Warwyn**, a RuneScape private server (RSPS) built with passion and precision over the past three years.

## 🌐 About Warwyn

Warwyn began as a personal passion project with the goal of recreating and expanding upon the nostalgic 2006 RuneScape experience. After years of development, refinement, and technical iteration, the project is now being prepared for live hosting—open to friends and interested players alike.

This repository houses the **web front-end**, which works in tandem with a custom-built back-end server and game server, forming a cohesive and user-friendly ecosystem for players.

---

## 🛠️ Tech Stack

### Front-End
- **Vue 3 + Vite** — Fast, modern development experience with a modular design
- Responsive UI design and integration with player profiles, stats, and shop features

### Back-End
- **Node.js + Express** — RESTful API that interfaces with the game server and database
- **Firebase Authentication** — Secure user sign-in and account handling
- **Firestore** — Cloud-hosted NoSQL database for scalable and real-time data storage

### Payment Processing
- **Stripe** — Secure payment gateway for the in-game donation shop (Wyncoin system)

### Background Task Management
- **Bull + Redis** — Job queue system for automated scheduling tasks such as poll expiration

---

## ⚙️ Features

- 🔐 Account registration, login, and secure authentication
- 🛍️ In-game donation shop powered by Stripe with real-time balance updates
- 📊 Hiscores and personal stats integration directly from the game server
- 📣 Polling system with scheduled expiration using Bull + Redis
- 🧩 Admin dashboard tools to manage posts, shop items, and community engagement

---

## 🚀 Goals

The goal of this project is to offer a stable, polished, and enjoyable front-end experience that complements the game server—providing easy account access, community-driven features, and seamless user engagement.

Warwyn is currently in private testing as development continues toward a full launch. Players who wish to follow progress or participate can join through the official Discord server (link TBA).

---

## 📁 Project Structure

root/

frontend/ → Vue 3 + Vite-based UI

backend/ → Node.js + Express API

functions/ → Firebase Cloud Functions (if applicable)

redis/ → Redis config for job queue

firestore/ → Firestore rules & collections

---

## 🤝 Contributing

At this time, Warwyn is a private project and contributions are handled on a case-by-case basis. If you're interested in helping, feel free to open an issue or reach out via Discord.

---

## 📜 License

This project is not affiliated with Jagex or RuneScape. All RuneScape-related assets are the property of Jagex Ltd. This project is for educational and non-commercial use.

---

## 📬 Contact

For more information or to get involved:
- 🧾 Website: [Coming Soon]
- 💬 Discord: https://discord.gg/gEQS7BEX69

---

Thanks for checking out Warwyn!