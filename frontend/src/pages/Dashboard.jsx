import React, { useEffect, useState } from "react";
import api from "../api";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
} from "lucide-react";
import DashboardCharts from "../components/DashboardCharts";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
    total_liabilities: 0,
    recent_transactions: [],
    monthly_stats: [],
    category_stats: [],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("stats/");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
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
    <div className="p-8 min-h-screen text-white pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-astro-text-muted mt-1">
          Financial summary and recent activity.
        </p>
      </header>

      {/* --- Summary Cards Row --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Balance Card */}
        <div className="bg-astro-card p-6 rounded-2xl shadow-lg shadow-black/20 border border-gray-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={48} className="text-white" />
          </div>
          <p className="text-astro-text-muted text-xs font-bold uppercase tracking-wider">
            Net Balance
          </p>
          <h2 className="text-2xl font-bold text-white mt-2">
            {formatCurrency(stats.balance)}
          </h2>
        </div>

        {/* Income Card */}
        <div className="bg-astro-card p-6 rounded-2xl shadow-lg shadow-black/20 border border-gray-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={48} className="text-astro-light-blue" />
          </div>
          <p className="text-astro-text-muted text-xs font-bold uppercase tracking-wider">
            Total Income
          </p>
          <h2 className="text-2xl font-bold text-astro-light-blue mt-2">
            {formatCurrency(stats.total_income)}
          </h2>
        </div>

        {/* Expenses Card */}
        <div className="bg-astro-card p-6 rounded-2xl shadow-lg shadow-black/20 border border-gray-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown size={48} className="text-red-500" />
          </div>
          <p className="text-astro-text-muted text-xs font-bold uppercase tracking-wider">
            Total Expenses
          </p>
          <h2 className="text-2xl font-bold text-red-500 mt-2">
            {formatCurrency(stats.total_expense)}
          </h2>
        </div>

        {/* Liabilities Card */}
        <div className="bg-astro-card p-6 rounded-2xl shadow-lg shadow-black/20 border border-orange-900/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertCircle size={48} className="text-orange-500" />
          </div>
          <p className="text-astro-text-muted text-xs font-bold uppercase tracking-wider">
            Total Debt
          </p>
          <h2 className="text-2xl font-bold text-orange-500 mt-2">
            {formatCurrency(stats.total_liabilities)}
          </h2>
        </div>
      </div>

      {/* --- Main Content Split --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Charts Area (Active) */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardCharts
            monthlyData={stats.monthly_stats}
            categoryData={stats.category_stats}
          />
        </div>

        {/* Right: Recent Transactions List */}
        <div className="bg-astro-card p-6 rounded-2xl shadow-lg border border-gray-800 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white text-lg">
              Recent Transactions
            </h3>
          </div>

          <div className="space-y-4">
            {stats.recent_transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-4 text-sm">
                No recent activity.
              </p>
            ) : (
              stats.recent_transactions.map((t, index) => (
                <div
                  key={`${t.type}-${t.id}-${index}`}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon based on type */}
                    <div
                      className={`p-2 rounded-lg ${
                        t.type === "income"
                          ? "bg-blue-500/10 text-astro-light-blue"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {t.type === "income" ? (
                        <ArrowDownLeft size={18} />
                      ) : (
                        <ArrowUpRight size={18} />
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-white text-sm">
                        {t.title}
                      </p>
                      <p className="text-xs text-astro-text-muted flex items-center gap-1">
                        <Calendar size={10} /> {t.date}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-bold text-sm ${
                      t.type === "income"
                        ? "text-astro-light-blue"
                        : "text-red-500"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount)}
                  </span>
                </div>
              ))
            )}
          </div>

          <button className="w-full mt-6 py-2 text-sm text-astro-text-muted hover:text-white hover:bg-gray-800 rounded-lg transition-colors border border-dashed border-gray-700">
            View All History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
