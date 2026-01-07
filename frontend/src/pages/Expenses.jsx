import React, { useState, useEffect } from "react";
import api from "../api";
import { Trash2, Plus, Calendar, CreditCard, Tag } from "lucide-react";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    category: "Food", // Default first option
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [loading, setLoading] = useState(false);

  // Categories matching your Django Model
  const CATEGORIES = [
    "Food",
    "Transport",
    "Utilities",
    "Entertainment",
    "Healthcare",
    "Education",
    "Housing",
    "Other",
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get("expenses/");
      setExpenses(response.data);
    } catch (error) {
      console.error("Failed to fetch expenses", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("expenses/", formData);
      setFormData({
        category: "Food",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
      fetchExpenses();
    } catch (error) {
      alert("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        await api.delete(`expenses/${id}/`);
        fetchExpenses();
      } catch (error) {
        alert("Failed to delete");
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    })
      .format(amount)
      .replace("LKR", "Rs.");
  };

  return (
    <div className="p-8 min-h-screen text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Expense Tracking</h1>
        <p className="text-astro-text-muted mt-1">
          Monitor your spending and manage costs.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Form */}
        <div className="bg-astro-card p-6 rounded-2xl shadow-lg shadow-black/20 border border-gray-800 h-fit">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-400">
            <Plus size={20} /> Add Expense
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Dropdown */}
            <div>
              <label className="text-sm text-astro-text-muted">Category</label>
              <div className="relative">
                <Tag
                  size={16}
                  className="absolute left-3 top-4 text-gray-500"
                />
                <select
                  className="w-full bg-astro-dark border border-gray-700 rounded-xl pl-10 pr-4 py-3 mt-1 focus:border-red-500 focus:outline-none transition-colors appearance-none text-white"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-astro-text-muted">Amount</label>
              <div className="relative">
                <CreditCard
                  size={16}
                  className="absolute left-3 top-4 text-gray-500"
                />
                <input
                  type="number"
                  placeholder="0.00"
                  required
                  className="w-full bg-astro-dark border border-gray-700 rounded-xl pl-10 pr-4 py-3 mt-1 focus:border-red-500 focus:outline-none transition-colors"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-astro-text-muted">Date</label>
              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-3 top-4 text-gray-500"
                />
                <input
                  type="date"
                  required
                  className="w-full bg-astro-dark border border-gray-700 rounded-xl pl-10 pr-4 py-3 mt-1 focus:border-red-500 focus:outline-none transition-colors text-white scheme-dark"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-astro-text-muted">
                Description (Optional)
              </label>
              <textarea
                placeholder="Details about this expense..."
                className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 mt-1 focus:border-red-500 focus:outline-none transition-colors"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-900/20"
            >
              {loading ? "Adding..." : "Add Expense"}
            </button>
          </form>
        </div>

        {/* Right Column: List of Expenses */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary Header */}
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-xl font-bold">Recent Spending</h2>
            <span className="text-astro-text-muted text-sm">
              {expenses.length} records found
            </span>
          </div>

          {expenses.length === 0 ? (
            <div className="bg-astro-card p-12 rounded-2xl border border-gray-800 text-center text-astro-text-muted">
              No expenses recorded yet. Good job saving money!
            </div>
          ) : (
            expenses.map((expense) => (
              <div
                key={expense.id}
                className="group bg-astro-card p-5 rounded-2xl border border-gray-800 flex justify-between items-center hover:border-red-500/50 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-astro-dark rounded-full border border-gray-800 text-red-500">
                    <Tag size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      {expense.category}
                    </h3>
                    <p className="text-sm text-astro-text-muted flex items-center gap-2">
                      <Calendar size={12} /> {expense.date}
                      {expense.description && (
                        <span className="text-gray-600">
                          • {expense.description}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-xl font-bold text-red-400">
                    - {formatCurrency(expense.amount)}
                  </span>
                  {/* Delete Button - Only visible on Hover (group-hover) */}
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Record"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;
