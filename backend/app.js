const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();

// Create Express app
const app = express();

// Middleware
const corsOption = {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: "POST, GET, PUT, DELETE",
    credentials: true,
};

app.use(cors(corsOption));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET_KEY,
  resave: false,
  saveUninitialized: false
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Import passport configuration
require('./config/passport');

// Import routes
const authRouter = require('./router/auth_router');

// Use routes
app.use("/auth", authRouter);

// Basic route
app.get('/', (req, res) => {
  res.send('Auth service is running');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;



