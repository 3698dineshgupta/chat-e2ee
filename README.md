# 🔐 chat-e2ee

A Disposable End-to-End Encrypted Chat Application  
Developed and maintained by **Dinesh Gupta**

---

## 🌐 Live Demo

👉 https://chat-e2ee-1.onrender.com

---

## 🚀 Overview

**chat-e2ee** is a privacy-first chat application that enables two mutually agreed users to communicate in a fully end-to-end encrypted environment.

The application:

- Does not require login or signup
- Does not track users
- Does not store chat history
- Does not retain encryption keys
- Generates private keys locally on the user's device

All encryption happens on the client side.  
Private keys never leave your device.

This project is intended for secure, temporary chat sessions — not as a replacement for mainstream messaging platforms.

---

## ✨ Key Features

### 🔒 End-to-End Encryption
Messages are encrypted before leaving the sender’s device and can only be decrypted by the intended recipient.

### 🚫 No Authentication System
Users remain anonymous. No login or personal information is required.

### 🧨 Disposable Sessions
Chat data is not stored on the server. Once the session ends, messages are gone.

### 🎙 Encrypted Audio Calls (Experimental)
Supports WebRTC-based 1-to-1 audio calls with additional encryption.

> Note: Audio encryption uses advanced WebRTC APIs such as `RTCRtpSender.createEncodedStreams`, which may have limited browser support.

### ⚡ Real-Time Communication
Built using Socket.io for low-latency real-time messaging.

---

## 🧠 How Encryption Works

1. Each participant generates a public/private key pair locally.
2. Public keys are exchanged securely between users.
3. Messages are encrypted using shared cryptographic material.
4. The server only relays encrypted data — it cannot decrypt content.
5. Private keys never leave the user's device.

---

## 🏗 Project Architecture

This repository follows a modular structure:

├── backend/ # Node.js + Express + Socket.io server
├── service/ # Reusable TypeScript SDK
├── client/ # Frontend application (Vite + TypeScript)
└── README.md

---

## 📦 JS SDK – `@chat-e2ee/service`

The project includes a reusable TypeScript SDK that allows developers to build custom frontends on top of the chat-e2ee backend.

The SDK handles:

- WebSocket connection management
- Encryption workflows
- Event subscriptions
- WebRTC signaling

You can integrate the service layer into your own application.

---

## 🛠 Technology Stack

- TypeScript
- Node.js
- Express
- Socket.io
- WebRTC
- Vite
- Modern Web Cryptography APIs

---

## 🧪 Development Setup

### Clone Repository

```bash
git clone https://github.com/3698dineshgupta/chat-e2ee.git
cd chat-e2ee
Install Dependencies
npm install
Build Service SDK
cd service
npm install
npm run build
Start Backend
cd ../backend
npm install
npm run dev
Start Frontend
cd ../client
npm install
npm run dev
💬 How to Initiate a Chat
Generate a unique chat link.
Share the link or PIN with the person you want to chat with.
Both users join the same session.
Messages are encrypted and exchanged securely.

🔮 Project Status
The project is under active development.
Planned improvements:
Improved UI/UX
Better browser compatibility for audio encryption
Security audits and optimization
Enhanced scalability