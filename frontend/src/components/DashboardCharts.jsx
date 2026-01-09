import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const DashboardCharts = ({ monthlyData, categoryData }) => {
  // --- COLOR PALETTE ---
  // We assign specific colors to make the chart look professional
  const COLORS = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Orange/Amber
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#6366F1", // Indigo
    "#14B8A6", // Teal
  ];

  // Custom Tooltip for the Pie Chart to show currency
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-bold">{payload[0].name}</p>
          <p className="text-astro-light-blue text-sm">
            Rs. {new Intl.NumberFormat("en-LK").format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* --- BAR CHART (Income vs Expenses) --- */}
      <div className="bg-astro-card p-4 md:p-6 rounded-2xl border border-gray-800 shadow-lg">
        <h3 className="text-white font-bold mb-4 md:mb-6 text-sm md:text-base">
          Financial Overview (Last 6 Months)
        </h3>
        <div className="h-56 md:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                dy={10}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                tickFormatter={(value) => `${value / 1000}k`}
                width={35}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  backgroundColor: "#111827",
                  borderColor: "#374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill="#3B82F6" // Blue
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
              <Bar
                dataKey="expense"
                name="Expenses"
                fill="#EF4444" // Red
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- PIE CHART (Expense Breakdown) --- */}
      <div className="bg-astro-card p-4 md:p-6 rounded-2xl border border-gray-800 shadow-lg">
        <h3 className="text-white font-bold mb-4 md:mb-6 text-sm md:text-base">
          Expense Breakdown
        </h3>
        <div className="h-56 md:h-64 w-full relative">
          {categoryData.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
              No expense data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45} // Smaller for mobile
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="total" // The value (number)
                  nameKey="category" // The label (e.g., "Salary", "Food")
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "10px" }}
                  formatter={(value) => (
                    <span className="text-gray-300 text-xs ml-1">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
