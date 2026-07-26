<div align="center">

# 🧱 DevStack

### _Where Developers Find Answers._

A modern, full-stack developer Q&A community platform built with **Next.js 19**, **Appwrite**, and **Magic UI** — inspired by Stack Overflow.

<br/>

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Appwrite](https://img.shields.io/badge/Appwrite-13-FD366E?style=for-the-badge&logo=appwrite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-433E38?style=for-the-badge)
![Motion](https://img.shields.io/badge/Motion-12-EC4899?style=for-the-badge)

</div>

---

## 📖 Project Overview

**DevStack** is a community-driven Q&A platform built for developers. It gives programmers a space to ask technical questions, share solutions, upvote the best answers, and discuss ideas through threaded comments — all wrapped in a sleek, animated dark-mode UI.

The project solves a common need: a self-hostable, customizable alternative to Stack Overflow that you own end-to-end. The entire backend is powered by **Appwrite** — handling auth, databases, file storage, and server-side logic via the Node.js SDK — while the frontend runs on Next.js with a rich component library built from **Magic UI** and **shadcn/ui**.

---

## ✨ Key Features

- **Questions & Answers** — Ask questions with a rich Markdown editor, attach files/screenshots, and tag them for discoverability. Browse and answer questions posted by the community.

- **Community Voting** — Upvote or downvote both questions and answers. Every vote updates the author's **reputation score** automatically via Appwrite's server-side SDK, encouraging quality contributions.

- **Commenting System** — Leave threaded comments on both questions and answers. Comments are typed (`question` | `answer`) and resolved by ID, making the data model clean and flexible.

- **Search & Pagination** — A real-time search bar on the questions listing filters results by title. URL-based search params (`?search=`, `?tag=`, `?page=`) keep results shareable and bookmarkable.

- **Authentication** — Email/password sign-up and login powered by Appwrite Accounts. Sessions are persisted with Zustand and validated server-side on each request.

- **User Profiles & Reputation** — Each user earns reputation points for answers and votes received, tracked in Appwrite User Preferences.

- **File Attachments** — Questions can include image or file attachments uploaded to Appwrite Storage.

- **Animated UI** — Floating navigation bar, shimmer buttons, meteor shower animations, border beams, and confetti celebrations — all from Magic UI and Motion.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 16.2 (App Router), React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4, tw-animate-css |
| **UI Components** | shadcn/ui, Magic UI (ShimmerButton, Meteors, BorderBeam, FloatingNav) |
| **Icons** | Lucide React, Tabler Icons |
| **Animations** | Motion (Framer Motion successor) |
| **Rich Text Editor** | @uiw/react-markdown-editor |
| **State Management** | Zustand 5 with Immer middleware + persist middleware |
| **Backend-as-a-Service** | Appwrite 13 |
| **Appwrite — Auth** | Appwrite Accounts (email/password sessions) |
| **Appwrite — Database** | Appwrite Databases (questions, answers, comments, votes) |
| **Appwrite — Storage** | Appwrite Storage (question file attachments) |
| **Appwrite — Users** | Appwrite Users SDK (reputation in user prefs, avatars) |
| **Server SDK** | node-appwrite 13 (API routes / server actions) |
| **Client SDK** | appwrite 13 (client-side auth & data) |
| **Slug Generation** | slugify |
| **Confetti** | canvas-confetti |
| **Package Manager** | npm |

---

## 🔑 Prerequisites & Environment Variables

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- An **Appwrite** instance — either [self-hosted](https://appwrite.io/docs/self-hosting) or [Appwrite Cloud](https://cloud.appwrite.io/)

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# ─── Appwrite ─────────────────────────────────────────────────────────────────

# Your Appwrite server URL (e.g. https://cloud.appwrite.io/v1 or your self-hosted URL)
NEXT_PUBLIC_APPWRITE_HOST_URL=

# Your Appwrite Project ID (found in Project Settings → General)
NEXT_PUBLIC_APPWRITE_PROJECT_ID=

# Server-side API Key with the required scopes (databases.read, databases.write,
# users.read, users.write, storage.read, storage.write)
# Never expose this key on the client side.
APPWRITE_API_KEY=
```

> **Why three variables?** `NEXT_PUBLIC_*` variables are safe to bundle in the browser bundle and are used by the Appwrite JS client SDK. `APPWRITE_API_KEY` is a secret used exclusively in Next.js API Route Handlers (server-side) via the node-appwrite SDK and is never exposed to the client.

---

## 🚀 Getting Started — Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/xxdiii/DevStack.git
cd DevStack
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local   # or create .env.local manually
```

Open `.env.local` and fill in your Appwrite credentials as described in the [Environment Variables](#-prerequisites--environment-variables) section above.

### 4. Set Up Appwrite

#### a) Create a Project
Log in to your Appwrite Console, create a new project, and copy the **Project ID** into your `.env.local`.

#### b) Create a Web Platform
Under your project → **Overview** → **Platforms**, add a **Web** platform:
- **Hostname:** `localhost` (for development)

#### c) Create an API Key
Go to **Settings** → **API Keys** → **Create API Key**. Grant the following scopes:
- `databases.read`, `databases.write`
- `users.read`, `users.write`
- `storage.read`, `storage.write`
- `sessions.write` (for server-side session validation)

Copy the generated key into `APPWRITE_API_KEY` in your `.env.local`.

#### d) Bootstrap the Database & Storage

DevStack ships with an automated setup script. Run the development server once — it will auto-create the database, all collections, their attributes, and the storage bucket via the Appwrite Node SDK on first boot:

```bash
npm run dev
```

> The setup is triggered via `src/models/server/dbSetup.ts`, which calls `getOrCreateDB()`. If the database already exists it skips creation silently.

### 5. Open the App

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Appwrite Database Schema

**Database ID / Name:** `main-stackoverlfow`

### `questions` Collection

Stores all developer questions.

| Attribute | Type | Required | Notes |
|---|---|---|---|
| `title` | String (100) | ✅ | Question title |
| `content` | String (10,000) | ✅ | Full question body (Markdown) |
| `authorId` | String (50) | ✅ | Appwrite User `$id` |
| `tags` | String[] (50 each) | ✅ | Array of tag strings |
| `attachmentId` | String (50) | ❌ | Appwrite Storage file `$id` |

### `answers` Collection

Stores answers linked to a parent question.

| Attribute | Type | Required | Notes |
|---|---|---|---|
| `content` | String (10,000) | ✅ | Answer body (Markdown) |
| `questionId` | String (50) | ✅ | Parent question `$id` |
| `authorId` | String (50) | ✅ | Appwrite User `$id` |

### `comments` Collection

Stores comments on either a question or an answer.

| Attribute | Type | Required | Notes |
|---|---|---|---|
| `content` | String (10,000) | ✅ | Comment body |
| `type` | Enum (`question` \| `answer`) | ✅ | Target resource type |
| `typeId` | String (50) | ✅ | `$id` of the target question or answer |
| `authorId` | String (50) | ✅ | Appwrite User `$id` |

### `votes` Collection

Tracks upvotes and downvotes on both questions and answers.

| Attribute | Type | Required | Notes |
|---|---|---|---|
| `type` | Enum (`question` \| `answer`) | ✅ | Target resource type |
| `typeId` | String (50) | ✅ | `$id` of the target question or answer |
| `voteStatus` | Enum (`upvoted` \| `downvoted`) | ✅ | The vote direction |
| `votedById` | String (50) | ✅ | Appwrite User `$id` of the voter |

### Appwrite Storage Bucket

| Bucket ID | Purpose |
|---|---|
| `question-attachment` | Stores file/image attachments uploaded with questions |

### User Preferences (Appwrite Users SDK)

Reputation is stored in each user's Appwrite preferences object:

```ts
interface UserPrefs {
  reputation: number;
}
```

Reputation is incremented server-side whenever a user posts an answer or receives a vote.

---

## 📁 Project Structure

```
DevStack/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/          # Login page
│   │   │   └── register/       # Registration page
│   │   ├── api/
│   │   │   ├── answer/         # POST: create answer
│   │   │   ├── comment/        # POST: create comment
│   │   │   ├── question/       # POST: create question (with file upload)
│   │   │   └── vote/           # POST/DELETE: cast or remove vote
│   │   ├── questions/
│   │   │   ├── ask/            # Ask a question page
│   │   │   ├── [questionId]/   # Question detail page
│   │   │   └── page.tsx        # Questions listing with search & pagination
│   │   ├── users/
│   │   │   └── [userId]/       # User profile page
│   │   ├── components/         # App-level components (Header, Hero, etc.)
│   │   ├── env.ts              # Typed env variable access
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   ├── magicui/            # Magic UI components (Shimmer, Meteors, BorderBeam)
│   │   ├── ui/                 # shadcn/ui primitives (Input, Label, FloatingNav)
│   │   ├── QuestionCard.tsx
│   │   ├── QuestionForm.tsx
│   │   ├── Pagination.tsx
│   │   └── RTE.tsx             # Markdown rich-text editor (dynamic import)
│   ├── models/
│   │   ├── name.ts             # Collection / database / bucket ID constants
│   │   ├── client/             # Appwrite client SDK setup (Account, Databases, Storage)
│   │   └── server/             # Appwrite server SDK setup + collection creators
│   ├── store/
│   │   └── Auth.ts             # Zustand auth store (session, user, JWT, reputation)
│   └── utils/
│       ├── slugify.ts
│       └── relativeTime.ts
├── .env.local                  # Your local secrets (never commit this)
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change, then submit a pull request against the `main` branch.

---

## 📄 License

This project is open source. See the repository for license details.

---

<div align="center">
  <sub>Built with ☕ and Next.js by <strong>Aadithya Suresh</strong></sub>
</div>
