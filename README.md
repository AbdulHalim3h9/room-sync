RoomSync 🏠✨
RoomSync is a free, open-source solution to streamline apartment and mess management. Built with React, Shadcn, and Firebase, it simplifies daily tasks like meal entry, funding, member management, and payments. Whether you're tracking meals, groceries, or finances, RoomSync keeps everyone in sync—without the hassle!
Hosted on Vercel, RoomSync offers a seamless experience for managers, administrators, and members. No login required for normal members to view their contributions, meal counts, or grocery details. Perfect for shared living spaces, hostels, or any group managing communal tasks.

🌟 Features

Meal Management 🍽️

Log daily meal entries effortlessly.
View monthly meal counts and meal rates.
Track individual meal consumption (e.g., how much worth of meals each member has eaten).


Funding & Payments 💸

Monitor contributions (e.g., how much money each member has funded).
Visualize balances with interactive charts (contributions vs. consumption).
Manage payments with clear records.


Grocery Tracking 🛒

Record grocery purchases and their costs.
Track who shopped for groceries.
See the total worth of groceries marketed.


Member Management 👥

Add, update, or archive members.
Role-based access:
Manager: Oversee tasks, approve entries, and manage members.
Administrator: Full control, including setting the "Call Khala" option.
Normal Members: View personal stats (funding, meals, groceries) without logging in.




Call Khala Option 📞

Administrators can set number to call khala (Maid).


Charts & Insights 📊

Beautiful, responsive charts powered by Recharts.
Monthly summaries of contributions, consumption, and balances.
Filter data by month


Free & Accessible 🆓

100% free solution using open-source tools.
No login required for members to access their data.
Hosted on Vercel for reliable, fast performance.




🛠️ Tech Stack

Frontend: React.js with Shadcn UI for a modern, accessible interface.
Backend: Firebase Firestore for real-time data storage (members, meals, contributions).
Charts: Recharts for interactive visualizations.
Authentication: Firebase Authentication for secure manager/admin access.
Deployment: Vercel for free, scalable hosting.
Routing: React Router for seamless navigation.


🚀 Getting Started
Prerequisites

Node.js (v16 or higher)
Firebase project (set up Firestore and Authentication)
Vercel account for deployment

Installation

Clone the repository:
git clone https://github.com/AbdulHalim3h9/room-sync.git
cd roomsync


Install dependencies:
npm install


Set up Firebase:

Create a Firebase project at console.firebase.google.com.

Add your Firebase config to src/firebase.js:
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




Run locally:
npm run dev

Open http://localhost:5173 to view the app.

Deploy to Vercel:

Push to GitHub.
Connect your repo to Vercel at vercel.com.
Set environment variables (Firebase config) in Vercel dashboard.
Deploy with one click!




📋 Usage
For Managers & Administrators

Login: Use Firebase Authentication to access the dashboard.
Manage Members: Add/edit members.
Meal Entry: Log daily meals in Firestore
Funding: Record contributions.
Grocery Tracking: Add grocery purchases and assign shoppers.
Call Khala: Call the maid in case she is absent.

For Normal Members

No Login Needed: 
Funded amount.
Meal consumption.
Monthly meal count and rate.
Grocery contributions (who shopped, how much spent).


Charts: Interactive Recharts visualize contributions vs. consumption.
Filter by Month: Use monthpicker to view data by month.


🔐 Roles & Permissions



Role
Permissions



Administrator
Full control: manage members, meals, funds, groceries, set "Call Khala" phone numbers.


Manager
Manage meals, funds, groceries; view reports; limited member management.


Normal Member
View personal stats (funding, meals, groceries) without login; no edit access.


🌐 Live Demo
Check out RoomSync live on Vercel:👉 https://room-sync-401.vercel.app/

🙌 Acknowledgments

Shadcn: For beautiful, accessible UI components.
Firebase: For free, scalable backend services.
Vercel: For seamless deployment.
Recharts: For stunning charts.
React Community: For endless inspiration.


RoomSync: Keeping your apartment in sync, one meal at a time! 🍲💸
