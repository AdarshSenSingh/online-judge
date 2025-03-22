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
      enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compiler Error', 'Compilation Error', 'Pending'],
      default: 'Pending'
    },
    message: String,
    details: String
  },
  executionTime: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
