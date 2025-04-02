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
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'https://online-judge-app.vercel.app',
            'https://online-judge-sandy.vercel.app',
            'http://localhost:5173'
        ];
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.CORS_ORIGIN === '*') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const URL = process.env.MONGOURL || process.env.MONGODB_URI || "mongodb://localhost:27017/online-judge";
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

app.use("/crud", route);




