import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../src/lib/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get("/auth/check");
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      setToken(null);
      toast.error("Session expired. Please login again.");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setUser(response.data.userData);
        toast.success("Login successful!");
        return { success: true };
      }
      toast.error(response.data.message);
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return {
        success: false,
        message,
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.post("/auth/signup", userData);
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setUser(response.data.userData);
        toast.success("Account created successfully!");
        return { success: true };
      }
      toast.error(response.data.message);
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed";
      toast.error(message);
      return {
        success: false,
        message,
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      console.log("Sending profile update:", profileData);
      toast.loading("Updating profile...", { id: "profile-update" });

      const response = await api.put("/auth/update-profile", profileData);
      console.log("Profile update response:", response.data);

      toast.dismiss("profile-update");

      if (response.data.success) {
        setUser(response.data.user);
        toast.success("Profile updated successfully!");
        return { success: true, user: response.data.user };
      }
      toast.error(response.data.message);
      return { success: false, message: response.data.message };
    } catch (error) {
      toast.dismiss("profile-update");
      console.error(
        "Profile update error details:",
        error.response?.data || error.message,
      );
      const message = error.response?.data?.message || "Update failed";
      toast.error(message);
      return {
        success: false,
        message,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
