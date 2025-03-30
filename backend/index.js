const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const router = require('./router/auth_router');
const dbConnection = require("./database/db");

// Debug log to check environment variables
// console.log("MongoDB URI:", process.env.MONGODB_URI ? "URI is defined" : "URI is undefined");
// console.log("JWT Secret:", process.env.JWT_SECRET_KEY ? "Secret is defined" : "Secret is undefined");

// Middleware
const corsOption = {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: "POST, GET, PUT, DELETE",
    credentials: true,
};

app.use(cors(corsOption));
app.use(express.json());
app.use("/auth", router);

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


