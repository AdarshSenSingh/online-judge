const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const router = require('./router/auth_router');
const dbConnection = require("./database/db");

// Debug log to check environment variables
console.log("CORS Origin:", process.env.CORS_ORIGIN || "https://online-judge-sandy.vercel.app");

// Middleware
const corsOption = {
    origin: function(origin, callback) {
        const allowedOrigins = [
            process.env.CORS_ORIGIN || "https://online-judge-sandy.vercel.app"
        ];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            console.log(`CORS blocked for origin: ${origin}`);
            callback(null, true); // Allow all origins in development
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept"],
    credentials: true
};

// Apply CORS first - before any routes
app.use(cors(corsOption));

// Handle OPTIONS requests explicitly
app.options('*', cors(corsOption));

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Origin:', req.headers.origin);
    next();
});

// Then apply other middleware
app.use(express.json());

// Then use your routers
app.use("/auth", router);

// Test endpoint for CORS
app.get('/test-cors', (req, res) => {
    res.json({ message: 'CORS is working!', origin: req.headers.origin });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

const PORT = process.env.PORT || 5000;

// Start server even if DB connection fails
dbConnection().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is listening on ${PORT}`);
    });
}).catch(err => {
    console.error("Failed to initialize database, but starting server anyway:", err);
    app.listen(PORT, () => {
        console.log(`Server is listening on ${PORT} (without DB connection)`);
    });

});