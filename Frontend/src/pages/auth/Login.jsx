import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";

const roleOptions = [
  { value: "user", label: "Customer", path: "user" },
  { value: "seller", label: "Seller", path: "seller" },
  { value: "admin", label: "Admin", path: "admin" },
  { value: "deliveryPartner", label: "Delivery Partner", path: "delivery" },
];

const homeByRole = {
  user: "/user/shop",
  seller: "/seller/inventory",
  admin: "/admin/dashboard",
  deliveryPartner: "/delivery/dashboard",
};

const Login = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role");
  const initialRole =
    roleParam === "delivery"
      ? "deliveryPartner"
      : roleParam === "admin"
        ? "admin"
        : "user";
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const apiRole = roleOptions.find((r) => r.value === role)?.path || "user";
      const user = await login(apiRole, { email, password });
      navigate(homeByRole[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold text-slate-900">Login</h1>
        <label className="mt-4 block text-sm text-slate-600">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <label className="mt-4 block text-sm text-slate-600">
          {role === "admin" ? "User ID" : "Email"}
        </label>
        <input
          type={role === "admin" ? "text" : "email"}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <label className="mt-4 block text-sm text-slate-600">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-white hover:bg-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (
            <>
              <Loader size="sm" color="white" />
              <span>Signing In...</span>
            </>
          ) : (
            "Sign In"
          )}
        </button>
        {role !== "admin" && (
          <p className="mt-4 text-center text-sm text-slate-600">
            No account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;

