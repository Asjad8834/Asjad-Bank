const express = require("express");

const transactionRouter = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const transactionController = require("../controllers/transaction.controller");


/**
 * - POST /api/transaction/
 * - Create a new transaction
 */

transactionRouter.post("/", authMiddleware.authMiddleware, transactionController.createTransaction )


/**
 * - POST/api/transactions/ssystem/initial-funds
 * - create initial funds for system user
 */

transactionRouter.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction)


module.exports = transactionRouter;