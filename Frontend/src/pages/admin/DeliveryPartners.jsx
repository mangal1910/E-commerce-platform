import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../services/api";
import Loader from "../../components/Loader";

const nav = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/delivery", label: "Delivery Partners" },
  { to: "/admin/sellers", label: "Sellers" },
];

const DeliveryPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobileNo: "",
  });

  const load = () =>
    api.get("/admin/delivery-partners").then((res) => setPartners(res.data));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/admin/delivery-partners", form);
    alert(`Delivery partner created. Login ID: ${data.loginId}`);
    setForm({ name: "", email: "", password: "", mobileNo: "" });
    load();
  };

  if (loading) {
    return (
      <DashboardLayout navItems={nav}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <Loader size="lg" color="blue" />
          <p className="text-gray-500 animate-pulse font-medium">Loading delivery partners...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={nav}>
      <h2 className="text-xl font-semibold">Create Delivery Partner</h2>
      <form onSubmit={create} className="mt-4 grid max-w-md gap-2">
        {Object.keys(form).map((key) => (
          <input
            key={key}
            placeholder={key}
            type={key === "password" ? "password" : "text"}
            required
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="rounded border px-3 py-2"
          />
        ))}
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Create Account
        </button>
      </form>
      <ul className="mt-6 space-y-2">
        {partners.map((p) => (
          <li key={p._id} className="rounded border p-3 text-sm">
            {p.name} — {p.email} (ID: {p._id})
          </li>
        ))}
      </ul>
    </DashboardLayout>
  );
};

export default DeliveryPartners;

