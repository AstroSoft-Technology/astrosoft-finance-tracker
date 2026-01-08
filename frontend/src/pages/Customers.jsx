import React, { useState, useEffect } from "react";
import api from "../api";
import {
  Users,
  Plus,
  Globe,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Search,
  CreditCard,
  X,
  Pencil,
  Box,
} from "lucide-react";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    project_name: "",
    domain_name: "",
    description: "",
    total_amount: "",
    advance_amount: "",
    is_payment_confirmed: false,
    is_project_delivered: false,
    delivery_date: "",
  });

  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    amount: "",
    date: "",
    note: "",
  });
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchPayments(selectedCustomer.id);
    }
  }, [selectedCustomer]);

  const fetchCustomers = async () => {
    try {
      const res = await api.get("customers/");
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers", error);
    }
  };

  const fetchPayments = async (customerId) => {
    try {
      const res = await api.get(`customer-payments/?customer=${customerId}`);
      const customerPayments = res.data.filter(
        (p) => p.customer === customerId
      );
      setPaymentHistory(customerPayments);
    } catch (error) {
      console.error("Error fetching payments", error);
    }
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setEditId(null);
    setFormData({
      name: "",
      project_name: "",
      domain_name: "",
      description: "",
      total_amount: "",
      advance_amount: "",
      is_payment_confirmed: false,
      is_project_delivered: false,
      delivery_date: "",
    });
    setShowAddModal(true);
  };

  const handleEdit = (client) => {
    setIsEditMode(true);
    setEditId(client.id);
    setFormData({
      name: client.name,
      project_name: client.project_name,
      domain_name: client.domain_name || "",
      description: client.description || "",
      total_amount: client.total_amount,
      advance_amount: client.advance_amount,
      is_payment_confirmed: client.is_payment_confirmed,
      is_project_delivered: client.is_project_delivered || false,
      delivery_date: client.delivery_date || "",
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      total_amount: Number(formData.total_amount),
      advance_amount:
        formData.advance_amount === "" ? "0" : formData.advance_amount,
      delivery_date:
        formData.delivery_date === "" ? null : formData.delivery_date,
    };

    try {
      if (isEditMode) {
        await api.put(`customers/${editId}/`, payload);
        alert("Client updated successfully!");
      } else {
        await api.post("customers/", payload);
        alert("Client added successfully!");
      }
      setShowAddModal(false);
      fetchCustomers();
    } catch (error) {
      console.error("Error saving customer", error);
      if (error.response && error.response.data) {
        alert(`Server Error:\n${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        alert("Failed to save. Check console.");
      }
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post("customer-payments/", {
        customer: selectedCustomer.id,
        ...paymentData,
      });
      setPaymentData({ amount: "", date: "", note: "" });
      fetchPayments(selectedCustomer.id);
      fetchCustomers();
      alert("Payment recorded!");
    } catch (error) {
      alert("Failed to record payment.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this customer? This cannot be undone.")) {
      await api.delete(`customers/${id}/`);
      fetchCustomers();
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" })
      .format(val)
      .replace("LKR", "Rs.");

  // SORT: Due payments first
  const processedCustomers = customers
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.project_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aDue = a.remaining > 0;
      const bDue = b.remaining > 0;
      if (aDue && !bDue) return -1;
      if (!aDue && bDue) return 1;
      return 0;
    });

  // Calculate Remaining for the Add/Edit Modal
  const calculatedRemaining = Math.max(
    0,
    Number(formData.total_amount || 0) - Number(formData.advance_amount || 0)
  );

  return (
    <div className="p-8 min-h-screen text-white">
      <header className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-astro-text-muted mt-1">
            Track projects and client payments.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search clients..."
              className="bg-astro-dark border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-astro-blue focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleOpenAdd}
            className="bg-astro-blue hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg"
          >
            <Plus size={20} /> Add Client
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {processedCustomers.map((client) => (
          <div
            key={client.id}
            className={`border rounded-2xl p-6 transition-all group relative flex flex-col justify-between ${
              client.remaining > 0
                ? "bg-astro-card border-gray-800"
                : "bg-gray-900/50 border-gray-800 opacity-80"
            }`}
          >
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(client)}
                className="text-gray-400 hover:text-blue-400 bg-gray-800 p-2 rounded-full"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(client.id)}
                className="text-gray-400 hover:text-red-500 bg-gray-800 p-2 rounded-full"
              >
                <XCircle size={16} />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`p-3 rounded-xl ${
                    client.remaining > 0
                      ? "bg-gray-800 text-astro-blue"
                      : "bg-green-900/20 text-green-500"
                  }`}
                >
                  {client.is_project_delivered ? (
                    <Box size={24} />
                  ) : (
                    <Users size={24} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {client.project_name}
                  </h3>
                  <p className="text-gray-400 text-sm">{client.name}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-300 mb-4">
                {client.domain_name && (
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-gray-500" />
                    <a
                      href={`https://${client.domain_name}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-astro-blue hover:underline"
                    >
                      {client.domain_name}
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-gray-400">
                      Due:{" "}
                      <span className="text-white">
                        {client.delivery_date || "N/A"}
                      </span>
                    </span>
                  </div>
                  {client.is_project_delivered && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30 uppercase font-bold">
                      Delivered
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">
                    Paid: {formatCurrency(client.total_paid)}
                  </span>
                  <span className="text-gray-400">
                    Total: {formatCurrency(client.total_amount)}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      client.remaining <= 0 ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        (client.total_paid / client.total_amount) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="text-right mt-1">
                  <span
                    className={`text-xs font-bold ${
                      client.remaining <= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {client.remaining <= 0
                      ? "Fully Paid"
                      : `Due: ${formatCurrency(client.remaining)}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <button
                onClick={() => setSelectedCustomer(client)}
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors"
              >
                <CreditCard size={16} /> Manage Payments
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-astro-card w-full max-w-2xl rounded-2xl border border-gray-700 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 border-b border-gray-700 pb-4">
              {isEditMode ? "Edit Project Details" : "New Project Details"}
            </h3>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="md:col-span-1">
                <label className="text-xs text-astro-blue uppercase font-bold mb-1 block">
                  Customer Name *
                </label>
                <input
                  required
                  className="w-full bg-astro-dark border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-astro-blue focus:outline-none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-xs text-astro-blue uppercase font-bold mb-1 block">
                  Project Name *
                </label>
                <input
                  required
                  className="w-full bg-astro-dark border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-astro-blue focus:outline-none"
                  value={formData.project_name}
                  onChange={(e) =>
                    setFormData({ ...formData, project_name: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-xs text-green-500 uppercase font-bold mb-1 block">
                  Total Amount (LKR) *
                </label>
                <input
                  required
                  type="number"
                  className="w-full bg-astro-dark border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                  value={formData.total_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, total_amount: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-xs text-green-500 uppercase font-bold mb-1 block">
                  Advance Payment
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full bg-astro-dark border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                  value={formData.advance_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, advance_amount: e.target.value })
                  }
                />
              </div>

              {/* --- NEW: VISUAL FEEDBACK FOR DUE AMOUNT --- */}
              <div className="md:col-span-2 bg-gray-800 p-4 rounded-xl flex justify-between items-center border border-gray-700">
                <span className="text-gray-400 text-sm">
                  Estimated Due Amount:
                </span>
                <span
                  className={`font-bold text-xl font-mono ${
                    calculatedRemaining > 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {formatCurrency(calculatedRemaining)}
                </span>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">
                  Domain Name (Optional)
                </label>
                <input
                  className="w-full bg-astro-dark border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-astro-blue focus:outline-none"
                  value={formData.domain_name}
                  onChange={(e) =>
                    setFormData({ ...formData, domain_name: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">
                  Expected Delivery
                </label>
                <input
                  type="date"
                  className="w-full bg-astro-dark border border-gray-700 rounded-lg px-4 py-3 text-white scheme-dark focus:border-astro-blue focus:outline-none"
                  value={formData.delivery_date}
                  onChange={(e) =>
                    setFormData({ ...formData, delivery_date: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-1 flex flex-col justify-end gap-2">
                <label className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-lg w-full cursor-pointer border border-gray-700 hover:border-green-500 transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-green-500"
                    checked={formData.is_payment_confirmed}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_payment_confirmed: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm font-bold text-white">
                    Payment Confirmed?
                  </span>
                </label>
                <label className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-lg w-full cursor-pointer border border-gray-700 hover:border-blue-500 transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-500"
                    checked={formData.is_project_delivered}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_project_delivered: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm font-bold text-white">
                    Project Delivered?
                  </span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">
                  Description
                </label>
                <textarea
                  rows="2"
                  className="w-full bg-astro-dark border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-astro-blue focus:outline-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="col-span-2 flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-700 rounded-xl hover:bg-gray-600 font-bold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-astro-blue text-white rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg"
                >
                  {isEditMode ? "Update Project" : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-astro-card w-full max-w-lg rounded-2xl border border-gray-700 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-astro-dark rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold">Manage Payments</h3>
                <p className="text-xs text-astro-blue">
                  {selectedCustomer.project_name}
                </p>
              </div>
              <button onClick={() => setSelectedCustomer(null)}>
                <X size={20} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form
                onSubmit={handleAddPayment}
                className="mb-6 bg-gray-800/50 p-4 rounded-xl border border-gray-700"
              >
                <h4 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
                  <Plus size={16} /> Record New Payment
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    required
                    type="number"
                    placeholder="Amount"
                    className="bg-astro-dark border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-green-500"
                    value={paymentData.amount}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, amount: e.target.value })
                    }
                  />
                  <input
                    required
                    type="date"
                    className="bg-astro-dark border border-gray-700 rounded-lg px-3 py-2 text-white outline-none scheme-dark focus:border-green-500"
                    value={paymentData.date}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, date: e.target.value })
                    }
                  />
                </div>
                <input
                  placeholder="Note (e.g. 2nd Installment)"
                  className="w-full bg-astro-dark border border-gray-700 rounded-lg px-3 py-2 text-white outline-none mb-3 focus:border-green-500"
                  value={paymentData.note}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, note: e.target.value })
                  }
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-sm text-white shadow-lg shadow-green-900/20"
                >
                  Add Payment
                </button>
              </form>

              <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase">
                Payment History
              </h4>
              <div className="space-y-3">
                {parseFloat(selectedCustomer.advance_amount) > 0 && (
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg border border-gray-700 opacity-75">
                    <div>
                      <p className="font-bold text-sm text-white">
                        Initial Advance
                      </p>
                      <p className="text-xs text-gray-500">Upon Agreement</p>
                    </div>
                    <span className="font-mono font-bold text-green-400">
                      {formatCurrency(selectedCustomer.advance_amount)}
                    </span>
                  </div>
                )}
                {paymentHistory.map((pay) => (
                  <div
                    key={pay.id}
                    className="flex justify-between items-center p-3 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div>
                      <p className="font-bold text-sm text-white">
                        {pay.note || "Partial Payment"}
                      </p>
                      <p className="text-xs text-gray-500">{pay.date}</p>
                    </div>
                    <span className="font-mono font-bold text-green-400">
                      {formatCurrency(pay.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
