import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [currentState, setCurrentState] = useState("Sign Up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (currentState === "Sign Up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      setLoading(false);
      return;
    }

    let result;
    if (currentState === "Sign Up") {
      result = await signup({ fullName, email, password, bio });
    } else {
      result = await login(email, password);
    }

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[url('../src/assets/bgImage.svg')] bg-cover bg-center flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8">
        {/* Logo */}
        <img
          src={assets.logo_big}
          alt="QuickChat"
          className="w-40 sm:w-48 md:w-56 lg:w-64"
        />

        {/* Form */}
        <form
          onSubmit={onSubmitHandler}
          className="backdrop-blur-xl bg-white/5 border border-gray-600 text-white p-6 rounded-2xl shadow-2xl w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-600 bg-clip-text text-transparent">
              {currentState}
            </h2>
            {isDataSubmitted && (
              <button
                type="button"
                onClick={() => setIsDataSubmitted(false)}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <img src={assets.arrow_icon} alt="back" className="w-5" />
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {currentState === "Sign Up" && !isDataSubmitted && (
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white placeholder-gray-400"
                required
              />
            )}

            {!isDataSubmitted && (
              <>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white placeholder-gray-400"
                  required
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white placeholder-gray-400 pr-12"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                          clipRule="evenodd"
                        />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
              </>
            )}

            {currentState === "Sign Up" && isDataSubmitted && (
              <textarea
                rows={3}
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white placeholder-gray-400 resize-none"
                required
              />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-violet-700 transition-all disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : currentState === "Sign Up"
                ? "Create Account"
                : "Login Now"}
          </button>

          {/* Terms */}
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <input type="checkbox" className="accent-violet-500" />
            <p>Agree to terms & privacy</p>
          </div>

          {/* Toggle */}
          <div className="mt-4 text-center text-sm text-gray-400">
            {currentState === "Sign Up" ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentState("Login");
                    setIsDataSubmitted(false);
                    setError("");
                  }}
                  className="text-violet-400 hover:text-violet-300 font-medium"
                >
                  Login
                </button>
              </p>
            ) : (
              <p>
                Need an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentState("Sign Up");
                    setError("");
                  }}
                  className="text-violet-400 hover:text-violet-300 font-medium"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
