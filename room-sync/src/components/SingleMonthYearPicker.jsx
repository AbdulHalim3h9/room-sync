// import React, { useState } from "react";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// const SingleMonthYearPicker = ({ onChange }) => {
//   // Generate options dynamically: this month to 1 year ago
//   const currentDate = new Date();
//   const options = [];
//   for (let i = 0; i < 12; i++) {
//     const date = new Date(
//       currentDate.getFullYear(),
//       currentDate.getMonth() - i,
//       1
//     ); // Decrement month
//     const month = date.toLocaleString("en-US", { month: "long" });
//     const year = date.getFullYear().toString();
//     options.push({
//       label: `${month} ${year}`,
//       value: `${date.getFullYear()}-${date.getMonth() + 1}`,
//     });
//   }

//   // Set the default selected option to the current month and year
//   const defaultOption = `${currentDate.getFullYear()}-${
//     currentDate.getMonth() + 1
//   }`;
//   const [selectedOption, setSelectedOption] = useState(defaultOption);

//   const handleChange = (value) => {
//     setSelectedOption(value);
//     if (onChange) {
//       const [year, month] = value.split("-");
//       onChange({ year, month });
//     }
//   };

//   return (
//     <div className="w-max">
//       <Select onValueChange={handleChange} defaultValue={defaultOption}>
//         <SelectTrigger>
//           <SelectValue placeholder="Select Month and Year">
//             {options.find((option) => option.value === selectedOption)?.label}
//           </SelectValue>
//         </SelectTrigger>
//         <SelectContent>
//           <SelectGroup>
//             {options.map((option) => (
//               <SelectItem
//                 key={option.value}
//                 value={option.value}
//                 className="flex justify-end"
//               >
//                 <span className="text-left">{option.label.split(" ")[0]}</span>{" "}
//                 {/* Month */}
//                 <span className="text-right">
//                   {option.label.split(" ")[1]}
//                 </span>{" "}
//                 {/* Year */}
//               </SelectItem>
//             ))}
//           </SelectGroup>
//         </SelectContent>
//       </Select>
//     </div>
//   );
// };

// export default SingleMonthYearPicker;


import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SingleMonthYearPicker = ({ onChange }) => {
  // Generate options dynamically: this month to 1 year ago
  const currentDate = new Date();
  const options = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    ); // Decrement month
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear().toString();
    const formattedMonth = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two digits
    options.push({
      label: `${month} ${year}`,
      value: `${year}-${formattedMonth}`, // Format as "YYYY-MM"
    });
  }

  // Set the default selected option to the current month and year
  const defaultOption = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;
  const [selectedOption, setSelectedOption] = useState(defaultOption);

  const handleChange = (value) => {
    setSelectedOption(value);
    if (onChange) {
      onChange(value); // Return the string "YYYY-MM"
    }
  };

  return (
    <div className="w-max">
      <Select onValueChange={handleChange} defaultValue={defaultOption}>
        <SelectTrigger>
          <SelectValue placeholder="Select Month and Year">
            {options.find((option) => option.value === selectedOption)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="flex justify-end"
              >
                <span className="text-left">{option.label.split(" ")[0]}</span>{" "}
                {/* Month */}
                <span className="text-right">
                  {option.label.split(" ")[1]}
                </span>{" "}
                {/* Year */}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SingleMonthYearPicker;
