import React, { useState, useEffect } from "react";
import api from "../api";
import {
  Users,
  Plus,
  DollarSign,
  Trash2,
  CheckCircle,
  X,
  Pencil,
} from "lucide-react";

// --- Payment History Modal ---
const PaymentHistoryModal = ({ employee, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`payroll/?employee=${employee.id}`);
        setHistory(res.data);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [employee]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" })
      .format(val)
      .replace("LKR", "Rs.");

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      {/* RESPONSIVE: Width fixes */}
      <div className="bg-astro-card w-[95%] md:w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-astro-dark rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-white">Payment History</h2>
            <p className="text-astro-text-muted text-sm mt-1">
              For{" "}
              <span className="text-astro-blue font-bold">{employee.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-8 text-astro-text-muted animate-pulse">
              Loading records...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
              No payment records found.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-700 overflow-x-auto">
              {/* RESPONSIVE: min-w to force scroll on small screens */}
              <table className="w-full text-left min-w-125">
                <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Title</th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-astro-card">
                  {history.map((pay) => (
                    <tr
                      key={pay.id}
                      className="hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-300 font-mono text-sm">
                        {pay.payment_date}
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {pay.title || "Salary Payment"}
                      </td>
                      <td className="px-6 py-4 text-right text-green-400 font-bold font-mono">
                        {formatCurrency(pay.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-700 bg-astro-dark rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState("team");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newEmp, setNewEmp] = useState({
    name: "",
    role: "",
    base_salary: "0",
    email: "",
    status: "Active",
  });
  const [showPayModal, setShowPayModal] = useState(false);
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
      if (isEditMode) {
        await api.put(`employees/${editId}/`, newEmp);
        alert("Employee updated successfully!");
      } else {
        await api.post("employees/", newEmp);
      }
      setShowAddEmp(false);
      setIsEditMode(false);
      setEditId(null);
      setNewEmp({
        name: "",
        role: "",
        base_salary: "0",
        email: "",
        status: "Active",
      });
      fetchData();
    } catch (err) {
      alert("Error saving employee");
    }
  };

  const handleEditEmployee = (emp, e) => {
    e.stopPropagation();
    setIsEditMode(true);
    setEditId(emp.id);
    setNewEmp({
      name: emp.name,
      role: emp.role,
      base_salary: emp.base_salary || "0",
      email: emp.email || "",
      status: emp.status || "Active",
    });
    setShowAddEmp(true);
  };

  const handleProcessPay = async (e) => {
    e.preventDefault();
    try {
      await api.post("payroll/", payData);
      setShowPayModal(false);
      setPayData({
        employee: "",
        amount: "",
        title: "",
        payment_date: new Date().toISOString().split("T")[0],
      });
      fetchData();
      alert("Salary Paid & Expense Recorded!");
    } catch (err) {
      alert("Error processing payment.");
    }
  };

  const handleDeleteEmployee = async (id, e) => {
    e.stopPropagation();
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
    // RESPONSIVE: p-4 on mobile
    <div className="p-4 md:p-8 min-h-screen text-white">
      {/* RESPONSIVE: Header Flex Col on Mobile */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Payroll Management</h1>
          <p className="text-astro-text-muted mt-1 text-sm md:text-base">
            Manage team salaries and payments.
          </p>
        </div>
        <button
          onClick={() => setShowPayModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-green-900/20 w-full md:w-auto justify-center"
        >
          <DollarSign size={20} /> Process Payroll
        </button>
      </header>

      {/* Tabs - horizontal scroll on very small screens if needed */}
      <div className="flex gap-6 mb-8 border-b border-gray-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab("team")}
          className={`pb-4 px-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "team"
              ? "text-astro-blue border-b-2 border-astro-blue"
              : "text-astro-text-muted"
          }`}
        >
          Team Members ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 px-2 font-medium transition-colors whitespace-nowrap ${
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <button
            onClick={() => {
              setIsEditMode(false);
              setEditId(null);
              setNewEmp({
                name: "",
                role: "",
                base_salary: "0",
                email: "",
                status: "Active",
              });
              setShowAddEmp(true);
            }}
            className="border-2 border-dashed border-gray-700 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-astro-text-muted hover:border-astro-blue hover:text-astro-blue transition-all h-56 md:h-64"
          >
            <div className="p-3 md:p-4 bg-gray-800 rounded-full mb-3 md:mb-4 group-hover:bg-astro-blue/10">
              <Plus size={28} className="md:w-[32px] md:h-[32px]" />
            </div>
            <span className="font-bold text-sm md:text-base">
              Add New Employee
            </span>
          </button>

          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-astro-card p-4 md:p-6 rounded-2xl border border-gray-800 shadow-lg relative group h-56 md:h-64 flex flex-col justify-between hover:border-astro-blue hover:shadow-astro-blue/10 transition-all"
            >
              <div>
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="p-2 md:p-3 bg-astro-dark rounded-xl text-astro-blue border border-gray-800 group-hover:bg-astro-blue group-hover:text-white transition-colors">
                    <Users size={20} className="md:w-[24px] md:h-[24px]" />
                  </div>
                  <div className="flex gap-1.5 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEditEmployee(emp, e)}
                      className="text-gray-600 hover:text-blue-400 transition-colors p-1.5 md:p-2 hover:bg-gray-800 rounded-lg"
                    >
                      <Pencil size={14} className="md:w-[16px] md:h-[16px]" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteEmployee(emp.id, e)}
                      className="text-gray-600 hover:text-red-500 transition-colors p-1.5 md:p-2 hover:bg-gray-800 rounded-lg"
                    >
                      <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-astro-blue transition-colors">
                  {emp.name}
                </h3>
                <p className="text-astro-text-muted text-xs md:text-sm">
                  {emp.role}
                </p>
              </div>
              <div className="pt-3 md:pt-4 border-t border-gray-800 flex justify-between items-center">
                <div>
                  <p className="text-[10px] md:text-xs text-astro-text-muted">
                    Status
                  </p>
                  <p
                    className={`font-medium text-xs md:text-sm flex items-center gap-2 ${
                      emp.status === "Active"
                        ? "text-green-400"
                        : emp.status === "On Leave"
                        ? "text-yellow-400"
                        : emp.status === "Inactive"
                        ? "text-gray-400"
                        : "text-green-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                        emp.status === "Active"
                          ? "bg-green-500"
                          : emp.status === "On Leave"
                          ? "bg-yellow-500"
                          : emp.status === "Inactive"
                          ? "bg-gray-500"
                          : "bg-green-500"
                      }`}
                    ></span>{" "}
                    {emp.status || "Active"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEmployee(emp)}
                  className="text-xs text-astro-blue font-medium bg-astro-blue/10 px-2 md:px-3 py-1 rounded-full hover:bg-astro-blue hover:text-white transition-all"
                >
                  View Payments →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === "history" && (
        // RESPONSIVE: overflow-x-auto for table scrolling
        <div className="bg-astro-card rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-astro-dark text-astro-text-muted text-[10px] md:text-xs uppercase">
                <tr>
                  <th className="p-3 md:p-4">Date</th>
                  <th className="p-3 md:p-4">Employee</th>
                  <th className="p-3 md:p-4">Payment Title</th>
                  <th className="p-3 md:p-4 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {payments.map((pay) => (
                  <tr
                    key={pay.id}
                    className="hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-3 md:p-4 flex items-center gap-2 text-xs md:text-sm">
                      <CheckCircle
                        size={12}
                        className="md:w-[14px] md:h-[14px] text-green-500 shrink-0"
                      />{" "}
                      {pay.payment_date}
                    </td>
                    <td className="p-3 md:p-4 font-medium text-white text-xs md:text-sm">
                      {pay.employee_name || "Employee"}
                      <span className="block text-[10px] md:text-xs text-astro-text-muted">
                        {pay.employee_role}
                      </span>
                    </td>
                    <td className="p-3 md:p-4 text-xs md:text-sm">
                      {pay.title || "-"}
                    </td>
                    <td className="p-3 md:p-4 text-right font-bold text-white text-xs md:text-sm">
                      {formatCurrency(pay.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && (
              <div className="p-6 md:p-8 text-center text-astro-text-muted text-xs md:text-sm">
                No salary payments recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- ADD EMPLOYEE MODAL --- */}
      {showAddEmp && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-astro-card w-[95%] md:w-full max-w-md rounded-2xl border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-4">
              {isEditMode ? "Edit Team Member" : "Add Team Member"}
            </h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="text-sm text-astro-text-muted mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
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
                  required
                  className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-astro-blue focus:outline-none"
                  value={newEmp.role}
                  onChange={(e) =>
                    setNewEmp({ ...newEmp, role: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-astro-text-muted mb-1 block">
                  Status
                </label>
                <select
                  required
                  className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-astro-blue focus:outline-none"
                  value={newEmp.status}
                  onChange={(e) =>
                    setNewEmp({ ...newEmp, status: e.target.value })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddEmp(false);
                    setIsEditMode(false);
                    setEditId(null);
                    setNewEmp({
                      name: "",
                      role: "",
                      base_salary: "0",
                      email: "",
                      status: "Active",
                    });
                  }}
                  className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-astro-blue text-white font-bold hover:bg-blue-600 transition-colors"
                >
                  {isEditMode ? "Update Member" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PROCESS PAY MODAL --- */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-astro-card w-[95%] md:w-full max-w-md rounded-2xl border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-4">Process Salary</h3>
            <form onSubmit={handleProcessPay} className="space-y-4">
              <div>
                <label className="text-sm text-astro-text-muted">
                  Select Employee
                </label>
                <select
                  required
                  className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white focus:border-green-600 focus:outline-none"
                  onChange={(e) =>
                    setPayData({
                      ...payData,
                      employee: e.target.value,
                      amount: "",
                    })
                  }
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
                  <label className="text-sm text-astro-text-muted">Title</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-astro-dark border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white focus:border-green-600 focus:outline-none"
                    value={payData.title}
                    onChange={(e) =>
                      setPayData({ ...payData, title: e.target.value })
                    }
                  />
                </div>
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

      {selectedEmployee && (
        <PaymentHistoryModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
};

export default Payroll;
