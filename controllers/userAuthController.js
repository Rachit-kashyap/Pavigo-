const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const {sendVerificationLink} = require("../Utils/EmailScript");
const jwt = require("jsonwebtoken")




const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        //  Input Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter all fields"
            });
        }

        if (!email.includes("@") || !email.includes(".")) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        //  Check if User Already Exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already registered"
            });
        }

        //  Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        //  Save User
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });


// send the verification link for activate account


const token = jwt.sign({_id:newUser._id},process.env.JWT_SECRET_KEY,{expiresIn:"2m"});

// send verification link to the user email
sendVerificationLink(newUser.email,token);






        // user succesfully created and send to frontend
        res.status(201).json({
            success: true,
            message: "User registered successfully. Verify Your account",
        });
    } catch (error) {
        console.error("Register error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};




const verify = async (req, res) => {
    try {
        const token = req.params.token;

        //  Token Presence Check
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token is missing",
            });
        }

        // Verify Token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "Token expired. Please request a new verification link.",
                });
            }

            return res.status(401).json({
                success: false,
                message: "Invalid or malformed token",
            });
        }

        //  Check if user exists
        const user = await User.findById(decoded._id); // payload: { id: userId }
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Update user's isActive status
        if (user.isActive) {
            return res.status(200).json({
                success: true,
                message: "User is already verified",
            });
        }

        await User.findByIdAndUpdate(user._id, { isActive: true }, { new: true });

        return res.status(200).json({
            success: true,
            message: "Verification successful. Your account is now active.",
        });
    } catch (error) {
        console.error("Verification error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};




const generateNewVerificationLink = async (req, res) => {
    try {
        const { email } = req.query;

        //  Email Presence Check
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide an email address",
            });
        }

        //  Email Format Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address",
            });
        }

        //  Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        //  Check if already verified
        if (user.isActive) {
            return res.status(400).json({
                success: false,
                message: "User is already verified",
            });
        }

        //  Generate new verification token
        const token = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "2m" } // Adjust time as needed
        );

        //  Send email with the new verification link
        await sendVerificationLink(user.email, token); // Assume this handles the email logic

        return res.status(200).json({
            success: true,
            message: "Verification link sent. Please check your email.",
        });
    } catch (error) {
        console.error("Error generating verification link:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter all fields"
            });
        }

        if (!email.includes("@") || !email.includes(".")) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Please verify your account first"
            });
        }

        const token = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "10d" }
        );

   

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};




module.exports = { register ,verify ,generateNewVerificationLink,login}
