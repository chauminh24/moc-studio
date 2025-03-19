import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-6xl font-bold text-red-600">404</h1>
      <p className="text-2xl text-gray-600 mt-4">Oops! Page not found.</p>
      <Link to="/" className="mt-6 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-700">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
