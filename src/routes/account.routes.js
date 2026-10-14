const express = require("express");

const accountRouter = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const accountController = require("../controllers/account.controller");

/**
 * - POST /api/accounts/
 * - Create a new account for the authenticated user
 */
accountRouter.post("/", authMiddleware.authMiddleware , accountController.createAccountController);

/**
 * -GET /api/accounts/balance/:accountID
 */

accountRouter.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController);


module.exports = accountRouter;