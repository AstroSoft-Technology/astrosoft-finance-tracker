import React, { useState, useEffect } from "react";
import api from "../api";
import {
  Trash2,
  Plus,
  Calendar,
  Landmark,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";

const Liabilities = () => {
  const [liabilities, setLiabilities] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    total_amount: "",
    paid_amount: "0",
    due_date: "",
  });
  const [loading, setLoading] = useState(false);

  // Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedLiability, setSelectedLiability] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    fetchLiabilities();
  }, []);

  const fetchLiabilities = async () => {
    try {
      const response = await api.get("liabilities/");
      setLiabilities(response.data);
    } catch (error) {
      console.error("Failed to fetch liabilities", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("liabilities/", formData);
      setFormData({
        title: "",
        total_amount: "",
        paid_amount: "0",
        due_date: "",
      });
      fetchLiabilities();
    } catch (error) {
      alert("Failed to add liability");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        await api.delete(`liabilities/${id}/`);
        fetchLiabilities();
      } catch (error) {
        alert("Failed to delete");
      }
    }
  };

  // Open Modal
  const openPayModal = (liability) => {
    setSelectedLiability(liability);
    setPaymentAmount("");
    setIsPayModalOpen(true);
  };

  // Handle Payment Submission
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedLiability) return;

    try {
      await api.post(`liabilities/${selectedLiability.id}/pay/`, {
        amount: paymentAmount,
        date: new Date().toISOString().split("T")[0], // Record payment date as today
      });
      setIsPayModalOpen(false);
      fetchLiabilities(); // Refresh data
      alert(`Payment of Rs. ${paymentAmount} recorded successfully!`);
    } catch (error) {
      alert(error.response?.data?.error || "Payment failed");
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

  const getProgress = (total, paid) => {
    if (!total || total === 0) return 0;
    return Math.min(100, Math.round((paid / total) * 100));
  };

  return (
    <div className="p-8 min-h-screen text-white relative">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Liabilities Management</h1>
        <p className="text-astro-text-muted mt-1">
          Track loans, credit cards, and debt repayment.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Form */}
        <div className="bg-astro-card p-6 rounded-2xl shadow-lg shadow-black/20 border border-gray-800 h-fit">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-orange-500">
            <Plus size={20} /> Add Liability
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-astro-text-muted">Title</label>
              <input
                type="text"
                required
                className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 mt-1 focus:border-orange-500 focus:outline-none transition-colors"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm text-astro-text-muted">
                Total Amount Owed
              </label>
              <input
                type="number"
                required
                className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 mt-1 focus:border-orange-500 focus:outline-none transition-colors"
                value={formData.total_amount}
                onChange={(e) =>
                  setFormData({ ...formData, total_amount: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-astro-text-muted">
                  Paid So Far
                </label>
                <input
                  type="number"
                  className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 mt-1 focus:border-orange-500 focus:outline-none transition-colors"
                  value={formData.paid_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, paid_amount: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-astro-text-muted">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 mt-1 focus:border-orange-500 focus:outline-none transition-colors text-white scheme-dark"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-900/20"
            >
              {loading ? "Adding..." : "Add Liability"}
            </button>
          </form>
        </div>

        {/* Right Column: List of Liabilities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-xl font-bold">Active Debts</h2>
            <span className="text-astro-text-muted text-sm">
              {liabilities.length} records found
            </span>
          </div>

          {liabilities.length === 0 ? (
            <div className="bg-astro-card p-12 rounded-2xl border border-gray-800 text-center text-astro-text-muted">
              No liabilities found. You are debt free!
            </div>
          ) : (
            liabilities.map((item) => {
              const progress = getProgress(item.total_amount, item.paid_amount);
              const isFullyPaid = item.remaining_amount <= 0;

              return (
                <div
                  key={item.id}
                  className={`group bg-astro-card p-6 rounded-2xl border ${
                    isFullyPaid ? "border-green-500/30" : "border-gray-800"
                  } hover:border-orange-500/50 transition-all shadow-sm relative overflow-hidden`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-full border border-gray-800 ${
                          isFullyPaid
                            ? "bg-green-500/10 text-green-500"
                            : "bg-astro-dark text-orange-500"
                        }`}
                      >
                        {isFullyPaid ? (
                          <CheckCircle2 size={24} />
                        ) : (
                          <Landmark size={24} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">
                          {item.title}
                        </h3>
                        <p className="text-sm text-astro-text-muted flex items-center gap-2">
                          <AlertCircle size={12} /> Due:{" "}
                          {item.due_date || "No date set"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-astro-text-muted uppercase">
                        Remaining
                      </p>
                      <span
                        className={`text-xl font-bold ${
                          isFullyPaid ? "text-green-500" : "text-white"
                        }`}
                      >
                        {isFullyPaid
                          ? "Settled"
                          : formatCurrency(item.remaining_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-2 flex justify-between text-xs text-astro-text-muted">
                    <span>Paid: {formatCurrency(item.paid_amount)}</span>
                    <span>Total: {formatCurrency(item.total_amount)}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        isFullyPaid ? "bg-green-500" : "bg-orange-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-800/50 gap-3">
                    {!isFullyPaid && (
                      <button
                        onClick={() => openPayModal(item)}
                        className="px-4 py-2 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Pay Now
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- PAYMENT MODAL --- */}
      {isPayModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-astro-card w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Pay Debt</h3>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-astro-text-muted text-sm mb-1">Paying off:</p>
              <p className="text-lg font-bold text-white">
                {selectedLiability?.title}
              </p>
              <p className="text-sm text-orange-500 mt-1">
                Remaining Balance:{" "}
                {formatCurrency(selectedLiability?.remaining_amount)}
              </p>
            </div>

            <form onSubmit={handlePayment}>
              <div className="mb-6">
                <label className="block text-sm text-astro-text-muted mb-2">
                  Payment Amount
                </label>
                <input
                  type="number"
                  autoFocus
                  required
                  max={selectedLiability?.remaining_amount}
                  className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none text-lg font-bold"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-900/20"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Liabilities;
