// inside controllers my main logic would be there
const bcrypt= require('bcryptjs');
const express= require('express');
const router = express.Router();
const User = require('../models/userSchema');
 const home= async(req,res)=>{

    try {
        return    res
        .status(200)
        .send("welcome in router main page.");
    } catch (error) {
        console.log("inside auth_controller.js ",error);
    }
}

// register part

const register =async(req,res)=>{
  try {
    console.log(req.body);
    // getting the data from the user
    const {user_name,email,mobile_no,password}= req.body;
    // check if all details are filled
    if(!(user_name && email && mobile_no&& password)){
      return res.status(404).json({msg:"Please fill all the details"});
    }
    // check if email already exits
    const userExit= await User.findOne({email});
    if(userExit){
        return res.status(400).json({msg:"User already exits with this email"});
    }
    const userMobile = await User.findOne({ mobile_no });
    if (userMobile) {
        return res.status(400).json({ msg: "User already exists with this Mobile no" });
    }
    // hashed the password
     const salt= 10;
     const hashed_pass= await bcrypt.hash(password,salt);
    // register the new user
   const userCreate= await User.create({user_name,email,mobile_no,password:hashed_pass});
    res.status(200).json({
      msg: "Registration sucessfully",
      msg: {
        user_name: req.body.user_name,
        email: req.body.email
      },
      token: await userCreate.generateToken(),
      userID: userCreate._id.toString()
    });
    // res.status(200).json({message:req.body});
  } catch (error) {
    console.log("Error inside the resister-> authcontroller ",error);
  }
};


// login part

const login = async (req, res) => {
  // Take the data from body
  const { email, password } = req.body;

  // Check for the existence of user
  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      const isPasswordValid = await bcrypt.compare(password, userExists.password);

      if (isPasswordValid) {
        const token = await userExists.generateToken();

        res.status(200).json({
          msg: "Login Successfully",
          token : token,
          userID: userExists._id.toString()
        });
      } else {
        res.status(401).json({ msg: "Invalid password" });
      }
    } else {
      res.status(401).json({ msg: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ msg: "Error while logging in" });
  }
};

// Add Google callback handler
const googleCallback = async (req, res) => {
  try {
    // The user is already authenticated by Passport
    // Generate a token for the authenticated user
    const token = await req.user.generateToken();
    
    // Redirect to frontend with token
    // You can use a dedicated route in your frontend to handle this token
    res.redirect(`${process.env.CORS_ORIGIN}/google-auth?token=${token}`);
  } catch (error) {
    console.error("Error in Google authentication callback:", error);
    res.redirect(`${process.env.CORS_ORIGIN}/login?error=auth_failed`);
  }
};

module.exports = {home, register, login, googleCallback};
