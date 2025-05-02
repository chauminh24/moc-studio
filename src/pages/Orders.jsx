import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);


  useEffect(() => {
    if (!user || !user._id || user.role === 'admin') {
      navigate('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/connectDB?type=userOrders&userId=${user._id}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data.orders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
  
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.role === 'admin') return null;

  return (
    <div className="min-h-screen pt-[10em] pb-20 px-4 sm:px-6 lg:px-8 bg-beige">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-blue mb-2">MY ORDERS</h1>
          <div className="w-20 h-1 bg-orange mx-auto"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-blue">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/shop-by-room/living-room')}
              className="mt-4 px-4 py-2 bg-orange text-white rounded hover:bg-dark-orange"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order._id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div className="mb-4 sm:mb-0">
                      <h2 className="text-lg font-semibold text-blue">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Placed on {formatDate(order.placed_at)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-6">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row">
                        <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                          <div className="w-20 h-20 bg-gray-200 rounded-md"></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-md font-medium text-blue">{item.name || 'Product'}</h3>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-sm text-blue mt-1">
                            €{typeof item.price_at_purchase === 'object'
                              ? item.price_at_purchase.$numberDecimal
                              : item.price_at_purchase}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Action */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-lg font-semibold text-blue">
                        €{typeof order.total_price === 'object'
                          ? order.total_price.$numberDecimal
                          : order.total_price}
                      </p>
                    </div>
                    <button
                      disabled
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      className="px-4 py-2 border border-orange text-orange rounded cursor-not-allowed bg-opacity-50"
                    >
                      View Details
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showTooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-orange text-white px-3 py-1 rounded-full text-sm whitespace-nowrap"
          style={{
            left: `${cursorPosition.x + 20}px`,
            top: `${cursorPosition.y + 20}px`
          }}
        >
          COMING SOON
        </div>
      )}

    </div>

  );
};

export default Orders;
