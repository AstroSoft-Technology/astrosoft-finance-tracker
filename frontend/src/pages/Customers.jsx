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
} from "lucide-react";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // For Payment Modal
  const [searchTerm, setSearchTerm] = useState("");

  // Customer Form State
  const [formData, setFormData] = useState({
    name: "",
    project_name: "",
    domain_name: "",
    description: "",
    total_amount: "",
    advance_amount: "",
    is_payment_confirmed: false,
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

  // Fetch Payment History when a customer is selected
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
      // Filter manually just in case the backend filter needs tuning or multiple customers are returned
      const customerPayments = res.data.filter(
        (p) => p.customer === customerId
      );
      setPaymentHistory(customerPayments);
    } catch (error) {
      console.error("Error fetching payments", error);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.post("customers/", formData);
      setShowAddModal(false);
      setFormData({
        name: "",
        project_name: "",
        domain_name: "",
        description: "",
        total_amount: "",
        advance_amount: "",
        is_payment_confirmed: false,
        delivery_date: "",
      });
      fetchCustomers();
      alert("Customer added successfully!");
    } catch (error) {
      alert("Failed to add customer.");
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
      fetchPayments(selectedCustomer.id); // Refresh history
      fetchCustomers(); // Refresh main list (to update remaining amount)
      alert("Payment recorded & Income added!");
    } catch (error) {
      alert("Failed to record payment.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this customer?")) {
      await api.delete(`customers/${id}/`);
      fetchCustomers();
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" })
      .format(val)
      .replace("LKR", "Rs.");

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.project_name.toLowerCase().includes(searchTerm.toLowerCase())
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
            onClick={() => setShowAddModal(true)}
            className="bg-astro-blue hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg"
          >
            <Plus size={20} /> Add Client
          </button>
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((client) => (
          <div
            key={client.id}
            className="bg-astro-card border border-gray-800 rounded-2xl p-6 hover:border-astro-blue transition-all group relative flex flex-col justify-between"
          >
            <button
              onClick={() => handleDelete(client.id)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <XCircle size={20} />
            </button>

            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gray-800 p-3 rounded-xl text-astro-blue">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {client.project_name}
                  </h3>
                  <p className="text-gray-400 text-sm">{client.name}</p>
                </div>
              </div>

              {/* Progress Bar */}
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
                      client.remaining <= 0 ? "bg-green-500" : "bg-astro-blue"
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

      {/* --- ADD CUSTOMER MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-astro-card w-full max-w-2xl rounded-2xl border border-gray-700 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">New Project Details</h3>
            <form
              onSubmit={handleAddCustomer}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                required
                placeholder="Customer Name"
                className="bg-astro-dark border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-astro-blue"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <input
                required
                placeholder="Project Name"
                className="bg-astro-dark border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-astro-blue"
                value={formData.project_name}
                onChange={(e) =>
                  setFormData({ ...formData, project_name: e.target.value })
                }
              />
              <input
                required
                type="number"
                placeholder="Total Amount"
                className="bg-astro-dark border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-astro-blue"
                value={formData.total_amount}
                onChange={(e) =>
                  setFormData({ ...formData, total_amount: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Advance Payment"
                className="bg-astro-dark border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-astro-blue"
                value={formData.advance_amount}
                onChange={(e) =>
                  setFormData({ ...formData, advance_amount: e.target.value })
                }
              />
              <input
                placeholder="Domain Name (Optional)"
                className="col-span-2 bg-astro-dark border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-astro-blue"
                value={formData.domain_name}
                onChange={(e) =>
                  setFormData({ ...formData, domain_name: e.target.value })
                }
              />
              <input
                type="date"
                className="bg-astro-dark border border-gray-700 rounded-lg px-4 py-3 text-white outline-none scheme-dark focus:border-astro-blue"
                value={formData.delivery_date}
                onChange={(e) =>
                  setFormData({ ...formData, delivery_date: e.target.value })
                }
              />

              <label className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-lg cursor-pointer border border-gray-700 hover:border-green-500 transition-colors">
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

              <div className="col-span-2 flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-700 rounded-xl hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-astro-blue text-white rounded-xl font-bold hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PAYMENT MANAGEMENT MODAL --- */}
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
              {/* Add Payment Form */}
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
                    placeholder="Amount (LKR)"
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
                  className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-sm"
                >
                  Add Payment
                </button>
              </form>

              {/* History List */}
              <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase">
                Payment History
              </h4>
              <div className="space-y-3">
                {/* Show Advance as First Entry */}
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

                {/* Show Partial Payments */}
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

                {paymentHistory.length === 0 &&
                  parseFloat(selectedCustomer.advance_amount) === 0 && (
                    <p className="text-center text-gray-500 text-sm">
                      No payments recorded yet.
                    </p>
                  )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 bg-astro-dark rounded-b-2xl">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Total Collected:</span>
                <span className="font-bold text-xl text-green-400">
                  {formatCurrency(selectedCustomer.total_paid)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
