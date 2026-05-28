import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../services/api";

const nav = [
  { to: "/seller/dashboard", label: "Profile" },
  { to: "/seller/inventory", label: "Inventory" },
  { to: "/seller/orders", label: "Orders" },
  { to: "/seller/analytics", label: "Analytics" },
  { to: "/seller/reviews", label: "Reviews" },
];

const Reviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get("/seller/reviews").then((res) => setReviews(res.data));
  }, []);

  return (
    <DashboardLayout navItems={nav}>
      <h2 className="text-xl font-semibold">Product Feedback</h2>
      <div className="mt-4 space-y-3">
        {reviews.map((r) => (
          <div key={r._id} className="rounded border p-3">
            <p className="font-medium">{r.product?.name}</p>
            <p className="text-sm">
              {r.rating}★ — {r.user?.name}
            </p>
            <p className="text-slate-600">{r.comment}</p>
          </div>
        ))}
      </div>
      {!reviews.length && <p className="mt-4 text-slate-500">No reviews yet.</p>}
    </DashboardLayout>
  );
};

export default Reviews;

