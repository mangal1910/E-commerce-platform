import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import UserDashboard from "./pages/user/UserDashboard";
import Shop from "./pages/user/Shop";
import Cart from "./pages/user/Cart";
import Wishlist from "./pages/user/Wishlist";
import MyOrders from "./pages/user/MyOrders";
import ProductDetail from "./pages/user/ProductDetail";
import SellerDashboard from "./pages/seller/SellerDashboard";
import Inventory from "./pages/seller/Inventory";
import Analytics from "./pages/seller/Analytics";
import Reviews from "./pages/seller/Reviews";
import SellerOrders from "./pages/seller/SellerOrders";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DeliveryPartners from "./pages/admin/DeliveryPartners";
import Sellers from "./pages/admin/Sellers";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";

const App = () => (
  <AuthProvider>
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/shop"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Shop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/cart"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/wishlist"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/orders"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/product/:productId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ProductDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/inventory"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/analytics"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/reviews"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <Reviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/delivery"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DeliveryPartners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sellers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Sellers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/delivery/dashboard"
          element={
            <ProtectedRoute allowedRoles={["deliveryPartner"]}>
              <DeliveryDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
);

export default App;

