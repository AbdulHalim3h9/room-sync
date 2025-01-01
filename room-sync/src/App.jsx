import React from "react";
import CreditChart from "./components/CreditChart";
import Layout from "./components/layouts/layout";
import BottomNavigation from "./components/layouts/BottomNavigation";
import NavigateMembers from "./components/layouts/NavigateMembers";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import { membersData } from "@/membersData";
import CreditConsumed from "./components/CreditConsumed";
import Payables from "./components/Payables";
import GroceryTurns from "./components/GroceryTurns";
import MemberForm from "./components/TestComponent";
import SetDailyMealCount from "./components/AdminComponents/SetDailyMealCount";
import SetPayables from "./components/AdminComponents/SetPayables";
import AddMealFund from "./components/AdminComponents/AddMealFund";
import AddGrocerySpendings from "./components/AdminComponents/AddGrocerySpendings";

const App = () => {
  return (
    <>
      <Layout />
      {/* <AddGrocerySpendings/> */}
      {/* <AddMealFund/> */}
      {/* <SetPayables/> */}
      {/* <SetDailyMealCount/> */}
      <Routes>
        <Route path="/creditconsumed/*" element={<CreditConsumed />}></Route>
        <Route path="/payables" element={<Payables />}></Route>
        <Route path="/groceryturns" element={<GroceryTurns />}></Route>
        {/* Admin Routes */}
        <Route
          path="/add-grocery-spendings"
          element={<AddGrocerySpendings />}
        />
        <Route path="/add-meal-fund" element={<AddMealFund />} />
        <Route path="/set-payables" element={<SetPayables />} />
        <Route path="/set-daily-meal-count" element={<SetDailyMealCount />} />
      </Routes>
      <BottomNavigation />
    </>
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
