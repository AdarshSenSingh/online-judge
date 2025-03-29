const mongoose = require('mongoose');

const dbConnection = async () => {
    const URI = process.env.MONGODB_URI || "mongodb+srv://adarshsensingh:adarshsensingh@cluster0.6m4qvzp.mongodb.net/algo-auth?retryWrites=true&w=majority&appName=Cluster0";
    
    try {
        console.log("Attempting to connect to MongoDB for Auth service...");
        await mongoose.connect(URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,  // Force IPv4
            retryWrites: true,
            w: "majority"
        });
        console.log("Database connection established for Auth service");
    } catch (error) {
        console.error("Database connection failed");
        console.error("Error details:", error);
        throw error;
    }
};
module.exports = dbConnection;



