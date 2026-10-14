const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next){
  //first we will check if a token itself exists or not

  try{
    const token =
    req.cookies.token ||
    req.headers.authorization?.split(" ")[1];

    if(!token){
      return res.status(401).json({
        message:"Unauthorized, token missing"
      })
    }

    //Now that their is a token we will check if that token is correct

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Now we will find that user with the id stored in the token when we made it earlier

    const user = await userModel.findById(decoded.id).select("-password");

    if(!user){
      return res.status(401).json({
        message:"Invalid token",
      })
    }

    //finally when we find the valid user we save the entire users data in our request header

    req.user = user;

    next();

  }
  catch(error){
    return res.status(401).json({
      message:"Authentication failed",
      error: error.message
    })
  }

}

//System user authentication middleware

async function authSystemUserMiddleware(req, res, next){

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if(!token){
    return res.status(401).json({
      message:"unauthorized, token missing"
    })
  }

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id).select("+systemUser");

    if(!user.systemUser){
      return res.status(401).json({
        message:"Unauthorized, only system users can perform this action"
      })
    }

    req.user = user;
    next();
  }
  catch(error){
    return res.status(401).json({
      message:"Authentication failed",
      error: error.message
    })
  }

}


module.exports = {
  authMiddleware,
  authSystemUserMiddleware
};