const mongoose = require('mongoose');

const dbConnection = async () => {
    const URI = process.env.MONGODB_URI;
    
    // Check if URI is defined
    if (!URI) {
        console.error("MONGODB_URI is not defined in environment variables");
        console.error("Please check your .env file and ensure MONGODB_URI is set correctly");
        // Continue execution even if DB connection fails
        return;
    }
    
    try {
        console.log("Attempting to connect to MongoDB...");
        await mongoose.connect(URI, {
            serverSelectionTimeoutMS: 10000,  // Increased timeout
            socketTimeoutMS: 45000,
            family: 4,  // Force IPv4
            retryWrites: true,
            w: "majority"
        });
        console.log("Database connection established");
    } catch (error) {
        console.error("Database connection failed");
        console.error("Error details:", error);
        
        // Try alternative connection if SRV fails
        try {
            if (!URI.includes('@')) {
                throw new Error('Invalid URI format for alternative connection');
            }
            
            console.log("Attempting alternative connection method...");
            // Extract parts from the SRV URI to create a direct URI
            const parts = URI.split('@')[1].split('/');
            const host = parts[0];
            const dbName = parts[1].split('?')[0];
            const directURI = `mongodb://${URI.split('@')[0].split('://')[1]}@${host}/${dbName}`;
            
            await mongoose.connect(directURI, {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                family: 4
            });
            console.log("Database connection established via alternative method");
        } catch (fallbackError) {
            console.error("All connection attempts failed");
            console.error("Fallback error details:", fallbackError);
            // Continue execution even if DB connection fails
        }
    }
};
module.exports = dbConnection;
