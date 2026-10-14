const userModel = require("../models/user.model");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Email Service
const emailService = require("../services/email.service");


// api/auth/register
async function register(req, res){
  const {email, name, password} = req.body;

  if(!name || !email || !password){
    return res.status(400).json({
      message:"All fields are required"
    })
  }

  //Now we will check if the user already exists; if the same email addresss is already present in our database

  const userAlreadyExists = await userModel.findOne({
    $or:[
      {email}
    ]
  })
  // Now check
  if(userAlreadyExists){
    return res.status(400).json({
      message:"User already exists",
      status: "failed"
    })
  }

  //Now that we have verified its a new user
  
  //We will hash their password
  const hash = await bcrypt.hash(password, 10);

  //Now we will make the user
  const user = await userModel.create({
    name,
    email,
    password: hash
  })

  //next we will assign a tokenb to this user
  const token = jwt.sign({
    id: user._id,
  }, process.env.JWT_SECRET, {expiresIn: "3d"});

  //Now set the tokeen in the cookies
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
  });

  // Now will show the final data
  res.status(201).json({
    message:"User created Succesfully",
    status: "success",
    user:{
      id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
      //createdAt: user.createdAt,
      //updatedAt: user.updatedAt
    },
    token
  });

  //Now we will send the registration email
  await emailService.sendRegistrationEmail(user.email, user.name);
  console.log("Email sent Succesfully");
  
}


//Login a user
async function login(req, res){
  try{

    const {email, password} = req.body;

    if(!email || !password){
      return res.status(400).json({
        message:"All fields are required",
        status:"failed"
      })
    }

    //Now we will check if the user exists

    const user = await userModel.findOne({
      $or:[
        {email}
      ]
    })

    if(!user){
      return res.status(400).json({
        message:"User does not exist",
        status:"failed"
      })
    }

    //Niw we will validate the password

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
      return res.status(400).json({
        message:"Invalid Credentials",
        status:"failed"
      })
    }

    //Now we will assign a token to this user
    const token = jwt.sign({
      id: user._id,
    }, process.env.JWT_SECRET, {expiresIn:"3d"});

    res.cookie("token", token);

    //Now after all the confirmation steps we will send the final response to the user

    return res.status(200).json({
      message:"User logged in successfully",
      status:"success",
      user:{
        name: user.name,
        email: user.email,
        password: user.password
      },
      token
    })


  }
  catch(error){
    return res.status(400).json({
      message:"Unexpected Error Occured",
      error: error.message,
      status:"failed"
    })
  }
}


async function logout(req, res){
  try{
    res.clearCookie("token");
    return res.status(200).json({
      message:"User logged out successfully",
      status:"success"
    })
  }
  catch(error){
    return res.status(400).json({
      message:"Unexpected Error Occured",
      error: error.message,
      status:"failed"
    })
  }
}



module.exports = {register, login, logout};