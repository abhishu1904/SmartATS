const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password is required"
            });
        }
        const [existingUsers] = await db.promise().execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userRole = role || "candidate";

        const [result] = await db.promise().execute(
            `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
            [name, email, hashedPassword, userRole]
        );

        res.status(201).json({
            message: "User registered successfully.",
            user: {
                id: result.insertId,
                name,
                email,
                role: userRole
            }
        });
    } catch (error) {
        console.error("Register Error:", error.message);
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // 2. Find user by email
        const [users] = await db.promise().execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 3. Get the user from database
        const user = users[0];

        // 4. Compare password with stored hash
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 5. Create JWT token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            "ATS_SECRET_KEY",
            {
                expiresIn: "1h"
            }
        );

        // 6. Login successful
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error.message);

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        // 1. Validate required fields
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "Email, new password and confirm password are required"
            });
        }

        // 2. Check password length
        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        // 3. Confirm passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        // 4. Find registered user
        const [users] = await db.promise().execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "No account found with this email"
            });
        }

        // 5. Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 6. Update password in database
        await db.promise().execute(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, users[0].id]
        );

        return res.status(200).json({
            message: "Password reset successfully. Please login with your new password."
        });

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to reset password"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    resetPassword
};