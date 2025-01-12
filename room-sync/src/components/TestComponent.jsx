import React, { useState, useEffect } from "react";
import { db } from "./../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

const MemberForm = () => {
  const [memberId, setMemberId] = useState("");
  const [mealCounts, setMealCounts] = useState("");
  const [formData, setFormData] = useState(null);
  const [savedData, setSavedData] = useState([]);

  const tasksCollectionRef = collection(db, "members");

  // Fetch data from Firebase
  const fetchData = async () => {
    const data = await getDocs(tasksCollectionRef);
    setSavedData(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  // Submit form data to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert mealCounts from a comma-separated string to an array of numbers
    const mealCountArray = mealCounts
      .split(",")
      .map((item) => parseInt(item.trim(), 10))
      .filter((num) => !isNaN(num));

    // Save data to Firebase
    await addDoc(tasksCollectionRef, {
      memberId,
      mealCounts: mealCountArray,
    });

    // Reset form inputs
    setMemberId("");
    setMealCounts("");
    fetchData(); // Fetch the updated data
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1>Member Form</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="memberId" className="block text-sm font-medium text-gray-700">
            Member ID
          </label>
          <input
            id="memberId"
            type="text"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="mealCounts" className="block text-sm font-medium text-gray-700">
            Meal Counts (Comma Separated)
          </label>
          <input
            id="mealCounts"
            type="text"
            value={mealCounts}
            onChange={(e) => setMealCounts(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Submit
        </button>
      </form>

      {/* Display the saved data */}
      <div className="mt-6">
        <h2 className="text-xl font-bold">Saved Data:</h2>
        <ul className="space-y-2">
          {savedData.map((item) => (
            <li key={item.id} className="p-4 bg-gray-100 rounded-md">
              <p><strong>Member ID:</strong> {item.memberId}</p>
              <p><strong>Meal Counts:</strong> {item.mealCounts.join(", ")}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MemberForm;
