const mongoose = require('mongoose');
const jwt= require('jsonwebtoken');
const userSchema = new mongoose.Schema({

    user_name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    mobile_no: {
        type: Number,
        require: true
    },
    password: {
        type: String,
        require: true
    }


});
// generating tokens

userSchema.methods.generateToken = async function() {
    try {
        console.log("Generating token with secret key:", process.env.JWT_SECRET_KEY ? "Secret is defined" : "Secret is undefined");
        console.log("Secret key value:", process.env.JWT_SECRET_KEY);
        
        return jwt.sign(
            {
                userID: this._id.toString(),
                email: this.email
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: process.env.JWT_EXPIRY || "5d"
            }
        );
    } catch (error) {
        console.log(error);
    }
}
// define model or collection name
const User= new mongoose.model("User",userSchema);
module.exports= User;
