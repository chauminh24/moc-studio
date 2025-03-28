import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CartProvider from "./context/CartContext";
import Header from "./Header";
import Footer from "./Footer";
import Home from "./pages/Home";
import ShopByRoom from "./pages/ShopByRoom";
import ShopByProduct from "./pages/ShopByProduct";
import InteriorConsulting from "./pages/InteriorConsulting";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";

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
    <CartProvider>
      <Router>
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

              {/* Interior Consulting Route */}
              <Route path="/interior-consulting" element={<InteriorConsulting />} />

              {/* Search Results Route */}
              <Route path="/search" element={<SearchResults />} />

              {/* Not Found Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;