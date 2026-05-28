import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: "🛍️",
    title: "Browse & Buy",
    desc: "Search products by name or category, filter by price and brand, and add to cart in one click.",
  },
  {
    icon: "🏪",
    title: "Sell Your Products",
    desc: "Manage your inventory, upload product images to Cloudinary, track sales and profit analytics.",
  },
  {
    icon: "🚚",
    title: "Real-Time Delivery",
    desc: "Delivery partners update shipping status at every step so customers always know where their order is.",
  },
  {
    icon: "⭐",
    title: "Reviews & Feedback",
    desc: "Customers leave star ratings and written feedback on delivered products.",
  },
  {
    icon: "🔄",
    title: "Easy Returns",
    desc: "Request a return after delivery. Sellers approve or reject with a note.",
  },
  {
    icon: "🛡️",
    title: "Role-Based Security",
    desc: "Separate dashboards for Users, Sellers, Admins and Delivery Partners with JWT auth.",
  },
];

const roles = [
  {
    title: "Customer",
    icon: "👤",
    desc: "Shop for products, track orders, manage cart & wishlist.",
    cta: "Register as Customer",
    to: "/register?role=user",
    accent: "bg-blue-600",
  },
  {
    title: "Seller",
    icon: "🏪",
    desc: "List products, manage inventory, assign deliveries, view revenue.",
    cta: "Register as Seller",
    to: "/register?role=seller",
    accent: "bg-violet-600",
  },
  {
    title: "Admin",
    icon: "🛡️",
    desc: "Platform oversight — moderate sellers, create delivery accounts, track commission.",
    cta: "Admin Login",
    to: "/login?role=admin",
    accent: "bg-rose-600",
  },
  {
    title: "Delivery Partner",
    icon: "🚚",
    desc: "View assigned orders, update delivery status, close completed deliveries.",
    cta: "Delivery Login",
    to: "/login?role=delivery",
    accent: "bg-green-600",
  },
];

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const dashboardLink = {
    user: "/user/dashboard",
    seller: "/seller/dashboard",
    admin: "/admin/dashboard",
    deliveryPartner: "/delivery/dashboard",
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-24 text-white">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)" }}
        />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <span className="inline-block rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300">
            Multi-Vendor E-Commerce Platform
          </span>
          <h1 className="mt-6 text-5xl font-extrabold leading-tight sm:text-6xl">
            Project{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Velos
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            A complete marketplace connecting customers, sellers, admins and
            delivery partners — with real-time tracking, Cloudinary image
            uploads, and role-based dashboards.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to={dashboardLink[user?.role] || "/"}
                className="rounded-xl bg-blue-600 px-8 py-3 font-semibold hover:bg-blue-500"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="rounded-xl bg-blue-600 px-8 py-3 font-semibold hover:bg-blue-500"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="rounded-xl border border-white/20 px-8 py-3 font-semibold hover:bg-white/10"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-blue-600">
            Platform Features
          </p>
          <h2 className="mt-2 text-center text-3xl font-bold text-slate-900">
            Everything you need in one platform
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-blue-600">
            Choose Your Role
          </p>
          <h2 className="mt-2 text-center text-3xl font-bold text-slate-900">
            Four roles, one platform
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((r) => (
              <div
                key={r.title}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="text-4xl">{r.icon}</div>
                <h3 className="mt-3 text-xl font-bold text-slate-900">
                  {r.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {r.desc}
                </p>
                <Link
                  to={r.to}
                  className={`mt-5 rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-white ${r.accent} hover:opacity-90`}
                >
                  {r.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-600 py-16 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-3 text-blue-100">
            Join as a customer or seller today. No credit card required.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/register?role=user"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50"
            >
              Shop as Customer
            </Link>
            <Link
              to="/register?role=seller"
              className="rounded-xl border border-white/30 px-6 py-3 font-semibold hover:bg-white/10"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Project Velos — Final Year Project</p>
      </footer>
    </div>
  );
};

export default Home;

