import React, { useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import SingleMonthYearPicker from './SingleMonthYearPicker';
import { format } from 'date-fns';

const MonthlySummaryTabs = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [carryforwardData, setCarryforwardData] = useState([]);
  const [mealRate, setMealRate] = useState(0);
  const [groceriesWorth, setGroceriesWorth] = useState(0);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Fetch data for the selected month/year
    // This is where you would make API calls to get the data
    // For now, we'll use mock data
    setCarryforwardData([
      { name: 'Member 1', funded: 5000, meals: 30, dues: 1000 },
      { name: 'Member 2', funded: 6000, meals: 25, dues: 1500 },
      { name: 'Member 3', funded: 4500, meals: 28, dues: 800 },
    ]);
    setMealRate(150);
    setGroceriesWorth(12000);
  };

  const totalMealCount = carryforwardData.reduce((sum, member) => sum + member.meals, 0);
  const totalFunded = carryforwardData.reduce((sum, member) => sum + member.funded, 0);
  const totalDues = carryforwardData.reduce((sum, member) => sum + member.dues, 0);

  return (
    <div className="p-4">
      <SingleMonthYearPicker
        selectedDate={selectedDate}
        onChange={handleDateChange}
      />
      
      <Tabs className="mt-4">
        <TabList>
          <Tab>Real-time Summary</Tab>
          <Tab>Carryforward</Tab>
        </TabList>

        <TabPanel>
          <div className="p-4">
            {/* Real-time summary content will go here */}
            <h3 className="text-lg font-semibold mb-4">Real-time Summary</h3>
            <div className="bg-white p-4 rounded-lg shadow">
              {/* Add your summary content here */}
            </div>
          </div>
        </TabPanel>

        <TabPanel>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Carryforward Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 text-left">Member Name</th>
                    <th className="px-6 py-3 text-left">Funded Amount</th>
                    <th className="px-6 py-3 text-left">Meal Count</th>
                    <th className="px-6 py-3 text-left">Meal Cost</th>
                    <th className="px-6 py-3 text-left">AWES</th>
                    <th className="px-6 py-3 text-left">Dues</th>
                  </tr>
                </thead>
                <tbody>
                  {carryforwardData.map((member, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4">{member.name}</td>
                      <td className="px-6 py-4">{member.funded} tk</td>
                      <td className="px-6 py-4">{member.meals}</td>
                      <td className="px-6 py-4">{(member.meals * mealRate).toFixed(2)} tk</td>
                      <td className="px-6 py-4">0 tk</td>
                      <td className="px-6 py-4">{member.dues} tk</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Total Groceries Worth</p>
                    <p className="text-lg font-semibold">{groceriesWorth} tk</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Total Meal Count</p>
                    <p className="text-lg font-semibold">{totalMealCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Meal Rate</p>
                    <p className="text-lg font-semibold">{mealRate} tk</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default MonthlySummaryTabs;
