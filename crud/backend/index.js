import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import route from "./router/Problemrouter.js";
import addTestProblem from "./testData.js"; // Import the test data function

// Load environment variables before using them
dotenv.config();

// Debug logs
// console.log("Environment variables loaded");
// console.log("MONGOURL:", process.env.MONGOURL ? "Defined" : "Undefined");
// console.log("PORT:", process.env.PORT);

const app = express();
// Configure CORS with specific origins from environment variables
const allowedOrigins = [
    process.env.CORS_ORIGIN || 'https://online-judge-sandy.vercel.app',
    process.env.FRONTEND_URL || 'https://online-judge-sandy.vercel.app',
    'http://localhost:3000' // Allow local development
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Allow all origins in production for now
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle OPTIONS requests explicitly
app.options('*', cors(corsOptions));

// Additional middleware to ensure CORS headers are set for all responses
app.use((req, res, next) => {
    // Set CORS headers for all responses including errors
    const origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Fallback to allow all in production
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use environment variables for MongoDB connection
const URL = process.env.MONGOURL || process.env.MONGODB_URI;
const PORT = process.env.PORT || 2000;

// Debug log to check if URL is defined

app.get("/", (req, res) => {
    res.send("CRUD API is running!");
});

const connectDB = async (retries = 2) => {
    try {
        console.log("Attempting to connect to MongoDB for CRUD service...");
        await mongoose.connect(URL, {
            serverSelectionTimeoutMS: 10000,
            retryWrites: true,
            w: "majority"
        });
        console.log("Database connection successful for CRUD service");

        // Add test problem if needed - pass true to use existing connection
        await addTestProblem(true);

        startServer();
    } catch (error) {
        console.error("Error While DB Connection for CRUD service:", error);
        if (retries > 0) {
            console.log(`Retrying connection... (${retries} attempts left)`);
            setTimeout(() => connectDB(retries - 1), 5000);
        } else {
            // Still start the server even if DB connection fails
            console.log("All connection attempts failed, starting server anyway");
            startServer();
        }
    }
};

// Function to start the server with port fallback
const startServer = () => {
    const server = app.listen(PORT, () => {
        console.log(`CRUD Server is listening on ${PORT}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${PORT} is busy, trying port ${PORT + 1}`);
            app.listen(PORT + 1, () => {
                console.log(`CRUD Server is listening on ${PORT + 1}`);
            });
        } else {
            console.error('Server error:', err);
        }
    });
};

connectDB();

// Apply routes after all middleware
app.use("/crud", route);




