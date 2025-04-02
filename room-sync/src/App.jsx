import React, { createContext, useState, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Layout from "./components/layouts/layout";
import BottomNavigation from "./components/layouts/BottomNavigation";
import CreditConsumed from "./components/CreditConsumed";
import Payables from "./components/Payables";
import Groceries_spendings from "./components/GroceryTurns";
import AddMealFund from "./components/ManagerComponents/AddMealFund";
import AddGrocerySpendings from "./components/ManagerComponents/AddGrocerySpendings";
import SetDailyMealCount from "./components/ManagerComponents/SetDailyMealCount";
import SetPayables from "./components/ManagerComponents/SetPayables";
import ManageMembers from "./components/ManagerComponents/ManageMembers";
import RegisterMember from "./components/AdminComponents/RegisterMember";
import MemberDetails from "./components/AdminComponents/MemberDetails";

// Create the context
const MonthContext = createContext();

// Custom hook for accessing the context
export const useMonth = () => useContext(MonthContext);

const App = () => {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Ensure 2 digits
    return `${year}-${month}`; // Format as "YYYY-MM"
  });

  return (
    <MonthContext.Provider value={{ month, setMonth }}>
        <Layout />
        <Routes>
          <Route path="/creditconsumed/*" element={<CreditConsumed />} />
          <Route path="/payables" element={<Payables />} />
          <Route path="/groceries_spendings" element={<Groceries_spendings />} />
          <Route path="/add-grocery-spendings" element={<AddGrocerySpendings />} />
          <Route path="/add-meal-fund" element={<AddMealFund />} />
          <Route path="/set-payables" element={<SetPayables />} />
          <Route path="/set-daily-meal-count" element={<SetDailyMealCount />} />
          <Route path="/register-member" element={<RegisterMember />} />
          <Route path="/members" element={<ManageMembers />} />
          <Route path="/member-details" element={<MemberDetails />} />
        </Routes>
        <BottomNavigation />
    </MonthContext.Provider>
  );
};

export default App;


// import React, { useState, useEffect } from "react";
// import { db } from "./firebase";
// import {
//   collection,
//   getDocs,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   doc,
// } from "firebase/firestore";

// const App = () => {
//   const [tasks, setTasks] = useState([]);
//   const [newTask, setNewTask] = useState("");

//   const tasksCollectionRef = collection(db, "tasks");

//   // Fetch tasks
//   const fetchTasks = async () => {
//     const data = await getDocs(tasksCollectionRef);
//     setTasks(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
//   };

//   // Add task
//   const addTask = async () => {
//     if (!newTask) return;
//     await addDoc(tasksCollectionRef, { title: newTask, completed: false });
//     setNewTask("");
//     fetchTasks();
//   };

//   // Update task
//   const toggleComplete = async (id, completed) => {
//     const taskDoc = doc(db, "tasks", id);
//     await updateDoc(taskDoc, { completed: !completed });
//     fetchTasks();
//   };

//   // Delete task
//   const deleteTask = async (id) => {
//     const taskDoc = doc(db, "tasks", id);
//     await deleteDoc(taskDoc);
//     fetchTasks();
//   };

//   useEffect(() => {
//     fetchTasks();
//   }, []);

//   return (
//     <div>
//       <h1>Task Manager</h1>
//       <input
//         type="text"
//         value={newTask}
//         onChange={(e) => setNewTask(e.target.value)}
//         placeholder="Add new task"
//       />
//       <button onClick={addTask}>Add Task</button>
//       <ul>
//         {tasks.map((task) => (
//           <li key={task.id}>
//             <span
//               style={{
//                 textDecoration: task.completed ? "line-through" : "none",
//               }}
//             >
//               {task.title}
//             </span>
//             <button onClick={() => toggleComplete(task.id, task.completed)}>
//               {task.completed ? "Undo" : "Complete"}
//             </button>
//             <button onClick={() => deleteTask(task.id)}>Delete</button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default App;
