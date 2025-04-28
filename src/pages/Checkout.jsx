import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Checkout = () => {
  const { cart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect admin users
  if (user?.role === 'admin') {
    navigate('/');
    return null;
  }

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    shippingMethod: 'standard',
    paymentMethod: 'credit-card',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    saveInfo: false
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price.$numberDecimal) * item.quantity), 0);
    const shipping = formData.shippingMethod === 'express' ? 15 : 5;
    const tax = subtotal * 0.1; // 10% tax
    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      total: (subtotal + shipping + tax).toFixed(2)
    };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

    if (formData.paymentMethod === 'credit-card') {
      if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
      if (!formData.cardExpiry.trim()) newErrors.cardExpiry = 'Expiry date is required';
      if (!formData.cardCvc.trim()) newErrors.cardCvc = 'CVC is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const orderData = {
        user_id: user?._id || null,
        items: cart.map(item => ({
          product_id: new ObjectId(item._id),
          quantity: item.quantity,
          price_at_purchase: item.price
        })),
        total_price: { $numberDecimal: calculateTotal().total },
        order_status: 'pending',
        shipping_address: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
        payment_method: formData.paymentMethod,
        shipping_method: formData.shippingMethod,
        placed_at: new Date(),
        estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 days
      };

      const response = await fetch('/api/connectdb?type=createOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderData })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      clearCart();
      navigate('/order-confirmation', { state: { order: orderData } });
    } catch (error) {
      console.error('Checkout error:', error);
      setErrors({ form: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-beige flex flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold text-blue mb-4">Your cart is empty</h1>
          <p className="text-blue mb-6">Looks like you haven't added any items to your cart yet.</p>
          <button
            onClick={() => navigate('/shop-by-room/living-room')}
            className="px-6 py-3 bg-orange text-white rounded hover:bg-dark-orange"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const totals = calculateTotal();

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-beige">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-blue mb-2">CHECKOUT</h1>
          <div className="w-20 h-1 bg-orange mx-auto"></div>
        </div>

        {errors.form && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{errors.form}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Left column - Shipping and Payment */}
          <div className="space-y-8">
            {/* Shipping Address */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue mb-6">Shipping Address</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue text-sm font-medium mb-1" htmlFor="firstName">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-orange`}
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="block text-blue text-sm font-medium mb-1" htmlFor="lastName">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-orange`}
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-blue text-sm font-medium mb-1" htmlFor="email">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-orange`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="mt-4">
                <label className="block text-blue text-sm font-medium mb-1" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange"
                />
              </div>

              <div className="mt-4">
                <label className="block text-blue text-sm font-medium mb-1" htmlFor="address">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-orange`}
                />
                {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="sm:col-span-1">
                  <label className="block text-blue text-sm font-medium mb-1" htmlFor="city">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-orange`}
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                </div>
                
                <div className="sm:col-span-1">
                  <label className="block text-blue text-sm font-medium mb-1" htmlFor="country">
                    Country *
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.country ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-orange`}
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="IT">Italy</option>
                  </select>
                  {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
                </div>
                
                <div className="sm:col-span-1">
                  <label className="block text-blue text-sm font-medium mb-1" htmlFor="postalCode">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-orange`}
                  />
                  {errors.postalCode && <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>}
                </div>
              </div>

              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="saveInfo"
                  name="saveInfo"
                  checked={formData.saveInfo}
                  onChange={handleChange}
                  className="h-4 w-4 text-orange focus:ring-orange border-gray-300 rounded"
                />
                <label htmlFor="saveInfo" className="ml-2 block text-sm text-blue">
                  Save this information for next time
                </label>
              </div>
            </div>
            
            {/* Shipping Method */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue mb-6">Shipping Method</h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="standard-shipping"
                    name="shippingMethod"
                    value="standard"
                    checked={formData.shippingMethod === 'standard'}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange focus:ring-orange"
                  />
                  <label htmlFor="standard-shipping" className="ml-3 block text-sm text-blue">
                    <span className="font-medium">Standard Shipping</span>
                    <span className="ml-2">(5-7 business days) - €5.00</span>
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="express-shipping"
                    name="shippingMethod"
                    value="express"
                    checked={formData.shippingMethod === 'express'}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange focus:ring-orange"
                  />
                  <label htmlFor="express-shipping" className="ml-3 block text-sm text-blue">
                    <span className="font-medium">Express Shipping</span>
                    <span className="ml-2">(2-3 business days) - €15.00</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue mb-6">Payment Method</h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="credit-card"
                    name="paymentMethod"
                    value="credit-card"
                    checked={formData.paymentMethod === 'credit-card'}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange focus:ring-orange"
                  />
                  <label htmlFor="credit-card" className="ml-3 block text-sm font-medium text-blue">
                    Credit Card
                  </label>
                </div>

                {formData.paymentMethod === 'credit-card' && (
                  <div className="mt-4 space-y-4 pl-7">
                    <div>
                      <label className="block text-blue text-sm font-medium mb-1" htmlFor="cardNumber">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        className={`w-full px-3 py-2 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-orange`}
                      />
                      {errors.cardNumber && <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-blue text-sm font-medium mb-1" htmlFor="cardExpiry">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          id="cardExpiry"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleChange}
                          placeholder="MM/YY"
                          className={`w-full px-3 py-2 border ${errors.cardExpiry ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-orange`}
                        />
                        {errors.cardExpiry && <p className="mt-1 text-sm text-red-500">{errors.cardExpiry}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-blue text-sm font-medium mb-1" htmlFor="cardCvc">
                          CVC *
                        </label>
                        <input
                          type="text"
                          id="cardCvc"
                          name="cardCvc"
                          value={formData.cardCvc}
                          onChange={handleChange}
                          placeholder="123"
                          className={`w-full px-3 py-2 border ${errors.cardCvc ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-orange`}
                        />
                        {errors.cardCvc && <p className="mt-1 text-sm text-red-500">{errors.cardCvc}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="paypal"
                    name="paymentMethod"
                    value="paypal"
                    checked={formData.paymentMethod === 'paypal'}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange focus:ring-orange"
                  />
                  <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-blue">
                    PayPal
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Order Summary */}
          <div className="mt-8 lg:mt-0">
            <div className="bg-white shadow-md rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-blue mb-6">Order Summary</h2>

              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item._id} className="flex justify-between items-center border-b border-gray-200 pb-4">
                    <div className="flex items-center">
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-blue">{item.name}</h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-blue">
                      €{(parseFloat(item.price.$numberDecimal) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-blue">Subtotal</span>
                  <span className="text-sm text-blue">€{totals.subtotal}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-blue">Shipping</span>
                  <span className="text-sm text-blue">€{totals.shipping}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-blue">Tax</span>
                  <span className="text-sm text-blue">€{totals.tax}</span>
                </div>
                
                <div className="flex justify-between border-t border-gray-200 pt-3 mt-3">
                  <span className="text-base font-medium text-blue">Total</span>
                  <span className="text-base font-medium text-blue">€{totals.total}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full mt-6 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isProcessing ? 'bg-gray-400' : 'bg-orange hover:bg-dark-orange'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange`}
              >
                {isProcessing ? 'Processing...' : 'Complete Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;