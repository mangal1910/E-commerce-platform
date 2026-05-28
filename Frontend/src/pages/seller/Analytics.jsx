import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../services/api";

const nav = [
  { to: "/seller/dashboard", label: "Profile" },
  { to: "/seller/inventory", label: "Inventory" },
  { to: "/seller/orders", label: "Orders" },
  { to: "/seller/analytics", label: "Analytics" },
  { to: "/seller/reviews", label: "Reviews" },
];

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/seller/analytics").then((res) => setData(res.data));
  }, []);

  return (
    <DashboardLayout navItems={nav}>
      <h2 className="text-xl font-semibold">Sales Analytics</h2>
      {data && (
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-slate-500">Revenue</p>
            <p className="text-2xl font-bold">{data.totalRevenue?.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-slate-500">Profit</p>
            <p className="text-2xl font-bold">{data.totalProfit?.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-slate-500">Items Sold</p>
            <p className="text-2xl font-bold">{data.itemsSold}</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Analytics;

