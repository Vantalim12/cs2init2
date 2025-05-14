// src/contexts/AuthContext.js - Fixed
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Set default axios header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Get current user info
        const response = await axios.get("/api/auth/me");

        if (response && response.data) {
          setCurrentUser(response.data);
          setIsAuthenticated(true);
          console.log(
            "Auth check successful, user authenticated:",
            response.data
          );
        } else {
          throw new Error("Invalid response from auth endpoint");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // If token is invalid, clean up
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        setCurrentUser(null);
        setIsAuthenticated(false);

        // Add user-friendly error message
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
        } else if (!navigator.onLine) {
          toast.error("Network connection is unavailable.");
        } else {
          toast.error("Authentication error. Please login again.");
        }
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post("/api/auth/login", credentials);

      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error("Invalid response format from login endpoint");
      }

      const { token, user } = response.data;

      // Store token in localStorage
      localStorage.setItem("token", token);

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);

      const errorMessage =
        error.response?.data?.error ||
        (error.response?.status === 404
          ? "Server not found"
          : !navigator.onLine
          ? "Network connection unavailable"
          : "Login failed");

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post("/api/auth/register", userData);

      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error("Invalid response format from registration endpoint");
      }

      const { token, user } = response.data;

      // Store token in localStorage
      localStorage.setItem("token", token);

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);

      const errorMessage =
        error.response?.data?.error ||
        (error.response?.status === 404
          ? "Server not found"
          : !navigator.onLine
          ? "Network connection unavailable"
          : "Registration failed");

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = () => {
    // Clear token from localStorage
    localStorage.removeItem("token");

    // Remove axios default header
    delete axios.defaults.headers.common["Authorization"];

    // Clear state
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const changePassword = async (passwordData) => {
    try {
      if (!isAuthenticated) {
        return {
          success: false,
          error: "You must be logged in to change your password",
        };
      }

      const response = await axios.post(
        "/api/auth/change-password",
        passwordData
      );

      return {
        success: true,
        message: response.data?.message || "Password changed successfully",
      };
    } catch (error) {
      console.error("Change password error:", error);

      const errorMessage =
        error.response?.data?.error ||
        (error.response?.status === 401
          ? "Authentication error. Please login again."
          : error.response?.status === 404
          ? "Server not found"
          : !navigator.onLine
          ? "Network connection unavailable"
          : "Failed to change password");

      // If token has expired
      if (error.response?.status === 401) {
        logout();
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    changePassword,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
