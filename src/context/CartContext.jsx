import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from local storage or database when component mounts or user changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        let cartData = [];
        const localCart = localStorage.getItem("cart");
  
        if (user) {
          if (localCart) {
            // Merge local cart with database cart
            const response = await axios.post('/api/connectDB?type=mergeCarts', {
              userId: user._id,
              localCartItems: JSON.parse(localCart),
            });
            cartData = response.data.cart;
  
            // Clear local storage after merging
            localStorage.removeItem("cart");
          } else {
            // Fetch cart from database
            const response = await axios.get(`/api/connectDB?type=getCart&userId=${user._id}`);
            cartData = response.data.cart;
          }
        } else if (localCart) {
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

  // Helper function to merge local and database carts
  const mergeCarts = (localCart, dbCart) => {
    const merged = [...dbCart];
    
    localCart.forEach(localItem => {
      const existingItem = merged.find(item => item._id === localItem._id);
      if (existingItem) {
        existingItem.quantity += localItem.quantity;
      } else {
        merged.push(localItem);
      }
    });
    
    return merged;
  };

  // Save cart to appropriate storage whenever it changes
  useEffect(() => {
    if (isLoading) return;
    
    const saveCart = async () => {
      try {
        if (user) {
          // User is logged in - save to database
          await axios.post('/api/connectDB?type=saveCart', {
            userId: user._id,
            cartItems: cart.map(item => ({
              productId: item._id,
              quantity: item.quantity,
            })),
          });
        } else {
          // User is not logged in - save to local storage
          localStorage.setItem("cart", JSON.stringify(cart));
        }
      } catch (error) {
        console.error("Error saving cart:", error);
        // Fallback to local storage if there's an error
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    };
  
    saveCart();
  }, [cart, user, isLoading]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item._id === product._id);
      if (existingProduct) {
        // Update quantity if product already exists
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Add new product to cart
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
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity,
        clearCart,
        isLoading 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;