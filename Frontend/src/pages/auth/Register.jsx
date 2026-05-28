import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const homeByRole = {
  user: "/user/dashboard",
  seller: "/seller/dashboard",
};

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role");
  const [role, setRole] = useState(
    initialRole === "seller" ? "seller" : "user"
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobileNo: "",
    address: "",
    shopAddress: "",
  });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (role === "delivery" || role === "admin") {
      setError(
        role === "admin"
          ? "Admin account cannot be registered. Please login instead."
          : "Delivery partners are created by Admin. Please login instead."
      );
      return;
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        mobileNo: form.mobileNo,
      };

      if (role === "user") payload.address = form.address;
      if (role === "seller") payload.shopAddress = form.shopAddress;

      const user = await register(role, payload);
      navigate(homeByRole[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold text-slate-900">Register</h1>
        <label className="mt-4 block text-sm text-slate-600">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="user">Customer</option>
          <option value="seller">Seller</option>
        </select>
        {["name", "email", "password", "mobileNo"].map((field) => (
          <div key={field}>
            <label className="mt-4 block text-sm capitalize text-slate-600">
              {field === "mobileNo" ? "Mobile No" : field}
            </label>
            <input
              name={field}
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              required
              value={form[field]}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
        ))}
        {role === "user" && (
          <>
            <label className="mt-4 block text-sm text-slate-600">Address</label>
            <input
              name="address"
              required
              value={form.address}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </>
        )}
        {role === "seller" && (
          <>
            <label className="mt-4 block text-sm text-slate-600">Shop Address</label>
            <input
              name="shopAddress"
              required
              value={form.shopAddress}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-blue-600 py-2.5 text-white hover:bg-blue-500"
        >
          Create Account
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;

