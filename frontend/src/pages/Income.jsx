import React, { useState, useEffect } from "react";
import api from "../api";
import { Trash2, Plus, Calendar, DollarSign } from "lucide-react";

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [formData, setFormData] = useState({
    source: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [loading, setLoading] = useState(false);

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
      });
      fetchIncomes();
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
        fetchIncomes();
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
    // RESPONSIVE: p-4 on mobile
    <div className="p-4 md:p-8 min-h-screen text-white">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Income Management</h1>
        <p className="text-astro-text-muted mt-1 text-sm md:text-base">
          Track and manage your revenue sources.
        </p>
      </header>

      {/* RESPONSIVE: Stacks form above list on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Left Column: Input Form */}
        <div className="bg-astro-card p-4 md:p-6 rounded-2xl shadow-lg shadow-black/20 border border-gray-800 h-fit">
          <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
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
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-lg md:text-xl font-bold">
              Recent Transactions
            </h2>
            <span className="text-astro-text-muted text-xs md:text-sm">
              {incomes.length} records
            </span>
          </div>

          {incomes.length === 0 ? (
            <div className="bg-astro-card p-12 rounded-2xl border border-gray-800 text-center text-astro-text-muted">
              No income records found.
            </div>
          ) : (
            incomes.map((income) => (
              <div
                key={income.id}
                className="group bg-astro-card p-3 md:p-5 rounded-2xl border border-gray-800 flex flex-col sm:flex-row justify-between sm:items-center hover:border-astro-light-blue/50 transition-all shadow-sm gap-3 sm:gap-0"
              >
                <div className="flex items-center gap-2 md:gap-4 overflow-hidden flex-1 min-w-0">
                  <div className="p-2 md:p-3 bg-astro-dark rounded-full border border-gray-800 text-green-500 shrink-0">
                    <DollarSign size={18} className="md:w-[20px] md:h-[20px]" />
                  </div>
                  <div className="overflow-hidden flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm md:text-base lg:text-lg truncate">
                      {income.source}
                    </h3>
                    <p className="text-[10px] md:text-xs lg:text-sm text-astro-text-muted flex items-center gap-1 md:gap-2">
                      <Calendar
                        size={10}
                        className="md:w-[12px] md:h-[12px] shrink-0"
                      />{" "}
                      {income.date}
                      {income.description && (
                        <span className="text-gray-600 truncate">
                          • {income.description}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-6">
                  <span className="text-sm md:text-base lg:text-xl font-bold text-green-400 whitespace-nowrap">
                    + {formatCurrency(income.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(income.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
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
