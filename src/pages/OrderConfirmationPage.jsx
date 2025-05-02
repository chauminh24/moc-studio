import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;

  return (
    <div className="min-h-screen pt-[10em] pb-20 px-4 sm:px-6 lg:px-8 bg-beige">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-8 text-center">
        <div className="mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-blue mb-4">Order Confirmed!</h1>
        <p className="text-blue mb-6">Thank you for your purchase. Your order has been received.</p>
        
        {order && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
            <h2 className="text-lg font-semibold text-blue mb-4">Order Details</h2>
            <div className="space-y-2">
              <p className="text-sm"><span className="font-medium">Order Total:</span> €{order.total_price.$numberDecimal}</p>
              <p className="text-sm"><span className="font-medium">Shipping to:</span> {order.shipping_address}</p>
              <p className="text-sm"><span className="font-medium">Payment Method:</span> {order.payment_method}</p>
              <p className="text-sm"><span className="font-medium">Estimated Delivery:</span> {new Date(order.estimated_delivery).toLocaleDateString()}</p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate('/shop-by-room/living-room')}
            className="px-6 py-2 bg-orange text-white rounded hover:bg-dark-orange"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-2 border border-blue text-blue rounded hover:bg-blue-50"
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;