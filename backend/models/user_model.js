// Add isGoogleUser field to your schema
const userSchema = new mongoose.Schema({
  // ... existing fields
  isGoogleUser: {
    type: Boolean,
    default: false
  }
});