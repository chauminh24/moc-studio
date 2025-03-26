import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubcontent, setActiveSubcontent] = useState(null);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    setActiveSubcontent(null); // Reset subcontent when modal is toggled
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Clear the search bar after submission
    }
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
          <Link
            to="/login-register"
            className="hidden lg:block uppercase tracking-extra-wide text-blue"
          >
            Log In
          </Link>

          {/* Shopping Bag */}
          <Link
            to="/cart"
            className="hidden lg:block uppercase tracking-extra-wide text-blue"
          >
            Shopping Bag (0)
          </Link>

          {/* Mobile Icons */}
          <div className="flex lg:hidden space-x-4">
            <button className="text-blue" aria-label="Search">
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

            <Link to="/login-register" className="text-blue" aria-label="Login">
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
            </Link>

            <Link to="/cart" className="text-blue" aria-label="Cart">
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

      {/* Navigation Links (Desktop Only) */}
      <div className="hidden lg:flex justify-end container mx-auto p-4">
        <nav className="flex space-x-9">
          {["Living Room", "Bedroom", "Bathroom", "Kitchen", "More"].map(
            (link) => (
              <Link
                key={link}
                to={`/${link.toLowerCase().replace(" ", "-")}`}
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
          {/* Overlay for Mobile Only */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
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
                  "Contact",
                ].map((link) => (
                  <div key={link} className="flex">
                    {(link === "Shop by Product" || link === "Shop by Room") ? (
                      // If it's one of these two, only open subcontent
                      <button
                        onClick={() => openSubcontent(link)}
                        className="text-white uppercase tracking-extra-wide hover:text-orange"
                        aria-label={`Open ${link} submenu`}
                      >
                        {link}
                      </button>
                    ) : (
                      // Otherwise, it's a normal link
                      <Link
                        to={`/${link.toLowerCase().replace(" & ", "-").replace(" ", "-")}`}
                        className="text-white uppercase tracking-extra-wide hover:text-orange"
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