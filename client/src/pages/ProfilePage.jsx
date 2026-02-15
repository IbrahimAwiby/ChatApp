import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { useAuth } from "../../context/AuthContext";

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  React.useEffect(() => {
    if (user) {
      setName(user.fullName || "");
      setBio(user.bio || "");
      if (user.profilePic) {
        setPreviewUrl(user.profilePic);
      }
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image too large. Max 5MB");
        return;
      }
      setSelectedImg(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError("");
    }
  };

  const compressImage = (base64String) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const maxDimension = 800;
        if (width > height && width > maxDimension) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        resolve(compressedBase64);
      };
    });
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const compressed = await compressImage(reader.result);
          resolve(compressed);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error("Error converting to base64:", error);
        reject(error);
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let profilePic = null;
      if (selectedImg) {
        profilePic = await convertToBase64(selectedImg);
      }

      const result = await updateProfile({
        fullName: name,
        bio,
        profilePic,
      });

      if (result.success) {
        navigate("/");
      } else {
        setError(result.message || "Update failed");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-[url('../src/assets/bgImage.svg')] bg-cover bg-center flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        {/* Logo Section */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <img
            src={assets.logo_big}
            alt="QuickChat"
            className="w-40 sm:w-48 md:w-56 lg:w-64 mb-4 drop-shadow-2xl"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-violet-600 bg-clip-text text-transparent">
            Edit Profile
          </h1>
          <p className="text-gray-300 text-sm max-w-sm">
            Customize your profile and let others know more about you
          </p>
        </div>

        {/* Profile Form */}
        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-xl bg-white/5 border border-gray-600 text-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md"
        >
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-600 bg-clip-text text-transparent">
              Profile Details
            </h2>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors group"
              title="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 group-hover:text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 flex-shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Profile Image Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <img
                src={previewUrl || assets.avatar_icon}
                alt="profile"
                className="w-24 h-24 rounded-full object-cover border-3 border-violet-500/50 shadow-lg"
              />
              <label
                htmlFor="avatar"
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </label>
            </div>
            <input
              onChange={handleImageChange}
              type="file"
              id="avatar"
              hidden
              accept="image/*"
            />
            <p className="text-xs text-gray-400 mt-2">
              Click to {selectedImg ? "change" : "upload"} profile picture
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Full Name</label>
              <input
                type="text"
                required
                placeholder="Your full name"
                className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-white placeholder-gray-500"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Bio</label>
              <textarea
                rows={4}
                className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-white placeholder-gray-500 resize-none"
                placeholder="Tell others about yourself..."
                required
                onChange={(e) => setBio(e.target.value)}
                value={bio}
              />
              <p className="text-xs text-gray-500">
                This will be visible on your profile
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-violet-700 transition-all duration-300 disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="flex-1 py-3 border-2 border-gray-600 text-white rounded-lg font-medium hover:bg-white/10 transition-all duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          {/* Hint text */}
          <p className="text-xs text-center text-gray-500 mt-4">
            Your profile information is visible to other users
          </p>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
