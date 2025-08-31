// inside controllers my main logic would be there
const bcrypt= require('bcryptjs');
const express= require('express');
const router = express.Router();
const User = require('../models/userSchema');
 const home= async(req,res)=>{

    try {
        return    res
        .status(200)
        .send("welcome in router main page.");
    } catch (error) {
        console.log("inside auth_controller.js ",error);
    }
}

// register part

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, phoneVerified, location } = req.body;
    // Validate all required student fields
    if (!(firstName && lastName && email && password && phone)) {
      return res.status(400).json({ status: false, msg: "Please fill all required fields: First Name, Last Name, Email, Phone, and Password." });
    }
    // strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?-]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ status: false, msg: "Password must be at least 8 characters long, contain uppercase, lowercase, number, and special character." });
    }
    // check if email/phone already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(409).json({ status: false, msg: "A student already exists with this email." });
    }
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(409).json({ status: false, msg: "A student already exists with this phone number." });
    }
    // Hash password
    const hashed_pass = await bcrypt.hash(password, 10);
    // Register new student
    const newStudent = await User.create({
      firstName,
      lastName,
      email,
      password: hashed_pass,
      phone,
      phoneVerified: phoneVerified || false,
      location: location || ''
    });
    res.status(201).json({
      status: true,
      msg: "Student registration successful!",
      student: {
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        email: newStudent.email,
        phone: newStudent.phone,
        phoneVerified: newStudent.phoneVerified,
        location: newStudent.location
      },
      token: await newStudent.generateToken(),
      userID: newStudent._id.toString()
    });
  } catch (error) {
    console.log("Error inside the student register -> authcontroller ", error);
    res.status(500).json({ status: false, msg: "Internal server error: Could not register student." });
  }
};


// login part

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validation: required fields
    if (!(email && password)) {
      return res.status(400).json({ status: false, msg: "Please provide both email and password." });
    }
    // Search for student (user) by email
    const student = await User.findOne({ email });
    if (!student) {
      return res.status(401).json({ status: false, msg: "Student not found with this email." });
    }
    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, student.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ status: false, msg: "Incorrect password." });
    }
    // All good: send success response
    const token = await student.generateToken();
    res.status(200).json({
      status: true,
      msg: "Login successful!",
      token,
      userID: student._id.toString(),
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        phoneVerified: student.phoneVerified,
        location: student.location
      }
    });
  } catch (error) {
    console.error("Error during student login:", error);
    res.status(500).json({ status: false, msg: "Error while logging in. Please try again later." });
  }
};

// Add Google callback handler
const googleCallback = async (req, res) => {
  try {
    // The user is already authenticated by Passport
    // Generate a token for the authenticated user
    const token = await req.user.generateToken();
    
    // Redirect to frontend with token
    // You can use a dedicated route in your frontend to handle this token
    res.redirect(`${process.env.CORS_ORIGIN}/google-auth?token=${token}`);
  } catch (error) {
    console.error("Error in Google authentication callback:", error);
    res.redirect(`${process.env.CORS_ORIGIN}/login?error=auth_failed`);
  }
};

// Twilio config
typeof process !== 'undefined' && require('dotenv').config();
const twilio = require('twilio');
const twilioSID = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioClient = (twilioSID && twilioToken) ? twilio(twilioSID, twilioToken) : null;

// In-memory OTP storage for demonstration (clear this out in production or use Redis/database)
const otpStore = {};

// Send OTP Controller
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ status: false, msg: "Phone number required" });
    }
    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore[phone] = { otp, createdAt: Date.now() };
    // Send via Twilio
    if (!twilioClient || !twilioNumber) {
      console.log(`DEBUG: OTP for ${phone} is ${otp} (Twilio not configured)`);
      return res.status(200).json({ status: true, msg: "Twilio not configured: check .env. OTP logged to server console.", sentOtp: otp });
    }
    await twilioClient.messages.create({
      body: `Your verification code for Online Judge platform is: ${otp}`,
      from: twilioNumber,
      to: phone
    });
    res.json({ status: true, msg: "OTP has been sent via SMS." });
  } catch (error) {
    console.error("sendOtp error: ", error);
    res.status(500).json({ status: false, msg: "Failed to send OTP via SMS.", error: error.message });
  }
};

// Verify OTP Controller
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ status: false, msg: "Phone number and OTP required" });
    }
    const entry = otpStore[phone];
    if (!entry) {
      return res.status(400).json({ status: false, msg: "No OTP requested for this phone number." });
    }
    // Optionally, add expiration check here (e.g., expires after 5 min)
    if (entry.otp !== otp) {
      return res.status(401).json({ status: false, msg: "Invalid OTP." });
    }
    // Success, remove the OTP from store
    delete otpStore[phone];
    res.json({ status: true, msg: "OTP verified successfully." });
  } catch (error) {
    console.error("verifyOtp error: ", error);
    res.status(500).json({ status: false, msg: "OTP verification failed." });
  }
};

module.exports = { home, register, login, googleCallback, sendOtp, verifyOtp };
