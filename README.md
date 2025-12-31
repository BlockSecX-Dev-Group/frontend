# BlockSecArena Frontend System

## 📖 Introduction

**BlockSecArena Frontend** is the immersive interface for a next-generation Web3 security education and CTF platform. Built with **Next.js 15 (App Router)** and **React 19**, it provides a seamless, high-performance experience for users to learn blockchain security, audit smart contracts, and compete in CTF challenges.

The system features a modern, responsive UI powered by **Tailwind CSS** and **shadcn/ui**, with deep integration of Web3 interactions (Wallet connection, EIP-712 signatures, and on-chain transactions) via Ethers.js. It bridges the gap between theoretical knowledge and practical on-chain application.

## ✨ Key Features

### 1. 🛡️ Smart Contract Auditing

* **AI-Powered Analysis:** Automated vulnerability detection and risk scoring (0-100) for smart contracts.
* **Honeypot Detection:** Real-time identification of malicious token logic.
* **Multi-Chain Support:** Seamlessly supports Ethereum, BSC, Base.
* **Report Generation:** Auto-generates professional Markdown audit reports for users.

### 2. 🎓 Interactive Learning Hub

* **Video Courses:** Structured blockchain security tutorials with progress tracking.
* **Knowledge Quizzes:** Interactive assessments to test theoretical understanding.
* **CTF Arena:** A dynamic environment for "Capture The Flag" challenges, categorized by difficulty levels.

### 3. 👤 Web3 User System

* **Wallet Integration:** Supports **MetaMask** and **Binance Web3 Wallet** via `WalletContext`.
* **Secure Authentication:** Uses **EIP-712** typed data signatures for secure, gasless login and authentication.
* **Gamification:** User ranking system, points tracking, and invite-to-earn mechanics.
* **Internationalization:** Native support for **English (en)** and **Traditional Chinese (zh-TW)**.

### 4. 🎨 NFT & Assets

* **Gasless Minting:** Implements signature-based NFT minting logic.
* **On-Chain Verification:** Real-time transaction confirmation and asset display.
* **Modern UI:** Features fluid animations (Framer Motion) and high-fidelity components.

## 🛠 Tech Stack

| Category | Technology |
| --- | --- |
| **Framework** | Next.js 15.4.5 (App Router) |
| **Core** | TypeScript 5, React 19.1.1 |
| **Styling** | Tailwind CSS 3.4, shadcn/ui, Radix UI |
| **Web3** | Ethers.js 6.15, Web3.js 4.16 |
| **Animation** | Framer Motion 12.x, OGL (WebGL) |
| **State** | React Context API (Wallet & User state) |
| **Package Mgr** | npm / yarn |

## 📂 Directory Structure

```bash
frontend/
├── api/                  # API Interface Layer (Axios/Fetch wrappers)
│   ├── audit/            # Contract auditing services
│   ├── auth/             # Login & EIP-712 authentication
│   ├── field/            # CTF Arena data fetching
│   ├── nft/              # NFT minting & transaction logic
│   └── user/             # Profile, points, and referral system
├── app/                  # Next.js 15 App Router Pages
│   ├── learning/         # Course listing and video player [id]
│   ├── nft/              # NFT minting interface
│   ├── profile/          # User dashboard
│   ├── rank/             # Leaderboards
│   └── page.tsx          # Landing page (Audit interface)
├── components/           # Reusable UI Components
│   ├── ui/               # Base UI primitives (shadcn/ui based)
│   ├── Header.tsx        # Navigation & Wallet Connect button
│   ├── VideoPlayer.tsx   # Custom video player component
│   └── ...
├── contexts/             # Global State Managers
│   └── WalletContext.tsx # Web3 provider & connection state
├── locales/              # i18n Translation Files
│   ├── en.ts             # English strings
│   └── zh-TW.ts          # Traditional Chinese strings
├── lib/                  # Utility functions
└── public/               # Static assets (images, whitepapers)

```