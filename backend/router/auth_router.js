const express = require('express');
const router = express.Router();
const authRoute = require('../controllers/auth_controllers');
const passport = require('passport');

router.route("/").get(authRoute.home);

router.route("/register").post(authRoute.register);
router.route("/login").post(authRoute.login);

// OTP routes
router.route("/send-otp").post(authRoute.sendOtp);
router.route("/verify-otp").post(authRoute.verifyOtp);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  authRoute.googleCallback
);

module.exports = router;







