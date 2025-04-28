import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from local storage or database
  useEffect(() => {
    const loadCart = async () => {
      try {
        let cartData = [];
        const localCart = localStorage.getItem("cart");

        if (user) {
          // User is logged in
          if (localCart) {
            // Merge local cart with database cart
            const localCartItems = JSON.parse(localCart);
            try {
              const response = await axios.post('/api/connectDB?type=mergeCarts', {
                userId: user._id,
                localCartItems: localCartItems.map(item => ({
                  productId: item._id,
                  quantity: item.quantity
                })),
              });
              cartData = response.data.cart || [];
              
              // Convert back to frontend format if needed
              if (cartData.length > 0 && !cartData[0]._id) {
                cartData = cartData.map(item => ({
                  ...item.productId, // Assuming product details are nested
                  quantity: item.quantity
                }));
              }
              
              localStorage.removeItem("cart");
            } catch (mergeError) {
              console.error("Merge cart error:", mergeError);
              cartData = localCartItems;
            }
          } else {
            // Fetch cart from database
            const response = await axios.get(`/api/connectDB?type=getCart&userId=${user._id}`);
            cartData = response.data.cart || [];
            
            // Convert format if needed
            if (cartData.length > 0 && !cartData[0]._id) {
              cartData = cartData.map(item => ({
                ...item.productId,
                quantity: item.quantity
              }));
            }
          }
        } else if (localCart) {
          // Guest user - use local storage
          cartData = JSON.parse(localCart);
        }

        setCart(cartData);
      } catch (error) {
        console.error("Error loading cart:", error);
        const localCart = localStorage.getItem("cart");
        setCart(localCart ? JSON.parse(localCart) : []);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [user]);

  // Save cart to appropriate storage
  useEffect(() => {
    if (isLoading) return;
    
    const saveCart = async () => {
      try {
        if (user) {
          // Prepare data for database
          const cartForDB = cart.map(item => ({
            productId: item._id,
            quantity: item.quantity
          }));
          
          await axios.post('/api/connectDB?type=saveCart', {
            userId: user._id,
            cartItems: cartForDB
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } else {
          localStorage.setItem("cart", JSON.stringify(cart));
        }
      } catch (error) {
        console.error("Error saving cart:", error);
        // Fallback to local storage
        localStorage.setItem("cart", JSON.stringify(cart));
        
        // Additional error handling
        if (error.response) {
          console.error("Server responded with:", error.response.data);
        } else if (error.request) {
          console.error("No response received:", error.request);
        }
      }
    };

    // Debounce the save operation
    const timer = setTimeout(() => {
      saveCart();
    }, 500);

    return () => clearTimeout(timer);
  }, [cart, user, isLoading]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item._id === product._id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    if (user) {
      // Also clear from database
      axios.post('/api/connectDB?type=clearCart', { userId: user._id })
        .catch(error => console.error("Error clearing cart:", error));
    }
    localStorage.removeItem("cart");
  };

  // Calculate total items and price
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalPrice = cart.reduce(
    (sum, item) => sum + (parseFloat(item.price?.$numberDecimal || item.price) * item.quantity),
    0
  );

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity,
        clearCart,
        isLoading,
        cartTotalItems,
        cartTotalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;