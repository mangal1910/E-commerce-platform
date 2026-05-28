import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../services/api";

const nav = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/delivery", label: "Delivery Partners" },
  { to: "/admin/sellers", label: "Sellers" },
];

const AdminDashboard = () => {
  const [revenue, setRevenue] = useState(null);

  useEffect(() => {
    api.get("/admin/revenue").then((res) => setRevenue(res.data));
  }, []);

  return (
    <DashboardLayout navItems={nav}>
      <h2 className="text-xl font-semibold">Platform Overview</h2>
      {revenue && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Commission" value={`${revenue.totalCommission?.toFixed(2)}`} />
          <Stat label="Order Value" value={`${revenue.totalOrderValue?.toFixed(2)}`} />
          <Stat label="Orders" value={revenue.totalOrders} />
          <Stat label="Users" value={revenue.metrics?.users} />
          <Stat label="Sellers" value={revenue.metrics?.sellers} />
          <Stat label="Delivery Partners" value={revenue.metrics?.deliveryPartners} />
        </div>
      )}
    </DashboardLayout>
  );
};

const Stat = ({ label, value }) => (
  <div className="rounded-lg border p-4">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;

