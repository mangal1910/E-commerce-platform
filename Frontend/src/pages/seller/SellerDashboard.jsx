import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../services/api";
import Loader from "../../components/Loader";

const nav = [
  { to: "/seller/dashboard", label: "Profile" },
  { to: "/seller/inventory", label: "Inventory" },
  { to: "/seller/orders", label: "Orders" },
  { to: "/seller/analytics", label: "Analytics" },
  { to: "/seller/reviews", label: "Reviews" },
];

const SellerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobileNo: "",
    shopAddress: "",
  });

  useEffect(() => {
    api.get("/seller/profile")
      .then((res) => {
        setProfile(res.data);
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          mobileNo: res.data.mobileNo || "",
          shopAddress: res.data.shopAddress || "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const { data } = await api.put("/seller/profile", form);
    setProfile(data);
    alert("Profile updated");
  };

  if (loading) {
    return (
      <DashboardLayout navItems={nav}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <Loader size="lg" color="blue" />
          <p className="text-gray-500 animate-pulse font-medium">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={nav}>
      <h2 className="text-xl font-semibold">Seller Profile</h2>
      <form onSubmit={save} className="mt-4 grid max-w-lg gap-3">
        {Object.keys(form).map((key) => (
          <input
            key={key}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            placeholder={key}
            className="rounded-lg border px-3 py-2"
          />
        ))}
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white">
          Save
        </button>
      </form>
      {profile?.isSuspended && (
        <p className="mt-4 text-red-600">Account is suspended</p>
      )}
    </DashboardLayout>
  );
};

export default SellerDashboard;

