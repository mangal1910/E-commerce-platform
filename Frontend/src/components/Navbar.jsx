import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleHome = {
  user: "/user/dashboard",
  seller: "/seller/dashboard",
  admin: "/admin/dashboard",
  deliveryPartner: "/delivery/dashboard",
};

const roleLinks = {
  user: [
    { to: "/user/dashboard", label: "Profile" },
    { to: "/user/shop", label: "Shop" },
    { to: "/user/cart", label: "Cart" },
    { to: "/user/wishlist", label: "Wishlist" },
    { to: "/user/orders", label: "Orders" },
  ],
  seller: [
    { to: "/seller/dashboard", label: "Profile" },
    { to: "/seller/inventory", label: "Inventory" },
    { to: "/seller/orders", label: "Orders" },
    { to: "/seller/analytics", label: "Analytics" },
    { to: "/seller/reviews", label: "Reviews" },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Overview" },
    { to: "/admin/delivery", label: "Delivery Partners" },
    { to: "/admin/sellers", label: "Sellers" },
  ],
  deliveryPartner: [{ to: "/delivery/dashboard", label: "Assignments" }],
};

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const links = isAuthenticated && user?.role ? roleLinks[user.role] || [] : [];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          to={isAuthenticated ? roleHome[user?.role] || "/" : "/"}
          className="flex items-center gap-2"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            V
          </span>
          <span className="text-lg font-bold text-slate-900">Velos</span>
        </Link>

        {/* Desktop nav links */}
        {isAuthenticated && (
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden flex-col items-end md:flex">
                <span className="text-sm font-medium text-slate-800">
                  {user?.name}
                </span>
                <span className="text-xs capitalize text-slate-500">
                  {user?.role === "deliveryPartner" ? "Delivery Partner" : user?.role}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
              >
                Register
              </Link>
            </>
          )}

          {/* Hamburger */}
          <button
            type="button"
            className="flex flex-col gap-1 p-1 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span
              className={`block h-0.5 w-5 bg-slate-700 transition ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-slate-700 transition ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-slate-700 transition ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
          <nav className="mt-3 flex flex-col gap-1">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          {isAuthenticated && (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">
                Signed in as <span className="font-medium">{user?.name}</span>
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 w-full rounded-lg bg-slate-900 py-2 text-sm text-white"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

