import React, { useState, useEffect } from "react";
import api from "../api"; // Use our secure API helper
import { Trash2, Plus, Calendar, DollarSign } from "lucide-react";

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [formData, setFormData] = useState({
    source: "",
    amount: "",
    date: new Date().toISOString().split("T")[0], // Default to today
    description: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch Income Data on Load
  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const response = await api.get("income/");
      setIncomes(response.data);
    } catch (error) {
      console.error("Failed to fetch income", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("income/", formData);
      setFormData({
        source: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      }); // Reset form
      fetchIncomes(); // Refresh list
    } catch (error) {
      alert("Failed to add income");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        await api.delete(`income/${id}/`);
        fetchIncomes(); // Refresh list after delete
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
        <h1 className="text-3xl font-bold">Income Management</h1>
        <p className="text-astro-text-muted mt-1">
          Track and manage your revenue sources.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Form */}
        <div className="bg-astro-card p-6 rounded-2xl shadow-lg shadow-black/20 border border-gray-800 h-fit">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Plus size={20} className="text-astro-light-blue" /> Add Income
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-astro-text-muted">Source</label>
              <input
                type="text"
                placeholder="e.g. Salary, Freelance"
                required
                className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 mt-1 focus:border-astro-blue focus:outline-none transition-colors"
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm text-astro-text-muted">Amount</label>
              <div className="relative">
                <DollarSign
                  size={16}
                  className="absolute left-3 top-4 text-gray-500"
                />
                <input
                  type="number"
                  placeholder="0.00"
                  required
                  className="w-full bg-astro-dark border border-gray-700 rounded-xl pl-10 pr-4 py-3 mt-1 focus:border-astro-blue focus:outline-none transition-colors"
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
                  className="w-full bg-astro-dark border border-gray-700 rounded-xl pl-10 pr-4 py-3 mt-1 focus:border-astro-blue focus:outline-none transition-colors text-white scheme-dark"
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
                placeholder="Add notes..."
                className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 mt-1 focus:border-astro-blue focus:outline-none transition-colors"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-astro-blue hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20"
            >
              {loading ? "Adding..." : "Add Record"}
            </button>
          </form>
        </div>

        {/* Right Column: List of Incomes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary Header */}
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
            <span className="text-astro-text-muted text-sm">
              {incomes.length} records found
            </span>
          </div>

          {incomes.length === 0 ? (
            <div className="bg-astro-card p-12 rounded-2xl border border-gray-800 text-center text-astro-text-muted">
              No income records found. Add one to get started!
            </div>
          ) : (
            incomes.map((income) => (
              <div
                key={income.id}
                className="group bg-astro-card p-5 rounded-2xl border border-gray-800 flex justify-between items-center hover:border-astro-light-blue/50 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-astro-dark rounded-full border border-gray-800 text-green-500">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      {income.source}
                    </h3>
                    <p className="text-sm text-astro-text-muted flex items-center gap-2">
                      <Calendar size={12} /> {income.date}
                      {income.description && (
                        <span className="text-gray-600">
                          • {income.description}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-xl font-bold text-green-400">
                    + {formatCurrency(income.amount)}
                  </span>
                  {/* Delete Button - Only visible on Hover (group-hover) */}
                  <button
                    onClick={() => handleDelete(income.id)}
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

export default Income;
