import { NavLink } from "react-router-dom";
import Navbar from "./Navbar";

const DashboardLayout = ({ navItems, children }) => (
  <div className="min-h-screen bg-slate-50">
    <Navbar />
    <div className="container mx-auto grid max-w-70xl gap-6 px-4 py-6 ">
      <main className="container min-w-0 rounded-xl border border-slate-200 bg-white p-6">
        {children}
      </main>
    </div>
  </div>
);

export default DashboardLayout;

