import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { io, userSocketMap } from "../server.js";

// sign up a new user
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "Account already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    res.json({
      success: true,
      userData: newUser,
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    console.log(error.message);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

// login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email });

    if (!userData) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(userData._id);

    res.json({
      success: true,
      userData: userData, // Changed from newUser to userData
      token,
      message: "Login successfully",
    });
  } catch (error) {
    console.log(error.message);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

// controller to check if user is authenticated
export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

// controller to update user profile details
export const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, profilePic } = req.body;
    const userId = req.user._id;
    let updatedUser;

    console.log("Updating profile for user:", userId);
    console.log("Received data:", {
      fullName,
      bio,
      profilePic: profilePic
        ? `Image provided (length: ${profilePic.length})`
        : "No image",
    });

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          fullName: fullName,
          bio: bio,
        },
        { new: true, runValidators: true },
      ).select("-password");
    } else {
      try {
        const uploadOptions = {
          folder: "chat_app_profiles",
          transformation: [
            { width: 400, height: 400, crop: "limit", quality: "auto:good" },
          ],
          timeout: 120000,
        };

        console.log("Starting Cloudinary upload...");

        const uploadResponse = await cloudinary.uploader.upload(
          profilePic,
          uploadOptions,
        );

        console.log("Cloudinary upload successful:", uploadResponse.secure_url);

        updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            profilePic: uploadResponse.secure_url,
            bio: bio,
            fullName: fullName,
          },
          { new: true, runValidators: true },
        ).select("-password");
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);

        updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            fullName: fullName,
            bio: bio,
          },
          { new: true, runValidators: true },
        ).select("-password");

        return res.json({
          success: true,
          message:
            "Profile updated but image upload failed. Please try again with a smaller image.",
          user: updatedUser,
        });
      }
    }

    if (!updatedUser) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User updated successfully:", updatedUser._id);

    // IMPORTANT: Emit the updated user info to all connected clients
    // Import io and userSocketMap at the top of your file
    // import { io, userSocketMap } from "../server.js";

    // Emit to all online users that this user's profile has been updated
    io.emit("userProfileUpdated", {
      userId: updatedUser._id,
      fullName: updatedUser.fullName,
      profilePic: updatedUser.profilePic,
      bio: updatedUser.bio,
    });

    res.json({
      success: true,
      message: "Updated Successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    console.error("Full error:", error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};
