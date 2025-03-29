import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  problemId: {
    type: String,
    required: true
  },
  problemTitle: {
    type: String,
    default: 'Unknown Problem'
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  verdict: {
    status: {
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compiler Error', 'Compilation Error', 'Runtime Error', 'System Error', 'Processing', 'Error'],
      default: 'Processing'
    },
    message: String,
    details: String
  },
  executionTime: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'error'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  results: [Object]
});

// Make sure we're using the same model everywhere
const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);

export default Submission;


