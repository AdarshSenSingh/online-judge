import mongoose from "mongoose";

const ProblemSchema= new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    testCases: [
        {
            input: { type: String, required: true },
            output: { type: String, required: true },
        },
    ],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Problem = new mongoose.model('Problem',ProblemSchema);
export default Problem;
