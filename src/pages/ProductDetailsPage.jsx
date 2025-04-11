import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { StarIcon, ShoppingCartIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 800));

        const response = await fetch(`/api/connectDB?type=productDetails&productId=${productId}`);
        if (!response.ok) throw new Error("Failed to fetch product details");
        const data = await response.json();

        setProduct(data.product);
        setMedia(data.media);
        setReviews(data.reviews);
        setRelatedProducts(data.relatedProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, quantity });
      // Toast notification could be added here instead of alert
      alert(`${product.name} (${quantity}x) added to cart!`);
    }
  };

  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, 10));
  const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-blue-500 rounded-full mb-4"></div>
        <p className="text-lg text-gray-600">Loading product details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-6 max-w-md mx-auto bg-red-50 rounded-lg">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error loading product</h2>
        <p className="text-gray-700 mb-4">{error}</p>
        <Link to="/" className="text-blue-500 hover:underline flex items-center justify-center">
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to home
        </Link>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-gray-700 mb-2">Product not found</h2>
        <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or may have been removed.</p>
        <Link to="/" className="text-blue-500 hover:underline flex items-center justify-center">
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to home
        </Link>
      </div>
    </div>
  );

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Back button */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to products
        </Link>
      </div>

      {/* Product Details Section */}
      <div className="flex flex-col lg:flex-row gap-8 mb-16">
        {/* Product Media Gallery */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
            {media.length > 0 ? (
              <img
                src={media[selectedImage].media_url}
                alt={product.name}
                className="w-full h-96 object-contain p-4"
              />
            ) : (
              <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          
          {/* Thumbnail gallery */}
          {media.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {media.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-md overflow-hidden border-2 ${selectedImage === index ? 'border-blue-500' : 'border-transparent'}`}
                >
                  <img
                    src={img.media_url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:w-1/2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          
          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-5 w-5 ${star <= averageRating ? 'text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-3xl font-bold text-gray-900">
              €{product.price.$numberDecimal}
            </span>
            {product.originalPrice && (
              <span className="ml-2 text-lg text-gray-500 line-through">
                €{product.originalPrice.$numberDecimal}
              </span>
            )}
            {product.discount && (
              <span className="ml-2 bg-red-100 text-red-800 text-sm font-medium px-2 py-0.5 rounded">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quantity</h3>
            <div className="flex items-center">
              <button 
                onClick={decrementQuantity}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-l"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="bg-gray-100 text-gray-800 font-bold py-2 px-6">
                {quantity}
              </span>
              <button 
                onClick={incrementQuantity}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-r"
                disabled={quantity >= 10}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <ShoppingCartIcon className="h-5 w-5 mr-2" />
            Add to Cart
          </button>

          {/* Product details */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
            <ul className="space-y-2">
              {product.sku && (
                <li className="flex">
                  <span className="text-gray-600 w-24">SKU:</span>
                  <span className="text-gray-900">{product.sku}</span>
                </li>
              )}
              {product.category && (
                <li className="flex">
                  <span className="text-gray-600 w-24">Category:</span>
                  <span className="text-gray-900 capitalize">{product.category}</span>
                </li>
              )}
              {product.stock && (
                <li className="flex">
                  <span className="text-gray-600 w-24">Availability:</span>
                  <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Customer Reviews</h2>
        
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="flex mr-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-5 w-5 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <h4 className="font-semibold text-gray-900">{review.userName || 'Anonymous'}</h4>
                  <span className="ml-auto text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
            <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium">
              Write a Review
            </button>
          </div>
        )}
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
              >
                <Link to={`/products/${relatedProduct._id}`} className="block">
                  <div className="h-48 bg-gray-100 flex items-center justify-center p-4">
                    {relatedProduct.image_url ? (
                      <img
                        src={relatedProduct.image_url}
                        alt={relatedProduct.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{relatedProduct.name}</h3>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-blue-600">
                        €{relatedProduct.price.$numberDecimal}
                      </span>
                      {relatedProduct.originalPrice && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          €{relatedProduct.originalPrice.$numberDecimal}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;