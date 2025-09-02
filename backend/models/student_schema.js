const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  phoneVerified: { type: Boolean, default: false },
  location: { type: String },
  isGoogleUser: { type: Boolean, default: false }
});

studentSchema.methods.generateToken = async function () {
  try {
    return jwt.sign(
      {
        userID: this._id.toString(),
        email: this.email,
        role: 'student'
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRY || '5d' }
    );
  } catch (error) {
    console.log(error);
  }
};

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
