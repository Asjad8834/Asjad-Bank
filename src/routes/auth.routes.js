const express = require("express");

const authRouter = express.Router();

const authController = require("../controllers/auth.controller");

// Sign up a User api/auth/register
authRouter.post("/register", authController.register );

//Sign In a user api/auth/login
authRouter.post("/login", authController.login);

//Sign Out a user api/auth/logout
authRouter.post("/logout", authController.logout);

module.exports = authRouter;