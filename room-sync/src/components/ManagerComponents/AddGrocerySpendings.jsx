// import React, { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// // Import the members data from the JSON file
// import { membersData } from "@/membersData"; // Adjust the import path as needed
// import { DatePick } from "./DatePick";

// const AddGrocerySpendings = () => {
//   const [amountSpent, setAmountSpent] = useState("");
//   const [selectedShopper, setSelectedShopper] = useState(""); // State for selected shopper
//   const [expenseType, setExpenseType] = useState("groceries"); // State to handle "Groceries" or "Other" selection
//   const [expenseTitle, setExpenseTitle] = useState(""); // State for the title in "Other" form

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Amount Spent:", amountSpent);
//     console.log("Shopper:", selectedShopper);
//     console.log("Expense Type:", expenseType);
//     if (expenseType === "other") {
//       console.log("Expense Title:", expenseTitle);
//     }
//     // Here you can handle form submission logic
//   };

//   return (
//     <div className="max-w-md mx-auto p-6">
//       <h1 className="text-xl font-bold mb-6">Add Grocery or Other Expense</h1>
//       <DatePick /> {/* Date Picker Component */}

//       {/* Radio Buttons for Expense Type */}
//       <div className="flex space-x-4 mb-6">
//         <div>
//           <input
//             type="radio"
//             id="groceries"
//             name="expenseType"
//             value="groceries"
//             checked={expenseType === "groceries"}
//             onChange={() => setExpenseType("groceries")}
//           />
//           <Label htmlFor="groceries" className="ml-2">
//             Groceries
//           </Label>
//         </div>

//         <div>
//           <input
//             type="radio"
//             id="other"
//             name="expenseType"
//             value="other"
//             checked={expenseType === "other"}
//             onChange={() => setExpenseType("other")}
//           />
//           <Label htmlFor="other" className="ml-2">
//             Other
//           </Label>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Amount Spent Field */}
//         <div>
//           <Label htmlFor="amount" className="block mb-1">
//             Amount Spent
//           </Label>
//           <Input
//             id="amount"
//             type="number"
//             placeholder="Enter amount spent"
//             value={amountSpent}
//             onChange={(e) => setAmountSpent(e.target.value)}
//             className="w-full"
//           />
//         </div>

//         {/* If "Other" is selected, display the title field */}
//         {expenseType === "other" && (
//           <div>
//             <Label htmlFor="title" className="block mb-1">
//               Expense Title
//             </Label>
//             <Input
//               id="title"
//               type="text"
//               placeholder="Enter expense title"
//               value={expenseTitle}
//               onChange={(e) => setExpenseTitle(e.target.value)}
//               className="w-full"
//             />
//           </div>
//         )}

//         {/* Shopper Dropdown (only shown for groceries) */}
//         {expenseType === "groceries" && (
//           <div>
//             <Label htmlFor="shopper" className="block mb-1">
//               Shopper
//             </Label>
//             <select
//               id="shopper"
//               value={selectedShopper}
//               onChange={(e) => setSelectedShopper(e.target.value)}
//               className="w-full border px-3 py-2 rounded-md"
//             >
//               <option value="">Select a shopper</option>
//               {membersData.map((member) => (
//                 <option key={member.member_id} value={member.member_name}>
//                   {member.member_name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {/* Submit Button */}
//         <div>
//           <Button className="w-full" type="submit">Submit</Button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddGrocerySpendings;


import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { membersData } from "@/membersData"; // Adjust the import path as needed
import { DatePick } from "./DatePick";
import { db } from "@/firebase"; // Import Firebase configuration
import { collection, addDoc } from "firebase/firestore";

const AddGrocerySpendings = () => {
  const [amountSpent, setAmountSpent] = useState("");
  const [selectedShopper, setSelectedShopper] = useState("");
  const [expenseType, setExpenseType] = useState("groceries");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [date, setDate] = useState(new Date());

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      amountSpent,
      shopper: selectedShopper || null,
      expenseType,
      expenseTitle: expenseType === "other" ? expenseTitle : null,
      date: date.toISOString(), // Save date as ISO string
    };

    try {
      await addDoc(collection(db, "expenses"), data); // Save data to Firestore
      console.log("Document successfully written!");
      // Clear the form after submission
      setAmountSpent("");
      setSelectedShopper("");
      setExpenseType("groceries");
      setExpenseTitle("");
      setDate(new Date());
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">Add Grocery or Other Expense</h1>
      <DatePick selectedDate={date} setSelectedDate={setDate} />

      <div className="flex space-x-4 mb-6">
        <div>
          <input
            type="radio"
            id="groceries"
            name="expenseType"
            value="groceries"
            checked={expenseType === "groceries"}
            onChange={() => setExpenseType("groceries")}
          />
          <Label htmlFor="groceries" className="ml-2">
            Groceries
          </Label>
        </div>

        <div>
          <input
            type="radio"
            id="other"
            name="expenseType"
            value="other"
            checked={expenseType === "other"}
            onChange={() => setExpenseType("other")}
          />
          <Label htmlFor="other" className="ml-2">
            Other
          </Label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="amount" className="block mb-1">
            Amount Spent
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount spent"
            value={amountSpent}
            onChange={(e) => setAmountSpent(e.target.value)}
            className="w-full"
          />
        </div>

        {expenseType === "other" && (
          <div>
            <Label htmlFor="title" className="block mb-1">
              Expense Title
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter expense title"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {expenseType === "groceries" && (
          <div>
            <Label htmlFor="shopper" className="block mb-1">
              Shopper
            </Label>
            <select
              id="shopper"
              value={selectedShopper}
              onChange={(e) => setSelectedShopper(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="">Select a shopper</option>
              {membersData.map((member) => (
                <option key={member.member_id} value={member.member_name}>
                  {member.member_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <Button className="w-full" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddGrocerySpendings;
