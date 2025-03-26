import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Home from "./pages/Home";
import ShopByRoom from "./pages/ShopByRoom";
import ShopByProduct from "./pages/ShopByProduct";
import NotFound from "./pages/NotFound";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
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

  return (
    <Router>
      <ScrollToTop />
      <div>
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="container mx-auto">
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<Home />} />
            {/* Shop by Product Routes */}
            <Route path="/shop-by-product" element={<ShopByProduct />} />
            <Route path="/shop-by-product/:category" element={<ShopByProduct />} />
            <Route
              path="/shop-by-product/:category/:subcategory"
              element={<ShopByProduct />}
            />

            {/* Shop by Room Routes */}
            <Route path="/shop-by-room" element={<ShopByRoom categories={categories} />} />
            <Route path="/shop-by-room/:category" element={<ShopByRoom categories={categories} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;