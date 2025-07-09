import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-4">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-extrabold tracking-widest animate-pulse">404</h1>
        <div className="bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg inline-block">
          <p className="text-2xl font-semibold">Oops! Halaman tidak ditemukan</p>
        </div>
        <p className="text-lg text-purple-100">Sepertinya Anda tersesat di antah berantah.</p>
        <a href="/" className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-300 ease-in-out transform hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
};

export default NotFound;
