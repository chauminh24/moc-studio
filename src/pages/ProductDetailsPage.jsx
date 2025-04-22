import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

// 3D Model Viewer Component
function ModelViewer({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [media, setMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/connectDB?type=productDetails&productId=${productId}`
        );
        if (!response.ok) throw new Error("Failed to fetch product details");
        const data = await response.json();

        // Combine product image with other media
        const allMedia = [
          { 
            media_type: 'image', 
            media_url: data.product.image_url,
            is_primary: true 
          },
          ...data.media
        ];

        setProduct(data.product);
        setMedia(allMedia);
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
      addToCart(product);
      alert("Product added to cart!");
    }
  };

  const handleNextMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % media.length);
  };

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex - 1 + media.length) % media.length);
  };

  const renderMedia = () => {
    if (media.length === 0) {
      return (
        <div className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
          <img
            src="/placeholder/image_placeholder.png"
            alt="Placeholder"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    const currentMedia = media[currentMediaIndex];

    try {
      switch (currentMedia.media_type) {
        case "3d_model":
          return (
            <div className="w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-10, -10, -10]} />
                <Suspense fallback={null}>
                  <ModelViewer url={currentMedia.file_path} />
                  <OrbitControls enableZoom={true} enablePan={true} />
                </Suspense>
              </Canvas>
            </div>
          );
        case "video":
          return (
            <video
              controls
              className="w-full h-[400px] object-cover rounded-lg"
              src={currentMedia.media_url || currentMedia.file_path}
            />
          );
        default: // image
          return (
            <img
              src={currentMedia.media_url || currentMedia.file_path}
              alt={product.name}
              className="w-full h-[400px] object-cover rounded-lg"
              onError={(e) => {
                e.target.src = "/placeholder/image_placeholder.png";
              }}
            />
          );
      }
    } catch (error) {
      console.error("Error rendering media:", error);
      return (
        <div className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
          <img
            src="/placeholder/image_placeholder.png"
            alt="Placeholder"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
  };

  if (loading) return <div className="container mx-auto pt-[12em] p-6">Loading...</div>;
  if (error) return <div className="container mx-auto pt-[12em] p-6">Error: {error}</div>;

  return (
    <div className="container mx-auto pt-[12em] p-6">
      {product ? (
        <>
          {/* Product Details Section */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Product Media */}
            <div className="flex-1 relative">
              {renderMedia()}
              {/* Arrows for navigation */}
              {media.length > 1 && (
                <>
                  <button
                    onClick={handlePrevMedia}
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-light-blue text-white p-2 rounded-full"
                  >
                    &#8592;
                  </button>
                  <button
                    onClick={handleNextMedia}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-light-blue text-white p-2 rounded-full"
                  >
                    &#8594;
                  </button>
                </>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
              <p className="text-lg text-gray mb-4">{product.description}</p>
              
              {/* Product Details */}
              <div className="mb-4">
                <h3 className="font-semibold">Dimensions:</h3>
                <p>{product.dimensions.width}cm (W) × {product.dimensions.depth}cm (D) × {product.dimensions.height}cm (H)</p>
                
                <h3 className="font-semibold mt-2">Materials:</h3>
                <p>{product.materials.join(", ")}</p>
                
                <h3 className="font-semibold mt-2">Available Colors:</h3>
                <p>{product.colors.join(", ")}</p>
                
                <h3 className="font-semibold mt-2">Style:</h3>
                <p>{product.style}</p>
                
                <h3 className="font-semibold mt-2">In Stock:</h3>
                <p>{product.stock_quantity.$numberInt} units available</p>
              </div>
              
              <p className="text-xl font-semibold text-blue mb-4">
                €{product.price.$numberDecimal}
              </p>
              <button
                onClick={handleAddToCart}
                className="bg-blue text-white px-6 py-2 rounded-lg hover:bg-dark-blue transition"
              >
                Add to Cart
              </button>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="border-b border-light-gray py-4">
                  <p className="font-semibold">{review.comment}</p>
                  <p className="text-sm text-gray-500">
                    Rating: {review.rating} / 5
                  </p>
                </div>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>

          {/* Related Products Section */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  to={`/product/${relatedProduct._id.$oid || relatedProduct._id}`}
                  key={relatedProduct._id.$oid || relatedProduct._id}
                  className="border rounded-lg p-4 hover:shadow-lg transition"
                >
                  <img
                    src={relatedProduct.image_url}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      e.target.src = "/placeholder/image_placeholder.png";
                    }}
                  />
                  <h3 className="text-lg font-semibold">{relatedProduct.name}</h3>
                  <p className="text-dark-blue font-bold">
                    €{relatedProduct.price.$numberDecimal}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div>Product not found</div>
      )}
    </div>
  );
};

export default ProductDetailsPage;