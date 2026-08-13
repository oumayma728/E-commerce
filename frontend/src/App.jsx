import Navbar from "./Navbar";
import Hero from "./Hero";
import Footer from "./Footer";
import Products from "./Products";
import ProductDetail from "./ProductDetail";
import Cart from "./Cart";
import WishList from "./Wishlist";
import Checkout from "./Checkout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import { Toaster } from "react-hot-toast";

import useCartStore from "./store/cartStore";
import useAuth from "./hooks/useAuth";

import OrderConfirmation from "./pages/OrderConfirmation";

function App() {
  const cart = useCartStore((state) => state.cart);
  const wish = useCartStore((state) => state.wish);

  const { initializeAuth } = useAuth();

  // Restaurer la session au démarrage de l'application
  useEffect(() => {
    initializeAuth();
  }, []);

  // Sauvegarder le panier
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Sauvegarder les favoris
  useEffect(() => {
    localStorage.setItem("wish", JSON.stringify(wish));
  }, [wish]);

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster />

      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Pages publiques */}
          <Route path="/" element={<Hero />} />
          <Route path="/products" element={<Products />} />
          <Route
            path="/product-detail/:id"
            element={<ProductDetail />}
          />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<WishList />} />

          {/* Authentification */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Pages privées */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
          </Route>
          <Route
            path="/order-confirmation"
            element={<OrderConfirmation />}
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;