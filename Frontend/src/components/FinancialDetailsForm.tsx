import React, { useState } from "react";
import {
  DollarSign,
  Calendar,
  Target,
  BarChart as ChartBar,
  Upload,
  X,
} from "lucide-react";
import { useFinancialContext } from "../contexts/FinancialContext";
import axios from "axios";

interface FinancialDetails {
  monthlySalary: number;
  expenses: {
    rent: number;
    groceries: number;
    utilities: number;
    entertainment: number;
    miscellaneous: number;
  };
  lifeGoals: Array<{
    name: string;
    timeline: number;
    cost: number;
  }>;
  riskTolerance: "Low" | "Medium" | "High";
  investmentPreferences: string[];
  debt: {
    amount: number;
    interestRate: number;
    tenure: number;
  };
}

const investmentOptions = [
  "Stocks",
  "Real Estate",
  "Gold",
  "Mutual Funds",
  "Crypto",
  "Fixed Deposits",
  "Bonds",
];

export function FinancialDetailsForm({ onClose }: { onClose: () => void }) {
  const [details, setDetails] = useState<FinancialDetails>({
    monthlySalary: 0,
    expenses: {
      rent: 0,
      groceries: 0,
      utilities: 0,
      entertainment: 0,
      miscellaneous: 0,
    },
    lifeGoals: [],
    riskTolerance: "Medium",
    investmentPreferences: [],
    debt: {
      amount: 0,
      interestRate: 0,
      tenure: 0,
    },
  });

  const [showExpenses, setShowExpenses] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: "", timeline: 0, cost: 0 });
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploadProgress(0), 1000);
        }
      }, 200);
    }
  };

  const addGoal = () => {
    if (newGoal.name && newGoal.timeline && newGoal.cost) {
      setDetails((prev) => ({
        ...prev,
        lifeGoals: [...prev.lifeGoals, newGoal],
      }));
      setNewGoal({ name: "", timeline: 0, cost: 0 });
    }
  };

  const { setSummaryStatement } = useFinancialContext();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/db/update", {
        body: details,
      });
      console.log(res, "this is response");
    } catch (error) {
      console.log(error, "this is error");
    }
    // Construct the summary statement
    const expensesSummary = Object.entries(details.expenses)
      .map(([key, value]) => `${key}: ₹${value}`)
      .join(", ");

    const lifeGoalsSummary = details.lifeGoals
      .map(
        (goal) =>
          `${goal.name} (Timeline: ${goal.timeline} years, Cost: ₹${goal.cost})`
      )
      .join(", ");

    const investmentPreferencesSummary =
      details.investmentPreferences.join(", ");

    const summaryStatement = `
      My monthly salary is ₹${details.monthlySalary}.
      My monthly expenses are: ${expensesSummary}.
      My life goals are: ${lifeGoalsSummary}.
      My risk tolerance is ${details.riskTolerance}.
      My investment preferences are: ${investmentPreferencesSummary}.
      My debt details are: Amount: ₹${details.debt.amount}, Interest Rate: ${details.debt.interestRate}%, Tenure: ${details.debt.tenure} years.
    `;

    localStorage.setItem("summary", JSON.stringify(summaryStatement));
    console.log("added to localstorage");

    // Update the context with the summary statement
    setSummaryStatement(summaryStatement.trim());

    // Close the form
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-navy-900/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="h-[90vh] w-full max-w-4xl bg-navy-800 border border-navy-700 rounded-2xl shadow-xl p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-blue-500/5 rounded-2xl" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gold transition-colors">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gold to-blue-500 bg-clip-text text-transparent relative">
          Financial Profile Setup
        </h2>

        <form
          onSubmit={handleSubmit}
          className="h-[75vh] overflow-auto space-y-6 relative">
          {/* Monthly Salary */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Monthly Salary
            </label>
            <div className="relative">
              &#8377;
              <input
                type="number"
                value={details.monthlySalary}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev,
                    monthlySalary: +e.target.value,
                  }))
                }
                className="w-full bg-navy-900 border border-navy-700 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all"
                placeholder="Enter your monthly salary"
              />
            </div>
          </div>

          {/* Expenses */}
          <div>
            <button
              type="button"
              onClick={() => setShowExpenses(!showExpenses)}
              className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 text-left hover:border-gold/50 transition-all">
              <div className="flex items-center justify-between">
                <span>Monthly Expenses</span>
                <ChartBar
                  className={`w-5 h-5 transition-transform ${
                    showExpenses ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {showExpenses && (
              <div className="mt-4 space-y-4 pl-4 border-l-2 border-navy-700">
                {Object.entries(details.expenses).map(([key, value]) => (
                  <div key={key} className="group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                      {key}
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) =>
                        setDetails((prev) => ({
                          ...prev,
                          expenses: {
                            ...prev.expenses,
                            [key]: +e.target.value,
                          },
                        }))
                      }
                      className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all"
                      placeholder={`Enter ${key} expense`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Life Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Life Goals
            </label>
            <div className="space-y-4">
              {details.lifeGoals.map((goal, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 bg-navy-900 border border-navy-700 rounded-lg p-4">
                  <span className="flex-1">{goal.name}</span>
                  <span>{goal.timeline} years</span>
                  <span>${goal.cost}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setDetails((prev) => ({
                        ...prev,
                        lifeGoals: prev.lifeGoals.filter((_, i) => i !== index),
                      }))
                    }
                    className="text-red-400 hover:text-red-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) =>
                    setNewGoal((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Goal name"
                  className="flex-1 bg-navy-900 border border-navy-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all"
                />
                <input
                  type="number"
                  value={newGoal.timeline || ""}
                  onChange={(e) =>
                    setNewGoal((prev) => ({
                      ...prev,
                      timeline: +e.target.value,
                    }))
                  }
                  placeholder="Years"
                  className="w-24 bg-navy-900 border border-navy-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all"
                />
                <input
                  type="number"
                  value={newGoal.cost || ""}
                  onChange={(e) =>
                    setNewGoal((prev) => ({ ...prev, cost: +e.target.value }))
                  }
                  placeholder="Cost"
                  className="w-32 bg-navy-900 border border-navy-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={addGoal}
                  className="px-4 py-2 bg-gold text-navy-900 rounded-lg hover:bg-gold/90 transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Risk Tolerance */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Risk Tolerance
            </label>
            <select
              value={details.riskTolerance}
              onChange={(e) =>
                setDetails((prev) => ({
                  ...prev,
                  riskTolerance: e.target.value as any,
                }))
              }
              className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Investment Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Investment Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {investmentOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setDetails((prev) => ({
                      ...prev,
                      investmentPreferences:
                        prev.investmentPreferences.includes(option)
                          ? prev.investmentPreferences.filter(
                              (p) => p !== option
                            )
                          : [...prev.investmentPreferences, option],
                    }))
                  }
                  className={`px-4 py-2 rounded-lg transition-all ${
                    details.investmentPreferences.includes(option)
                      ? "bg-gold text-navy-900"
                      : "bg-navy-900 border border-navy-700 hover:border-gold/50"
                  }`}>
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Debt Details */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">
              Debt Details
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <input
                  type="number"
                  value={details.debt.amount || ""}
                  onChange={(e) =>
                    setDetails((prev) => ({
                      ...prev,
                      debt: { ...prev.debt, amount: +e.target.value },
                    }))
                  }
                  placeholder="Loan amount"
                  className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={details.debt.interestRate || ""}
                  onChange={(e) =>
                    setDetails((prev) => ({
                      ...prev,
                      debt: { ...prev.debt, interestRate: +e.target.value },
                    }))
                  }
                  placeholder="Interest rate (%)"
                  className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={details.debt.tenure || ""}
                  onChange={(e) =>
                    setDetails((prev) => ({
                      ...prev,
                      debt: { ...prev.debt, tenure: +e.target.value },
                    }))
                  }
                  placeholder="Tenure (years)"
                  className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload Financial Data
            </label>
            <div className="relative group">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".csv,.json"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 flex items-center justify-center space-x-2 cursor-pointer hover:border-gold/50 transition-all">
                <Upload className="w-5 h-5" />
                <span>Upload CSV or JSON file</span>
              </label>
              {uploadProgress > 0 && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-navy-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold to-blue-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gold text-navy-900 font-bold rounded-lg py-3 hover:bg-gold/90 transition-colors">
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
}
