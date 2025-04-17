# 🏠 RoomSync — Hassle-Free Apartment & Mess Management

**RoomSync** is a **free**, **open-source** solution built to simplify shared living. From tracking meals to managing payments, groceries, and members—**RoomSync keeps everything in sync**, effortlessly. Designed with **React**, **Shadcn UI**, and **Firebase**, it’s fast, modern, and intuitive.

🔗 **[Live Demo](https://room-sync-401.vercel.app/)** — Try it now on Vercel!

---

## ✨ Why RoomSync?

Whether you’re in a **shared apartment**, **hostel**, or any group-based living setup, RoomSync offers:

- ✅ No login needed for regular members  
- ✅ Real-time updates with Firebase  
- ✅ Beautiful charts and reports  
- ✅ Fast, responsive UI  

---

## 🌟 Features

### 🍽️ Meal Management  
- Log daily meal entries effortlessly  
- View monthly meal counts and meal rates  
- Track individual consumption (how much each member has eaten in currency)

---

### 💸 Funding & Payments  
- Record how much each member has contributed  
- See balances via interactive charts (funded vs. consumed)  
- Maintain clear, organized payment records

---

### 🛒 Grocery Tracking  
- Add grocery items with cost and date  
- Track who bought what  
- See total grocery expenses

---

### 👥 Member Management  
- Add, update, or archive members  
- **Role-based access**:  
  - **Administrator**: Full control  
  - **Manager**: Moderate control  
  - **Normal Member**: View-only access (no login needed)

---

### 📞 “Call Khala” Option  
Admins can set a phone number for calling the maid directly in emergencies or absences.

---

### 📊 Charts & Insights  
- Stunning, responsive charts using **Recharts**  
- Monthly summaries of meals, contributions, and balances  
- **Filter by month** to explore trends

---

## 🛠️ Tech Stack

| Layer       | Tech Used |
|-------------|-----------|
| **Frontend** | React + Shadcn UI |
| **Backend** | Firebase Firestore |
| **Auth** | Firebase Authentication |
| **Charts** | Recharts |
| **Routing** | React Router |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### 🔧 Prerequisites
- Node.js (v16 or above)  
- Firebase project (Firestore + Auth enabled)  
- Vercel account for deployment

---

### 📦 Installation

```bash
# Clone the repository
git clone https://github.com/AbdulHalim3h9/room-sync.git
cd roomsync

# Install dependencies
npm install
```

---

### 🔌 Set Up Firebase

Create a project at [Firebase Console](https://console.firebase.google.com) and add the config:

```js
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

---

### 🖥️ Run Locally

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

### 🚢 Deploy to Vercel

- Push your code to GitHub  
- Connect the repo at [vercel.com](https://vercel.com)  
- Add Firebase config as **Environment Variables**  
- Deploy with one click 🎉

---

## 📋 Usage Guide

### 🔐 Roles & Permissions

| Role            | Access |
|------------------|--------|
| **Administrator** | Full access: members, meals, groceries, settings, “Call Khala” |
| **Manager**       | Manage entries, track reports, limited member control |
| **Normal Member** | View-only access (no login required) |

---

### 👨‍💼 For Managers/Admins
- Login with Firebase Authentication  
- Access dashboard to manage everything  
- Add/edit meals, groceries, contributions  
- Call maid when needed  

---

### 👤 For Normal Members
_No login required!_  
Just visit the app to view:

- Funded amount  
- Monthly meal count & rate  
- Individual meal consumption  
- Grocery contributions  

---

## 🙌 Acknowledgments

- **Shadcn UI** — Elegant, accessible UI components  
- **Firebase** — Fast, scalable backend  
- **Vercel** — Effortless deployment  
- **Recharts** — Beautiful data visualization  
- **React Community** — Constant inspiration ❤️

---

## 💬 Final Words

**RoomSync**: Keeping your apartment in sync, one meal at a time.  
No stress. Just clean, simple management. 🍲💸