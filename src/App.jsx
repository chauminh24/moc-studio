import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Home from "./pages/Home";
import ShopByRoom from "./pages/ShopByRoom";
import ShopByProduct from "./pages/ShopByProduct";
import NotFound from "./pages/NotFound";
// import LoginRegister from "./pages/LoginRegister";
// import Contact from "./pages/Contact";
// import About from "./pages/About";
// import InteriorConsulting from "./pages/InteriorConsulting";
// import Chairs from "./pages/Chairs";
// import Tables from "./pages/Tables";
// import Lightings from "./pages/Lightings";
// import Cutlery from "./pages/Cutlery";
// import Rugs from "./pages/Rugs";
// import Lamps from "./pages/Lamps";
// import Cushions from "./pages/Cushions";
// import Decor from "./pages/Decor";
// import LivingRoom from "./pages/LivingRoom";
// import Bedroom from "./pages/Bedroom";
// import Bathroom from "./pages/Bathroom";
// import Kitchen from "./pages/Kitchen";
// import More from "./pages/More";

const App = () => {
  const [products, setProducts] = useState([]);

  const subcontent = {
    "Shop by Product": [
      { name: "Chairs", link: "/shop-by-product/chairs" },
      { name: "Tables", link: "/shop-by-product/tables" },
      { name: "Lighting", link: "/shop-by-product/lighting" },
      { name: "Cutlery & Plates", link: "/shop-by-product/cutlery" },
      {
        name: "Accessories",
        link: "/shop-by-product/accessories",
        isCollapsible: true,
        subItems: [
          { name: "Rugs", link: "/shop-by-product/accessories/rugs" },
          { name: "Lamps", link: "/shop-by-product/accessories/lamps" },
          { name: "Cushions", link: "/shop-by-product/accessories/cushions" },
          { name: "Decor", link: "/shop-by-product/accessories/decor" },
        ],
      },
    ],
    "Shop by Room": [
      { name: "Living Room", link: "/shop-by-room/living-room" },
      { name: "Bedroom", link: "/shop-by-room/bedroom" },
      { name: "Bathroom", link: "/shop-by-room/bathroom" },
      { name: "Kitchen", link: "/shop-by-room/kitchen" },
      { name: "More", link: "/shop-by-room/more" },
    ],
  };

  useEffect(() => {
    fetch("/api/fetchProducts")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);
  return (
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
            <Route path="/shop-by-room" element={<ShopByRoom />} />
            <Route path="/shop-by-room/:category" element={<ShopByRoom />} />
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