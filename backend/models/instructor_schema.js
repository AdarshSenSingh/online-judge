const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const instructorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  phoneVerified: { type: Boolean, default: false },
  location: { type: String },
  isGoogleUser: { type: Boolean, default: false }
});

instructorSchema.methods.generateToken = async function () {
  try {
    return jwt.sign(
      {
        userID: this._id.toString(),
        email: this.email,
        role: 'instructor'
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRY || '5d' }
    );
  } catch (error) {
    console.log(error);
  }
};

const Instructor = mongoose.model('Instructor', instructorSchema);
module.exports = Instructor;
