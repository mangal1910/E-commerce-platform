import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/Loader";

const nav = [
  { to: "/seller/dashboard", label: "Profile" },
  { to: "/seller/inventory", label: "Inventory" },
  { to: "/seller/orders", label: "Orders" },
  { to: "/seller/analytics", label: "Analytics" },
  { to: "/seller/reviews", label: "Reviews" },
];

const emptyForm = {
  name: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  costPrice: "",
  stock: "",
};

const Inventory = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const load = () => api.get("/seller/products").then((res) => setProducts(res.data));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const onEditFileChange = (e) => {
    const file = e.target.files?.[0];
    setEditImageFile(file || null);
    if (file) {
      setEditPreview(URL.createObjectURL(file));
    } else {
      setEditPreview(null);
    }
  };

  const createProduct = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      showToast("Please select a product image", "error");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== "") fd.append(k, v);
      });
      fd.append("image", imageFile);

      await api.post("/seller/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm(emptyForm);
      setImageFile(null);
      setPreview(null);
      document.getElementById("product-image").value = "";
      load();
      showToast("Product added! It is now visible on the customer shop.");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to add product",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setEditForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      brand: product.brand || "",
      price: product.price || "",
      costPrice: product.costPrice || "",
      stock: product.stock || "",
    });
    setEditImageFile(null);
    setEditPreview(product.imageUrl || null);
  };

  const closeEditModal = () => {
    setEditingId(null);
    setEditForm(emptyForm);
    setEditImageFile(null);
    setEditPreview(null);
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => {
        if (v !== "") fd.append(k, v);
      });
      if (editImageFile) {
        fd.append("image", editImageFile);
      }

      await api.put(`/seller/products/${editingId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      closeEditModal();
      load();
      showToast("Product updated successfully!");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update product",
        "error"
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const removeProduct = async (id) => {
    await api.delete(`/seller/products/${id}`);
    load();
    showToast("Product removed");
  };

  if (loading) {
    return (
      <DashboardLayout navItems={nav}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <Loader size="lg" color="blue" />
          <p className="text-gray-500 animate-pulse font-medium">Loading inventory...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={nav}>
      <h2 className="text-xl font-semibold text-slate-900">Add Product</h2>
      <form
        onSubmit={createProduct}
        className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Product name *"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border px-3 py-2"
          />
          <input
            placeholder="Category *"
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-lg border px-3 py-2"
          />
          <input
            placeholder="Brand"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className="rounded-lg border px-3 py-2"
          />
          <input
            placeholder="Price (₹) *"
            type="number"
            required
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="rounded-lg border px-3 py-2"
          />
          <input
            placeholder="Cost price (₹)"
            type="number"
            min="0"
            value={form.costPrice}
            onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
            className="rounded-lg border px-3 py-2"
          />
          <input
            placeholder="Stock *"
            type="number"
            required
            min="0"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="rounded-lg border px-3 py-2"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-lg border px-3 py-2 sm:col-span-2"
            rows={3}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-start gap-4">
          <label className="cursor-pointer rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 hover:border-blue-400">
            <input
              id="product-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
            Choose image (uploads to Cloudinary) *
          </label>
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="h-28 w-28 rounded-lg border object-cover"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {submitting ? "Uploading..." : "Add Product"}
        </button>
      </form>

      <h3 className="mt-10 text-lg font-semibold">Your Inventory</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {products.map((p) => (
          <div
            key={p._id}
            className={`flex gap-3 rounded-xl border p-3 ${
              p.isActive ? "bg-white" : "bg-slate-100 opacity-60"
            }`}
          >
            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="h-20 w-20 shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-slate-500">
                  ₹{p.price} · Stock: {p.stock}
                </p>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(p)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeProduct(p._id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!products.length && (
        <p className="mt-4 text-slate-500">No products in inventory yet.</p>
      )}

      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Product</h3>
              <button
                onClick={closeEditModal}
                className="text-2xl text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={updateProduct} className="grid gap-3 sm:grid-cols-2">
              <input
                placeholder="Product name *"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="rounded-lg border px-3 py-2"
              />
              <input
                placeholder="Category *"
                required
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="rounded-lg border px-3 py-2"
              />
              <input
                placeholder="Brand"
                value={editForm.brand}
                onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                className="rounded-lg border px-3 py-2"
              />
              <input
                placeholder="Price (₹) *"
                type="number"
                required
                min="0"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                className="rounded-lg border px-3 py-2"
              />
              <input
                placeholder="Cost price (₹)"
                type="number"
                min="0"
                value={editForm.costPrice}
                onChange={(e) => setEditForm({ ...editForm, costPrice: e.target.value })}
                className="rounded-lg border px-3 py-2"
              />
              <input
                placeholder="Stock *"
                type="number"
                required
                min="0"
                value={editForm.stock}
                onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                className="rounded-lg border px-3 py-2"
              />
              <textarea
                placeholder="Description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="rounded-lg border px-3 py-2 sm:col-span-2"
                rows={3}
              />

              <div className="sm:col-span-2">
                <label className="cursor-pointer rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 hover:border-blue-400 block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onEditFileChange}
                  />
                  Change image (optional)
                </label>
                {editPreview && (
                  <img
                    src={editPreview}
                    alt="Preview"
                    className="mt-3 h-28 w-28 rounded-lg border object-cover"
                  />
                )}
              </div>

              <div className="sm:col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-lg border border-slate-300 px-6 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Inventory;

