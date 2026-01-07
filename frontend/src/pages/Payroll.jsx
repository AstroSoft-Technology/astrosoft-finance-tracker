import React, { useState, useEffect } from "react";
import api from "../api";
import {
  Users,
  Plus,
  DollarSign,
  UserPlus,
  Trash2,
  CheckCircle,
} from "lucide-react";

const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState("team"); // 'team' or 'history'

  // Forms
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [newEmp, setNewEmp] = useState({
    name: "",
    role: "",
    base_salary: "0",
    email: "",
  });

  const [showPayModal, setShowPayModal] = useState(false);

  // --- UPDATED STATE: Changed 'date' to 'payment_date' to match Backend ---
  const [payData, setPayData] = useState({
    employee: "",
    amount: "",
    title: "",
    payment_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const empRes = await api.get("employees/");
      const payRes = await api.get("payroll/");
      setEmployees(empRes.data);
      setPayments(payRes.data);
    } catch (error) {
      console.error("Failed to fetch payroll data");
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.post("employees/", { ...newEmp, base_salary: "0" });
      setShowAddEmp(false);
      setNewEmp({ name: "", role: "", base_salary: "0", email: "" });
      fetchData();
    } catch (err) {
      alert("Error adding employee");
    }
  };

  const handleProcessPay = async (e) => {
    e.preventDefault();
    try {
      await api.post("payroll/", payData);
      setShowPayModal(false);
      // --- UPDATED RESET: Reset 'payment_date' correctly ---
      setPayData({
        employee: "",
        amount: "",
        title: "",
        payment_date: new Date().toISOString().split("T")[0],
      });
      fetchData();
      alert("Salary Paid & Expense Recorded!");
    } catch (err) {
      console.error(err);
      alert("Error processing payment. Check console for details.");
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (confirm("Delete this employee?")) {
      try {
        await api.delete(`employees/${id}/`);
        fetchData();
      } catch (err) {
        alert("Failed to delete");
      }
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" })
      .format(val)
      .replace("LKR", "Rs.");

  return (
    <div className="p-8 min-h-screen text-white">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-astro-text-muted mt-1">
            Manage team salaries and payments.
          </p>
        </div>
        <button
          onClick={() => setShowPayModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-green-900/20"
        >
          <DollarSign size={20} /> Process Payroll
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-gray-800">
        <button
          onClick={() => setActiveTab("team")}
          className={`pb-4 px-2 font-medium transition-colors ${
            activeTab === "team"
              ? "text-astro-blue border-b-2 border-astro-blue"
              : "text-astro-text-muted"
          }`}
        >
          Team Members ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 px-2 font-medium transition-colors ${
            activeTab === "history"
              ? "text-astro-blue border-b-2 border-astro-blue"
              : "text-astro-text-muted"
          }`}
        >
          Payment History
        </button>
      </div>

      {/* TEAM TAB */}
      {activeTab === "team" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add New Card */}
          <button
            onClick={() => setShowAddEmp(true)}
            className="border-2 border-dashed border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center text-astro-text-muted hover:border-astro-blue hover:text-astro-blue transition-all h-64"
          >
            <div className="p-4 bg-gray-800 rounded-full mb-4 group-hover:bg-astro-blue/10">
              <Plus size={32} />
            </div>
            <span className="font-bold">Add New Employee</span>
          </button>

          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-astro-card p-6 rounded-2xl border border-gray-800 shadow-lg relative group h-64 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-astro-dark rounded-xl text-astro-blue border border-gray-800">
                    <Users size={24} />
                  </div>
                  <button
                    onClick={() => handleDeleteEmployee(emp.id)}
                    className="text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-white">{emp.name}</h3>
                <p className="text-astro-text-muted text-sm">{emp.role}</p>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <p className="text-xs text-astro-text-muted">Status</p>
                <p className="text-green-400 font-medium text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>{" "}
                  Active Team Member
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === "history" && (
        <div className="bg-astro-card rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-astro-dark text-astro-text-muted text-xs uppercase">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Payment Title</th>
                <th className="p-4 text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {payments.map((pay) => (
                <tr
                  key={pay.id}
                  className="hover:bg-gray-800/50 transition-colors"
                >
                  <td className="p-4 flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />{" "}
                    {pay.payment_date}
                  </td>
                  <td className="p-4 font-medium text-white">
                    {pay.employee_name || "Employee"}
                    <span className="block text-xs text-astro-text-muted">
                      {pay.employee_role}
                    </span>
                  </td>
                  <td className="p-4">{pay.title || "-"}</td>
                  <td className="p-4 text-right font-bold text-white">
                    {formatCurrency(pay.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div className="p-8 text-center text-astro-text-muted">
              No salary payments recorded yet.
            </div>
          )}
        </div>
      )}

      {/* --- ADD EMPLOYEE MODAL --- */}
      {showAddEmp && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-astro-card w-full max-w-md rounded-2xl border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-4">Add Team Member</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="text-sm text-astro-text-muted mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  required
                  className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-astro-blue focus:outline-none"
                  value={newEmp.name}
                  onChange={(e) =>
                    setNewEmp({ ...newEmp, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm text-astro-text-muted mb-1 block">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Developer"
                  required
                  className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-astro-blue focus:outline-none"
                  value={newEmp.role}
                  onChange={(e) =>
                    setNewEmp({ ...newEmp, role: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddEmp(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-astro-blue text-white font-bold hover:bg-blue-600 transition-colors"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PROCESS PAY MODAL (UPDATED) --- */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-astro-card w-full max-w-md rounded-2xl border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-4">Process Salary</h3>
            <form onSubmit={handleProcessPay} className="space-y-4">
              <div>
                <label className="text-sm text-astro-text-muted">
                  Select Employee
                </label>
                <select
                  required
                  className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white focus:border-green-600 focus:outline-none"
                  onChange={(e) => {
                    setPayData({
                      ...payData,
                      employee: e.target.value,
                      amount: "",
                    });
                  }}
                >
                  <option value="">Choose...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-astro-text-muted">
                    Payment Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jan Salary"
                    required
                    className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white focus:border-green-600 focus:outline-none"
                    value={payData.title}
                    onChange={(e) =>
                      setPayData({ ...payData, title: e.target.value })
                    }
                  />
                </div>
                {/* --- UPDATED INPUT: DATE FIELD FIX --- */}
                <div>
                  <label className="text-sm text-astro-text-muted">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white scheme-dark focus:border-green-600 focus:outline-none"
                    value={payData.payment_date}
                    onChange={(e) =>
                      setPayData({ ...payData, payment_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-astro-text-muted">
                  Amount (LKR)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount..."
                  required
                  className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 mt-1 text-green-400 font-bold focus:border-green-600 focus:outline-none"
                  value={payData.amount}
                  onChange={(e) =>
                    setPayData({ ...payData, amount: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20"
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

export default Payroll;
