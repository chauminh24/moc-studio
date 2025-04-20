import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [media, setMedia] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category_ids: [],
    stock: 0,
    image_url: ""
  });
  const [newMedia, setNewMedia] = useState({
    product_id: "",
    media_url: "",
    media_type: "image",
    is_primary: false
  });
  const [newAvailability, setNewAvailability] = useState({
    date: "",
    time_slots: "",
    default_capacity: 1  // Default capacity for new slots
  });

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (activeTab === "orders") {
          const response = await fetch("/api/connectDB?type=adminOrders");
          if (!response.ok) throw new Error("Failed to fetch orders");
          const data = await response.json();
          setOrders(data.orders);
        } else if (activeTab === "products") {
          const productsResponse = await fetch("/api/connectDB?type=adminProducts");
          if (!productsResponse.ok) throw new Error("Failed to fetch products");
          const productsData = await productsResponse.json();
          setProducts(productsData.products);

          const mediaResponse = await fetch("/api/connectDB?type=adminMedia");
          if (!mediaResponse.ok) throw new Error("Failed to fetch media");
          const mediaData = await mediaResponse.json();
          setMedia(mediaData.media);
        } else if (activeTab === "availability") {
          const response = await fetch("/api/connectDB?type=adminAvailability");
          if (!response.ok) throw new Error("Failed to fetch availability");
          const data = await response.json();
          setAvailability(data.availability);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Handle order status update
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch("/api/connectDB", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "updateOrderStatus",
          orderId,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update order status");

      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle product update
  const handleProductUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/connectDB", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "updateProduct",
          product: editProduct,
        }),
      });

      if (!response.ok) throw new Error("Failed to update product");

      setProducts(products.map(product =>
        product._id === editProduct._id ? editProduct : product
      ));
      setEditProduct(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle new product creation
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/connectDB", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "createProduct",
          product: newProduct,
        }),
      });

      if (!response.ok) throw new Error("Failed to create product");

      const createdProduct = await response.json();
      setProducts([...products, createdProduct]);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category_ids: [],
        stock: 0,
        image_url: ""
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle product media upload
  const handleAddMedia = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/connectDB", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "addProductMedia",
          media: newMedia,
        }),
      });

      if (!response.ok) throw new Error("Failed to add media");

      const createdMedia = await response.json();
      setMedia([...media, createdMedia]);
      setNewMedia({
        product_id: "",
        media_url: "",
        media_type: "image",
        is_primary: false
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle product deletion
  const deleteProduct = async (productId) => {
    try {
      const response = await fetch("/api/connectDB", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "deleteProduct",
          productId,
        }),
      });

      if (!response.ok) throw new Error("Failed to delete product");

      setProducts(products.filter(product => product._id !== productId));
      // Also delete associated media
      setMedia(media.filter(item => item.product_id !== productId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle media deletion
  const deleteMedia = async (mediaId) => {
    try {
      const response = await fetch("/api/connectDB", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "deleteMedia",
          mediaId,
        }),
      });

      if (!response.ok) throw new Error("Failed to delete media");

      setMedia(media.filter(item => item._id !== mediaId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle availability creation
  const handleAddAvailability = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Process time slots
      const timeSlots = newAvailability.time_slots
        .split(',')
        .map(t => t.trim())
        .filter(t => t)
        .map(time => ({
          time,
          available: newAvailability.default_capacity,
          capacity: newAvailability.default_capacity
        }));

      if (timeSlots.length === 0) {
        throw new Error("Please add at least one time slot");
      }

      // Log the payload being sent to the API
      console.log("Sending availability data:", {
        date: newAvailability.date,
        time_slots: timeSlots
      });

      const response = await fetch('/api/connectDB?type=addAvailability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availability: {
            date: newAvailability.date,
            time_slots: timeSlots
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to add availability");
      }

      // Success - refresh data
      const availResponse = await fetch('/api/connectDB?type=adminAvailability');
      const newData = await availResponse.json();
      setAvailability(newData.availability);

      setNewAvailability({
        date: '',
        time_slots: '',
        default_capacity: 1
      });

    } catch (err) {
      console.error("Full error:", err);
      setError(`${err.message} - Please check console for details`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle availability deletion
  const deleteAvailability = async (availabilityId) => {
    try {
      const response = await fetch("/api/connectDB", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "deleteAvailability",
          availabilityId,
        }),
      });

      if (!response.ok) throw new Error("Failed to delete availability");

      setAvailability(availability.filter(item => item._id !== availabilityId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter orders/products based on search term
  const filteredOrders = orders.filter(order =>
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailability = availability.filter(avail =>
    avail.date.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray pt-[10em] pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue mb-2">Admin Dashboard</h1>
          <div className="h-1 w-20 bg-orange"></div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-4 px-6 font-medium ${activeTab === "orders" ? "text-blue border-b-2 border-blue" : "text-gray-500"}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={`py-4 px-6 font-medium ${activeTab === "products" ? "text-blue border-b-2 border-blue" : "text-gray-500"}`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={`py-4 px-6 font-medium ${activeTab === "availability" ? "text-blue border-b-2 border-blue" : "text-gray-500"}`}
            onClick={() => setActiveTab("availability")}
          >
            Availability
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
          </div>
        )}

        {/* Orders Tab */}
        {!loading && activeTab === "orders" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order._id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer.name} ({order.customer.email})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          €{order.total.$numberDecimal}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm rounded-md"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="text-blue hover:text-blue-700"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {!loading && activeTab === "products" && (
          <div className="space-y-6">
            {/* Create New Product Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-blue mb-4">Create New Product</h2>
              <form onSubmit={handleCreateProduct}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                      rows="3"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                      value={newProduct.image_url}
                      onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue text-white rounded-lg hover:bg-dark-blue transition"
                  >
                    Create Product
                  </button>
                </div>
              </form>
            </div>

            {/* Add Media Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-blue mb-4">Add Product Media</h2>
              <form onSubmit={handleAddMedia}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                      value={newMedia.product_id}
                      onChange={(e) => setNewMedia({ ...newMedia, product_id: e.target.value })}
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>{product.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Media URL</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                      value={newMedia.media_url}
                      onChange={(e) => setNewMedia({ ...newMedia, media_url: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                      value={newMedia.media_type}
                      onChange={(e) => setNewMedia({ ...newMedia, media_type: e.target.value })}
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="3d">3D Model</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_primary"
                      className="h-4 w-4 text-blue focus:ring-blue border-gray-300 rounded"
                      checked={newMedia.is_primary}
                      onChange={(e) => setNewMedia({ ...newMedia, is_primary: e.target.checked })}
                    />
                    <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-700">
                      Primary Media
                    </label>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue text-white rounded-lg hover:bg-dark-blue transition"
                  >
                    Add Media
                  </button>
                </div>
              </form>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Media</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <React.Fragment key={product._id}>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img
                                    className="h-10 w-10 rounded-md object-cover"
                                    src={product.image_url || "/placeholder/image_placeholder.png"}
                                    alt={product.name}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                  <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              €{product.price.$numberDecimal}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.stock}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {media.filter(m => m.product_id === product._id).length} media items
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => setEditProduct(product)}
                                className="text-blue hover:text-blue-700 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteProduct(product._id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                          {/* Media for this product */}
                          {media.filter(m => m.product_id === product._id).map(mediaItem => (
                            <tr key={mediaItem._id} className="bg-gray-50">
                              <td colSpan="4" className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-16 w-16">
                                    {mediaItem.media_type === 'image' ? (
                                      <img
                                        className="h-16 w-16 object-cover rounded"
                                        src={mediaItem.media_url}
                                        alt={`Media for ${product.name}`}
                                      />
                                    ) : (
                                      <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                                        {mediaItem.media_type === 'video' ? '🎥 Video' : '🖥️ 3D Model'}
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {mediaItem.media_type} {mediaItem.is_primary && '(Primary)'}
                                    </div>
                                    <div className="text-sm text-gray-500">{mediaItem.media_url}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  onClick={() => deleteMedia(mediaItem._id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Availability Tab */}
        {!loading && activeTab === "availability" && (
          <div className="space-y-6">
            {/* Add Availability Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-blue mb-4">Add Availability</h2>
              <form onSubmit={handleAddAvailability}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                      value={newAvailability.date}
                      onChange={(e) => setNewAvailability({
                        ...newAvailability,
                        date: e.target.value
                      })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Slots (comma separated, e.g., "09:00, 10:00, 11:00")
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                      value={newAvailability.time_slots}
                      onChange={(e) => setNewAvailability({
                        ...newAvailability,
                        time_slots: e.target.value
                      })}
                      placeholder="09:00, 10:00, 11:00"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Must be in 24-hour HH:MM format (e.g., 09:00, 13:30)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Capacity per Slot
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                      value={newAvailability.default_capacity}
                      onChange={(e) => setNewAvailability({
                        ...newAvailability,
                        default_capacity: parseInt(e.target.value) || 1
                      })}
                      required
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue text-white rounded-lg hover:bg-dark-blue transition"
                  >
                    Add Availability
                  </button>
                </div>
              </form>
            </div>

            {/* Availability Calendar */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-blue mb-4">Availability Calendar</h2>
              <div className="h-[500px]">
                <Calendar
                  localizer={localizer}
                  events={availability.flatMap(avail => {
                    // Convert MongoDB date string to Date object if needed
                    const dateObj = avail.date instanceof Date ? avail.date : new Date(avail.date);
                    const dateStr = dateObj.toISOString().split('T')[0];

                    return avail.time_slots.map(slot => ({
                      id: `${avail._id}-${slot.time}`,
                      title: `Available (${slot.time}) - ${slot.available}/${slot.capacity}`,
                      start: new Date(`${dateStr}T${slot.time}:00`),
                      end: new Date(`${dateStr}T${slot.time}:00`),
                      allDay: false,
                      resource: {
                        ...slot,
                        dateId: avail._id
                      }
                    }));
                  })}
                  startAccessor="start"
                  endAccessor="end"
                  defaultView="week"
                  views={['week', 'day', 'agenda']}
                  min={new Date(0, 0, 0, 9, 0, 0)}  // 9:00 AM
                  max={new Date(0, 0, 0, 18, 0, 0)} // 6:00 PM
                  step={30}                          // 30 minute intervals
                  timeslots={2}                      // Number of time slots per hour
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: event.resource.available > 0 ? '#3182ce' : '#e53e3e',
                      borderRadius: '4px',
                      border: 'none',
                      color: 'white',
                      padding: '2px 5px',
                      fontSize: '12px'
                    }
                  })}
                  onSelectEvent={(event) => {
                    // Handle event click (e.g., show edit modal)
                    console.log('Selected availability:', event);
                  }}
                  components={{
                    event: ({ event }) => (
                      <div className="p-1">
                        <div className="font-semibold">{event.title}</div>
                        {event.resource.available > 0 && (
                          <div className="text-xs">Slots available</div>
                        )}
                      </div>
                    ),
                    toolbar: (toolbarProps) => (
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toolbarProps.onNavigate('PREV')}
                            className="px-3 py-1 border rounded"
                          >
                            Back
                          </button>
                          <button
                            onClick={() => toolbarProps.onNavigate('TODAY')}
                            className="px-3 py-1 border rounded"
                          >
                            Today
                          </button>
                          <button
                            onClick={() => toolbarProps.onNavigate('NEXT')}
                            className="px-3 py-1 border rounded"
                          >
                            Next
                          </button>
                        </div>
                        <span className="text-lg font-medium">
                          {toolbarProps.label}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toolbarProps.onView('day')}
                            className={`px-3 py-1 border rounded ${toolbarProps.view === 'day' ? 'bg-blue-100' : ''}`}
                          >
                            Day
                          </button>
                          <button
                            onClick={() => toolbarProps.onView('week')}
                            className={`px-3 py-1 border rounded ${toolbarProps.view === 'week' ? 'bg-blue-100' : ''}`}
                          >
                            Week
                          </button>
                          <button
                            onClick={() => toolbarProps.onView('agenda')}
                            className={`px-3 py-1 border rounded ${toolbarProps.view === 'agenda' ? 'bg-blue-100' : ''}`}
                          >
                            Agenda
                          </button>
                        </div>
                      </div>
                    )
                  }}
                />
              </div>
            </div>

            {/* Availability List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slots</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAvailability.length > 0 ? (
                      filteredAvailability.map((avail) => (
                        <tr key={avail._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(avail.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {avail.time_slots.join(', ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => deleteAvailability(avail._id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                          No availability found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-blue">Edit Product</h2>
                  <button
                    onClick={() => setEditProduct(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleProductUpdate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                        value={editProduct.name}
                        onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                        value={editProduct.price.$numberDecimal}
                        onChange={(e) => setEditProduct({
                          ...editProduct,
                          price: { $numberDecimal: e.target.value }
                        })}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                        rows="4"
                        value={editProduct.description}
                        onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                        value={editProduct.stock}
                        onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                        value={editProduct.image_url}
                        onChange={(e) => setEditProduct({ ...editProduct, image_url: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setEditProduct(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue text-white rounded-lg hover:bg-dark-blue transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;