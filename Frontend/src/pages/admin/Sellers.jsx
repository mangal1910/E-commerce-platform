import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../services/api";

const nav = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/delivery", label: "Delivery Partners" },
  { to: "/admin/sellers", label: "Sellers" },
];

const Sellers = () => {
  const [sellers, setSellers] = useState([]);

  const load = () => api.get("/admin/sellers").then((res) => setSellers(res.data));

  useEffect(() => {
    load();
  }, []);

  const moderate = async (id, action) => {
    await api.patch(`/admin/sellers/${id}/moderate`, { action });
    load();
  };

  return (
    <DashboardLayout navItems={nav}>
      <h2 className="text-xl font-semibold">Seller Moderation</h2>
      <div className="mt-4 space-y-3">
        {sellers.map((s) => (
          <div key={s._id} className="flex flex-wrap items-center justify-between gap-2 rounded border p-3">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-sm text-slate-500">{s.email}</p>
              <p className="text-xs">
                {s.isBlocked && "Blocked "}
                {s.isSuspended && "Suspended"}
                {!s.isBlocked && !s.isSuspended && "Active"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => moderate(s._id, "suspend")}
                className="rounded border px-2 py-1 text-sm"
              >
                Suspend
              </button>
              <button
                onClick={() => moderate(s._id, "block")}
                className="rounded border px-2 py-1 text-sm text-red-600"
              >
                Block
              </button>
              <button
                onClick={() => moderate(s._id, "activate")}
                className="rounded bg-green-600 px-2 py-1 text-sm text-white"
              >
                Activate
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Sellers;

