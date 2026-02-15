import React from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[url('../src/assets/bgImage.svg')] bg-cover bg-center flex items-center justify-center p-4 sm:p-6 md:p-4">
      <div className="border-2 backdrop-blur-xl bg-white/8 text-white border-gray-500 p-6 sm:p-8 md:p-10 flex flex-col items-center gap-4 sm:gap-5 md:gap-6 rounded-lg shadow-lg max-w-md w-full mx-auto">
        <img
          src={assets.logo_big || assets.logo_icon}
          alt="logo"
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain"
        />

        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold bg-linear-to-r from-purple-400 to-violet-600 bg-clip-text text-transparent">
          404
        </h1>

        <h2 className="text-xl sm:text-2xl font-medium text-center px-2">
          Page Not Found
        </h2>

        <p className="text-gray-400 text-center text-xs sm:text-sm px-2 sm:px-4">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full mt-2 sm:mt-4 px-2 sm:px-0">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:flex-1 py-2.5 sm:py-3 px-4 border border-gray-600 text-white rounded-md cursor-pointer hover:bg-white/10 transition-all text-sm sm:text-base"
          >
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full sm:flex-1 py-2.5 sm:py-3 px-4 bg-linear-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer hover:opacity-90 transition-opacity text-sm sm:text-base"
          >
            Home Page
          </button>
        </div>

        <div className="mt-2 sm:mt-4 text-[10px] sm:text-xs text-gray-500">
          QuickChat • Stay Connected
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
