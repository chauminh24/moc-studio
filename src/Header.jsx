import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "./context/CartContext";
import { AuthContext } from "./context/AuthContext"; // Import AuthContext

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubcontent, setActiveSubcontent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false); // State for search modal
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { cart, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate()
  const location = useLocation();

  const toggleModal = () => {
    setIsOpen(!isOpen);
    setActiveSubcontent(null); // Reset subcontent when modal is toggled
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Clear the search bar after submission
      setIsSearchModalOpen(false); // Close the search modal
    }
  };

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  const openCartModal = () => {
    setIsCartModalOpen(true);
  };

  const closeCartModal = () => {
    setIsCartModalOpen(false);
  };

  const openAccountModal = () => {
    setIsAccountModalOpen(true);
  };

  const closeAccountModal = () => {
    setIsAccountModalOpen(false);
  };

  const handleLoginClick = () => {
    if (user) {
      setIsAccountModalOpen(true); // Open account modal if logged in
    } else {
      // Redirect to login with the current page as the redirect URL
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsAccountModalOpen(false);
    navigate("/"); // Redirect to homepage after logout
  };


  const handleLinkClick = () => {
    // Close the sidebar
    setIsOpen(false);
    setActiveSubcontent(null);
    // Scroll to top
    window.scrollTo(0, 0);
  };

  const openSubcontent = (section) => {
    setActiveSubcontent(section);
  };

  const closeSubcontent = () => {
    setActiveSubcontent(null);
    setIsOpen(true); // Keep the sidebar open
  };


  const subcontent = {
    "Shop by Product": [
      {
        name: "Furniture",
        link: "/shop-by-product/furniture",
        isCollapsible: true,
        subItems: [
          { name: "Tables", link: "/shop-by-product/furniture/tables" },
          { name: "Chairs", link: "/shop-by-product/furniture/chairs" },
        ],
      },
      { name: "Lighting", link: "/shop-by-product/lighting" },
      { name: "Tableware", link: "/shop-by-product/tableware" },
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

  const Subcontent = ({ section }) => {
    // State to handle each collapsible item's open/close status
    const [openItems, setOpenItems] = useState({});

    // Toggle function for each item
    const toggleItem = (index) => {
      setOpenItems((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
    };

    return (
      <div className="text-[25px] font-medium mt-10 bg-blue ml-12">
        <button
          onClick={closeSubcontent}
          className="text-white mb-4"
          aria-label="Close subcontent"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {subcontent[section].map((item, index) => (
          <div key={index}>
            {/* Wrap text and arrow in a flexbox container */}
            <div className="flex items-center justify-between w-full">
              <Link
                to={item.link}
                className="uppercase tracking-extra-wide text-white mb-2 hover:text-orange"
                onClick={handleLinkClick}
              >
                {item.name}
              </Link>

              {item.isCollapsible && (
                <button
                  onClick={() => toggleItem(index)}
                  className="text-white ml-2"
                  aria-expanded={openItems[index]}
                >
                  <svg
                    className={`w-6 h-6 transform ${openItems[index] ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Sub-items */}
            {openItems[index] && (
              <div className="ml-4">
                {item.subItems.map((subItem, idx) => (
                  <Link
                    to={subItem.link}
                    key={idx}
                    className="block uppercase tracking-extra-wide text-white mb-2 hover:text-orange"
                    onClick={handleLinkClick}
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };


  return (
    <header className="fixed w-full z-10">
      <div className="w-full h-[1rem] bg-blue mb-4"></div>

      {/* Top Row: Toggle, Logo, Search, Login, Shopping Bag */}
      <div className="container mx-auto flex items-center justify-between p-4 relative">
        {/* Toggle Button */}
        <button
          onClick={toggleModal}
          className="text-orange hover:text-orange focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Logo */}
        <div className="absolute left-[3rem] transform -translate-y-1/2 top-1/2 z-20">
          <Link to="/">
            <img
              src="/moc-studio.png"
              alt="Logo"
              className="h-[10rem] w-auto"
            />
          </Link>
        </div>

        {/* Search, Login, Shopping Bag */}
        <div className="flex items-center space-x-6">
          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center bg-white rounded-full shadow-sm"
          >
            <input
              type="text"
              placeholder="Search"
              className="py-2 px-4 rounded-full focus:outline-none text-blue-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="p-2" aria-label="Search">
              <svg
                className="w-6 h-6 text-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>


          {/* Login */}
          <button
            onClick={handleLoginClick}
            className="hidden lg:block uppercase tracking-extra-wide text-blue"
          >
            {user ? "Account" : "Log In"}
          </button>

          {/* Shopping Bag */}
          <Link
            onClick={openCartModal}
            className="hidden lg:block uppercase tracking-extra-wide text-blue"
          >
            Shopping Bag ({cart.reduce((total, item) => total + item.quantity, 0)})
          </Link>

          {/* Mobile Icons */}
          <div className="flex lg:hidden space-x-4">
            <button className="text-blue" aria-label="Search" onClick={openSearchModal}>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </button>

            <button onClick={handleLoginClick} className="text-blue" aria-label="Login">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>

            <Link onClick={openCartModal} className="text-blue" aria-label="Cart">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-blue flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <button
              onClick={closeSearchModal}
              className="absolute top-4 right-4 text-gray hover:text-black"
              aria-label="Close search modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <form onSubmit={handleSearchSubmit} className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Search"
                className="py-2 px-4 border rounded focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="py-2 px-4 bg-orange text-white rounded hover:bg-dark-beige"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Account Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50" onClick={closeAccountModal}>
          <div
            className="absolute top-16 right-4 bg-white rounded-lg shadow-xl w-64 overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
          >
            {/* Modal header */}
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <img
                  src="/moc-studio.png"
                  alt="Logo"
                  className="h-8 w-auto"
                />
                <h3 className="font-medium text-sm">
                  {user?.name || "User"}
                  {user?.role === "admin" && (
                    <span className="ml-2 text-xs bg-blue text-white px-2 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                </h3>
              </div>
            </div>

            {/* Modal body */}
            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  navigate("/account");
                  closeAccountModal();
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray rounded transition-colors"
              >
                Manage Account
              </button>

              {/* Conditional buttons based on role */}
              {user?.role === "admin" ? (
                <button
                  onClick={() => {
                    navigate("/admin");
                    closeAccountModal();
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray rounded transition-colors flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Admin Dashboard
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate("/orders");
                    closeAccountModal();
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray rounded transition-colors"
                >
                  View Orders
                </button>
              )}
            </div>

            {/* Modal footer */}
            <div className="p-2 border-t">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-orange hover:text-white hover:bg-orange rounded transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartModalOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="flex-1"
            onClick={closeCartModal}
          ></div>

          {/* Cart Content */}
          <div
            className={`fixed inset-y-0 right-0 ${window.innerWidth > 768 ? "w-2/5" : "w-full"} bg-white p-6 z-40 shadow-lg`}
          >
            <button
              onClick={closeCartModal}
              className="absolute top-4 right-4 text-blue hover:text-black"
              aria-label="Close cart modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-xl text-blue font-bold mt-10 text-center">Shopping Bag</h2>
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item._id} className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-sm">€{item.price.$numberDecimal}</p>
                    <p className="text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-blue">Your cart is empty.</p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Navigation Links (Desktop Only) */}
      <div className="hidden lg:flex justify-end container mx-auto p-4">
        <nav className="flex space-x-9">
          {["Living Room", "Bedroom", "Bathroom", "Kitchen", "More"].map(
            (link) => (
              <Link
                key={link}
                to={`/shop-by-room/${link.toLowerCase().replace(" ", "-")}`}
                className="uppercase tracking-extra-wide text-orange"
                onClick={handleLinkClick}
              >
                {link}
              </Link>
            )
          )}
        </nav>
      </div>

      {/* Modal for Toggle */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-opacity-50 z-30"
            onClick={toggleModal}
          ></div>

          {/* Modal Content */}
          <div
            className={`fixed inset-y-0 left-0 ${window.innerWidth > 768 ? "w-2/5" : "w-full"
              } bg-blue p-6 z-40`}
          >
            {/* Close Button */}
            <button
              onClick={toggleModal}
              className="absolute top-4 right-4 text-white hover:text-orange"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Main Modal Content */}
            {!activeSubcontent ? (
              <nav className="flex flex-col space-y-4 mt-18 bg-blue ml-12 text-[25px] font-medium">
                {[
                  "Shop by Product",
                  "Shop by Room",
                  "Interior Consulting",
                  "About",
                ].map((link) => (
                  <div key={link} className="flex justify-between items-center">
                    {(link === "Shop by Product" || link === "Shop by Room") ? (
                      // If it's one of these two, only open subcontent
                      <button
                        onClick={() => openSubcontent(link)}
                        className="text-white uppercase tracking-extra-wide hover:text-orange text-left flex-1"
                        aria-label={`Open ${link} submenu`}
                      >
                        {link}
                      </button>
                    ) : (
                      // Otherwise, it's a normal link
                      <Link
                        to={`/${link.toLowerCase().replace(" & ", "-").replace(" ", "-")}`}
                        className="text-white uppercase tracking-extra-wide hover:text-orange text-left flex-1"
                        onClick={handleLinkClick}
                      >
                        {link}
                      </Link>
                    )}

                    {(link === "Shop by Product" || link === "Shop by Room") && (
                      <button
                        onClick={() => openSubcontent(link)}
                        className="text-white"
                        aria-label={`Open ${link} submenu`}
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </nav>

            ) : (
              <Subcontent section={activeSubcontent} />
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Header;