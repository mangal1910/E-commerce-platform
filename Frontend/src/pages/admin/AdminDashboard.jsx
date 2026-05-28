import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../services/api";
import Loader from "../../components/Loader";

const nav = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/delivery", label: "Delivery Partners" },
  { to: "/admin/sellers", label: "Sellers" },
];

const AdminDashboard = () => {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/revenue")
      .then((res) => setRevenue(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout navItems={nav}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <Loader size="lg" color="blue" />
          <p className="text-gray-500 animate-pulse font-medium">Loading overview...</p>
        </div>
      </DashboardLayout>
    );
  }

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

