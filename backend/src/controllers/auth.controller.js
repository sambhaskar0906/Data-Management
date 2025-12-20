import User from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/jwt.js";


/* ===========================
   REGISTER
=========================== */
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1️⃣ validation
        if (!name || !email || !password) {
            return res.status(400).json({
                statusCode: 400,
                status: false,
                message: "All fields are required",
                data: null,
            });
        }

        // 2️⃣ check existing user
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(409).json({
                statusCode: 409,
                status: false,
                message: "User already exists",
                data: null,
            });
        }

        // 3️⃣ create user (password auto-hash)
        const user = await User.create({
            name,
            email,
            password, // 🔥 plain text
        });

        return res.status(201).json({
            statusCode: 201,
            status: true,
            message: "User registered successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            statusCode: 500,
            status: false,
            message: "Registration failed",
            data: null,
        });
    }
};


/* ===========================
   LOGIN
=========================== */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json(new ApiResponse(400, null, "Email and password required"));
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res
                .status(401)
                .json(new ApiResponse(401, null, "Invalid credentials"));
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res
                .status(401)
                .json(new ApiResponse(401, null, "Invalid credentials"));
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        return res.status(200).json(
            new ApiResponse(200, {
                accessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            }, "Login successful")
        );

    } catch (err) {
        console.error(err);
        return res
            .status(500)
            .json(new ApiResponse(500, null, "Login failed"));
    }
};

/* ===========================
   LOGOUT
=========================== */
export const logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, {
            refreshToken: null,
        });

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Logout successful"));

    } catch (err) {
        return res
            .status(500)
            .json(new ApiResponse(500, null, "Logout failed"));
    }
};


export const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                statusCode: 400,
                status: false,
                message: "User ID is required",
                data: null,
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                status: false,
                message: "User not found",
                data: null,
            });
        }

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            statusCode: 200,
            status: true,
            message: "User deleted successfully",
            data: null,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            statusCode: 500,
            status: false,
            message: "Failed to delete user",
            data: null,
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select("-password -refreshToken")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            statusCode: 200,
            status: true,
            message: "Users fetched successfully",
            data: users,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            statusCode: 500,
            status: false,
            message: "Failed to fetch users",
            data: null,
        });
    }
};
