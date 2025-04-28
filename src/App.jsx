import React, { useEffect, useState, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import CartProvider from "./context/CartContext";
import AuthProvider, { AuthContext } from "./context/AuthContext"; // Make sure to export AuthContext from AuthContext.js
import Header from "./Header";
import Footer from "./Footer";
import Home from "./pages/Home";
import ShopByRoom from "./pages/ShopByRoom";
import ShopByProduct from "./pages/ShopByProduct";
import InteriorConsulting from "./pages/InteriorConsulting";
import SearchResults from "./pages/SearchResults";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AboutPage from "./pages/AboutPage";
import AdminDashboard from "./pages/AdminDashboard";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmationPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import NotFound from "./pages/NotFound";

// Move RequireAuth component inside App component or to a separate file
const RequireAuth = ({ children }) => {
  const { user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/login', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) {
    return null;
  }

  return children;
};

const App = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/connectDB")
      .then((response) => response.json())
      .then((data) => {
        setCategories(data.categories);
        setProducts(data.products);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const ConditionalPageStyle = ({ children }) => {
    const location = useLocation();
    const excludedPaths = ["/login", "/register", "/forgot-password", "/not-found"];
    const isExcludedPage = excludedPaths.includes(location.pathname);

    return (
      <>
        {!isExcludedPage && <Header />}
        <main className="container mx-auto">{children}</main>
        {!isExcludedPage && <Footer />}
      </>
    );
  };

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ConditionalPageStyle>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop-by-product" element={<ShopByProduct />} />
              <Route path="/shop-by-product/:category" element={<ShopByProduct />} />
              <Route
                path="/shop-by-product/:category/:subcategory"
                element={<ShopByProduct />}
              />
              <Route path="/shop-by-room" element={<ShopByRoom categories={categories} />} />
              <Route path="/shop-by-room/:category" element={<ShopByRoom categories={categories} />} />
              <Route path="/product/:productId" element={<ProductDetailsPage />} />
              <Route path="/interior-consulting" element={<InteriorConsulting />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/account" element={<Account />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/about" element={<AboutPage />} />
              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <AdminDashboard />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ConditionalPageStyle>
        </CartProvider>
      </AuthProvider>

    </Router>
  );
};

export default App;