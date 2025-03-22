import mongoose from "mongoose";
import Problem from "./models/ProblemSchema.js";
import dotenv from "dotenv";

dotenv.config();

const addTestProblem = async (existingConnection = null) => {
    let needToDisconnect = false;
    
    try {
        // Only connect if we don't already have a connection
        if (!existingConnection && mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGOURL);
            needToDisconnect = true;
            console.log("Connected to MongoDB for test data insertion");
        }
        
        // Check if there are any problems
        const count = await Problem.countDocuments();
        console.log(`Current problem count: ${count}`);
        
        if (count === 0) {
            // Add a test problem if none exist
            const testProblem = new Problem({
                title: "Two Sum",
                description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                difficulty: "easy",
                testCases: [
                    {
                        input: "[2,7,11,15], target = 9",
                        output: "[0,1]"
                    },
                    {
                        input: "[3,2,4], target = 6",
                        output: "[1,2]"
                    }
                ]
            });
            
            await testProblem.save();
            console.log("Test problem added successfully");
        } else {
            console.log("Database already has problems, skipping test data insertion");
        }
    } catch (error) {
        console.error("Error adding test data:", error);
    } finally {
        // Only disconnect if we created our own connection
        if (needToDisconnect) {
            await mongoose.disconnect();
            console.log("Disconnected from MongoDB after test data insertion");
        }
    }
};

// Don't run the function automatically when imported
// Export for use in other files
export default addTestProblem;
